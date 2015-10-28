var app = angular.module('adminApp');
app.controller('AccountController', ['$routeParams', '$location', 'AccountResource', function($routeParams, $location, AccountResource) {

    var self = this;
    self.accounts = [];
    self.account;

    if ($routeParams.accountId && $routeParams.accountId != 'new') {
    	self.account = AccountResource.get({id: $routeParams.accountId}, function(data) {
            // nothing to do
        });
    } else {
	    // initialize
	    self.accounts = AccountResource.query(function(data) {
            // nothing to do 
        });
	}

    this.go = function(path) {
        $location.path( path );
    };

    this.getAccount = function(id) {
    	self.account = AccountResource.get(id);
    	if (!self.account) {
    		alert ('Not found for ' + id);
    	}
    };

    this.submit = function() {

        if (self.account.uuid) {
            delete self.account._id;
            AccountResource.update({id: self.account.uuid}, self.account);
        } else {
            var newAccount = new AccountResource(self.account);
            newAccount.kind = 'normal';
            newAccount.auth = {
                authSource: 'local',
                username: 'test',
                password: 'test'
            };
            newAccount.$save();
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