var app = angular.module('admin', ['ionic', 'ngCordova', 'firebase', 'angularGeoFire', 'LocalForageModule', 'monospaced.qrcode']);

// *****************************
// Global constant and factories
// *****************************

// URL of Firebase DB
app.value('FIREBASE_URL', 'https://polytracer.firebaseio.com');

// Firebase singleton
app.factory('fbRef', ['FIREBASE_URL', function (FIREBASE_URL) {
    return new Firebase(FIREBASE_URL);
}]);

// Geofire singleton
app.factory('$geo', ['fbRef', '$geofire', function (fbRef, $geofire) {
    return new $geofire(fbRef.child('geofire'));
}]);

// Configure LocalForage
app.config(['$localForageProvider', function ($localForageProvider) {
    $localForageProvider.config({
        name: 'polytracer' // name of the database and prefix for our data, it is 'lf' by default
    });
}]);


// *************************
// Angular JS configurations
// *************************

app.config(function ($logProvider) {
    // We enable loggin service on period of development time
    $logProvider.debugEnabled(true);
});

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('', '/welcome');
    $urlRouterProvider.otherwise('/welcome');

    $stateProvider
        .state('welcome', {
            url: '/welcome',
            templateUrl: 'templates/welcome.html',
            controller: 'WelcomeController'
        })

    .state('legal', {
        url: '/legal',
        templateUrl: 'templates/legal.html',
        controller: 'LegalController'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginController'
    })

    .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'RegisterController'
    })

    .state('forgot', {
        url: '/forgot',
        templateUrl: 'templates/forgot.html',
        controller: 'ForgotController'
    })

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the code below
            'user': ['AuthService', function (AuthService) {
                // $waitForAuth returns a promise so the resolve waits for it to complete
                return AuthService.waitForAuth();
            }]
        },
        onEnter: function($state, AuthService) {
            if (AuthService.wasNotAuth()) {
                $state.go('login');
            }
        }
    })

    .state('app.devices', {
        url: '/devices',
        views: {
            'menuContent': {
                templateUrl: 'templates/devices.html',
                controller: 'DevicesCtrl'
            }
        }
    })

    .state('app.addDevices', {
        url: '/devices/add',
        views: {
            'menuContent': {
                templateUrl: 'templates/add_device.html',
                controller: 'AddDeviceCtrl'
            }
        }
    })

    .state('app.singleOnMap', {
        url: '/map/:deviceId',
        views: {
            'menuContent': {
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            }
        }
    })

    .state('app.changePassword', {
        url: '/change-password',
        views: {
            'menuContent': {
                templateUrl: 'templates/change-password.html',
                controller: 'ChangePasswordCtrl'
            }
        }
    })
});

app.run(['$rootScope', '$ionicPlatform', '$state', function ($rootScope, $ionicPlatform, $state) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === 'AUTH_REQUIRED') {
            $state.go('login');
        }
    });

    $ionicPlatform.ready(function () {
        if (window.cordova) {
            // Android customization
            cordova.plugins.backgroundMode.setDefaults({
                text: 'Doing heavy tasks.'
            });
            // Enable background mode
            cordova.plugins.backgroundMode.enable();

            // Called when background mode has been activated
            cordova.plugins.backgroundMode.onactivate = function () {
                setTimeout(function () {
                    // Modify the currently displayed notification
                    cordova.plugins.backgroundMode.configure({
                        text: 'Running in background for more than 5s now.'
                    });
                }, 5000);
            }
        }
    });
}]);

app.run(['$ionicPlatform',
    function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
}]);
