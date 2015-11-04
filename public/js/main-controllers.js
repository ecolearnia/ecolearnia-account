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

app.controller('SignupController', ['$window', '$location', 'AuthService', 
    function($window, $location, AuthService)
{

    var self = this;
    self.account;
    // Temporary staging used prior submission
    self.temp = {
        email: null,
        dob: {
            month: null,
            day: null,
            year: null
        }
    };

    self.referencial = {
        genders: [],
        days: [],
        months: [],
    };
    
    loadReferencials();

    function loadReferencials()
    {
        self.referencial.days = new Array(31);
        
        self.referencial.months = [
            {value: '1', name:'Januray'},
            {value: '2', name:'February'},
            {value: '3', name:'March'},
            {value: '4', name:'April'},
            {value: '5', name:'May'},
            {value: '6', name:'June'},
            {value: '7', name:'July'},
            {value: '8', name:'August'},
            {value: '9', name:'September'},
            {value: '10', name:'October'},
            {value: '11', name:'November'},
            {value: '12', name:'December'},
        ];

        self.referencial.genders = [
            {value: '1', name:'Female'},
            {value: '2', name:'Male'},
            {value: '3', name:'Other'},
        ];
    }

    this.redir = function(path) {
        //$location.path( path );
        $window.location.href = path;
    };

    /**
     * Calls signup remote endpoint
     */
    this.signup = function() {
        self.account.profile.emails = [self.temp.email];
        self.account.profile.dob = new Date(self.temp.dob.year, self.temp.dob.month, self.temp.dob.day);
        self.account.auth.username = self.temp.email;
        AuthService.signup(self.account)
        .then(function(account) {
            if (account) {
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
    };

}]);