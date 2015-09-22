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
 *  This file includes definition of GoogleAuthHelper.
 *
 * @author Young Suk Ahn Park
 * @date 2/28/15
 */


var Logger = require('ecofyjs-logger-facade').Logger;

/**
 * Class that read and Google users credential and creates Auth object
 */
internals.GoogleAuthHelper = function()
{
}

/**
 * Builds Auth model from Google's credentials
 */
internals.GoogleAuthHelper.prototype.buildAuthModel = function(credentials)
{
	var auth = {};

	// For the mean time, just use the default values
    //auth.createdBy: { type: Schema.Types.ObjectId, ref: 'Account' },
    //auth.createdAt: { type: Date, default: Date.now, index: true },
    //auth.modifiedBy: { type: Schema.Types.ObjectId, ref: 'Account' },
    //auth.modifiedAt: { type: Date, default: Date.now },
    //auth.modifiedCounter: { type: Number, default: 0 }, // Number of time this record was modified
    
    // Authentication
    auth.authSource: 'google';
    auth.authId: credentials.profile.id;
    auth.authCredentials: JSON.stringify(credentials);
    auth.authCredentialsTimestamp: new Date();
    auth.status: 1;

    auth.rememberToken: credentials.token,

    // Only applicable for local authentication
    auth.password: '',
    auth.activationCode: '',
    auth.securityQuestion: '',
    auth.securityAnswer: '',
    //auth.sessionTimestamp: ,
    //auth.authFailCounter: { type: Number } // Number of consecutive authorization failure

};


/**
 * Builds Auth model from Google's credentials
 */
internals.GoogleAuthHelper.prototype.buildAccountModel = function(credentials)
{
	var account = {};

	// For the mean time, just use the default values
    //account.createdBy: { type: Schema.Types.ObjectId, ref: 'Account' },
    //account.createdAt: { type: Date, default: Date.now, index: true },
    //account.modifiedBy: { type: Schema.Types.ObjectId, ref: 'Account' },
    //account.modifiedAt: { type: Date, default: Date.now },
    //account.modifiedCounter: { type: Number, default: 0 }, // Number of time this record was modified

    account.kind: 'basic';
        
    account.roles: [], //roles
    account.status: 'registered',
    account.displayName: credentials.profile.displayName;
    account.imageUrl: credentials.profile.raw.image.url, 

    account.profile: {
        // The models section includes data passed to"
        familyName: credentials.profile.name.familyName,
        givenName: credentials.profile.name.givenName,
        //middleName: { type: String, index: true },
        highlight: credentials.profile.raw.tagline,
        //dob: { type: Date }, // Date of birth
        gender: credentials.profile.raw.gender,
        //phone: credentials.profile.raw.gender,
        //mobile: { type: String },
        email: credentials.profile.emails[0].value,
        //timezone: { type: String },
        languages:[ credentials.profile.raw.language ],
        //permalink: { type: String },

        //guardians: [Schema.Types.ObjectId], // parents

        education: {
            lastLevel: { type: String }, // Last achieved level
            // More details?
        },

        organizations: credentials.profile.raw.organizations,

        /*
        address: {
            countryCode: { type: String },
            stateCode: { type: String },
            street: { type: String },
            postalCode: { type: String }
        }*/
    }
	
};

module.exports.GoogleAuthHelper = internals.GoogleAuthHelper;