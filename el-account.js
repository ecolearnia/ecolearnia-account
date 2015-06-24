var Hapi = require("hapi");
var config = require('ecofyjs-config');

config.load('./config/el-account.conf.json');
var port = config.get('port');
var logConf = config.get('log');

var server = new Hapi.Server();
server.connection(
    { 
      port: port, 
      labels: 'main',
      routes: { cors: true } 
    }
  );

server.register([
      { register: require("./lib/index"), options: { log: logConf} }
], function(err) {
    if (err) throw err;
    server.start(function() {
        console.log("EcoLearnia-Account server started @ " + server.info.uri);
    });
});