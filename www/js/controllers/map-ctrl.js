angular.module('admin')
.controller('MapCtrl', ['$scope', '$log', '$state', '$stateParams', 'DeviceService', 'Map', 'MapDrawing', '$ionicPopup', 'FencingService', 'NotificationService',
  function($scope, $log, $state, $stateParams, DeviceService, Map, MapDrawing, $ionicPopup, FencingService, NotificationService) {

    $log.debug('MapCtrl');

    $scope.notifications = [{text: 1}];

    $scope.$on('$ionicView.afterEnter', function() {
      $scope.deviceId = $stateParams.deviceId;

      DeviceService.get($scope.deviceId).then(function($device) {
        $log.debug('Bind to device ' + $device.$id);
        $device.$bindTo($scope, 'device'); 
        // List of fencings
        FencingService.watch($device.$id, fencingAdded);
        //
        $scope.notifications = NotificationService.notifications($device.$id); 
        // Initialise Map
        Map.init();
        // Watch after device and show it on the map
        $scope.$watch('device', function(device) {
            pointDevice(device);
        });
      });
    });

    function pointDevice(device) {
        if (device.location) {
            var pos = new google.maps.LatLng(Number(device.location.latitude), Number(device.location.longitude));
            if ($scope.deviceMarker) {
                Map.updateDeviceMarker($scope.deviceMarker, pos, Number(device.location.bearing));
            } else {
                $scope.deviceMarker = Map.createDeviceMarker(pos, Number(device.location.bearing));
            }
            Map.center(pos);
        }
    }

    function fencingAdded(key) {
        FencingService.get(key).then(function($fencing) {
            if ($fencing.type) {
                var shape = toShape($fencing);
                MapDrawing.add(shape);
            }
        });
    }

    function notificationAdded(key) {
    	NotificationService.get(key).then(function($notification) {
    	  $log.debug($waypoint);
        });
    }

    //************
    // Map Drawing
    //************

    $scope.editMode = false;
    $scope.deleteButtonDisabled = true;

    $scope.toggleEditMode = function() {
        $scope.editMode = !$scope.editMode;
        if ($scope.editMode) {
            MapDrawing.onShapeCreated(onShapeCreated);
            MapDrawing.onShapeUpdated(onShapeUpdated);
            MapDrawing.onShapeSelected(onShapeSelected);
            MapDrawing.show(Map.getMap());
        } else {
            MapDrawing.hide();
        }
    };

    function onShapeCreated(shape) {
        $log.debug('Created: ' + shape);
        FencingService.create($scope.deviceId).then(function($fencing) {
            shape.$id = $fencing.$id;
            toFencing(shape, $fencing);
            FencingService.set($fencing);
        });
    }

    function onShapeUpdated(shape) {
        $log.debug('Updated: ' + shape);
        FencingService.get(shape.$id).then(function($fencing) {
            toFencing(shape, $fencing);
            FencingService.set($fencing);
        });
    }

    function onShapeSelected(shape) {
        $scope.deleteButtonDisabled = shape === null;
        $log.debug('deleteButton: ' + $scope.deleteButtonDisabled);
    }

    $scope.deleteDisabled = function() {
        return $scope.deleteButtonDisabled;
    };

    $scope.deleteSelectedShape = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete',
            template: 'Delete selected Geofencing?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                MapDrawing.deleteSelectedShape(function(shape) {
                    FencingService.get(shape.$id).then(function($fencing) {
                        FencingService.remove($fencing, $scope.deviceId);
                    });
                });
            }
        });
    };
    $scope.deleteAllShape = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete',
            template: 'Delete all Geofencings?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                MapDrawing.deleteAllShape(function(shape) {
                    FencingService.get(shape.$id).then(function($fencing) {
                        FencingService.remove($fencing, $scope.deviceId);
                    });
                });
            }
        });
    };

    //*************************************
    // Translate shapes to fencing and back
    //*************************************

    function toFencing(shape, $fencing) {
        if (shape.type === google.maps.drawing.OverlayType.CIRCLE) {
            var center = shape.getCenter();
            $fencing.center = {
                lat: center.lat(),
                lng: center.lng(),
            };
            $fencing.radius = shape.getRadius();
        } else if (shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
            var bounds = shape.getBounds();
            $fencing.bounds = {
                sw: {
                    lat: bounds.getSouthWest().lat(),
                    lng: bounds.getSouthWest().lng()
                },
                nw: {
                    lat: bounds.getNorthEast().lat(),
                    lng: bounds.getNorthEast().lng()
                }
            };
        } else {
            throw Error('Unsupported shape type ' + shape.type);
        }
        toCommonFencing(shape, $fencing);
    }

    function toCommonFencing(shape, $fencing) {
        $fencing.type = shape.type;
        $fencing.fillColor = shape.fillColor;
        $fencing.fillOpacity = shape.fillOpacity;
        $fencing.strokeWeight = shape.strokeWeight;
    }

    function toShape($fencing) {
        var shape;
        var opts = {
            map: Map.getMap(),
            fillColor: $fencing.fillColor,
            fillOpacity: $fencing.fillOpacity,
            strokeWeight: $fencing.strokeWeight,
            clickable: true,
            draggable: true,
            editable: false
        };
        if ($fencing.type === google.maps.drawing.OverlayType.CIRCLE) {
            opts.center = new google.maps.LatLng($fencing.center.lat, $fencing.center.lng);
            opts.radius = $fencing.radius;
            shape = new google.maps.Circle(opts);
        } else if ($fencing.type === google.maps.drawing.OverlayType.RECTANGLE) {
            opts.bounds = new google.maps.LatLngBounds(
              new google.maps.LatLng($fencing.bounds.sw.lat, $fencing.bounds.sw.lng),
              new google.maps.LatLng($fencing.bounds.nw.lat, $fencing.bounds.nw.lng));
            shape = new google.maps.Rectangle(opts);
        } else {
            throw Error("Unsupported shape type " + $fencing.type);
        }
        shape.$id = $fencing.$id;
        shape.type = $fencing.type;
        return shape;
    }
}]);
