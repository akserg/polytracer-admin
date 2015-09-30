angular.module('admin')
.controller('ChangePasswordCtrl', ['$scope', '$state', '$log', 'AuthService', 'Toast', 'user', 
  function($scope, $state, $log, AuthService, Toast, user) {

  $scope.forgotForm = {};
  $scope.user = {};

  $scope.changePassword = function() {

    var email = user.email;
    var oldPassword = $scope.user.oldPassword;
    var newPassword = $scope.user.newPassword;

    AuthService.changePassword(email, oldPassword, newPassword)
    .then(function() {
      $state.go('app.devices');
      $log.info("Password changed");
      Toast.show("You password has been changed", 'long', 'bottom');
    }, function(error) {
      $log.error(error);
      Toast.show(error, 'long', 'bottom');
    });
  }

}]);
