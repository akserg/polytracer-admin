angular.module('admin')
.factory('LegalService', ['$localForage', function($localForage) {

  function setAgreed() {
    return $localForage.setItem('agreed', true);
  }

  function isAgreed() {
    // Return primise with agreed value
    return $localForage.getItem('agreed');
  }

  return {
    setAgreed: setAgreed,
    isAgreed: isAgreed
  };
}]);
