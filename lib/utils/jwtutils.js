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
 *  This file includes definition of HapiResource.
 *
 * @author Young Suk Ahn Park
 * @date 9/28/15
 */
var JWT = require('jsonwebtoken');

// Declararation of namespace for internal module use
var internals = {};

internals.JwtUtils = {};

/**
 * connect
 *
 * @param {string} connSgtring  'mongodb://localhost/test'
 */
internals.JwtUtils.createToken = function(account, secret)
{
    var token = {
        // Standard:
        // iss: issuer,
        // exp: expiration
        // iat: issued at

        id: account.uuid,
        kind: account.kinds,
        roles: account.roles,
        displayName: account.displayName
    };

    return JWT.sign(token, secret);
};

/**
 * Decode token
 */
internals.JwtUtils.decodeToken = function(token, secret)
{
    return JWT.verify(token, secret);
};


module.exports.JwtUtils = internals.JwtUtils;