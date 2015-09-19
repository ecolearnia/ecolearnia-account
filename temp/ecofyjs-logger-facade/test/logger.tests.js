
var expect = require('chai').expect;
//var sinon = require('sinon');

var config = require('ecofyjs-config');
var Logger = require('../lib/logger').Logger;


describe('Logger', function () {

	before(function () {
		config.load('./config/test.conf.json');
	});

	describe('Config', function () {	
	
		it('should ...', function () {

			var logger = Logger.getLogger('test');
			logger.info('info');
			
		});	

		it('should ...', function () {
			var logger = Logger.getLogger('test');
			logger.warn({meta:'meta'}, 'my warning', {test: 'test'}, {test: 'test'}, 'hehe');
			
		});	
	});
});

