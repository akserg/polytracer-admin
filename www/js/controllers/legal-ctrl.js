angular.module('admin')
.controller('LegalController', ['$scope', '$state', 'LegalService', 
  function($scope, $state, LegalService) {

  $scope.iAggree = function() {
    // User accepted Legal Agreement - save info in local storage and move to login page
    LegalService.setAgreed().then(function() {
      $state.go('login');
    });
  };

}]);
