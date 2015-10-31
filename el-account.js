var Hapi = require("hapi");
var config = require('ecofyjs-config');

// Authentication for social networks
var Bell = require('bell');

// Mongo Database connection
var DbUtils = require('./lib/utils/mongoutils').MongoUtils;

config.load('./config/el-account.conf.json');
var port = config.get('port');
var logConf = config.get('log');

// Should this go in the application file?
DbUtils.connect('mongodb://localhost/ecol_test');

var server = new Hapi.Server();
server.connection(
    {
      host:'localhost', // This will force to use localhost, instead of computer name
      port: port, 
      labels: 'main',
      routes: {
        cors: true
      }
    }
  );

// Since Hapi 10.0, the view engine and directory has been externalized
// In order to use them, they must be explicilty included and registered.
server.register(require('vision'), function () {});
server.register(require('inert'), function () {});

// hapi-auth-jwt2 {{
server.register(require('hapi-auth-jwt2'), function (err) {

    // validation function
    var validate = function (decoded, request, callback) {

        // always return valid
        return callback(null, true);
    };
    
    /**
     *
     */
    server.auth.strategy('jwt', 'jwt',
        {
            key: 'ChangeAndKeepTheSecret',
            validateFunc: validate,      // validate function defined above
            // @see: https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
            verifyOptions: {
                ignoreExpiration: true,  // do not reject expired tokens
                algorithms: [ 'HS256' ]  // pick a strong algorithm
            }
        });
    // The following will set all route to jwt
    //server.auth.default('jwt');

    server.route([
        {
            method: "GET", path: "/open", config: { auth: false },
            handler: function(request, reply) {
                console.log('--open!');
                reply({text: 'Token not required'});
            }
        },
        {
            method: "GET", path: "/token", config: { auth: false },
            handler: function(request, reply) {
                reply({text: 'Token not required'});
            }
        },
        {
            method: 'GET', path: '/restricted', 
            config: { auth: 'jwt' },
            handler: function(request, reply) {
                console.log('--token:' + request.headers.authorization);
                reply({text: 'You used a Token!'})
                    .header("Authorization", request.headers.authorization);
            }
        }
    ]);

});
// }} hapi-auth-jwt2

server.register([
      // Registering the account plugin
     { register: require("./lib/index"), options: { log: logConf} }
], function(err) {
    if (err) throw err;

    server.start(function() {
        console.log("EcoLearnia-Account server started @ " + server.info.uri);
    });
});

