/*****************************************************************************
 * EcoLearnia main entry file
 *
 */

// Load modules
var os = require('os');
var path = require('path');
var Hoek = require('hoek');

var Handlebars = require('handlebars');

var Exception = require('ecofyjs-exception');
var Logger = require('ecofyjs-logger-facade').Logger;
var utils = require('./utils/utils');
var JwtUtils = require('./utils/jwtutils').JwtUtils;
var ResourceAuth = require('./utils/resourceauth').ResourceAuth;
var GoogleAuthHelper = require('./providers/googleauthhelper').GoogleAuthHelper;

var HapiResource = require('./utils/hapiresource').HapiResource;
var authmanager = require('./providers/authmanager');
var accountmanager = require('./providers/accountmanager');

// Declararation of namespace for internal module use
var internals = {

    CONST: {
        API_PREFIX: '/api',
        JWT_SECRET: 'ChangeAndKeepTheSecret'
    },


    // Module information
    MODULE: {
        NAME: 'EcoLearnia:Account',
        VERSION: '0.0.2',
    },

    defaults: {
        // Module's relative path's base
        pathBase: '',
        contentPathBase: '/content',
        basePath: path.join(__dirname, '..', 'templates'),
        publicPath: path.join(__dirname, '..', 'public'),
        helpersPath: path.join(__dirname, '..', 'templates', 'helpers'),
        partialsPath: path.join(__dirname, '..', 'templates'),
        indexTemplate: 'index',
        routeTemplate: 'route',

        authRedir: '/public/main.html#/me'
    },

    authManager: authmanager.getManager(),
    accountManager: accountmanager.getManager()

};



/**
 * Route endpoints:
 */
