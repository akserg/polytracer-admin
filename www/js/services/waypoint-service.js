angular.module('admin')
    .factory('WaypointArray', ['fbRef', '$firebaseArray', '$firebaseObject', function (fbRef, $firebaseArray, $firebaseObject) {
        var waypoints = fbRef.child('waypoints');

        // create a new service based on $firebaseArray
        var WaypointArray = $firebaseArray.$extend({
            // change the added behavior to return waypoint objects
            $$added: function (snap) {
                // instead of creating the default POJO (plain old JavaScript object)
                // we will return an instance of the Widget class each time a child_added
                // event is received from the server
                return $firebaseObject(waypoints.child(snap.key()));
            }
        });

        return function (listRef) {
            // create an instance of WaypointArray (the new operator is required)
            return new WaypointArray(listRef);
        }
}])
    .factory('WaypointService', ['fbRef', '$q', '$firebaseObject', '$firebaseArray', 'WaypointArray', function (fbRef, $q, $firebaseObject, $firebaseArray, WaypointArray) {

        // Get list of sync waypoints
        function waypoints(deviceId, limit) {
            limit = limit || 50;
            return WaypointArray(fbRef.child('device/' + deviceId + '/waypoints').limitToLast(limit));
        }

        // Watch after waypoints array belongs to deviceId and call specific callback function
        function watch(deviceId, addedCallback, changedCallback, removedCallback) {
            $firebaseArray(fbRef.child('devices/' + deviceId + '/waypoints')).$watch(function (value) {
                if (value.event === 'child_added' && addedCallback) {
                    addedCallback(value.key);
                } else if (value.event === 'child_changed' && changedCallback) {
                    changedCallback(value.key);
                } else if (value.event === 'child_removed' && removedCallback) {
                    removedCallback(value.key);
                }
            });
        }

        /**
         * Create new waypoint .
         * This method returns promise object which will return waypoint as result of
         * resolve operation.
         */
        function create(value, deviceId) {
            var deferred = new $q.defer();
            // Create new waypoint reference instance
            var waypoint = fbRef.child('waypoints').push();
            // A waypoint value object
            value = angular.extend({}, {
                'timestamp': Firebase.ServerValue.TIMESTAMP,
                'device': deviceId
            }, value);
            //
            waypoint.set(value, function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var waypointId = waypoint.key();
                    fbRef.child('devices/' + deviceId + '/waypoints/' + waypointId).set(true);
                    deferred.resolve();
                }
            });
            //
            return deferred.promise;
        }

        /**
         * Save waypoint information
         */
        function set($waypoint) {
            var deferred = new $q.defer();
            $waypoint.$save().then(function () {
                deferred.resolve($waypoint);
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        /**
         * Find and return dvice by id.
         * This method returns promise object which will return waypoint as result of
         * resolve operation.
         */
        function get(deviceId) {
            var deferred = new $q.defer();
            // Convert waypoint reference into angular object data
            var $waypoint = $firebaseObject(fbRef.child('waypoints/' + deviceId));
            // We need wait until oject will be fully loaded
            $waypoint.$loaded().then(function () {
                // Now waypoint is ready to use
                deferred.resolve($waypoint);
            }).catch(function (error) {
                // Something wrong
                deferred.reject(err);
            });
            //
            return deferred.promise;
        }

        /**
         * Remove information about waypoint from Firebase.
         */
        function remove($waypoint, deviceId) {
            var deferred = new $q.defer();
            // Remove waypoint from list of waypoints
            $waypoint.$remove().then(function (ref) {
                var waypointKey = ref.key();
                // Get waypoint from user
                var waypoint = fbRef.child('devices/' + deviceId + '/waypoints/' + waypointKey);
                // Remove waypoint from user
                waypoint.remove(function (error) {
                    if (error) {
                        deferred.reject("Waypoint could not be removed. " + error);
                    } else {
                        deferred.resolve();
                    }
                });
            }, function (err) {
                deferred.reject("Waypoint could not be removed. " + err);
            });
            //
            return deferred.promise;
        }

        return {
            waypoints: waypoints,
            watch: watch,
            create: create,
            set: set,
            get: get,
            remove: remove
        };

}]);
