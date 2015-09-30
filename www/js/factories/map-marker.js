angular.module('admin')
.factory('MapMarker', ['$log',
  function($log) {
    $log.debug('MapMarker');

    function create(options, events) {
      var marker;

      /**
       * set options
       */
      if (!(options.position instanceof google.maps.LatLng)) { // jshint ignore:line
        options.position = new google.maps.LatLng(0,0); // jshint ignore:line
      }
      // Create marker
      marker = new google.maps.Marker(options); // jshint ignore:line

      /**
       * set events
       */
      for (var eventName in events) {
        if (eventName) {
          google.maps.event.addListener(marker, eventName, events[eventName]); // jshint ignore:line
        }
      }

      return marker;
    }

    return {
      create: create
    };
}]);