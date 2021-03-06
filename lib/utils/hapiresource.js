/*
 * This file is part of the EcoLearnia platform.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * EcoLearnia v0.0.2
 *
 * @fileoverview
 *  This file includes definition of HapiResource.
 *
 * @author Young Suk Ahn Park
 * @date 2/25/15
 */


var Exception = require('ecofyjs-exception');
var Logger = require('ecofyjs-logger-facade').Logger;

var utils = require('./utils');
var promiseutils = require('../utils/promiseutils');
var QueryHelper = require('./queryhelper').QueryHelper;

//var JsonValidator = require('themis');
// Another fast alternative for JSON Schema Validator:
// https://github.com/mafintosh/is-my-json-valid

// Declare internals namespace
var internals = {};

/**
 * @class HapiResource
 *
 * @module utils
 *
 * @classdesc
 *  Object of this class handles the common REST API endpoints:
 *  GET, POST, PUT, DELETE
 *
 * @todo - implement PATCH
 *
 *
 * @param {!string}   basePath - The base path (not including the the DNS)
 * @param {!string}   name  - The name of of this resource
 * @param {!Provider} provider  - The resource provider that provides CRUD functionalites
 * @param {Object=}   criteriaKeyDictionary
 *      For example when router is configured to /parent/{parent}/item/{item}
 *      with the { parent: 'parentUuid', item: 'itemUuid'
 *      at the moment of sending the query to the provider, it will be
 *      { parentUuid: {parent}, itemUuid: {item}
 * @param (Object) authSettings - Authorization settings
 *
 */
internals.HapiResource = function(basePath, name, provider, criteriaKeyDictionary, authSettings)
{
    this.logger_ = Logger.getLogger('HapiResource:' + name);

    /**
     * The base path as in http://domain.com/<base_path>
     * @type {string}
     * @private
     */
    this.basePath_ = basePath || '';
    if (this.basePath_.length > 0 && !utils.endsWith(this.basePath_, '/')) {
        this.basePath_ += '/';
    }

    /**
     * Name of this resource, used as identifier
     * @type {!string}
     * @private
     */
    this.name_ = name;

    this.logger_.info({name: name, basePath: this.basePath_},  'Initializing HapiResource');

    /**
     * The underlying persistent store provider
     * @type {!Provider}
     * @private
     */
    this.provider_ = provider;

    /**
     * The mapping used to translate the criteria key
     * @type {Object}
     * @private
     */
    this.criteriaKeyDictionary_ = criteriaKeyDictionary || {};

    /**
     * Au/Az Settings
     * @type {Object=}
     * @private
     */
    this.authSettings_ = authSettings;

    /**
     * Reference to the parent resoruce
     * @type {HapiResource=}
     * @private
     */
    this.parentResource_ = null;

    /**
     * Children resources
     * @type {Object<string, HapiResource>=}
     * @private
     */
    this.subResources_ = {};

};

/**
 * Get the name of this resource
 * Get the name of this resource
 * @returns {!string}
 */
internals.HapiResource.prototype.getName = function()
{
    return this.name_;
};

/**
 * Return the provider
 * @returns {!Provider}
 */
internals.HapiResource.prototype.getProvider = function()
{
    return this.provider_;
};

/**
 * From a map, filters entries depending on the filter in/out parameters.
 * @todo - consider changing to regex
 *
 * @param {Object} object  - the query entries
 * @param {string=} prefixFilterOut  - If present, only properties that has this prefix are included 
 * @param {string=} prefixFilterIn  - If present, only properties that has this prefix are included 
 */
internals.HapiResource.prototype.filterEntries = function(object, prefixFilterOut, prefixFilterIn)
{
    var properties = {};
    for (var propName in object) {
        if (object.hasOwnProperty(propName)) {
            // properties with prefix to be filtered out
            if (prefixFilterOut === undefined || 
                prefixFilterOut &&  utils.startsWith(propName, prefixFilterOut)) {
                continue;
            }
            // properties with prefix to be filtered in
            if (prefixFilterIn === undefined || 
                prefixFilterIn &&  utils.startsWith(propName, prefixFilterIn) )
            {
                var propNameWoPrefix = (prefixFilterIn === undefined) ? propName : propName.substring(prefixFilterIn.length);
                properties[propNameWoPrefix] = object[propName];
            }
        }
    }

    return properties;
}

