/*****************************************************************************
 *
 * model/auth.js
 *
 * The Auth schema.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var internals = {}

// Singleton object of the content schema
internals.contentNodeSchema = null;

internals.getSchemaDefObject = function()
{
    return {
        uuid: { type: String, required: true, unique: true },

        ownedBy: { type: Schema.Types.ObjectId, ref: 'Account' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'Account' },
        createdAt: { type: Date, default: Date.now, index: true },
        modifiedBy: { type: Schema.Types.ObjectId, ref: 'Account' },
        modifiedAt: { type: Date, default: Date.now },
        modifiedCounter: { type: Number, default: 0 }, // Number of time this record was modified

        account: { type: Schema.Types.ObjectId, ref: 'Account' }, // the account that owns this auth

        // Authentication
        authSource: { type: String, required: true, index: true}, // e.g. local | google | clever | facebook
        authId: { type: String, required: true, index: true}, // Unique ID provided by the Auth provider
        authCredentialsRaw: { type: String },
        authCredentialsTimestamp: { type: Date },
        status: { type: Number, index: true}, // authentication status: 0-started, 1-authenticated

        sessionTimestamp: { type: Date },
        rememberToken: { type: String, index: true },
        authFailCounter: { type: Number, default: 0  }, // Number of consecutive authorization failure

        username: { type: String },
        security: {
            // Only applicable for local authentication
            password: { type: String },
            activationCode: { type: String, index: true },
            securityQuestion: { type: String},
            securityAnswer: { type: String}
        }
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

module.exports.getSchemaDefObject = internals.getSchemaDefObject;
module.exports.getSchema = internals.getSchema;
