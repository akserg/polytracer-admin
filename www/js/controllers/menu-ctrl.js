angular.module('admin').controller('MenuCtrl', ['$scope', 'AuthService', '$log', '$state', 'Toast', '$ionicPopup',
    function ($scope, AuthService, $log, $state, Toast, $ionicPopup) {

        $log.debug('MenuCtrl');

        $scope.$on('$ionicView.afterEnter', function () {
            $scope.user = AuthService.getUser();
        });

        $scope.logout = function () {
            $log.info('Logout');
            AuthService.logout().then(function () {
                $state.go('welcome');
            });
        };

        $scope.changePassword = function () {
            $log.info('Change Password');
            $log.debug('loginWithPassword: ' + $scope.user.loginWithPassword);
            if ($scope.user.loginWithPassword) {
                $state.go('app.changePassword');    
            } else {
                $ionicPopup.alert({
                    title: 'Appologies',
                    template: 'This function available only for Users logged in with Email & Password Authentication'
                });
            }
            
        };

    }
]);
