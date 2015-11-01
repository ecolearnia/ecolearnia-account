/**
 * The main application module
 */
angular.module('mainApp', ['ngRoute', 'ngCookies', 'account', 'ngMaterial'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {
      //template: '<h5>This is the default route</h5>'
      controller: 'SigninController as signinCtrl',
      templateUrl:'/public/partials/signin.html'
    })
    .when('/home', {
      controller: 'AccountController as accountCtrl',
      templateUrl:'/public/partials/account_details.html'
    })
    .when('/me/profile', {
      controller: 'AccountController as accountCtrl',
      templateUrl:'/public/partials/account_form.html'
    })
    .otherwise({redirectTo: '/login'});
  }])

/**
 * For the Angular matrial design
 */
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('green')
    .accentPalette('orange');
})

/**
 * Frame controller than handles the account in session
 */
.controller('FrameController', ['$location', 'AuthService'
    , function($location, AuthService) 
{
  var self = this;
  AuthService.fetchMyAccount()
  .then(function(account) {
    self.session = account;
  })
  .catch(function(error) {

  })
}]);