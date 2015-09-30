angular.module('admin')
.controller('WelcomeController', ['$scope', '$state', 'LegalService',
  function($scope, $state, LegalService) {

  $scope.enter = function() {
    // After user click on Enter button we need to decide where we go.
    // If user accepted Leag Agreement yet - move to login view else on legal view:
    LegalService.isAgreed().then(function(agreed) {
      if (agreed) {
        $state.go('login');
      } else {
   	  $state.go('legal');
   	}
    });
  };

}]);
