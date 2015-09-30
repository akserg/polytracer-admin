angular.module('admin')
    .factory('GeolocationService', ['$cordovaBackgroundGeolocation', '$log', 'WaypointService', function ($cordovaBackgroundGeolocation, $log, WaypointService) {

        var options = {
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 30,
            activityType: 'AutomotiveNavigation',
            debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
            stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates
        };

        function init() {
            $log.debug('Init $cordovaBackgroundGeolocation');
            $cordovaBackgroundGeolocation.configure(callbackFn, failureFn, options);
            $cordovaBackgroundGeolocation.start();
        }

        // This hardcoded device id must be changed to the real one
        var deviceId = '';

        //******************
        // Callback function
        //******************

        /**
         * This callback will be executed every time a geolocation is recorded in the background.
         */
        function callbackFn(location) {
            $log.debug('BackgroundGeoLocation:  ' + location.latitude + ',' + location.longitude);

            // Update our current-position marker.
            //app.setCurrentLocation(location);
            var waypoint = {
                heading: location.heading,
                lat: location.latitude,
                lng: location.longitude,
                speed: location.speed,
                accuracy: location.accuracy
            };
            //WaypointService.create(waipoint, deviceId);

            // After you Ajax callback is complete, you MUST signal to the native code, which is running a background-thread, that you're done and it can gracefully kill that thread.
            yourAjaxCallback.call(this);
        };

        /**
         * This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
         */
        function yourAjaxCallback(response) {
            $cordovaBackgroundGeolocation.finish();
        };

        function failureFn(error) {
            $log.debug('BackgroundGeoLocation error');
        };


        return {
            init: init
        };
}]);