/**
 * Translates the query criteria by changing each of params's name as 
 * specified in the criteriaKeyDictionary_ if exists.
 * Those parameter names that starts with underscore is skipped.
 *
 * @param {Object} object  - the query entries (e.g. from query string)
 * @param {Object} defaultCriteria  - the default criteria
 */
internals.HapiResource.prototype.translateCriteria = function(object)
{
    var criteria = {};
    for (var property in object) {
        if (object.hasOwnProperty(property)) {
            // All properties that has prefix _ are skipped
            if (this.criteriaKeyDictionary_.hasOwnProperty(property)) {

                //criteria[this.criteriaKeyDictionary_[property]] = object[property];
                utils.dotAccess(criteria, this.criteriaKeyDictionary_[property], object[property])

            } else {
                criteria[property] = object[property];
            }
        }
    }

    return criteria;
}


/**
 * set the parent resource
 *
 * @param {HapiResource} parentResource  - Reference to the parent (containing)
 *      resource 
 */
internals.HapiResource.prototype.setParent_ = function(parentResource)
{
    this.parentResource_ = parentResource;
};

/**
 * Add a sub resource
 *
 * @param {HapiResource} subResource  - Reference to the nested resource  
 */
internals.HapiResource.prototype.addSubResource = function(subResource)
{
    this.subResources_[subResource.getName()] = subResource;
    subResource.setParent_(this);
};

/**
 * Returns the RESTy context path traversing the parents.
 * E.g. given resource 'activity' with parents 'project', and 'task', it will return
 * /project/{projectId}/task/{taskId}/activity/
 *
 * @returns {string}
 */
internals.HapiResource.prototype.getContextPath = function()
{
    var paths = [];

    var ptr = this; // iterator
    while(ptr.parentResource_)
    {
        paths.unshift(ptr.parentResource_.basePath_ + ptr.parentResource_.getName() 
            + '/{' + ptr.parentResource_.getName()+ 'Id}/');
        ptr = ptr.parentResource_;
    }
    paths.push(this.basePath_ + this.getName());
    if (paths[0].charAt(0) !== '/') {
        paths.unshift('/');
    }
    return paths.join('');
};

/**
 * registerCustomRoute
 * @todo - change to registerRoute
 *
 * register a single route with custom behavior
 *
 * @param {Object} server  - The Hapi server
 * @param {Object} routeConfig - route configuration, see below
 *      {string}  routeConfig.httpVerb - HTTP verb: 'GET', 'POST', etc.
 *      {string}  routeConfig.path     - The relative path that this route maps to
 *      {number}  routeConfig.successStatus      - The status to return when no error.
 *      {string=} routeConfig.authStrategy      - The Hapi auth strategy to use. usually jwt.
 *      {function(reuquest, options)} routeConfig.handler 
 *              - The function that handles the request and returns promise
 *                The promise's success value is an object of {data, status}
 */
