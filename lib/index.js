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
var Logger = require('ecofyjs-logger-facade').Logger;
var HapiResource = require('./utils/hapiresource').HapiResource;

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
    }
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


    // account: /<base>/account
    var accountManager = accountmanager.getManager();

    var criteriaKeyDictionary = {
        id: 'uuid'
    };
    var accountResource = new HapiResource(settings.pathBase, 'account', accountManager, criteriaKeyDictionary);
    accountResource.registerStandardRoutes(server);

    /**
     * API: /signin
     */
    server.route({
        path: settings.pathBase + '/signin',
        method: 'POST',
        handler: function(request, reply) {
            reply(exception.createNoImplementError(null).toJSON(), 200);
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
                        reply('<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>');
                    }
                }
            });
        }
    );

    next();
};
 
exports.register.attributes = {
    pkg: require("../package.json")
};

