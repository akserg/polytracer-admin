angular.module('admin')
    .factory('NotificationArray', ['fbRef', '$firebaseArray', '$firebaseObject', function (fbRef, $firebaseArray, $firebaseObject) {
        var notifications = fbRef.child('notifications');

        // create a new service based on $firebaseArray
        var NotificationArray = $firebaseArray.$extend({
            // change the added behavior to return Notification objects
            $$added: function (snap) {
                // instead of creating the default POJO (plain old JavaScript object)
                // we will return an instance of the Widget class each time a child_added
                // event is received from the server
                return $firebaseObject(notifications.child(snap.key()));
            }
        });

        return function (listRef) {
            // create an instance of NotificationArray (the new operator is required)
            return new NotificationArray(listRef);
        }
}])
    .factory('NotificationService', ['fbRef', '$q', '$firebaseObject', '$firebaseArray', 'NotificationArray', function (fbRef, $q, $firebaseObject, $firebaseArray, NotificationArray) {

        // Get list of sync notifications
        function notifications(deviceId) {
            return NotificationArray(fbRef.child('devices/' + deviceId + '/notifications'));
        }

        // Watch after fencing array belongs to deviceId and call specific callback function
        function watch(deviceId, addedCallback, changedCallback, removedCallback) {
            $firebaseArray(fbRef.child('devices/' + deviceId + '/notifications')).$watch(function(value) {
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
         * Create new notification .
         * This method returns promise object which will return notification as result of
         * resolve operation.
         */
        function create(value, deviceId) {
            var deferred = new $q.defer();
            // Create new notification reference instance
            var notification = fbRef.child('notifications').push();
            // A notification value object
            value = angular.extend({}, {
                'timestamp': Firebase.ServerValue.TIMESTAMP,
                'device': deviceId
            }, value);
            //
            notification.set(value, function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var notificationId = notification.key();
                    fbRef.child('devices/' + deviceId + '/notifications/' + notificationId).set(true);
                    deferred.resolve();
                }
            });
            //
            return deferred.promise;
        }

        /**
         * Save notification information
         */
        function set($notification) {
            var deferred = new $q.defer();
            $notification.$save().then(function () {
                // Save info in geofire
                $geo.$set($notification.$id, [$notification.latitude, $notification.longitude])
                    .then(function () {
                        deferred.resolve($notification);
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
         * Find and return notification by id.
         * This method returns promise object which will return notification as result of
         * resolve operation.
         */
        function get(notificationId) {
            var deferred = new $q.defer();
            // Convert notification reference into angular object data
            var $notification = $firebaseObject(fbRef.child('notifications/' + notificationId));
            // We need wait until oject will be fully loaded
            $notification.$loaded().then(function () {
                // Now notification is ready to use
                deferred.resolve($notification);
            }).catch(function (error) {
                // Something wrong
                deferred.reject(err);
            });
            //
            return deferred.promise;
        }

        /**
         * Remove information about notification from Firebase.
         */
        function remove($notification) {
            return $notification.$remove();
        }

        return {
            notifications: notifications,
            create: create,
            set: set,
            get: get,
            remove: remove
        };

}]);
