var app = angular.module('adminApp');
app.controller('AccountController', ['$cookies', '$routeParams', '$location', 'AuthService', 'AccountResource'
    , function($cookies, $routeParams, $location, AuthService, AccountResource) 
{
    var self = this;
    self.accounts = [];
    self.account;

    if ($routeParams.accountId && $routeParams.accountId != 'new') {
    	self.account = AccountResource.get({id: $routeParams.accountId}, function(data) {
            // nothing to do, data is updated when async is returned.
        });
    } else {
	    // initialize
	    self.accounts = AccountResource.query(function(data) {
            // nothing to do, data is updated when async is returned.
        });
	}

    this.go = function(path) {
        $location.path( path );
    };

    /**
     * Is any user selected?
     */
    this.selectedAccount = function() {
        return self.account;
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
