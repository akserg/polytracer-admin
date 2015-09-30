angular.module('admin')
.controller('ForgotController', ['$scope', '$state', '$log', 'AuthService', 'Toast', 
  function($scope, $state, $log, AuthService, Toast) {

  $scope.forgotForm = {};
  $scope.user = {};

  $scope.resetPassword = function() {

    var email = $scope.user.email;

    AuthService.resetPassword(email)
    .then(function() {
      $state.go('login');
      $log.info("Email sent");
      Toast.show("We sent instruction how reset passord on your e-mail", 'short', 'bottom');
    }, function(error) {
      $log.error("Forgot Password Failed!" + error);
      Toast.show(error, 'long', 'bottom');
    });
  }

}]);
