/*****************************************************************************
 *
 * model/account.js
 *
 * The Account schema.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var internals = {}

// Singleton object of the content schema
internals.entitySchema = null;

internals.getSchemaDefObject = function(DataTypes)
{
    return {
        uuid: { type: DataTypes.STRING, primaryKey: true},

        // The models section includes data passed to"
        familyName: { type: DataTypes.STRING, allowNull: false },
        givenName: { type: DataTypes.STRING, allowNull: false },
        middleName: { type: DataTypes.STRING },
        highlight: { type: DataTypes.STRING },
        dob: { type: DataTypes.DATE }, // Date of birth
        gender: { type: DataTypes.STRING },
        phone: { type: DataTypes.STRING },
        mobile: { type: DataTypes.STRING },
        primaryEmail: { type:DataTypes.STRING, allowNull: false },
        //emails: { type:[String], index: true },
        timezone: { type: DataTypes.STRING },
        permalink: { type: DataTypes.STRING },

        //guardians: [Schema.Types.ObjectId], // parents
        //languages:[String],

        /*
        education: {
            lastLevel: { type: DataTypes.STRING }, // Last achieved level
            // More details?
        },

        organizations: [{
            name: { type: DataTypes.STRING }, // Altenia
            title: { type: DataTypes.STRING }, // Principal Consultant
            startDate: { type: Date },
            endDate: { type: Date }
        }],
        */

        address_countryCode: { type: DataTypes.STRING },
        address_stateCode: { type: DataTypes.STRING },
        address_city: { type: DataTypes.STRING },
        address_street: { type: DataTypes.STRING },
        address_postalCode: { type: DataTypes.STRING }
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
  var Profile = sequelize.define("Profile", internals.getSchemaDefObject(DataTypes),
  {
    indexes: [
        {
            fields: ['primaryEmail']
        },
        {
            fields: ['address_countryCode']
        },
        {
            fields: ['address_stateCode']
        },
        {
            fields: ['address_postalCode']
        }
    ],
    classMethods: {
      associate: function(models) {
        Profile.belongsTo(models.Account);
      }
    }
  });

  return Profile;
};
