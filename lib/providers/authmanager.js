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

var mongopersistenceprovider = require('./mongopersistenceprovider');
var accountmanager = require('./accountmanager');


// Declaration of namespace for internal module use
var internals = {};


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
    this.accountManager = null;
};

/**
 * Gets the nodeManager instance
 */
internals.AuthManager.prototype.getAccountManager = function()
{
    if (this.accountManager ==  null)
    {
        this.accountManager = accountmanager.getManager();
    }
    return this.accountManager;
}


/**
 * Add a account
 * @param resource
 * @param options
 * @returns {*}
 */
internals.AuthManager.prototype.add = function(resource, options)
{
    return this.authProvider.add(resource, options);
};

/**
 *
 * @param {Object} options   -
 *      options.fetchAccount - Whether or not to fetch acount
 */
internals.AuthManager.prototype.find = function(criteria, options)
{
    //return this.authProvider.find(criteria, options);

    var promise = this.authProvider.find(criteria, options)
    .then(function(auth) {
        if (auth && options && options.fetchAccount === 'true')
        {
            var accountCriteria = {
                op: '=',
                var: '_id', 
                val: auth.account
            };
            return this.getAccountManager().find(accountCriteria)
            .then(function(account) {
                auth.account = account;
                return auth;
            });
        } else {
            return auth;
        }
    }.bind(this));

    return promise;
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
 * Removes an auth record
 */
internals.AuthManager.prototype.remove = function(criteria, options)
{
    return this.authProvider.remove(criteria, options);
};

/**
 * Removes an auth record
 */
internals.AuthManager.prototype.removeByPK = function(pk, options)
{
    return this.authProvider.remove(pk, options);
};

/** Additional non-standard methods **/

/**
 * @param {model.Auth} authCriteria - the Auth model which was populated from auth provider
 */
internals.AuthManager.prototype.findFromCredentials = function(authCriteria)
{
    var promise = promiseutils.createPromise(function(resolve, reject) {
        
        var auth;
        var criteria = {
            op: 'and',
            args: [
                { 
                    op: '=',
                    var: 'authSource', 
                    val: authCriteria.authSource
                },
                { 
                    op: '=',
                    var: 'authId', 
                    val: authCriteria.authId
                }
            ]
        };

        this.find(criteria)
        .then(function(hitAuthModel) {
            if (hitAuthModel) {
                auth = hitAuthModel;
                var accountCriteria = { 
                        op: '=',
                        var: '_id', 
                        val: hitAuthModel.account
                    };
                return this.getAccountManager().find(accountCriteria)
            }
            return null;
        }.bind(this))
        .then(function(accountModel) {
            if (accountModel) {
                auth.accountObject = accountModel;
            }
            resolve(auth);
        })
        .catch(function(error){
            reject (error);
        });

    }.bind(this));

    return promise;
};


/**
 * Creates a new entry for Account - if no match found with same emails, and
 * creates a new entry for Auth.
 *
 * We assume that user can try to sign up with different auth providers but  
 * they have overlapping emails in the user profile.
 * Same person with two different auth providers with no overlapping emails will create two 
 * different accounts.
 *
 * @param {model.Acount} account - the Account which was populated from auth provider
 * @param {model.Auth} auth - the Auth which was populated from auth provider
 * @return {Promise}  Success return auth object with account
 */
internals.AuthManager.prototype.createAccountAndAuth = function(account, auth)
{
    var promise = promiseutils.createPromise(function(resolve, reject) {

        if (!account.profile.emails)
        {
            // @todo validate email;
            return reject(new Error('Required property account.profile.email not found'));
        }

        // We assume that user can try to sign up with different auth providers
        // But they have overlapping emails in the user profile
        this.getAccountManager().findByEmail(account.profile.emails[0])
        .then(function(matchAccountModel) {
            if (matchAccountModel) {
                return matchAccountModel;
            }
            // if not found, create one
            this.logger_.info({auth: auth}, 'No matching Account found, creating one...');
            return this.getAccountManager().add(account);
        }.bind(this))
        .then(function(accountModel) {
            auth.account = accountModel._id;
            this.add(auth)
            .then(function(authModel) {
                var auth = authModel;
                auth.accountObject = accountModel;
                resolve(auth);
            });
        }.bind(this))
        .catch(function(error) {
            reject(error);
        });
    }.bind(this));

    return promise;
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