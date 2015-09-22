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

server.register([
      // Registering the account plugin
      { register: require("./lib/index"), options: { log: logConf} }
], function(err) {
    if (err) throw err;

    server.start(function() {
        console.log("EcoLearnia-Account server started @ " + server.info.uri);
    });
});

