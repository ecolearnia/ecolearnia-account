// When second argument (array) is provided then this becomes a definition,
// otherwise it is a loading
angular.module('adminApp', ['ngRoute', 'account'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      //template: '<h5>This is the default route</h5>'
      controller: 'AccountController as accountCtrl',
      templateUrl:'/public/partials/account_list.html'
    })
    .when('/account/:accountId', {
      template: '<h5>This is the second route</h5>'
    })
    .otherwise({redirectTo: '/'});
  }]);