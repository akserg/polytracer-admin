angular.module('admin')
    .factory('DeviceArray', ['fbRef', '$firebaseArray', '$firebaseObject', function (fbRef, $firebaseArray, $firebaseObject) {
        var devices = fbRef.child('devices');

        // create a new service based on $firebaseArray
        var DeviceArray = $firebaseArray.$extend({
            // change the added behavior to return device objects
            $$added: function (snap) {
                // instead of creating the default POJO (plain old JavaScript object)
                // we will return an instance of the Widget class each time a child_added
                // event is received from the server
                return $firebaseObject(devices.child(snap.key()));
            }
        });

        return function (listRef) {
            // create an instance of DeviceArray (the new operator is required)
            return new DeviceArray(listRef);
        }
}])
.factory('DeviceService', ['fbRef', '$q', '$firebaseObject', '$firebaseArray', 'DeviceArray', function (fbRef, $q, $firebaseObject, $firebaseArray, DeviceArray) {

            // Get list of sync devices
            function devices(userId) {
                return DeviceArray(fbRef.child('users/' + userId + '/devices'));
            }

            /**
             * Create new device .
             * This method returns promise object which will return device as result of
             * resolve operation.
             */
            function create(value, userId) {
                var deferred = new $q.defer();
                // Create new device reference instance
                var device = fbRef.child('devices').push();
                // A device value object
                value = angular.extend({}, {
                    'timestamp': Firebase.ServerValue.TIMESTAMP,
                    'user': userId
                }, value);
                //
                device.set(value, function (err) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        var deviceId = device.key();
                        fbRef.child('users/' + userId + '/devices/' + deviceId).set(true);
                        deferred.resolve();
                    }
                });
                //
                return deferred.promise;
            }

            /**
             * Save device information
             */
            function set($device) {
                var deferred = new $q.defer();
                $device.$save().then(function () {
                    // Save info in geofire
                    $geo.$set($device.$id, [$device.latitude, $device.longitude])
                        .then(function () {
                            deferred.resolve($device);
                        })
                        .catch(function (err) {
                            deferred.reject(err);
                        });
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }

            /**
             * Find and return dvice by id.
             * This method returns promise object which will return device as result of
             * resolve operation.
             */
            function get(deviceId) {
                var deferred = new $q.defer();
                // Convert device reference into angular object data
                var device = fbRef.child('devices/' + deviceId);
                device.on('value', function(snapshot) {
                    if (snapshot.val()) {
                        var $device = $firebaseObject(device);
                        // We need wait until oject will be fully loaded
                        $device.$loaded().then(function () {
                            // Now device is ready to use
                            deferred.resolve($device);
                        }).catch(function (error) {
                            // Something wrong
                            deferred.reject(err);
                        });
                    } else {
                        deferred.reject('Device does not exist');
                    }
                }, function(error) {
                    deferred.reject(error);
                });
                
                //
                return deferred.promise;
            }

            /**
             * Remove information about device from Firebase.
             */
            function remove($device, userId) {
                var deferred = new $q.defer();
                // Remove device from list of devices
                $device.$remove().then(function(ref) {
                    var deviceKey = ref.key();
                    // Get device from user
                    var device = fbRef.child('/users/' + userId + '/devices/' + deviceKey);
                    // Remove device from user
                    device.remove(function(error) {
                        if (error) {
                            deferred.reject("Device could not be removed. " + error);
                        } else {
                            deferred.resolve();
                        }
                    });
                }, function(err) {
                    deferred.reject("Device could not be removed. " + err);
                });
                //
                return deferred.promise;
            }

            function link($device, userId) {
                var deferred = new $q.defer();
                fbRef.child('users/' + userId + '/devices/' + $device.$id).set(true);
                deferred.resolve();
                return deferred.promise;
            }

            function unlink($device, userId) {
                var deferred = new $q.defer();
                fbRef.child('users/' + userId + '/devices/' + $device.$id).set(null);
                deferred.resolve();
                return deferred.promise;
            }

            return {
                devices: devices,
                create: create,
                set: set,
                get: get,
                remove: remove,

                link: link,
                unlink: unlink
            };

}]);
