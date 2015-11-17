/*
 * This file is part of the EcoLearnia platform.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * EcoLearnia v0.0.1
 *
 * @fileoverview
 *  This file includes definition of HapiResource.
 *
 * @author Young Suk Ahn Park
 * @date 2/15/15
 */
var Sequelize = require('sequelize');

var logger = require('ecofyjs-logger-facade');

// Declararation of namespace for internal module use
var internals = {};

internals.SequelizeUtils = {};

/**
 * connect
 *
 * @param {string} connSgtring  'mysql://user:pass@example.com:9821/dbname'
 */
internals.SequelizeUtils.connect = function(connString)
{
    //var sequelize = new Sequelize(connString);
    internals.sequelize = new Sequelize('eco_learnia', 'ecolearnia', 'eco', {
      dialect: "mysql", // or 'sqlite', 'postgres', 'mariadb'
      port:    3306, // or 5432 (for postgres)
    });

    // Parameterize the path
    internals.models = require('../models/sequelize/index.js').loadModels(internals.sequelize);

    return internals.sequelize;
}

/**
 * returns the underlying connection
 * @return {Object} conection
 */
internals.SequelizeUtils.getConnection = function ()
{
    return internals.sequelize;
}

/**
 * getModel
 * @param {string} name   - The name of the model. Not used in
 * @param {string} schema - The schema reference
 */
internals.SequelizeUtils.getModel = function (name, schema)
{
    return internals.models[name];
}

module.exports.SequelizeUtils = internals.SequelizeUtils;
