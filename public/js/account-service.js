var accountModule = angular.module('account', ['ngResource']);
accountModule.factory('AccountResource', ['$resource', function($resource) {

	var basePath = '/api/accounts';

	return $resource(basePath + '/:id', {},
		{
	        'update': { method:'PUT' }
	    });
	/*
	this.list = function() {
	    // initialize
	    return $http.get(basePath)
	}
 
    this.retrieve = function(id) {
    	return $http.get(basePath);
    };

    this.retrieve = function(id) {
    	return $http.get(basePath);
    };*/
 
}]);
