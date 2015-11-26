/*
 * This file is part of the EcoLearnia platform.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * EcoLearnia v0.0.1
 *
 * @fileoverview
 *  This file includes definition of SequelizePersistenceProvider.
 *
 * @author Young Suk Ahn Park
 * @date 11/16/15
 */

var lodash = require('lodash');
var uuid = require('node-uuid');

var Exception = require('ecofyjs-exception');
var logger = require('ecofyjs-logger-facade');
var promiseutils = require('../utils/promiseutils');
var DbUtils = require('../utils/sequelizeutils').SequelizeUtils;

var QueryHelper = require('../utils/queryhelper').QueryHelper;

var CriteriaTranslator = require('../utils/criteriatranslatorsequelize').CriteriaTranslatorSequelize;


// Declaration of namespace for internal module use
var internals = {};

internals.DEFAULT_QUERY_LIMIT = 20;

/**
 * @class SequelizePersistenceProvider
 * @todo - Change to SequelizePersistenceProvider
 *
 * @module utils
 *
 * @classdesc
 *  Mongo-based resource provider.
 *  A resource provider's responsibility is the CRUD operations to the
 *  persistent store.
 *
 * @todo - implement PATCH
 *
 * Limitation, the primaryKey property must reside in the rool level
 * @param {!string} modelName - The name of the model
 * @param {!Schema} schema - The Mongoose schema
 * @param {string} config - Configuration
 */
internals.SequelizePersistenceProvider = function(modelName, schema, config) {
	this.logger_ = logger.Logger.getLogger('SequelizePersistenceProvider:' + modelName);

	this.modelName = modelName;
	this.Model_ = DbUtils.getModel(modelName, schema);

	if (config) {
		this.primaryKey_ = config.primaryKey || '_id'; // eg. uuid
		this.autoSetPkIfEmpty_ = config.autoSetPkIfEmpty || true;
		this.includes_ = config.includes;
	}

	this.logger_.info({
		primaryKey: this.primaryKey_, autoSetPkIfEmpty: this.autoSetPkIfEmpty_
	}, 'configured');
};

/**
 * Add resource to the persistent store
 *
 * @param {object} resource  - The resource to add
 * @param {object=} options  - Option
 *
 * @returns {Promise}
 *		{Promise.resolve(Resource)}
 *		{Promise.reject(Exception)}
 */
internals.SequelizePersistenceProvider.prototype.add = function(resource, options)
{
	// Assign a uuid if absent
	if (this.autoSetPkIfEmpty_ && !resource[this.primaryKey_]) {
		resource[this.primaryKey_] = uuid.v4();
	}
	var swLog = new logger.StopwatchLog(this.logger_, 'add');
	var logMeta = {PK: resource[this.primaryKey_]};
	swLog.start(logMeta);

	var promise = promiseutils.createPromise(function(resolve, reject) {

		var resourceModel = this.Model_.build(resource);
		resourceModel.save()
		// this.Model_.create(resource) // This is a shortcut
		.then(function(){
			swLog.stop({uuid: resourceModel.uuid});
		  resolve(resourceModel);
		}.bind(this))
		.catch(function(error){
			swLog.stop({uuid: resourceModel.uuid});
			var exception = Exception.wrapError(error);
			logger.Logger.logError(this.logger_, exception, 'Error when saving to DB', logMeta);
			throw exception;
		}.bind(this))
	}.bind(this));

	return promise;
};

/**
 * Find a single resource
 *
 * @param {Object} criteria - The  criteria
 * @param {Object=} options  - Optional parameters
 *      options._asModel= - Whether to return as Model, if true, or as plain JS Object, otherwise
 *
 * @returns {Promise}
 */
internals.SequelizePersistenceProvider.prototype.find = function(criteria, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'find');
	swLog.start({criteria: criteria, options: options}, undefined, 'info');

	var sequelizeWhere = CriteriaTranslator.translate(criteria);

	options = options || {};
	var raw = (options._asModel) ? !options._asModel : false;

	this.logger_.trace({ sequelizeWhere: sequelizeWhere}, 'find:native-criteria');

	var promise = promiseutils.createPromise(function(resolve, reject) {
		var findParms = {
			where: sequelizeWhere, raw: raw
		};
		if (this.includeModels_) {
			findParms.include = this.buildIncludeModels(options);
		}
		this.Model_.findOne(findParms)
		.then(function(result) {
			swLog.stop();
			if (options && options._asModel === true) {
				resolve(result);
			} else {
				if (result) {
					// @todo: find out if there is somethign similar to result.toObject
					resolve(result.dataValues);
				} else {
					resolve(null);
				}
			}
			this.logger_.debug({result: result});
		}.bind(this))
		.catch(function(error) {
			swLog.stop();
			var exception = Exception.wrapError(error);
			logger.Logger.logError(this.logger_, exception, 'Error when querying DB');
			throw exception;
		}.bind(this));
	}.bind(this));

	return promise;
};

