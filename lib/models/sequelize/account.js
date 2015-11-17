/*****************************************************************************
 *
 * model/account.js
 *
 * The Account schema.
 */
"use strict";

var internals = {};

// Singleton object of the content schema
internals.entitySchema = null;

internals.getSchemaDefObject = function(DataTypes)
{
    return {
        uuid: { type: DataTypes.STRING, primaryKey: true},

        managedBy: { type: DataTypes.STRING },
        createdBy: { type: DataTypes.STRING },
        createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        modifiedBy: { type: DataTypes.STRING },
        modifiedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        modifiedCounter: { type: DataTypes.INTEGER, defaultValue: 0 }, // Number of time this record was modified
        kind: { type: DataTypes.STRING, allowNull: false }, // basic, premium, admin

        //roles: [String], //roles
        status: { type: DataTypes.STRING },
        displayName: { type: DataTypes.STRING }, // Name to be displayed (could be First Last name)
        imageUrl: { type: DataTypes.STRING },

        lastLogin: { type: DataTypes.DATE }

    };
};

internals.getSchema = function()
{
    if (!internals.entitySchema)
    {
        internals.entitySchema = new Schema( internals.getSchemaDefObject() );
    }
    return internals.entitySchema;
}

module.exports = function(sequelize, DataTypes) {
  var Account = sequelize.define("Account", internals.getSchemaDefObject(DataTypes),
  {
    indexes: [
        {
            fields: ['managedBy']
        },
        {
            fields: ['createdAt']
        },
        {
            fields: ['kind']
        },
        {
            fields: ['status']
        }
    ],
    classMethods: {
      associate: function(models) {
        Account.hasOne(models.Profile, {
            onDelete: 'cascade'
        });
        Account.hasMany(models.Auth, {
            onDelete: 'cascade'
        });
      }
    }
  });

  return Account;
};
