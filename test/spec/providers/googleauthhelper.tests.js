
var expect = require('chai').expect;
var sinon = require('sinon');

var config = require('ecofyjs-config');


// Library under test
var Helper = require('../../../lib/providers/googleauthhelper').GoogleAuthHelper;

// Test data
var testdata = require('../../mock/credentials-google.testdata.json');


config.load('./config/test.conf.json');

describe('GoogleAuthHelper', function () {

	beforeEach(function () {
		
	});

	describe('buildAuthModel', function () {	
	
		it('should build auth model', function () {
			var auth = Helper.buildAuthModel(testdata);

			var expected = {
			};

			expect(auth).to.not.null;
			//expect(auth).to.deep.equals();
			console.log( JSON.stringify(auth, null, 2));
		});	
	});

	describe('buildAccountModel', function () {	
	
		it('should build account model', function () {
			var account = Helper.buildAccountModel(testdata);

			expect(account).to.not.null;
			console.log( JSON.stringify(account, null, 2));
		});	
	});

});