/**
 * Find a single resource by primary key
 *
 * @param {string|number} pk  - Primary key
 * @param {Object=} options  - Optional parameters
 * @returns {Promise}
 */
internals.SequelizePersistenceProvider.prototype.findByPK = function(pk, options)
{
	/*var criteria = {};
	criteria[this.primaryKey_] = pk;
	*/
	var criteria = QueryHelper.createComparisonOp('=', this.primaryKey_, pk);

	return this.find(criteria, options);
};

/**
 * @param {Object<String, Object>} criteria -  A map of criteria
 *        Uses Mongoose's dot notation for the property path
 * @param {Object=} options
 *      options._asModel= - Whether to return as Model, if true, or as plain JS Object, otherwise
 *		options.sort,
 *		options.offset,
 *		options.limit
 *
 * @returns {Promise}
 */
internals.SequelizePersistenceProvider.prototype.query = function(criteria, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'query');
	swLog.start({criteria: criteria, options: options}, undefined, 'info');

	var sequelizeWhere = CriteriaTranslator.translate(criteria);

	options = options || {};
	var offset = options.offset || 0;
	var limit  = options.limit || internals.DEFAULT_QUERY_LIMIT;
	var raw = (options._asModel) ? !options._asModel : false;

	this.logger_.trace({ sequelizeWhere: sequelizeWhere}, 'query:native-criteria');

	// @todo - pagination
	var promise = promiseutils.createPromise(function(resolve, reject) {
		this.Model_.findAll({where: sequelizeWhere, raw: raw})
		.then(function(result){
			swLog.stop();
			resolve(result);
		}.bind(this))
		.catch(function(error){
			swLog.stop();
			var exception = Exception.wrapError(error);
			logger.Logger.logError(this.logger_, exception, 'Error when querying DB', logMeta);
			throw exception;
		}.bind(this))

	}.bind(this));

	return promise;
};


/**
 * Counts the hits that matches the criteria
 *
 * @param {Object} criteria -  A object that represents Ecofy Criteria
 *
 * @returns {Promise}
 */
internals.SequelizePersistenceProvider.prototype.count = function(criteria)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'query');
	swLog.start({criteria: criteria}, undefined, 'info');

	var sequelizeWhere = CriteriaTranslator.translate(criteria);

	// @todo - pagination
	var promise = promiseutils.createPromise(function(resolve, reject) {
		//this.Model_.findAll({attributes: [[DbUtils.getConnection().fn('COUNT', DbUtils.getConnection().col('*')), 'cnt']], where: sequelizeWhere})
		this.Model_.count({where: sequelizeWhere})
		.then(function(result){
			swLog.stop();
			resolve(result);
		}.bind(this))
		.catch(function(error){
			swLog.stop({uuid: resourceModel.uuid});
			var exception = Exception.wrapError(error);
			logger.Logger.logError(this.logger_, exception, 'Error when querying DB', logMeta);
			throw exception;
		}.bind(this))

	}.bind(this));

	return promise;
};


/**
 * Update a resource
 *
 * @param {Object<String, Object>} criteria -  A map of criteria
 *        Uses Mongoose's dot notation for the property path
 * @param resource
 * @param {Object=} options  - Optional parameters
 * @returns {Promise}
 */
internals.SequelizePersistenceProvider.prototype.update = function(criteria, resource, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'update');
	swLog.start({criteria: criteria, options: options});

	var sequelizeWhere = CriteriaTranslator.translate(criteria);

	var promise = promiseutils.createPromise(function(resolve, reject) {

		// http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
		this.Model_.update(resource, {where: sequelizeWhere})
		.then(function(result){
			swLog.stop();
			resolve(result);
		}.bind(this))
		.catch(function(error){
			swLog.stop();
			var exception = Exception.wrapError(error);
			logger.Logger.logError(this.logger_, exception, 'Error when updating DB', logMeta);
			throw exception;
		}.bind(this))
	}.bind(this));

	return promise;
};

/**
 * Saves the mongoose model.
 * Useful when mongoose model is available
 *
 * @param {Model} resourceModel
 * @param options
 * @returns {Promise}
 */
