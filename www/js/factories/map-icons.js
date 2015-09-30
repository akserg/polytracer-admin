angular.module('admin')
.factory('MapIcons', ['$log',
  function($log) {
    $log.debug('MapIcons');

    var trail = {
        path: 'M6,0 L7,0 L11,4 L11,5 L9,5 L9,13 L4,13 L4,5 L2,5 L2,4 L6,0',
        strokeColor: '#002F00',
        strokeWeight: 1,
        fillColor: '#00FF00',
        fillOpacity: 0.5,
        scale: 1,
        anchor: new google.maps.Point(6, 6),
        rotation: 0
    };

    var device = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        strokeColor: '#002F00',
        strokeWeight: 1,
        fillColor: '#00FF00',
        fillOpacity: 0.5,
        scale: 4,
        anchor: new google.maps.Point(0, 2),
        rotation: 0
    };

    return {
      trail: trail,
      device: device
    };
}]);
