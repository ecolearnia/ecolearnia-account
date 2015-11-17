"use strict";

var fs        = require("fs");
var path      = require("path");

// Declaration of namespace for internal module use
var internals = {
  db: {}
};

internals.loadModels = function(sequelize)
{
  fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
      var model = sequelize.import(path.join(__dirname, file));
      internals.db[model.name] = model;
    });

  Object.keys(internals.db).forEach(function(modelName) {
    if ("associate" in internals.db[modelName]) {
      internals.db[modelName].associate(internals.db);
    }
  });

  return internals.db;
}

module.exports.loadModels = internals.loadModels;
