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
 *  This file includes definition of AuthManager class.
 *
 * @author Young Suk Ahn Park
 * @date 2/15/15
 */

var uuid = require('node-uuid');

var logger = require('ecofyjs-logger-facade');

var promiseutils = require('../utils/promiseutils');

var QueryHelper = require('../utils/queryhelper').QueryHelper;

var DbUtils = require('../utils/mongoutils').MongoUtils;

var mongopersistenceprovider = require('./providers/mongopersistenceprovider');


// Declaration of namespace for internal module use
var internals = {};


internals.Content = DbUtils.getModel('ContentItem', contentItemSchema);

internals.managerInstance = null;

/**
 * @class AuthManager
 *
 * @module providers
 *
 * @classdesc
 *  Object of this class provides CRUD operations to Content Item.
 *
 */
internals.AuthManager = function()
{
    this.logger_ = logger.Logger.getLogger('AuthManager');

    var providerConfig = { primaryKey: 'uuid'};    
    this.authProvider = mongopersistenceprovider.createProvider('Auth', 'auth', providerConfig);
    this.instance = null;
};

/**
 * Gets the nodeManager instance
 */
internals.AccountManager.prototype.getAccountManager = function()
{
    if (this.accountManager ==  null)
    {
        this.accountManager = accountmanager.getManager();
    }
    return this.accountManager;
}


/**
 * Add a account
 * @param contentItem
 * @param options
 * @returns {*}
 */
internals.AuthManager.prototype.add = function(contentItem, options)
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
internals.AuthManager.prototype.find = function(criteria, options)
{
    return this.authProvider.find(criteria, options);
};

internals.AuthManager.prototype.findByPK = function(pk, options)
{
    /*var criteria = {};
    criteria[this.authProvider.primaryKey_] = pk;
    */

    var criteria = QueryHelper.createComparisonOp('=', this.authProvider.primaryKey_, pk);

    return this.find(criteria, options);
};

/**
 * @param {Map.<String, Object>} criteria -  A map of criteria
 */
internals.AuthManager.prototype.query = function(criteria, options)
{
    return this.authProvider.query(criteria, options);
};


internals.AuthManager.prototype.count = function(criteria)
{
    return this.authProvider.count(criteria);
};

internals.AuthManager.prototype.update = function(criteria, resource, options)
{
    return this.authProvider.update(criteria, resource, options);
};

/**
 * Removes an item and updates it's parents accordinlgy
 * Manual test OK.
 */
internals.AuthManager.prototype.remove = function(criteria, options)
{
    var promise = promiseutils.createPromise(function(resolve, reject) {
        
    }.bind(this));

    return promise;
};

/** Additional non-standard methods **/

internals.AuthManager.prototype.retrieveByEmail = function(email)
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
        internals.managerInstance = new internals.AuthManager();
    }
    return internals.managerInstance;
};

module.exports.getManager = internals.getManager;