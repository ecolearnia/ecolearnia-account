var app = angular.module('mainApp');
app.controller('SigninController', ['$window', '$location', 'AuthService', 
    function($window, $location, AuthService)
{

    var self = this;
    self.account;

    self.credentials = {
        username:'',
        password:''
    };

    this.redir = function(path) {
        //$location.path( path );
        $window.location.href = path;
    };

    this.signin = function() {
        //$location.path( path );
        AuthService.signin(self.credentials)
        .then(function(authenticated) {
            // authenticated
            if (authenticated) {
                self.errorMessage = null;
                $location.path( '#/home' );
            } else {
                self.errorMessage = 'Invalid username or password';
            }
        })
        .catch(function(error) {
            if (error instanceof Error) {
                self.errorMessage = error.toString();
            } 
            self.errorMessage = JSON.stringify(error, null, 2);
        });
    };

}]);