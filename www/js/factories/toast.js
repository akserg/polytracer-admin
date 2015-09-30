// Requires the Toast plugin: https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin
// And Ionic Framework: http://ionicframework.com
// ngCordova is used here, but easily removed: http://ngcordova.com/

// When running in Cordova, show the native toast. Outside of Cordova, show an Ionic Popup for the same period of time. 
// Uses the API for the Toast plugin - message, duration, position. 
// Differences are that: Ionic Popup ignores position, and doesn't allow doing anything while it shows. 
angular.module('admin')
.factory('Toast', function($rootScope, $timeout, $ionicPopup, $cordovaToast) {
    return {
        show: function (message, duration, position) {
        	message = message || "There was a problem...";
        	duration = duration || 'short';
        	position = position || 'top';

        	if (!!window.cordova) {
        		// Use the Cordova Toast plugin
				$cordovaToast.show(message, duration, position);	        		
        	}
        	else {
                if (duration == 'short') {
                    duration = 2000;
                }
                else {
                    duration = 5000;
                }

					var myPopup = $ionicPopup.show({
						template: "<div class='toast'>" + message + "</div>",
						scope: $rootScope,
						buttons: []
					});

					$timeout(function() {
						myPopup.close(); 
					}, duration);
        	}
		},
		
	};
})