internals.HapiResource.prototype.registerRoute = function(server, routeConfig)
{
    var self = this;
    var fullPath = this.getContextPath() + routeConfig.path;
    this.logger_.info({method: routeConfig.httpVerb, path: fullPath, authStrategy: routeConfig.authStrategy}, 'Registering route');
    
    // Add a Hapi Route
    var route = {
        method: routeConfig.httpVerb,
        path: fullPath,
        handler: function(request, reply) {

            var response = null;
            var status = routeConfig.successStatus || 200;
            try {

                // 1. Any pre processing 
                promiseutils.resolve( 
                    // Execute immediately to use the return value as argument
                    //(routeConfig.auth) ? routeConfig.auth.checkAuthorization(request) : false
                    (function(){
                        // Any pre processing
                        return true;
                    }())
                )
                // 2. Execute the actual logic 
                .then(function(){
                    var options = self.filterEntries(request.query, null, '_');
                    return routeConfig.handler(request, options);
                })
                // 3. Assign to the paylod to be returned and log
                .then(function(handlerResult){
                    response = handlerResult;
                    logCompletion(self.logger_, routeConfig.httpVerb + ':succeeded', routeConfig.path, status);
                })
                .catch(function(error){
                    if (error instanceof Exception) {
                        status = error.statusCode;
                        response = error.toJSON();
                    } else {
                        response = error.toString();
                    }
                    logCompletion(self.logger_, routeConfig.httpVerb + ':error', routeConfig.path, status, error);
                })
                // [ES6] There is no finally in ES6 Promise
                .finally(function(){
                    return reply(response).code(status);
                });
    
            } catch (except) {
                response = except.stack;
                status = 500;
                logCompletion(self.logger_, routeConfig.httpVerb + ':failed', routeConfig.path, status, response);
                return reply(response).code(status);;
            }
        }.bind(this)
    };

    // Add Hapi's authorization strategy
    if (routeConfig.authStrategy) {
        route.config = { 
            auth: routeConfig.authStrategy 
        };
    }

    server.route(route);
};

/**
 * registerStandardRoutes
 * @todo - change to registerStandardRoutes
 *
 * Creates and registers the standard routes
 *
 * @param {Object} server  - The Hapi server
 */
internals.HapiResource.prototype.registerStandardRoutes = function(server)
{
    this.registerStandardRoutesRecursive_(this, server);
};

internals.HapiResource.prototype.criteriaFromRequestParam = function(request)
{
    var criteria = {};
    var ids = this.translateCriteria(request.params);

    var  comparisonOps = [];
    for (prop in ids) {
        var comparisonOp = QueryHelper.createComparisonOp('=', prop, ids[prop]);
        comparisonOps.push(comparisonOp);
    }
    if (comparisonOps.length == 1) {
        criteria = comparisonOps[0];
    } else if (comparisonOps.length > 1) {
        criteria = QueryHelper.createLogicalOp('and', comparisonOps);
    }
    return criteria;
};

internals.HapiResource.prototype.checkAuthorization_ = function(request, resource)
{
    var self = this;
    return promiseutils.resolve( 
        // Execute immediately to use the return value as argument
        (self.authSettings_) ? self.authSettings_.checkAuthorization(request, resource) : true
    )
    .then(function(authorized){
        if (authorized) {
            return true;
        } else {
            var forbiddenError = Exception.createForbiddenError(null,  null, 'Insufficient privilege');
            throw forbiddenError;
        }
    })
}

/**
 * Creates and registers the standard routes for all the ancestors
 * @todo: instead of recurse to ancestor, traverse children.
 *
 * @param {Object} server  - The Hapi server
 * @param {Object} ptr     - Pointer to traverse
 */
