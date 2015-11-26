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

var authmanager = require('./authmanagersequelize');
var baseaccountmanager = require('./accountmanager');

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
class AccountManagerSequelize extends baseaccountmanager.AccountManager
{
  constructor(persistenceProvider)
  {
    super(persistenceProvider);
    this.SYSID_COLUMN_ = 'uuid';
    this.accountProvider.includeModels_ = { profile: DbUtils.getModel('Profile', 'profile')};
  }

  getAuthManager()
  {
      if (this.authManager ==  null)
      {
          this.authManager = authmanager.getManager(this.persistenceProvider.NAME.toLowerCase());
      }
      return this.authManager;
  }

  add(resource, options)
  {
    var account;
    return super.add(resource, options)
    .then(function(accountModel) {
      account = accountModel;
      // add profile
      var profile = resource.profile;
      profile.AccountUuid = account.uuid;
      return internals.ProfileModel.create(profile); // This is a shortcut
    })
    .then(function(profile) {
      account.profile = profile;
      return account;
    });
  }

  findByEmail(email)
  {
      // @todo - check if emails is an array, if it is use 'in' operator
      var options = {
        where: {}
      }
      options.where.profile = {
              op: '=',
              var: 'primaryEmail',
              val: email
          };
      return this.find(null, options);
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
    internals.ProfileModel = DbUtils.getModel('Profile', 'profile');
      internals.managerInstance = new AccountManagerSequelize(persistenceProvider);
  }
  return internals.managerInstance;
};

module.exports.getManager = internals.getManager;
