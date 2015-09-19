/*****************************************************************************
 * utils.js
 * Includes various utility functions
 */

var path = require('path');
var fs = require('fs');

var nconf = require('nconf');

var internals = {};

internals.configInited = false;

internals.Config = {}

internals.Config.load = function(configFilePath)
{
    if (!configFilePath) {
        var fileInfo = path.parse(process.argv[1]);
        configFilePath = './conf/' + fileInfo.name + '.conf.json';
    }
    if (!fs.existsSync(configFilePath))
    {
        var errMsg = 'Config failed to open file: ' + configFilePath;
        console.log(errMsg);
        throw new Error(errMsg);
    }

    console.log('Config loading from file: ' + configFilePath);
    nconf.argv()
       .env()
       .file({ file: configFilePath });
    internals.configInited = true;
};

internals.Config.get = function(key, defaultVal)
{
    if (!internals.configInited)
    {
        internals.Config.load();
    }
    return nconf.get(key) || defaultVal;
};

module.exports = internals.Config;
