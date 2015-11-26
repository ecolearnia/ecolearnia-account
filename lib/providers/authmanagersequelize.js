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

var DbUtils = require('../utils/sequelizeutils').SequelizeUtils;
var persistenceProvider = require('./sequelizepersistenceprovider');

var accountmanager = require('./accountmanagersequelize');
var baseauthmanager = require('./authmanager');

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
class AuthManagerSequelize extends baseauthmanager.AuthManager
{
  constructor(persistenceProvider)
  {
    super(persistenceProvider);
    this.SYSID_COLUMN_ = 'uuid';
    this.ACCOUNT_FK_ = 'AccountUuid';
  }

  /**
   * Gets the AccountManager instance
   */
  getAccountManager()
  {
      if (this.accountManager ==  null)
      {
          this.accountManager = accountmanager.getManager(this.persistenceProvider.NAME.toLowerCase());
      }
      return this.accountManager;
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
      internals.managerInstance = new AuthManagerSequelize(persistenceProvider);
  }
  return internals.managerInstance;
};

module.exports.getManager = internals.getManager;
