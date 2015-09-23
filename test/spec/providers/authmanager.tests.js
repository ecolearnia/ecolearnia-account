
var expect = require('chai').expect;
var sinon = require('sinon');
var lodash = require('lodash');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('ecofyjs-config');
var DbUtils = require('../../../lib/utils/mongoutils').MongoUtils;


// Library under test
var manager = require('../../../lib/providers/authmanager');

// Test data
var testauthdata = require('../../mock/auth.testdata.json');


config.load('./config/test.conf.json');

describe('AuthManager', function () {

	before(function(){
		DbUtils.connect('mongodb://localhost/test_ecolearnia');
	});

	var testManager;

	var testResources = [
			generateTestAuth('google', 'gid1', 1),
			generateTestAuth('google', 'gid2', 2),
			generateTestAuth('clever', 'cid1', 1),
		];

	beforeEach(function () {
		testManager = manager.getManager();
	});

	describe('Initialize', function () {	
	
		it('should initialize', function () {
			expect(testManager.authProvider).to.not.null;
			expect(testManager.authProvider.primaryKey_).to.equal('uuid');
		});	
	});

	describe('CRUD operations', function () {	

		describe.skip('Create resource', function () {	
		
			it('should add', function (done) {

				testManager.add(testResources[0])
				.then( function(model) {
					var result = model.toJSON();
					result.uuid;
					// remove system properties
					delete result['__v'];
					delete result['_id'];

					expect(result.uuid, 'uuid property not generated').to.not.null;
					expect(result).to.deep.equal(testResources[0]);

					delete_(testManager, result.uuid);
					done();
				})
				.catch( function(error) {
					done(error);
				});
			});	
		});

		var createdUuids = [];

		beforeEach(function (done) {
			// Create three for reading 
			console.log("Adding 3 test records..");

			testManager.add(testResources[0])
			.then( function(model1) {
				createdUuids.push(model1.uuid);

				testManager.add(testResources[1])
				.then( function(model2) {
					createdUuids.push(model2.uuid);

					testManager.add(testResources[2])
					.then( function(model3) {
						createdUuids.push(model3.uuid);

						console.log("Completed adding 3 tests records.");
						done();
					})

				})

			})
			.catch( function(error) {
				done(error);
			});
		});

		afterEach(function (done) {
			deleteAllAndDone(testManager, done);
		});

		describe('Read resource', function () {

			it('should find', function (done) {
				var criteria = {
					op: '=',
					var: 'authId',
					val: testResources[1].authId
				};

				testManager.find(criteria)
				.then( function(model) {
					expect(model, 'Model is null').to.not.null;
					expect(model.data, 'Data does not match').to.equal(testResources[1].data);
					done();
				})
				.catch( function(error) {
					done(error);
				});
			});

			it('should findByPK', function (done) {
				testManager.findByPK(createdUuids[0])
				.then( function(model) {
					expect(model.data).to.equal(testResources[0].data);
					done();
				})
				.catch( function(error) {
					done(error);
				});
			});

			it('should query', function (done) {

				var criteria = {
					op: '=',
					var: 'authSource',
					val: testResources[1].authSource
				};

				testManager.query(criteria)
				.then( function(collection) {
					expect(collection.length, 'Retrieve').to.equal(2);
					done();
				})
				.catch( function(error) {
					done(error);
				});
			});

			it('should count', function (done) {

				var criteria = {
					op: '=',
					var: 'authSource',
					val: testResources[1].authSource
				};

				testManager.count(criteria)
				.then( function(result) {
					expect(result, 'Count').to.equal(2);
					done();
				})
				.catch( function(error) {
					done(error);
				});
			});
		});

		describe('Update resource', function () {
			var resources = [
				generateTestAuth('testsrc', 'tid1', 1),
			];

			beforeEach(function (done) {
				delete_(testManager, {})
				.then( function(model) {
					
					// Create one for updating 
					//delete resources[0].uuid;
					testManager.add(resources[0])
					.then( function(model1) {
						model = model1;
						done();
					})
					.catch( function(error) {
						done(error);
					});
				})
				.catch( function(error) {
					console.log('** ERROR on delete! **' +  JSON.stringify(error));
					done(error);
				});
			});

			afterEach(function (done) {
				deleteAllAndDone(testManager, done);
			});
		
			it('should update', function (done) {

				var criteria = {
					op: '=',
					var: 'authId',
					val: resources[0].authId
				};

				var updateTo = generateTestAuth('testsrc', 'tid1', 2);

				testManager.update(criteria, updateTo)
				.then( function(model2) {
					testManager.findByPK(resources[0].uuid)
					.then( function(model2b) {
						expect(model2b.status).to.equal(updateTo.status);
						done();
					})
					.catch( function(error) {
						done(error);
					});
				})
				.catch( function(error) {
					done(error);
				});
			});

			
		});

		describe('Delete resource', function () {	
		
			it('should remove', function (done) {

				var criteria = {
					op: '=',
					var: 'authId',
					val: testResources[0].authId
				};

				testManager.remove(criteria)
				.then( function(removeResult) {

					testManager.find(criteria)
					.then( function(resourceFound) {
						expect(resourceFound, 'Resource was not deleted').to.null;
						done();
					})
					.catch( function(error) {
						done(error);
					});
				})
				.catch( function(error) {
					done(error);
				});
			});

			it('should removeByPK', function (done) {

				testManager.removeByPK(testResources[0].uuid)
				.then( function(removeResult) {

					testManager.findByPK(testResources[0].uuid)
					.then( function(resourceFound) {
						expect(resourceFound, 'Resource was not deleted').to.null;
						done();
					})
					.catch( function(error) {
						done(error);
					});
				})
				.catch( function(error) {
					done(error);
				});
			});	
		});
	});

	function generateTestAuth(authSource, authId, status) {
		var testdata = lodash.cloneDeep(testauthdata);
		delete testdata.uuid;
		testdata.authSource = authSource;
		testdata.authId = authId;
		testdata.status = status;

		return testdata;
	}

	function deleteAllAndDone(provider, done)
	{
		delete_(provider, {})
			.then( function(model) {
				done();
			})
			.catch( function(error) {
				console.log('** ERROR on deleteAllAndDone! **' +  JSON.stringify(error));
				done(error);
			});
	}


	function delete_(provider, criteria)
	{
		if (typeof criteria == 'string')
		{
			criteria = {
				uuid: criteria
			}
		}
		return provider.remove(criteria);
	}
});

