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

var DbUtils = require('../utils/sequelizeutils').SequelizeUtils;

var baseaccountmanager = require('accountmanager');

// Declaration of namespace for internal module use
var internals = {};

internals.managerInstance = null;

internals.createAccount = function(displayName, role, kind, status, email)
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


/**
 * Factory method
 * persistenceProviderName
 */
internals.getManager = function(persistenceProviderName)
{
    if (!internals.managerInstance)
    {
        internals.managerInstance = baseaccountmanager.getManager(persistenceProviderName);
        internals.managerInstance.accountProvider.includeModels_ = { profile: DbUtils.getModel('Profile', 'profile')}

        /** Additional non-standard methods **/

        internals.managerInstance.prototype.findByEmail = function(emails)
        {
            // @todo - check if emails is an array, if it is use 'in' operator
            var criteria = {
                    op: '=',
                    var: 'profile_email',
                    val: emails
                };
            return internals.managerInstance.find(criteria);
        };

    }
    return internals.managerInstance;
};

module.exports.getManager = internals.getManager;
