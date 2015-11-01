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
        AuthService.signin(self.credentials)
        .then(function(authenticated) {
            // authenticated
            if (authenticated) {
                self.errorMessage = null;
                self.redir( '/public/admin.html' );
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
        //$location.path( path );
    };

}]);