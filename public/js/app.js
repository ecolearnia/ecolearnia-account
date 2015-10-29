// When second argument (array) is provided then this becomes a definition,
// otherwise it is a loading
angular.module('adminApp', ['ngRoute', 'account', 'ngMaterial'])
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
});