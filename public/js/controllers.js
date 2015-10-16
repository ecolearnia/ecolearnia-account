angular.module('adminApp')
.controller('AccountController', ['$routeParams', 'AccountResource', function($routeParams, AccountResource) {

    var self = this;
    self.accounts = [];

    // initialize
    self.accounts = AccountResource.query();

    this.addAuth = function() {

    };


}]);