internals.SequelizePersistenceProvider.prototype.updateModel = function(resourceModel, options)
{
	var promise = promiseutils.createPromise(function(resolve, reject) {

		resourceModel.update(resource, {where: sequelizeWhere})
		.then(function(result){
			swLog.stop();
			resolve(result);
		}.bind(this))
		.catch(function(error){
			swLog.stop();
			var exception = Exception.wrapError(error);
			logger.Logger.logError(this.logger_, exception, 'Error when updating DB', logMeta);
			throw exception;
		}.bind(this))
	}.bind(this));

	return promise;
};


/**
 * Updates a resource with those properties provided.
 * Instead of replacing the entire resource, replaces only those properties provided.
 * Uses mongo update with $set
 *
 * @param {Object<String, Object>} criteria -  A map of criteria
 *        Uses Mongoose's dot notation for the property path
 * @param resource
 * @param {Object=} options  - Optional parameters
 * @returns {Promise} Upon success, the data is the original object prior update
 */
internals.SequelizePersistenceProvider.prototype.updatePartial = function(criteria, partialResource, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'update');
	swLog.start({criteria: criteria, options: options});

	var sequelizeWhere = CriteriaTranslator.translate(criteria);

	var promise = promiseutils.createPromise(function(resolve, reject) {

		var setObject = { $set: partialResource };

		// http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
		this.Model_.update(partialResource, {where: sequelizeWhere})
		.then(function(result){
			swLog.stop();
			resolve(result);
		}.bind(this))
		.catch(function(error){
			swLog.stop();
			var exception = Exception.wrapError(error);
			logger.Logger.logError(this.logger_, exception, 'Error when updating DB', logMeta);
			throw exception;
		}.bind(this));

	}.bind(this));

	return promise;
};

/**
 * Delete a resource
 *
 * @param criteria
 * @param {Object=} options  - Optional parameters
 * @returns {Promise}
 */
internals.SequelizePersistenceProvider.prototype.remove = function(criteria, options)
{
	var swLog = new logger.StopwatchLog(this.logger_, 'remove');
	swLog.start({criteria: criteria, options: options}, undefined, 'info');

	var sequelizeWhere = CriteriaTranslator.translate(criteria);

	var promise = promiseutils.createPromise(function(resolve, reject) {
		this.Model_.destroy({where: sequelizeWhere})
		.then(function(result){
			swLog.stop();
			resolve(result);
		}.bind(this))
		.catch(function(error){
			swLog.stop();
			var exception = Exception.wrapError(error);
			logger.Logger.logError(this.logger_, exception, 'Error when deleting from DB');
			throw exception;
		}.bind(this))
	}.bind(this));

	return promise;
};


/**
 * removeByPK
 *
 * Removes a resource by PrimaryKey
 */
internals.SequelizePersistenceProvider.prototype.removeByPK = function(pk, options)
{
	var criteria = QueryHelper.createComparisonOp('=', this.primaryKey_, pk);

	return this.remove(criteria);
};

/**
 * removeByPK
 *
 * Removes a resource by PrimaryKey
 */
internals.SequelizePersistenceProvider.prototype.buildIncludeModels = function(options)
{
	var retval = [];

	// includeModels is of type {<as>: Model,...}
	for (var includeModelAs in this.includeModels_)
	{
		var entry = {};
		entry.model = this.includeModels_[includeModelAs];
		entry.as = includeModelAs;
		entry.required = true;

		// The options.where[alias] => Sequelize criteria
		if (options.where && options.where[includeModelAs]) {
			entry.where = CriteriaTranslator.translate(options.where[includeModelAs]);
		}
		retval.push(entry);
	}
	return retval;
};

/**
 * Factory method to create a provider instance
 *
 * @param {string} modelName  - THe name of the model
 * @param {string | mongoose.Schema} schema  - Either the mongoose schema
 *				object or the name of it. If name is provided, the schema
 *				is loaded require-ing it from ../models/{schema}.js path.
 * @param {Object} config}  - the config
 */
internals.createProvider = function(modelName, schema, config)
{
	var schemaObj = null;
	if (lodash.isObject(schema)) {
		schemaObj = schema;
	} else if (lodash.isString(schema)) {
		// @todo - instead of going one path down, use path from project
		schemaObj = require('../models/' + schema).getSchema();
	}

	return new internals.SequelizePersistenceProvider(modelName, schemaObj, config);
};

module.exports.NAME = 'Sequelize';

module.exports.createProvider = internals.createProvider;
