/*****************************************************************************
 *
 * model/auth.js
 *
 * The Auth schema.
 */

"use strict";

var internals = {}

// Singleton object of the content schema
internals.contentNodeSchema = null;

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

        //account: { type: Schema.Types.ObjectId, ref: 'Account' }, // the account that owns this auth
        //accountUuid: The FK is automatically generated by the belongsTo

        // Authentication
        authSource: { type: DataTypes.STRING, allowNull: false}, // e.g. local | google | clever | facebook
        authId: { type: DataTypes.STRING, allowNull: false}, // Unique ID provided by the Auth provider
        authCredentialsRaw: { type: DataTypes.STRING },
        authCredentialsTimestamp: { type: DataTypes.DATE },
        status: { type: DataTypes.INTEGER}, // authentication status: 0-started, 1-authenticated

        sessionTimestamp: { type: DataTypes.DATE },
        rememberToken: { type: DataTypes.STRING },
        authFailCounter: { type: DataTypes.INTEGER, defaultValue: 0  }, // Number of consecutive authorization failure

        username: { type: DataTypes.STRING },

        // Only applicable for local authentication
        security_password: { type: DataTypes.STRING },
        security_activationCode: { type: DataTypes.STRING },
        security_securityQuestion: { type: DataTypes.STRING},
        security_securityAnswer: { type: DataTypes.STRING}
    };
};

internals.getSchema = function()
{
    if (!internals.contentNodeSchema)
    {
        internals.contentNodeSchema = new Schema( internals.getSchemaDefObject() );
    }
    return internals.contentNodeSchema;
}


module.exports = function(sequelize, DataTypes) {
  var Auth = sequelize.define("Auth", internals.getSchemaDefObject(DataTypes),
  {
    indexes: [
        {
            fields: ['authSource']
        },
        {
            fields: ['authId']
        },
        {
            fields: ['status']
        },
        {
            fields: ['username']
        },
        {
            fields: ['security_activationCode']
        }
    ],
    classMethods: {
      associate: function(models) {
        // Sequelize creates AccountUuid and then fails to create accountUuid
        //Auth.belongsTo(models.Account, { as: 'Account', foreignKey: 'accountUuid'});
        Auth.belongsTo(models.Account);
      }
    }
  });

  return Auth;
};