exports.register = function(server, options, next) {
    
    console.log(JSON.stringify(options));

    var logger_ = Logger.getLogger(internals.MODULE.NAME);

	var settings = Hoek.applyToDefaults(internals.defaults, options);
 
    var moduleInfo = {
        name: internals.MODULE.NAME,
        version: internals.MODULE.VERSION,
        hostname: os.hostname()
    };

    initialize(server, logger_);

    server.views({
        engines: settings.engines || {
            html: {
                module: Handlebars
            }
        },
        path: settings.basePath,
        partialsPath: settings.partialsPath,
        helpersPath: settings.helpersPath
    });

    /**
     * Index web page
     */
    server.route({
        path: settings.pathBase + '/index.html',
        method: 'GET',
        handler: function(request, reply) {
            
            return reply.view(settings.indexTemplate, serverInfo);
        }
    });

    /**
     * Public web assets
     */
    server.route({
        method: 'GET',
        path: settings.pathBase + '/public/{path*}',
        config: {
            handler: {
                directory: {
                    path: settings.publicPath,
                    index: false,
                    listing: false
                }
            }
        }
    });


    /**
     * API: /api/info
     */
    server.route({
        path: settings.pathBase + internals.CONST.API_PREFIX + '/info',
        method: "GET",
        handler: function(request, reply) {
            reply(moduleInfo).code(200);
        }
    });


    var auth = new ResourceAuth({jwtSecret: internals.CONST.JWT_SECRET});
    auth.setAuthStrategy(['GET_QUERY', 'GET', 'PUT', 'DELETE'], 'jwt');
    // @todo - externalize
    auth.setRules({
        root: {
            read: true,
            //query: true,
        }
    });

    var criteriaKeyDictionary = {
        // This says that the resource's {id} parameter in the path is mapped
        // as uuid in the query.
        id: 'uuid' 
    };
    // API: /<base>/api/auth
    var authResource = new HapiResource(settings.pathBase + internals.CONST.API_PREFIX, 'auths', internals.authManager, criteriaKeyDictionary);
    authResource.registerStandardRoutes(server);


    // API: /<base>/api/account
    var accountResource = new HapiResource(settings.pathBase + internals.CONST.API_PREFIX, 'accounts', internals.accountManager, criteriaKeyDictionary, auth);
    accountResource.registerStandardRoutes(server);

    /**
     * API: /<base>/api/signup
     */
    server.route({
        path: settings.pathBase + internals.CONST.API_PREFIX + '/signup',
        method: 'POST',
        handler: function(request, reply) {
            var newAccount = request.payload;
            newAccount.auth.authSource = 'local';
            newAccount.kind = 'basic';
            newAccount.roles = ['user'];
            newAccount.status = ['signedup'];
            newAccount.displayName = newAccount.profile.givenName + ' ' + newAccount.profile.familyName;

            // validate
            var validationFailures = [];
            if (!newAccount.profile) {
                validationFailures.push({ property: 'profile', cause: 'Empty'});
            }
            if (!newAccount.profile.givenName) {
                validationFailures.push({ property: 'profile.givenName', cause: 'Empty'});
            }
            if (!newAccount.profile.familyName) {
                validationFailures.push({ property: 'profile.familyName', cause: 'Empty'});
            }

            if (validationFailures.length > 0) {
                var requestError = exception.createBadRequestError(null, validationFailures, 'Validation failure');
                return reply(unauthorizedError.toJSON()).status(unauthorizedError.statusCode);
            }

            // Add to account and authenticate
            internals.accountManager.add(newAccount)
            .then(function(account){
                var authCredential = {
                    authSource: 'local',
                    authId: '-NONE-', // only applicable for social network
                    username: newAccount.auth.username,
                    security: { password: newAccount.auth.security.password }
                };
                return authenticate(authCredential, false, logger_)
            })
            // TEST PENDING
            .then(function(authenticated) {
                if (!authenticated) {
                    /* Shall we send just null?
                    authenticated = {};
                    */
                } else if (authenticated.auth) {
                    delete authenticated.auth.security;
                }
                return reply(authenticated).code(200);
            })
            .catch(function(error) {
                var statusCode = error.statusCode ? error.statusCode : 500;
                var errorPaylod = (error.toJSON) ? error.toJSON() : error.toString();
                return reply(errorPaylod).code(statusCode);
            });
        }
    });

    /**
     * API: /<base>/api/signin
     */
    server.route({
        path: settings.pathBase + internals.CONST.API_PREFIX + '/signin',
        method: 'POST',
        handler: function(request, reply) {
            var authCredential = {
                authSource: 'local',
                authId: '-NONE-', // only applicable for social network
                username: request.payload.username,
                security: { password: request.payload.password }
            };

            authenticate(authCredential, false, logger_)
            .then(function(authenticated) {
                if (!authenticated) {
                    /* Shall we send just null?
                    authenticated = {};
                    */
                } else if (authenticated.auth) {
                    delete authenticated.auth.security;
                }
                return reply(authenticated).code(200);
            })
            .catch(function(error) {
                var statusCode = error.statusCode ? error.statusCode : 500;
                return reply(error.toJSON()).code(statusCode);
            });
        }
    });

    /**
     * API: /api/signout
     */
    server.route({
        path: settings.pathBase + internals.CONST.API_PREFIX + '/signout',
        method: 'POST',
        handler: function(request, reply) {

            var token = request.headers.authorization;
            if (token) {
                // @todo try-catch
                var decoded = JwtUtils.decodeToken(token, internals.CONST.JWT_SECRET);
                
                logger_.info({accountUuid: decoded.id}, 'Signing-out');

                return reply(utils.httpMessage(200, 'OK')).code(200);
            } else {
                return reply(utils.httpMessage(200, 'No Token found')).code(200);
            }
        }
    });

    /**
     * API: /myaccount
     * curl -v -H "Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjFhYTY5ZDA0LWRhY2UtNDQwNC05Y2Q1LWRkMzkyYjlkMTU0YyIsInJvbGVzIjpbXSwiZGlzcGxheU5hbWUiOiJZb3VuZy1TdWsgQWhuIiwiaWF0IjoxNDQzNDg4NzUxfQ.fdMuvDbqvXr0UM280uA5MKTgI-xoEbASxGVkmC3Py2k" http://localhost:8088/myaccount
     */
    server.route({
        path: settings.pathBase + internals.CONST.API_PREFIX + '/myaccount',
        method: 'GET',
        handler: function(request, reply) {
            var token = request.headers.authorization;
            if (token) {
                // @todo try-catch
                var decoded = JwtUtils.decodeToken(token, internals.CONST.JWT_SECRET);

                internals.accountManager.findByPK(decoded.id)
                .then(function(account) {
                    reply(account);
                })
                .catch(function(error) {
                    var statusCode = error.statusCode ? error.statusCode : 500;
                    reply(error).status(statusCode);
                })
            } else {
                var unauthorizedError = exception.createUnauthorizedError(null, null, 'Token not found');
                reply(unauthorizedError.toJSON()).status(unauthorizedError.statusCode);
            }
        }
    });

    // Registering Bell plugin for Google+ auth
    server.register(
        require('bell'), 
        function (error) {
            var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET; 
            
            console.log('Google googleClientSecret=' + googleClientSecret);
            // Registering Bell strategy with Google+ setting
            server.auth.strategy('google', 'bell', {
                provider: 'google',
                password: 'password',
                isSecure: false,
                // Go to https://console.developers.google.com
                // Create a new project.
                // Navigate to “APIs & auth /  APIs” and filter by “Google+ API”
                // Click the “Google+ API” and press the “Enable API” button on top
                // Navigate to “APIs & auth /  Credentials”
                // Press “Add credentials” and in the drop down select “OAuth 2.0 client ID”
                // Select “Web application”
                // Enter the name of the application
                // In the field “Authorized JavaScript origins” enter the “http://localhost:<port>”
                // In the field “Authorized redirect URIs” enter “http://localhost:<port>/auth/google
                clientId: '800325046946-grh3dm8pik124qcusb5j6ah6ok3tchei.apps.googleusercontent.com',
                clientSecret: googleClientSecret,
                location: server.info.uri
            });

            server.route({
                method: '*',
                path: '/auth/google',
                config: {
                    auth: {
                        strategy: 'google',
                        mode: 'try'
                    },
                    handler: function (request, reply) {

                        if (!request.auth.isAuthenticated) {
                            return reply('Authentication failed due to: ' + request.auth.error.message);
                        }
                        logger_.info({
                                provider: 'google',
                                credentials: request.auth.credentials
                            }, 'Authenticated');


                        var authCredential = GoogleAuthHelper.buildAuthModel(request.auth.credentials);

                        authenticate(authCredential, true, logger_)
                        .then(function(authenticated) {

                            // The third-party credentials are stored in 
                            // request.auth.credentials. Any query parameters 
                            // from the initial request are passed back via 
                            // request.auth.credentials.query.
                            var redirUrl = request.auth.credentials.query.redir_url || settings.authRedir;
                            return replyWithCookie(reply, authenticated.token, redirUrl);
                        })
                        .catch(function(error) {
                            return reply('<pre>' + JSON.stringify(error, null, 4) + '</pre>');
                        });
                        
                    }
                }
            });
        }
    );

    /**
     * Page: /admin/auths
     */
    server.route({
        path: settings.pathBase + '/admin/auths',
        method: 'GET',
        config: { auth: 'jwt' },
        handler: function(request, reply) {
            reply({text: 'GOOD Token!'})
                .header('Authorization', request.headers.authorization);
        }
    });

    /**
     * Page: /admin/init
     */
    server.route({
        path: settings.pathBase + '/admin/init',
        method: 'GET',
        config: { auth: false },
        handler: function(request, reply) {
            initialize(server, logger_)
            .then(function(result){
                reply(result, 'Init successful');
            })
            .catch(function(error){
                reply({error: error});
            });

        }
    });

    next();
};

