angular.module('mainCtrl', [])

.controller('mainController', function($rootScope, $location, Auth) {
    //alert("this is mainCtrl/mainController");
	var vm = this;
   // alert("hello world");
	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();


	// check to see if a user is logged in on every request
	$rootScope.$on('$routeChangeStart', function() {
		vm.loggedIn = Auth.isLoggedIn();	

		// get user information on page load
		Auth.getUser()
			.then(function(data) {
				vm.user = data.data;
			});	
	});	

	// function to handle login form
	vm.doLogin = function() {
		vm.processing = true;

		// clear the error
		vm.error = '';

		Auth.login(vm.loginData.username, vm.loginData.password)
			.then(function(data) {
				//alert(data.data.token);
				vm.processing = false;			
               // console.log("hello wolrd",$scope.data);
				// if a user successfully logs in, redirect to users page
				if (data.data.success)
				    //$location.path('/');
					$location.path('/');
				else 
					vm.error = data.message;
				
			});
	};

	// function to handle logging out
	vm.doLogout = function() {
		Auth.logout();
		vm.user = '';
		
		$location.path('/login');
	};

	vm.createSample = function() {
		Auth.createSampleUser();
	};

});
