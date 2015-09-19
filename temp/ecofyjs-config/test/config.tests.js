
var expect = require('chai').expect;
//var sinon = require('sinon');

var config = require('../lib/config');


describe('Utils', function () {

	beforeEach(function () {

	});

	describe('Config', function () {	
	
		it('should return property value', function (done) {

			config.load('./config/test.conf.json');

			var retval = config.get('prop1');
			expect(retval).to.equal(123);

			retval = config.get('prop2');
			expect(retval).to.equal('test-prop-val');

			done();
			
		});	

		it('should return default value for unexistent property', function () {

			config.load('./config/test.conf.json');

			var testDefault = 'TEST-default';
			var retval = config.get('prop13', testDefault);
			expect(retval).to.equal(testDefault);
			
		});	
	});
});

