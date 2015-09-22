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
internals.contentNodeSchema = null;

internals.getSchemaDefObject = function()
{
    return {
        uuid: { type: String, required: true, unique: true },

        createdBy: { type: Schema.Types.ObjectId, ref: 'Account' },
        createdAt: { type: Date, default: Date.now, index: true },
        modifiedBy: { type: Schema.Types.ObjectId, ref: 'Account' },
        modifiedAt: { type: Date, default: Date.now },
        modifiedCounter: { type: Number, default: 0 }, // Number of time this record was modified
        kind: { type: String, index: true, required: true }, // 
        
        roles: [String], //roles
        status: { type: String, index: true},
        displayName: { type: String }, // Name to be displayed (could be First Last name)
        imageUrl: { type: String }, 

        profile: {
            // The models section includes data passed to"
            familyName: { type: String, index: true },
            givenName: { type: String, index: true },
            middleName: { type: String, index: true },
            highlight: { type: String, index: true },
            dob: { type: Date }, // Date of birth
            gender: { type: String },
            phone: { type: String },
            mobile: { type: String },
            emails: { type:[String], index: true },
            timezone: { type: String },
            permalink: { type: String },

            guardians: [Schema.Types.ObjectId], // parents
            languages:[String],

            education: {
                lastLevel: { type: String }, // Last achieved level
                // More details?
            },

            organizations: [{
                name: { type: String }, // Altenia
                title: { type: String }, // Principal Consultant
                startDate: { type: Date },
                endDate: { type: Date }
            }],

            address: {
                countryCode: { type: String },
                stateCode: { type: String },
                street: { type: String },
                postalCode: { type: String }
            }
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