internals.HapiResource.prototype.registerStandardRoutesRecursive_ = function(ptr, server)
{
    var self = this;
    if (ptr.parentResource_)
    {
        ptr.registerStandardRoutesRecursive_(ptr.parentResource_, server)
    }

    if (ptr.routeRegistered_)
        return;
    ptr.routeRegistered_ = true;

    var contextPath = ptr.getContextPath();

    ptr.logger_.info({contextPath: contextPath}, 'Registering resource routes');

    /**
     * Route: List resources
     * query: q - (URL encoded EQL), e.g. name="Young" AND age > 30
     *      _meta - (string) true to include result metadata (request details, totalHits)
     *                       the actual resources are returned in the documents[] property.
     *      _page - (number) page number
     *      _offset - (number) starting offset
     *      _limit - (number) maximul number of entries per page
     */
    var listRoute = {
        httpVerb: 'GET',
        path: '',
        authStrategy: (self.authSettings_) ? self.authSettings_.authStrategy('GET_QUERY') : null,
        handler: function(request) {
            var criteria = this.criteriaFromRequestParam(request);
            var withMeta = (request.query._meta === 'true');
            
            // For the criteria, conjoin the request param's id with the query
            if (request.query.q) {
                var queryHelper = new QueryHelper();
                var qcriteria = queryHelper.parse(request.query.q);
                if (Object.keys(criteria).length === 0) {
                    criteria = qcriteria;
                } else {
                    // If there were criteria provided in query string as c1=v1, etc.
                    var factors = [];
                    factors.push(criteria);
                    factors.push(qcriteria);
                    criteria = QueryHelper.createLogicalOp('and', factors);
                }
            }

            // Pagination:
            var options = {                
                sort: {},
                limit: request.query._limit ? Number(request.query._limit) : 50,
                offset: request.query._offset ? Number(request.query._offset) : 0,
                page: request.query._page ? Number(request.query._page) : 0,
            };
            if (options.page > 0 && options.offset === 0) {
                options.offset = options.page * options.limit;
            }
            var response = {
                criteria:  criteria,
                page: options.page,
                offset: options.offset,
                limit: options.limit
            };

            // Second argment is the resource to check the authorization 
            return this.checkAuthorization_(request, null)
            .then(function (authorized) {
                return ptr.provider_.count(criteria);
            })
            .then(function (count) {
                response.totalHits = count;
                return ptr.provider_.query(criteria, options);
            })
            .then(function (resources) {
                response.documents = resources;
                if (withMeta) {
                    return response;
                } else {
                    return resources;
                }
            });

        }.bind(this)
    }
    ptr.registerRoute(server, listRoute);


    /**
     * Route: Retrieve resource
     */
    var retrieveRoute = {
        httpVerb: 'GET',
        path: '/{id}',
        authStrategy: (self.authSettings_) ? self.authSettings_.authStrategy('GET') : null,
        handler: function(request) {
            var criteria = this.criteriaFromRequestParam(request);
            //var criteria = this.translateCriteria(request.params);

            var options = this.filterEntries(request.query, null, '_');

            // Notice: for the error to be cause rejection, it shoud return the .then chain; 
            return ptr.provider_.find(criteria, options)
            .then(function(resource){
                if (resource) {
                    return resource;
                } else {
                    var error = Exception.createNotFoundError(null, {id: request.params.id});
                    throw error;
                }
            });
        }.bind(this)
    }
    ptr.registerRoute(server, retrieveRoute);
    

    /**
     * Route: Add resource
     */
    var addRoute ={
        httpVerb: 'POST',
        path: '',
        authStrategy: (self.authSettings_) ? self.authSettings_.authStrategy('POST') : null,
        successStatus: 201,
        handler: function(request) {
            var resource = request.payload;

            // Used to populate the resource with contextual ids, i.e, the parent resources' ids 
            var contextIds = this.translateCriteria(request.params);
            if (contextIds) {
                utils.dotPopulate(resource, contextIds);
            }

            return ptr.provider_.add(resource);
        }.bind(this)
    }
    ptr.registerRoute(server, addRoute);
    
    /**
     * Route: Update resource
     */
    var updateRoute ={
        httpVerb: 'PUT',
        path: '/{id}',
        authStrategy: (self.authSettings_) ? self.authSettings_.authStrategy('PUT') : null,
        handler: function(request) {
            var criteria = this.criteriaFromRequestParam(request);
            var resource = request.payload;

            return ptr.provider_.update(criteria, resource);
        }.bind(this)
    }
    ptr.registerRoute(server, updateRoute);
 
    /**
     * Route: Delete resource
     */
    var deleteRoute ={
        httpVerb: 'DELETE',
        path: '/{id}',
        authStrategy: (self.authSettings_) ? self.authSettings_.authStrategy('DELETE') : null,
        handler: function(request) {
            var criteria = this.criteriaFromRequestParam(request);
            return ptr.provider_.remove(criteria);
        }.bind(this)
    }
    ptr.registerRoute(server, deleteRoute);
    
};


/**
 * Log for when completed
 * @param logger
 * @param message
 * @param contextPath
 * @param status
 * @param error
 */
function logCompletion(logger, message, contextPath, status, error) {
    var logObj = {
        contextPath: contextPath,
        status: status,
    };
    if (error) {
        Logger.logError(logger, error, message, logObj);
    } else {
        logger.info(logObj, message);
    }
}

module.exports.HapiResource = internals.HapiResource;