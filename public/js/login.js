// When second argument (array) is provided then this becomes a definition,
// otherwise it is a loading
angular.module('loginApp', ['account', 'ngMaterial'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('green')
    .accentPalette('orange');
})
.controller('LoginController', ['$window', 'AccountResource'
    , function($window, AccountResource) 
{
    this.go = function(path) {
        //$location.path( path );
        $window.location.href = path;
    };
}]);