angular.module('admin')
.factory('LoadingService', ['$ionicLoading', function($ionicLoading) {

  function show(message) {
    $ionicLoading.show({
      template: message
    });
  }

  function hide() {
    $ionicLoading.hide();
  }

  return {
    show: show,
    hide: hide
  };
}]);
