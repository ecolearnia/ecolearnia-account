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
 *  This file includes promise factory function.
 *  The createPromise() function provides abstraction to the promise implementation.
 *
 *  Usage example:
 *  var promise = promiseutils.createPromise(function(resolve, reject) {
 *      resolve(successObj);
 *      ...
 *      reject(errorObj);
 *  }.bind(this));
 *  return promise;
 *
 * @author Young Suk Ahn Park
 * @date 6/02/15
 */

// Declare internals namespace
var internals = {};

/*
// Ecmascript 6's Promise
// The .finally is not available
internals.createEsPromise = function(func)
{
    return new Promise(func);
};
*/

var Bluebird = require('bluebird');
internals.createBluebirdPromise = function(func)
{
    return new Bluebird(func);
};
internals.createPromise = internals.createBluebirdPromise;
internals.Promise = Bluebird;

/*
var when = require('when');
internals.createWhenPromise = function(func)
{
    return when.promise(func);
};

var Promise = require('promise');
internals.createSimplePromise = function(func)
{
    return new Promise(func);
};
*/

/**
 * Expose Promise creation wrapper
 */
module.exports.createPromise = internals.createPromise;

/**
 * Expose Promise implementation
 */
module.exports.Promise = internals.Promise;

/**
 * Expose Promise implementation
 */
module.exports.resolve = internals.Promise.resolve;

/**
 * Expose Promise implementation
 */
module.exports.reject = internals.Promise.reject;
