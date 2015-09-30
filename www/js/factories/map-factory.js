angular.module('admin')
.factory('Map', ['$log', 'MapIcons', 'MapMarker', 
  function($log, MapIcons, MapMarker) {

    $log.debug('Map');

    //****
    // Map
    //****

    var map;

    function initialise(id) {
      var mapOptions = {
        center: new google.maps.LatLng(-33.971310, 18.470995),
        zoom: 16,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: false,
        scaleControl: true,
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.DEFAULT,
          position: google.maps.ControlPosition.LEFT_TOP
        },
        streetViewControl: false
      };

      map = new google.maps.Map(document.getElementById(id), mapOptions);
    }

    //**********************
    // Map's exposed methods
    //**********************

    function init() {
      google.maps.event.addDomListener(document.getElementById("map"), 'load', initialise("map"));
    }

    function center(position) {
      map.setCenter(position);
    }

    function getMap() {
      return map;
    }

    //******
    // Utils
    //******

    function rotate(icon, heading) {
      icon.rotation = heading ? heading : 0;
      return icon;
    }

    //*******
    // Marker
    //*******
    function createDeviceMarker(position, heading) {
      return MapMarker.create({
        position: position,
        map: map,
        icon: rotate(MapIcons.device, heading)
      });
    }

    function updateDeviceMarker(marker, position, heading) {
      marker.setPosition(position);
      marker.setIcon(rotate(MapIcons.device, heading));
    }


    return {
      getMap: getMap,
      init: init,
      createDeviceMarker: createDeviceMarker,
      updateDeviceMarker: updateDeviceMarker,
      center: center
    };
}]);
