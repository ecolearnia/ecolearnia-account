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
 *  This file includes definition of AccountManager class.
 *
 * @author Young Suk Ahn Park
 * @date 2/15/15
 */

var uuid = require('node-uuid');

var logger = require('ecofyjs-logger-facade');

var promiseutils = require('../utils/promiseutils');

var QueryHelper = require('../utils/queryhelper').QueryHelper;

var DbUtils = require('../utils/mongoutils').MongoUtils;

var mongopersistenceprovider = require('./mongopersistenceprovider');


// Declaration of namespace for internal module use
var internals = {};


internals.managerInstance = null;

/**
 * @class AccountManager
 *
 * @module providers
 *
 * @classdesc
 *  Object of this class provides CRUD operations to Content Item.
 *
 */
internals.AccountManager = function()
{
    this.logger_ = logger.Logger.getLogger('AccountManager');

    var providerConfig = { primaryKey: 'uuid'};    
    this.accountProvider = mongopersistenceprovider.createProvider('Account', 'account', providerConfig);
    this.authManager = null;
};

/**
 * Gets the nodeManager instance
 */
internals.AccountManager.prototype.getAccountManager = function()
{
    if (this.authManager ==  null)
    {
        this.authManager = authmanager.getManager();
    }
    return this.authManager;
}


/**
 * Add a account
 * @param contentItem
 * @param options
 * @returns {*}
 */
internals.AccountManager.prototype.add = function(contentItem, options)
{
    var self = this;
    var promise = promiseutils.createPromise(function(resolve, reject) {
        

    }.bind(this));

    return promise; 
};

/**
 *
 * @param {Object} options   -
 *      options.fetchAncestors - Whether or not to fetch ancestors
 */
internals.AccountManager.prototype.find = function(criteria, options)
{
    return this.accountProvider.find(criteria, options);
};

internals.AccountManager.prototype.findByPK = function(pk, options)
{
    /*var criteria = {};
    criteria[this.accountProvider.primaryKey_] = pk;
    */

    var criteria = QueryHelper.createComparisonOp('=', this.accountProvider.primaryKey_, pk);

    return this.find(criteria, options);
};

/**
 * @param {Map.<String, Object>} criteria -  A map of criteria
 */
internals.AccountManager.prototype.query = function(criteria, options)
{
    return this.accountProvider.query(criteria, options);
};


internals.AccountManager.prototype.count = function(criteria)
{
    return this.accountProvider.count(criteria);
};

internals.AccountManager.prototype.update = function(criteria, resource, options)
{
    return this.accountProvider.update(criteria, resource, options);
};

/**
 * Removes an item and updates it's parents accordinlgy
 * Manual test OK.
 */
internals.AccountManager.prototype.remove = function(criteria, options)
{
    var promise = promiseutils.createPromise(function(resolve, reject) {
        
    }.bind(this));

    return promise;
};

/** Additional non-standard methods **/

internals.AccountManager.prototype.retrieveByEmail = function(email)
{
    return this.find({'profile.emails': email});
};


/**
 * Factory method
 */
internals.getManager = function()
{
    if (!internals.managerInstance)
    {
        internals.managerInstance = new internals.AccountManager();
    }
    return internals.managerInstance;
};

module.exports.getManager = internals.getManager;