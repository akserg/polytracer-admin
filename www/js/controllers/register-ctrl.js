angular.module('admin')
    .controller('RegisterController', ['$scope', '$state', '$log', 'AuthService', 'Toast',
  function ($scope, $state, $log, AuthService, Toast) {

            $scope.regForm = {};
            $scope.user = {};

            $scope.register = function () {

                var username = $scope.user.email;
                var password = $scope.user.password;

                AuthService.createUser(username, password)
                    .then(function (authData) {
                        $state.go('login');
                        $log.info("User " + authData.uid + " created successfully!" + authData);
                        Toast.show("You have been registered", 'short', 'bottom');
                    }, function (error) {
                        $log.error("SignUp Failed!" + error);
                        Toast.show(error, 'long', 'bottom');
                    });
            };

}]);
