var Hapi = require("hapi");
var config = require('ecofyjs-config');

// Authentication for social networks
var Bell = require('bell');

config.load('./config/el-account.conf.json');
var port = config.get('port');
var logConf = config.get('log');


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
      // Registering the 3rd party authentication plugin (for G+)
      { register: Bell },
      // Registering the account plugin
      { register: require("./lib/index"), options: { log: logConf} }
], function(err) {
    if (err) throw err;

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
        // In the field “Authorized redirect URIs” enter “http://localhost:<port>/bell/door“
        clientId: '800325046946-grh3dm8pik124qcusb5j6ah6ok3tchei.apps.googleusercontent.com',
        clientSecret: googleClientSecret,
        location: server.info.uri
    });

    server.route({
        method: '*',
        path: '/bell/door',
        config: {
            auth: {
                strategy: 'google',
                mode: 'try'
            },
            handler: function (request, reply) {

                if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }
                reply('<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>');
            }
        }
    });

    server.start(function() {
        console.log("EcoLearnia-Account server started @ " + server.info.uri);
    });
});

