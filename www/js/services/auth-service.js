angular.module('admin')
    .factory('AuthService', ['$firebaseAuth', 'fbRef', '$q', '$log', 'Toast',
  function ($firebaseAuth, fbRef, $q, $log, Toast) {

            var auth = $firebaseAuth(fbRef);
            var users = fbRef.child('users');

            var user;

            function createUser(email, password) {
                var deferred = $q.defer();

                auth.$createUser({
                        email: email,
                        password: password
                    }).then(function (authData) {
                        setUser(authData);
                        deferred.resolve(user);
                    })
                    .catch(function (error) {
                        setUser();
                        deferred.reject(error);
                    });

                return deferred.promise;
            }

            function removeUser(email, password) {
                var deferred = $q.defer();
                return auth.$removeUser({
                        email: email,
                        password: password
                    }).then(function (authData) {
                        setUser(authData);
                        deferred.resolve(user);
                    })
                    .catch(function (error) {
                        setUser();
                        deferred.reject(error);
                    });
            }

            function setUser(authData) {
                if (authData) {
                    user = authData;
                    if (authData.password) {
                        // Provider 'password'
                        user.email = authData.password.email;
                    } else if (authData.twitter) {
                        // Provider 'twitter'
                        user.first_name = authData.twitter.displayName;
                        user.avatar = authData.twitter.cachedUserProfile.profile_image_url_https;
                    } else if (authData.facebook) {
                        // Provider 'facebook'
                        user.first_name = authData.facebook.cachedUserProfile.first_name;
                        user.last_name = authData.facebook.cachedUserProfile.last_name;
                        user.email = authData.facebook.email;
                        user.avatar = authData.facebook.cachedUserProfile.picture.data.url;
                    } else if (authData.google) {
                        // Provider 'google'
                        user.first_name = authData.google.cachedUserProfile.given_name;
                        user.last_name = authData.google.cachedUserProfile.family_name;
                        user.email = authData.google.email;
                        user.avatar = authData.google.cachedUserProfile.picture;
                    }

                    var profile = angular.extend({}, user);
                    user.uid = authData.uid;

                    user.loginWithPassword = false;
                    if (authData.password) {
                        user.loginWithPassword = true;
                        user.passwordIsTemporary = authData.password && authData.password.isTemporaryPassword ? true : false;
                    }

                    $log.debug('loginWithPassword: ' + user.loginWithPassword);
                    

                    // Get user info
                    users.child(user.uid).once('value', function (snap) {
                        if (!snap.val()) {
                            users.child(user.uid).set({
                                profile: profile
                            }, function (error) {
                                $log.error(error ? 'Cannot add user because ' + error : 'User added successfully');
                            });
                        }
                    });

                } else {
                    user = null;
                }

                return user;
            }

            function loginWithPassword(email, password) {
                var deferred = $q.defer();
                auth.$authWithPassword({
                        email: email,
                        password: password
                    }).then(function (authData) {
                        deferred.resolve(setUser(authData));
                    })
                    .catch(function (error) {
                        setUser();
                        deferred.reject(error);
                    });
                return deferred.promise;
            }

            function loginWithOAuth(provider) {
                var deferred = $q.defer();

                auth.$authWithOAuthPopup(provider).then(function (authData) {
                    setUser(authData);
                    deferred.resolve(user);
                }).catch(function (error) {
                    if (error && error.code === "TRANSPORT_UNAVAILABLE") {
                        // fall-back to browser redirects, and pick up the session
                        // automatically when we come back to the origin page
                        auth.$authWithOAuthRedirect(provider).then(function (authData) {
                            setUser(authData);
                            deferred.resolve(user);
                        }).catch(function (error) {
                            setUser();
                            deferred.reject(error);
                        });
                    } else {
                        setUser();
                        deferred.reject(error);
                    }
                });

                return deferred.promise;
            }

            function resetPassword(email) {
                return auth.$resetPassword({
                    email: email
                });
            }

            function logout() {
                var deferred = $q.defer();
                auth.$unauth();
                setUser();
                deferred.resolve();
                return deferred.promise;
            }

            function waitForAuth() {
                return auth.$waitForAuth().then(function (authData) {
                    $log.debug('waitForAuth resolved ' + authData);
                    setUser(authData);
                    return user;
                });
            }

            function changePassword(email, oldPassword, newPassword) {
                var deferred = $q.defer();
                auth.$changePassword({
                        email: email,
                        oldPassword: oldPassword,
                        newPassword: newPassword
                    }).then(function () {
                        deferred.resolve(user);
                    })
                    .catch(function (error) {
                        setUser();
                        deferred.reject(error);
                    });
                return deferred.promise;
            }

            function getUser() {
                return user;
            }

            function wasNotAuth() {
                return user === null;
            }

            return {
                createUser: createUser,
                removeUser: removeUser,
                loginWithPassword: loginWithPassword,
                loginWithOAuth: loginWithOAuth,
                resetPassword: resetPassword,
                logout: logout,
                waitForAuth: waitForAuth,
                changePassword: changePassword,
                getUser: getUser,
                wasNotAuth: wasNotAuth
            };

}]);
