angular.module('userApp', ['ngAnimate', 'app.routes', 'authService', 'mainCtrl', 'userCtrl', 'userService','videoCtrl','videoService'])

// application configuration to integrate token into requests
.config(function($httpProvider) {
	//alert("this is app.js/config");

	// attach our auth interceptor to the http requests
	$httpProvider.interceptors.push('AuthInterceptor');

});