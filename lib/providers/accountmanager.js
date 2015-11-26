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
"use strict";

var uuid = require('node-uuid');

var logger = require('ecofyjs-logger-facade');

var promiseutils = require('../utils/promiseutils');

var QueryHelper = require('../utils/queryhelper').QueryHelper;

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
class AccountManager
{
  constructor(persistenceProvider, config)
  {
    config = config || {};
    this.SYSID_COLUMN_ = config.sysIdCol || '_id'; // 'uuid' for RDBMS

    this.logger_ = logger.Logger.getLogger('AccountManager');
    this.persistenceProvider = persistenceProvider;

    var providerConfig = {
      primaryKey: 'uuid'
    };
    this.accountProvider = persistenceProvider.createProvider('Account', 'account', providerConfig);
    this.authManager = null;

    this.logger_.info(providerConfig, 'AccountManager inited with ' + this.persistenceProvider.NAME);
  }

  // export the column name
  SYSID_COLUMN()
  {
    return this.SYSID_COLUMN_;
  }

  /**
   * Gets the AuthManager instance
   */
  getAuthManager()
  {
      if (this.authManager ==  null)
      {
          this.authManager = authmanager.getManager(this.persistenceProvider.NAME.toLowerCase());
      }
      return this.authManager;
  }


  /**
   * Add a account
   * @param resource
   * @param options
   * @returns {*}
   */
  add(resource, options)
  {
      var promise = this.accountProvider.add(resource, options)
      .then(function(account) {
          // If auth was provided, add it too
          if (account && resource.auth)
          {
              resource.auth.account = account[this.SYSID_COLUMN_];
              // Assume there is only one auth
              return this.getAuthManager().add(resource.auth)
              .then(function(auth) {
                  account.auths = [auth];
                  return account;
              });

          } else {
              return account;
          }
      }.bind(this));

      return promise;
  }

  /**
   * Retrieves an account
   *
   * @param {Object} options   -
   *      options.fetchAuths - Whether or not to fetch auths
   */
  find(criteria, options)
  {
    var promise = this.accountProvider.find(criteria, options)
    .then(function(account) {
        if (account && options && options.fetchAuths === 'true')
        {
          var authAccountFK = self.getAuthManager().ACCOUNT_FK();
          var authCriteria = QueryHelper.createComparisonOp('=', authAccountFK, element[self.SYSID_COLUMN_]);
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
  }

  findByPK(pk, options)
  {
      /*var criteria = {};
      criteria[this.accountProvider.primaryKey_] = pk;
      */

      var criteria = QueryHelper.createComparisonOp('=', this.accountProvider.primaryKey_, pk);

      return this.find(criteria, options);
  }

  /**
   * @param {Map.<String, Object>} criteria -  A map of criteria
   */
  query(criteria, options)
  {
      return this.accountProvider.query(criteria, options);
  }

  /**
   * Counts the matching records
   * @param {Map.<String, Object>} criteria -  A map of criteria
   */
  count(criteria)
  {
      return this.accountProvider.count(criteria);
  }

  update(criteria, resource, options)
  {
      resource.modifiedAt = new Date();
      return this.accountProvider.update(criteria, resource, options);
  }

  /**
   * Removes accounts and all the associated auths
   */
  remove(criteria, options)
  {
      var self = this;
      // @todo remove all associated auths
      return this.query(criteria)
      .then(function(accountsToRemove) {
          return self.removeAssociatedAuths(accountsToRemove);

      })
      .then(function (count){
          return self.accountProvider.remove(criteria, options);
      });
  }

  /**
   * Remove all associated auth
   * @param {Array.<Account>} accounts - The array of accounts to be deleted
   */
  removeAssociatedAuths(accounts)
  {
      var self = this;
      var promise = promiseutils.createPromise(function(resolve, reject) {
          if (accounts && accounts.length > 0) {
              var ctr = 0;
              accounts.forEach (function (element, index){
                var authAccountFK = self.getAuthManager().ACCOUNT_FK();
                var authCriteria = QueryHelper.createComparisonOp('=', authAccountFK, element[self.SYSID_COLUMN_]);
                self.getAuthManager().remove(authCriteria)
                .then(function(deleted) {
                    commonHandler();
                })
                .catch(function(error) {
                    self.logger_.error.log(authCriteria,  'Failed to delete auth');
                    commonHandler();
                })
              });
              function commonHandler() {
                  ctr++;
                  if (ctr === accounts.length) {
                      return resolve(ctr);
                  }
              }
          } else {
              resolve(0);
          }
      }.bind(this));

      return promise;
  }

  /**
   * Removes an auth record
   */
  removeByPK(pk, options)
  {
      var criteria = QueryHelper.createComparisonOp('=', this.accountProvider.primaryKey_, pk);
      return this.accountProvider.remove(criteria, options);
  }

  /** Additional non-standard methods **/

  findByEmail(emails)
  {
      // @todo - check if emails is an array, if it is use 'in' operator
      var criteria = {
              op: '=',
              var: 'profile.emails',
              val: emails
          };
      return this.find(criteria);
  }

  /**
   * Changes the lastLogin times
   */
  touch(pk)
  {
      // @todo - check if emails is an array, if it is use 'in' operator
      var criteria = QueryHelper.createComparisonOp('=', this.accountProvider.primaryKey_, pk);
      var setLastLogin = {
          lastLogin: new Date()
      };
      return this.accountProvider.updatePartial(criteria, setLastLogin);
  }

  createAccount(displayName, role, kind, status, email)
  {
      return {
          kind: kind,
          roles: [role],
          status: status,
          displayName: displayName,
          profile: {
              emails: [email]
          }
      };
  }
}

/**
 * Factory method
 * persistenceProviderName
 */
internals.getManager = function(persistenceProviderName)
{
    if (!internals.managerInstance)
    {
        var persistenceProviderPath = './' + (persistenceProviderName || 'mongo') + 'persistenceprovider';
        var persistenceProvider = require(persistenceProviderPath);

        internals.managerInstance = new AccountManager(persistenceProvider);
    }
    return internals.managerInstance;
};

module.exports.AccountManager = AccountManager;
module.exports.getManager = internals.getManager;
