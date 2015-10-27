var app = angular.module('adminApp');
app.controller('AccountController', ['$routeParams', 'AccountResource', function($routeParams, AccountResource) {

    var self = this;
    self.accounts = [];
    self.account;

    if ($routeParams.accountId) {
    	self.account = AccountResource.get({id: $routeParams.accountId}, function(data) {
            var t = data;
        });
    } else {
	    // initialize
	    self.accounts = AccountResource.query(function(data) {
            var t = data;
        });
	}

    this.getAccount = function(id) {
    	self.account = AccountResource.get(id);
    	if (!self.account) {
    		alert ('Not found for ' + id);
    	}
    };

}]);

app.controller('AccountDetailsController', ['$routeParams', 'AccountResource', function($routeParams, AccountResource) {

    var self = this;
    self.accounts = [];
    self.account;

    // initialize
    self.accounts = AccountResource.query();

    this.getAccount = function(id) {
    	self.account = AccountResource.get(id);
    	if (!self.account) {
    		alert ('Not found for ' + id);
    	}
    };

}]);