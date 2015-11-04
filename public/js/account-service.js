var accountModule = angular.module('account');

/**
 * Service that provides REST access for Account resource  
 */
accountModule.factory('AccountResource', ['$resource', 'AuthService', 
	function($resource, AuthService)
{

	var basePath = '/api/accounts';
	var token = AuthService.getToken();

	return $resource(basePath + '/:id', {},
		{
			'get': { method:'GET', headers: { 'Authorization': token } },
			'save': { method:'POST', headers: { 'Authorization': token } },
	        'query': { method:'GET', isArray: true, headers: { 'Authorization': token } },
	        'remove': { method:'DELETE', headers: { 'Authorization': token } },
	        'deleve': { method:'DELETE', headers: { 'Authorization': token } },
	        'update': { method:'PUT', headers: { 'Authorization': token } },
	        'query2': { method:'GET', headers: { 'Authorization': token }, paramDefaults: { 'meta': 'true'} }
	    });
 
}]);
