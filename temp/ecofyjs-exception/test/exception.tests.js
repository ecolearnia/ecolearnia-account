
var expect = require('chai').expect;
//var sinon = require('sinon');

var Exception = require('../lib/exception');


describe('Exception', function () {

	function verifyValues(actual, expected)
	{
		expect(actual.name).to.equal(expected.name);
		expect(actual.message).to.equal(expected.message);
		expect(actual.cause).to.equal(expected.cause);
		expect(actual.statusCode).to.equal(expected.statusCode);
		expect(actual.messageCode).to.equal(expected.messageCode);
		expect(actual.context).to.deep.equal(expected.context);
	}

	var testErr;
	beforeEach(function () {	

		testErr = {
			name: 'test-name',
			message: 'test-message',
			cause: new Error('Test'),
			statusCode: 123,
			messageCode: 'test-messageCode',
			context: {mycontext: 'MOCK'}
		};
	});

	describe('Instantiation', function () {	
	
		it('should create Exception', function () {
			
			var cause = new Error('Test');
			var exception = new Exception(testErr.name, testErr.message, testErr.cause, testErr.statusCode, testErr.messageCode, testErr.context);
			
			expect(exception instanceof Error).to.be.true;
			expect(exception instanceof Exception).to.be.true;

			verifyValues(exception, testErr);

		});
	});

	describe('Conversions', function () {
		it('should create Exception from object: fromJSON', function () {
			
			var exception = Exception.fromJSON(testErr);
			verifyValues(exception, testErr);
		});

		it('should create Exception from string: fromJSON', function () {
			var testErrStr = JSON.stringify(testErr);
			var exception = Exception.fromJSON(testErr);
			verifyValues(exception, testErr);
		});

		it('should create JSON objcect (toJSON)', function () {
			var exception = Exception.fromJSON(testErr);
			var exceptionJson = exception.toJSON();

			// The cause is not restored to Error object but to stringified
			testErr.cause = testErr.cause.toString();
			verifyValues(exceptionJson, testErr);
		});
	});

	describe('Create HTTP wrappers', function () {
		it('should createBadRequestError', function () {
			var ex = Exception.createBadRequestError(testErr.cause, testErr.context);
			testErr.name = 'BadRequest';
			testErr.message = 'Bad Request Error';
			testErr.statusCode = 400;
			testErr.messageCode = testErr.name;
			verifyValues(ex, testErr);
		});
	});

});

