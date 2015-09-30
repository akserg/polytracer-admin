angular.module('admin')
    .controller('LoginController', ['$scope', '$state', '$log', 'AuthService', 'Toast', 'DeviceService', 'LoadingService',
        function ($scope, $state, $log, AuthService, Toast, DeviceService, LoadingService) {

            $scope.user = {};

            $scope.loginWithPassword = function (e) {
                e.preventDefault();

                var username = $scope.user.email;
                var password = $scope.user.password;

                LoadingService.show('Logging in ...');

                AuthService.loginWithPassword(username, password)
                    .then(function (user) {
                        login(user);
                    }, function (error) {
                        $log.error(error);
                        Toast.show(error, 'long', 'bottom');
                    })
                    .finally(function() {
                        LoadingService.hide();
                    });

            };

            $scope.loginWithOAuth = function (provider) {

                LoadingService.show('Logging in ...');

                AuthService.loginWithOAuth(provider)
                    .then(function (user) {
                        login(user);
                    }, function (error) {
                        $log.error(error);
                        Toast.show(error, 'long', 'bottom');
                    })
                    .finally(function() {
                        LoadingService.hide();
                    });
            };

            function login(user) {
                $log.info("Authenticated successfully with payload:" + user.uid);
                if (user.passwordIsTemporary) {
                    $state.go('app.changePassword');
                } else {
                    $state.go('app.devices');
                }
                Toast.show('You have been logged in', 'short', 'bottom');
            }

    }]);
