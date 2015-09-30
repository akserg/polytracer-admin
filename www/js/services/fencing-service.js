angular.module('admin')
    .factory('FencingArray', ['fbRef', '$firebaseArray', '$firebaseObject', function (fbRef, $firebaseArray, $firebaseObject) {
        var fencings = fbRef.child('fencings');

        // create a new service based on $firebaseArray
        var FencingArray = $firebaseArray.$extend({
            // change the added behavior to return fencing objects
            $$added: function (snap) {
                // instead of creating the default POJO (plain old JavaScript object)
                // we will return an instance of the Widget class each time a child_added
                // event is received from the server
                return $firebaseObject(fencings.child(snap.key()));
            }
        });

        return function (listRef) {
            // create an instance of FencingArray (the new operator is required)
            return new FencingArray(listRef);
        }
}])
.factory('FencingService', ['fbRef', '$q', '$firebaseObject', '$firebaseArray', 'FencingArray', function (fbRef, $q, $firebaseObject, $firebaseArray, FencingArray) {

            // Get list of sync fencings
            function fencings(deviceId) {
                return FencingArray(fbRef.child('devices/' + deviceId + '/fencings'));
            }

            // Watch after fencing array belongs to deviceId and call specific callback function
            function watch(deviceId, addedCallback, changedCallback, removedCallback) {
                $firebaseArray(fbRef.child('devices/' + deviceId + '/fencings')).$watch(function(value) {
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
             * Create new fencing .
             * This method returns promise object which will return fencing as result of
             * resolve operation.
             */
            function create(deviceId) {
                var deferred = new $q.defer();
                // Create new fencing reference instance
                var fencing = fbRef.child('fencings').push();
                // A fencing value object
                var value = {
                    'device': deviceId
                };
                //
                fencing.set(value, function (err) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        var fencingId = fencing.key();
                        fbRef.child('devices/' + deviceId + '/fencings/' + fencingId).set(true);
                        // Convert fencing reference into angular object data
                        var $fencing = $firebaseObject(fencing);
                        // We need wait until oject will be fully loaded
                        $fencing.$loaded().then(function () {
                            // Now fencing is ready to use
                            deferred.resolve($fencing);
                        }).catch(function (error) {
                            // Something wrong
                            deferred.reject(err);
                        });
                    }
                });
                //
                return deferred.promise;
            }

            /**
             * Save fencing information
             */
            function set($fencing) {
                return $fencing.$save();
            }

            /**
             * Find and return fencing by id.
             * This method returns promise object which will return fencing as result of
             * resolve operation.
             */
            function get(fencingId) {
                var deferred = new $q.defer();
                // Convert fencing reference into angular object data
                var $fencing = $firebaseObject(fbRef.child('fencings/' + fencingId));
                // We need wait until oject will be fully loaded
                $fencing.$loaded().then(function () {
                    // Now fencing is ready to use
                    deferred.resolve($fencing);
                }).catch(function (error) {
                    // Something wrong
                    deferred.reject(err);
                });
                //
                return deferred.promise;
            }

            /**
             * Remove information about fencing from Firebase.
             */
            function remove($fencing, deviceId) {
                var deferred = new $q.defer();
                // Remove fencing from list of fencings
                $fencing.$remove().then(function(ref) {
                    var fencingKey = ref.key();
                    // Get fencing from device
                    var fencing = fbRef.child('/devices/' + deviceId + '/fencings/' + fencingKey);
                    // Remove fencing from device
                    fencing.remove(function(error) {
                        if (error) {
                            deferred.reject("Fencing could not be removed. " + error);
                        } else {
                            deferred.resolve();
                        }
                    });
                }, function(err) {
                    deferred.reject("Fencing could not be removed. " + err);
                });
                //
                return deferred.promise;
            }

            return {
                watch: watch,
                fencings: fencings,
                create: create,
                set: set,
                get: get,
                remove: remove
            };

}]);
