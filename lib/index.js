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

    /**
     * API: /account (create)
     */
    server.route({
        path: settings.pathBase + '/account',
        method: 'POST',
        handler: function(request, reply) {
            reply(exception.createNoImplementError(null).toJSON(), 200);
        }
    });

    /**
     * API: /account (update)
     */
    server.route({
        path: settings.pathBase + '/account',
        method: 'PUT',
        handler: function(request, reply) {
            reply(exception.createNoImplementError(null).toJSON(), 200);
        }
    });

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

    next();
};
 
exports.register.attributes = {
    pkg: require("../package.json")
};