/**
 * Run once at the initialization
 * @todo - consider changing to sync using promise
 */
function initialize(server, logger)
{
    // Create a root auth/account if such account does not exist
    var authCriteria = {
        authSource: 'local',
        authId: 'root'
    };

    return internals.authManager.findFromCredentials(authCriteria)
        .then(function (auth) {
            if (!auth) {
                var account = {
                    kind: 'root',
                    roles: ['root'],
                    status: 'enabled',
                    displayName: 'Root',
                    profile: {
                        emails: ['changeme@root.net']
                    }
                };
                auth = authCriteria;
                authCriteria.security = {
                    password: 'root'
                };
                return internals.authManager.createAccountAndAuth(account, auth);
            }
            return auth;
        })
        .then (function (auth) {
            // Nothing to do
            logger.warn('Initialization completed, root user ' + auth.authId + ' was created.');
            return {auth: auth};
        })
        .catch(function (error) {
            logger.error({error: JSON.stringify(error)}, 'failed at initialization');
            throw error;
        });
}

/**
 * Authenticates
 *
 * @param {model.Auth}  - The credientail object 
 * @param {bool} createIfNoMatch  - Create an account if no match was found
 * @return {Promise} Upon success objec: {auth, token} is returned
 */
function authenticate(auth, createIfNoMatch, logger)
{

    // Search by auth credentials (i.e. by authSource and authId)
    return internals.authManager.findFromCredentials(auth)
        .then(function(matchAuth) {
            if (matchAuth) {
                // Check that the password matches
                if (matchAuth.authSource === 'local') {
                    // @todo hash the password
                    if (matchAuth.security.password !== auth.security.password)
                    {
                        return null;
                    }
                } 
                return matchAuth;
            }
            if (createIfNoMatch === true) {
                // If not found, create an entry in account and auth.
                var account = GoogleAuthHelper.buildAccountModel(request.auth.credentials);
                return internals.authManager.createAccountAndAuth(account, authCredential);
            } else {
                //throw Exception.createNotFoundError(/*cause*/ null, /*context*/ null, 'Invalid username or password');
                return null;
            }
        })
        .then(function(auth) {

            var authenticated = null;
            if (auth) {
                // Update the lastLogin date
                internals.accountManager.touch(auth.accountObject.uuid)
                .catch(function(error) {
                    logger.error({error: JSON.stringify(error)}, 'failed at touching account');
                });

                authenticated = {
                    auth: auth,
                    token: JwtUtils.createToken(auth.accountObject, internals.CONST.JWT_SECRET)
                }
            }
            return authenticated;
        });
}

