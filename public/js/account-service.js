var accountModule = angular.module('account', ['ngResource']);
accountModule.factory('AccountResource', ['$resource', function($resource) {

	var basePath = '/accounts';

	return $resource(basePath + '/:id'); // Note the full endpoint address
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
