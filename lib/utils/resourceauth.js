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
 * @date 10/31/15
 */


var Logger = require('ecofyjs-logger-facade').Logger;
var JwtUtils = require('./jwtutils').JwtUtils;


// Declare internals namespace
var internals = {};

/**
 * @class ResourceAuth
 *
 * @module utils
 *
 * @classdesc
 *  
 * @todo - implement PATCH
 *
 *
 * @param {!Object} config - The config, for now 
 * 				config.authStrategy  - for each for the methods
 * 				config.jwtSecret to decrypt JWT
 * @param {!Object} rules  - The rules for allowing/disallowing
 *
 * rules: {
 	"role1": {
 		"read-own": true,
		"create-own": true,
		"update-own": true,
		"delete-own": true

 		"read": true,
		"create": true,
		"update": true,
		"delete": true
 	}	
 }
 *
 */
internals.ResourceAuth = function(config, rules)
{
    this.logger_ = Logger.getLogger('ResourceAuth');

    this.config_ = config;

    this.authStrategy_ = this.config_.authStrategy || {}

    this.rules_ = rules;
}

/**
 * @param {Array.<string>} methods  -list of methods
 * @param {string}  strategyName  - the strategy
 */
internals.ResourceAuth.prototype.setAuthStrategy = function(methods, strategyName)
{
	methods.forEach(function(element, index) {
		this.authStrategy_[element] = strategyName;
	}.bind(this));
}


/**
 * Returns the auth strategy, e.g. 'jwt'
 */
internals.ResourceAuth.prototype.authStrategy = function(method)
{
	return this.authStrategy_[method];
}


/**
 * @param {Array.<string>} methods  -list of methods
 * @param {string}  strategyName  - the strategy
 */
internals.ResourceAuth.prototype.setRules = function(rules)
{
	this.rules_ = rules;
}

/**
 * Checks the authorization of a particular resource
 *
 * @param {Object} request - the request object
 * @param {Resource=} resource - the resource objec
 */
internals.ResourceAuth.prototype.checkAuthorization = function(request, resource)
{
	var isAuthorized = true;
	// @todo - externalize (to abstract the mechanism of obatining the roles)
	// extract the JWT token
	var roles = null; 
	if (request.auth.strategy === 'jwt') {
		var decoded = null;
		if (request.headers.authorization) {
			var decoded = JwtUtils.decodeToken(request.headers.authorization, this.config_.jwtSecret);
			roles = decoded.roles;
		} 
		isAuthorized = (decoded != null);
	}

	if (!roles) {
		return isAuthorized;
	}
	roles.forEach(function(role, index) {
		var ruleForRole = this.rules_[role];
		if (ruleForRole) {
			if (request.method.toLowerCase() == 'get') {
				isAuthorized = ruleForRole['read'];
			} else if (request.method.toLowerCase() == 'post') {
				isAuthorized = ruleForRole['create'];
			} else if (request.method.toLowerCase() == 'pust') {
				isAuthorized = ruleForRole['update'];
			} else if (request.method.toLowerCase() == 'path') {
				isAuthorized = ruleForRole['update'];
			} else if (request.method.toLowerCase() == 'delete') {
				isAuthorized = ruleForRole['delete'];
			}
		}
	}.bind(this));

	return isAuthorized;

}

module.exports.ResourceAuth = internals.ResourceAuth;