/*****************************************************************************
 * EcoLearnia main entry file
 *
 */

// Load modules
var os = require('os');
var path = require('path');
var Hoek = require('hoek');

var Handlebars = require('handlebars');

//var utils = require('./utils/utils');
var Exception = require('ecofyjs-exception');
var Logger = require('ecofyjs-logger-facade').Logger;
var JwtUtils = require('./utils/jwtutils').JwtUtils;
var GoogleAuthHelper = require('./providers/googleauthhelper').GoogleAuthHelper;

var HapiResource = require('./utils/hapiresource').HapiResource;
var authmanager = require('./providers/authmanager');
var accountmanager = require('./providers/accountmanager');

// Declararation of namespace for internal module use
var internals = {

    // Module information
    MODULE: {
        NAME: 'EcoLearnia:Account',
        VERSION: '0.0.1',
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

        authSuccessRedir: '/main'
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
        method: "GET",
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
     * API: Repos info
     */
    server.route({
        path: settings.pathBase + '/info',
        method: "GET",
        handler: function(request, reply) {
            reply(moduleInfo, 200);
        }
    });


    // API: /<base>/auth
    var criteriaKeyDictionary = {
        id: 'uuid'
    };
    var authResource = new HapiResource(settings.pathBase, 'auths', internals.authManager, criteriaKeyDictionary);
    authResource.registerStandardRoutes(server);


    // API: /<base>/account
    var accountResource = new HapiResource(settings.pathBase, 'accounts', internals.accountManager, criteriaKeyDictionary);
    accountResource.registerStandardRoutes(server);

    /**
     * API: /signin
     */
    server.route({
        path: settings.pathBase + '/signin',
        method: 'POST',
        handler: function(request, reply) {
            request.payload.username;
            request.payload.password;
            //reply(exception.createNoImplementError(null).toJSON(), 200);
            // TEST PENDING
            authenticate(authCredential, reply)
            .then(function(token) {
                replyWithCookie(reply, token, settings.authSuccessRedir);
            })
            .catch(function(error) {
                reply('<pre>' + JSON.stringify(error, null, 4) + '</pre>');
            });
        }
    });

    /**
     * API: /signout
     */
    server.route({
        path: settings.pathBase + '/signout',
        method: 'POST',
        handler: function(request, reply) {
            reply(exception.createNoImplementError(null).toJSON(), 200);
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

                        // TEST PENDING
                        authenticate(authCredential, reply)
                        .then(function(token) {
                            return replyWithCookie(reply, token, settings.authSuccessRedir);
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
            console.log('--token:' + request.headers.authorization);
            reply({text: 'GOOD Token!'})
                .header("Authorization", request.headers.authorization);
        }
    });


    /**
     * Page: /admin/auths
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

// Run once at the initialization
// @todo - consider changing to sync using promise
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
                authCriteria.password = 'root';
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
 * Authenticates.
 * 
 * @return {Promise} Upon success token is returned
 */
function authenticate(auth, createIfNoMatch)
{

    // Search by auth credentials (authSource and authId)
    return internals.authManager.findFromCredentials(auth)
        .then(function(matchAuth) {
            if (matchAuth) {
                return matchAuth;
            }
            if (createIfNoMatch === true) {
                // If not found, create an entry in account and auth.
                var account = GoogleAuthHelper.buildAccountModel(request.auth.credentials);
                return internals.authManager.createAccountAndAuth(account, authCredential);
            } else {
                throw Exception.createUnauthorizedError(/*cause*/ null, /*context*/ null, 'Invalid username or password');
            }
        })
        .then(function(auth) {
            // 1.2. create JWT token (PENDING)
            var token = JwtUtils.createToken(auth.accountObject, 'ChangeAndKeepTheSecret');
            return token;
        });
}

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
    var redir_html = '<html><head><META http-equiv="refresh" content="5;URL='+'/admin/auths'+'"></head></html>';

    if (!redir_to) {
        redir_to = '/main';
    }
    // The client(browser) can now get the ecofy_token cookie value and  use in calls
    return reply().redirect(redir_to).header("Authorization", token)        // where token is the JWT
        .state("ecofy_token", token, cookie_options) // set the cookie with options
        ;

}

exports.register.attributes = {
    pkg: require("../package.json")
};

