angular.module('admin')
    .controller('DevicesCtrl', ['$scope', '$log', 'DeviceService', '$state', 'AuthService',
  function ($scope, $log, DeviceService, $state, AuthService) {

            $log.debug('DevicesCtrl');

            $scope.devices = [];

            $scope.$on('$ionicView.afterEnter', function () {
                $scope.devices = DeviceService.devices(AuthService.getUser().uid);
                $log.debug($scope.devices);
            });

            $scope.addDevice = function () {
                $log.debug("Navigate to Create Device");
                $state.go('app.addDevices');
            };

            $scope.select = function (device) {
                $log.debug("Navigate to show Device on Map");
                $state.go('app.singleOnMap', {
                    deviceId: device.$id
                });
            };

}]);
