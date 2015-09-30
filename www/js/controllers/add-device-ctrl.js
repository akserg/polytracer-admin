angular.module('admin')
.controller('AddDeviceCtrl', ['$scope', '$log', 'DeviceService', '$state', 'user', '$cordovaBarcodeScanner', 'Toast', 
  function($scope, $log, DeviceService, $state, user, $cordovaBarcodeScanner, Toast) {

    $scope.device = {};
    var userId = user.uid;

  	$scope.addDevice = function(e) {
  	  e.preventDefault();
      addDevice($scope.device.id);
  	};

    $scope.scan = function(e) {
      e.preventDefault();

      try {
        $cordovaBarcodeScanner
          .scan()
          .then(function (id) {
            $log.debug('Added device number ' + id.text);
            addDevice(id.text);
          }, function (error) {
              Toast.show('Error: ' + error, 'long', 'bottom');
          });
      } catch(error) {
        Toast.show('Error: ' + error, 'long', 'bottom');
      }
    };

    function addDevice(deviceId) {
      if (deviceId) {
        // Try to find specific deviceId and link it to user
        DeviceService.get(deviceId).then(function($device) {
          DeviceService.link($device, userId).then(function() {
            Toast.show('Device added successfully', 'long', 'bottom');
          }, function(error) {
            Toast.show('Error: ' + error, 'long', 'bottom');
          });
        }, function(error) {
          Toast.show('Error: ' + error, 'long', 'bottom');
        });
      }
      
    }
}]);
