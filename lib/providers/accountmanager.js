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
var authmanager = require('./authmanager');


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
internals.AccountManager.prototype.getAuthManager = function()
{
    if (this.authManager ==  null)
    {
        this.authManager = authmanager.getManager();
    }
    return this.authManager;
}


/**
 * Add a account
 * @param resource
 * @param options
 * @returns {*}
 */
internals.AccountManager.prototype.add = function(resource, options)
{
    return this.accountProvider.add(resource, options);
};

/**
 *
 * @param {Object} options   -
 *      options.fetchAncestors - Whether or not to fetch ancestors
 */
internals.AccountManager.prototype.find = function(criteria, options)
{
    var promise = this.accountProvider.find(criteria, options)
    .then(function(account) {
        if (account)
        {
            var authCriteria = {
                op: '=',
                var: 'account', 
                val: account._id
            };
            return this.getAuthManager().query(authCriteria)
            .then(function(auths) {
                account.auths = auths;
                return account;
            });
        } else {
            return account;
        }
    }.bind(this));

    return promise;
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
    return this.accountProvider.remove(criteria, options);
};

/**
 * Removes an auth record
 */
internals.AccountManager.prototype.removeByPK = function(pk, options)
{
    return this.accountProvider.remove(pk, options);
};

/** Additional non-standard methods **/

internals.AccountManager.prototype.findByEmail = function(emails)
{
    // @todo - check if emails is an array, if it is use 'in' operator
    var criteria = {
            op: '=',
            var: 'profile.emails', 
            val: emails
        };
    return this.find(criteria);
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