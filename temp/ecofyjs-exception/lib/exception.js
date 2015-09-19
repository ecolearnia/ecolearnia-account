/*
 * This file is part of the EcofyJS library.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * EcofyJS v0.0.1
 *
 * @fileoverview
 *  This file includes definition of Exception.
 *
 * @author Young Suk Ahn Park
 * @date 2/25/15
 */

/*****************************************************************************
 *
 * The the JSON representation of an error object
 * {{
 *     apiVersion: (string)
 *     code:    (!string), // Unique identifier of the error
 *     status:  (!number), // The error status using the standard HTTP status code
 *     message: (!string), // Error message ()
 *     context: {
 *         domain: (!string),
 *         cause: string,
 *     },
 *     logged_: (?boolean), // as the property name says
 * }}  
 *
 * **************************************************************************/

/**
 * Declaration of internals name-space
 */
var internals = {};


/* **************************************************************************
 * Exception
 *
 * Constructor function for the Exception class.
 *
 * @constructor
 *
 * @param {string} name  - The name of the exception
 * @param {string} message  - The human readable message
 * @param {Exception | Error | undefined} cause  - The cause of thix exeption
 * @param {number} statusCode  - The HTTP status code that classifies this exception
 * @param {string=} messageCode  - the message code for l10n
 * @param {Object=} context  - Optional context, e.g. the id's used retrieve, etc.
 *
 ****************************************************************************/
internals.Exception = function(name, message, cause, statusCode, messageCode, context)
{
    /**
     * Error name from JS Error object
     * @type {string}
     */
    this.name = name;

    /**
     * End-user friendly error message. From JS Error object
     * @type {string}
     */
    this.message = message;

    /**
     * The Exception that caused.
     * @type {Exception | Error | undefined}  
     *  
     */
    this.cause = cause;

    /**
     * The HTTP status code if applicable. 
     * @type {number}
     */
    this.statusCode = statusCode;

    /**
     * Error code. Useful for l10n
     * @type {string=}
     */
    this.messageCode = messageCode;

    /**
     * Additional optional context
     * @type {Object=}
     */
    this.context = context;

    /**
     * Flag indicating whether or not this error has been logged
     * (to avoid multiple logging of the same error)
     * @type {boolean}
     */
    this.logged_ = false;

};

// Extending the Error object
internals.Exception.prototype = Object.create(Error.prototype);
internals.Exception.prototype.constructor = internals.Exception;


/***************************************************************************
 * toJSON
 *
 * Get a JSON ready object containing the properties of this Exception.
 *
 * @returns {Object} an object with JSON ready property values.
 *
 */
internals.Exception.prototype.toJSON = function ()
{
    var jsonified = {
            '@type': 'Exception',
            'name': this.name,
            'message': this.message,
            'messageCode': this.messageCode,
            'statusCode': this.statusCode
        };
    if (this.cause) {
        jsonified.cause = (this.cause.toJSON === 'function') ? this.cause.toJSON() : this.cause.toString();
    }
    if (this.context) {
        jsonified.context = this.context;
    }

    return jsonified;
};

/***** static functions *****/

/* **************************************************************************
 * Exception.fromJSON
 * 
 * Create a new Exception instance from an object or stringified json that
 * contains error properties. 
 *
 * @param {Error | Object} source  - The object that will be used to create 
 *      the Exception.
 *      At minimun, the object (or parsed object) shuld contain name and
 *      message properties.
 *
 * @returns {?Exception} a new Exception w/ properties initialized
 * from the given error object, or null if the given object didn't have the
 * necessary properties.
 */
internals.Exception.fromJSON = function(source)
{
    var errorObj = source;
    if (typeof source === 'string')
    {
        try {
            errorObj = JSON.parse(source);
        } catch (parseError) {
            throw new Error('Could not unmarshall Exception: ' + parseError);
        }
    }

    if (typeof errorObj === 'object')
    {
        // @todo prase the cause object
        return new internals.Exception(
            errorObj.name,
            errorObj.message,
            errorObj.cause,
            errorObj.statusCode,
            errorObj.messageCode,
            errorObj.context);
    } else {
        throw new Error('Unmarshalling Exception requires either string or object but was provided ' + typeof errorObj);
    }

    return null;
};


/* **************************************************************************
 * Exception.wrapError
 * 
 * Create a new Exception instance from an object w/ the necessary properties.
 * The object should contain the property '@type' with the value 'Exception'. 
 *
 * @param {Error | Object} error     The object that will be used to create the Exception
 *                           if it contains the necessary properties.
 *                           THe error object can also be of type Error, in
 *                           this case, the method will return Exception 
 *                           object that wraps around error's message.
 *
 * @returns {?Exception} a new Exception w/ properties initialized
 * from the given error object, or null if the given object didn't have the
 * necessary properties.
 */
internals.Exception.wrapError = function(error, name, message, statusCode, messageCode)
{
    if (error instanceof internals.Exception)
    {
        return new internals.Exception(
                name || error.name,
                message || error.message,
                error,
                statusCode || error.statusCode,
                messageCode || error.messageCode
            );
    }
    else if (error instanceof Error)
    {
        return new internals.Exception(
                name || error.name,
                message || error.message,
                error,
                statusCode || 500,
                messageCode || 'RunTimeError'
            );
    }
    else
    {
        throw Error('Cannot wrap an object other than Error or Exception')
    }

    return null;
};

/***** Wrapper of HTTP Common Errors *****/

internals.Exception.createStandardError = function(name, message, cause, statusCode, context)
{
    var exception = internals.Exception.wrapError(cause,
        name, 
        message, 
        statusCode,
        name
    );
    exception.context = context;
    return exception;
};

/**
 * Wraps a Bad Request Error (400)
 */
internals.Exception.createBadRequestError = function(cause, context)
{
    return internals.Exception.createStandardError(
        'BadRequest', 
        'Bad Request Error', 
        cause,
        400, context
    );
};

/**
 * Wraps a Unauthorized Error (401)
 */
internals.Exception.createUnauthorizedError = function(cause, context)
{
    return internals.Exception.createStandardError
Exception.createStandardError(
        'Unauthorized', 
        'Unauthorized Error', 
        cause,
        401, context
    );
};

/**
 * Wraps a Forbidden Error (403)
 */
internals.Exception.createForbiddenError = function(cause, context)
{
    return internals.Exception.createStandardError
Exception.createStandardError(
        'Forbidden', 
        'Forbidden Error', 
        cause,
        403, context
    );
};

/**
 * Wraps a Not Found Error (404)
 */
internals.Exception.createNotFoundError = function(cause, context)
{
    return internals.Exception.createStandardError
Exception.createStandardError(
        'NotFound', 
        'Not Found Error', 
        cause,
        404, context
    );
};

/**
 * Wraps an Internal Server Error (500)
 */
internals.Exception.createInternalServerError = function(cause, context)
{
    return internals.Exception.createStandardError
Exception.createStandardError(
        'InternalServerError', 
        'Internal Server Error', 
        cause,
        500, context
    );
};

/**
 * Wraps a Not Implemented (501)
 */
internals.Exception.createNotImplementedError = function(cause, context)
{
    return internals.Exception.createStandardError
Exception.createStandardError(
        'NotImplemented', 
        'Not Implemented Error', 
        cause,
        501, context
    );
};

module.exports = internals.Exception;