/**
 * HTTP Reply with cookie that includes token
 * 
 * @param {Object} reply  - the Hapi's reply function 
 * @param {Object} token  - JWT token
 * @param {Object} redir_to - Redirection url
 */
function replyWithCookie(reply, token, redir_to)
{
    // 1.3. return token in the cookie
    var cookie_options = {
        // @see: http://hapijs.com/api#serverstatename-options
        ttl: 365 * 24 * 60 * 60 * 1000, // expires a year from today
        encoding: 'none',    // we already used JWT to encode
        //isSecure: true,    // enabling this together with isHttpOnly seems to prevent working in http
        //isHttpOnly: true,  // prevent client alteration
        clearInvalid: false, // remove invalid cookies
        path: '/',           // necessary for the visibility of cookie after redirection
        //domain: 'localhost', // For the (sub)domain mathc. @see: http://tools.ietf.org/html/rfc6265#section-5.1.3
        strictHeader: true   // don't allow violations of RFC 6265
    };

    if (!redir_to) {
        redir_to = '/main';
    }
    // The client(browser) can now get the ecofy_token cookie value and  use in calls
    return reply().redirect(redir_to).header('Authorization', token)        // where token is the JWT
        .state("ecofy_token", token, cookie_options) // set the cookie with options
        ;

}

exports.register.attributes = {
    pkg: require("../package.json")
};

