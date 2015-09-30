angular.module('admin')
.factory('TripsArray', ['fbRef', '$firebaseArray', '$firebaseObject', function(fbRef, $firebaseArray, $firebaseObject) {
  var trips = fbRef.child('trips');

  // create a new service based on $firebaseArray
  var TripsArray = $firebaseArray.$extend({
    // change the added behavior to return Trip objects
    $$added: function(snap) {
      // instead of creating the default POJO (plain old JavaScript object)
      // we will return an instance of the Widget class each time a child_added
      // event is received from the server
      return $firebaseObject(trips.child(snap.key()));
    }
  });

  return function(listRef) {
    // create an instance of TripsArray (the new operator is required)
    return new TripsArray(listRef);
  }
}]).factory('TripService', ['fbRef', '$q', '$firebaseObject', '$firebaseArray', 'TripsArray',
  function(fbRef, $q, $firebaseObject, $firebaseArray, TripsArray) {

    function trips(deviceId, limit) {
      limit = limit || 50;
      return TripsArray(fbRef.child('devices/' + deviceId + '/trips').limitToLast(limit));
    }

    return {
      trips: trips
    };
}]);