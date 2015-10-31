// When second argument (array) is provided then this becomes a definition,
// otherwise it is a loading
angular.module('adminApp', ['ngRoute', 'ngCookies', 'account', 'ngMaterial'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      //template: '<h5>This is the default route</h5>'
      controller: 'AccountController as accountCtrl',
      templateUrl:'/public/partials/account_list.html'
    })
    .when('/account/:accountId', {
      controller: 'AccountController as accountCtrl',
      templateUrl:'/public/partials/account_details.html'
    })
    .when('/account/:accountId/form', {
      controller: 'AccountController as accountCtrl',
      templateUrl:'/public/partials/account_form.html'
    })
    .otherwise({redirectTo: '/'});
  }])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('green')
    .accentPalette('orange');
})
.controller('FrameController', ['$window', 'AuthService'
    , function($window, AuthService) 
{
  var self = this;

  AuthService.fetchMyAccount()
  .then(function(account) {
    self.session = account;
  })
  .catch(function(error) {

  });

  this.signout = function() {
    AuthService.signout()
    .then(function(data) {
      $window.location.href = '/public/main.html#/login';
    })
    .catch(function(error) {
      alert(JSON.stringify(error, null, 2));
    });

  }
}]);