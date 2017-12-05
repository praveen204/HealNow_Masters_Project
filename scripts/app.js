var healNow = angular.module('healNowApp', ['ngRoute', 'rmDatepicker', 'ngResource', 'ngStorage']);
    window.alert = function() {};
	healNow.config(function($routeProvider, rmDatepickerConfig) {
        $routeProvider
			.when('/load', {
				templateUrl : 'views/site.html',
				controller  : 'SiteCtrl'
			})
			.when('/login', {
				templateUrl : 'views/login.html',
				controller  : 'LoginCtrl',
				controllerAs: 'login',
				resolve: {
					roles: function(HealNowService) {
						return HealNowService.getRoles().$promise.then(function(response){
							return response;
						});
					}
				}
			})
			.when('/registration', {
				templateUrl : 'views/registration.html',
				controller  : 'RegistrationCtrl',
				resolve: {
					categories: function(HealNowService) {
						return HealNowService.getCategories();
					},
					roles: function(HealNowService) {
						return HealNowService.getRoles().$promise.then(function(response){
							return response;
						});
					}
				},
				controllerAs: 'registration'
			})
			.when('/home', {
				templateUrl : 'views/home.html',
				controller  : 'HomeCtrl',
				resolve: {
					categories: function(HealNowService) {
						return HealNowService.getCategories();
					},
					roles: function(HealNowService) {
						return HealNowService.getRoles().$promise.then(function(response){
							return response;
						});
					}
				}
			})
			.when('/profile', {
				templateUrl : 'views/profile.html',
				controller  : 'ProfileCtrl',
				roles: function(HealNowService) {
					return HealNowService.getRoles().$promise.then(function(response){
						return response;
					});
				}
			})
			.otherwise({
				redirectTo: '/load'
			});
			
			rmDatepickerConfig.mondayStart = true;
			rmDatepickerConfig.initState = "month";
    });
	
	healNow.controller('MainCtrl', function($scope) {});
	
	healNow.controller('SiteCtrl', function($scope, $location){
		$scope.navigateToLogin = function() {
			$location.path('/login');
		};
		
		$scope.navigateToSignup = function() {
			$location.path('/registration');
		};
	});
	
	healNow.controller('LoginCtrl', function($scope, $location, HealNowService, $timeout, $localStorage, roles){
		$scope.user ={};
		
		var opts = {'apikey': '3qio1-DzKnISagC0Of'}; // TODO: insert your API key here
        var b6 = Bit6.init(opts);
        // Prepare the app
        //initApp(b6, true);
		//var ident = 'usr:' + $scope.user.username;
        //var pass = $scope.user.password;
		
		
		$scope.navigateToHome = function() {
			$location.path('/load');
		};
		$scope.initializeAlert = function() {
			$scope.alert = {display: false,message: ''};
		};
		
		$scope.checkForDoctorRole = function (roleId) {
		roles.filter(function(role){
			if(role.id === roleId) {
				if(role.role === 'Doctor') {
					$scope.isDoctor = true;
				} else {
					$scope.isDoctor = false;
				}
			}
		});
		};
		
		$scope.navigateToSignup = function() {
			$location.path('/registration');
		};
    
		$scope.validateUserAndNavigate = function() {
			HealNowService.login($scope.user)
				.$promise.then(function(data) {
					 $scope.checkForDoctorRole(data.roleId);
					b6.session.login({'identity': 'usr:' + $scope.user.username, 'password': $scope.user.password}, function(err) {
						if (err) {
							//alert('auth error'+ JSON.stringify(err));
                            $scope.alert = {display: true, message: error.message};
                            $scope.alert['type'] = 'failed';
                            $timeout(function() {
                                $scope.initializeAlert();
                            }, 5000);
						}
						else {
                            window.localStorage.setItem('bit6_auth', JSON.stringify(b6.session.save()));
							//console.log('auth done');
                             
                             if($scope.isDoctor) {
                                $localStorage.userId = data.doctor.userId;
                                $localStorage.roleId = data.roleId;
                                $localStorage.username = $scope.user.username;
                                $localStorage.password = $scope.user.password;
                                setTimeout(function() {
                                    $location.path('/home');
                                }, 100);
                                
                            // window.localStorage.setItem('bit6_auth', JSON.stringify(b6.session.save()));
                            } else {
                                $localStorage.userId = data.patient.userId;
                                $localStorage.roleId = data.roleId;
                                $localStorage.username = $scope.user.username;
                                $localStorage.password = $scope.user.password;
                                setTimeout(function() {
                                    $location.path('/home');
                                }, 100);

                                //window.localStorage.setItem('bit6_auth', JSON.stringify(b6.session.save()));
                            }
						}
					});
				}).catch(function(error) {
					$scope.alert = {display: true, message: error.data.message};
					$timeout(function() {
						$scope.initializeAlert();
					}, 5000);
				});
		};
	});

	healNow.controller('ProfileCtrl', function($scope, roles){
		$scope.navigateToHome = function() {
			$location.path('/home');
		};
		
		$scope.init = function() {
			HealNowService.getUserDetails()
				.$promise
				.then(function(response) {
				});
		};
		
	});
	
	healNow.controller('RegistrationCtrl', function($scope, $location, HealNowService, categories, roles, $localStorage, $timeout){
		$scope.user = {};
	
		var opts = {'apikey': '3qio1-DzKnISagC0Of'}; // TODO: insert your API key here
        var b6 = Bit6.init(opts);
        // Prepare the app
        //initApp(b6, true);
		//var ident = 'usr:' + $scope.user.email;
        //var pass = $scope.user.password;
		
		
		//$scope.isDoctor = false;
		$scope.categories = categories;
		$scope.roles = roles;
		
		$scope.checkForDoctorRole = function () {
			$scope.roles.filter(function(role){
				if(role.id === parseInt($scope.user.roleId)) {
					if(role.role === 'Doctor') {
						$scope.isDoctor = true;
					} else {
						$scope.isDoctor = false;
					}
				}
			});
		};

		$scope.initializeAlert = function() {
			$scope.alert = {display: false,message: ''};
		};
		$scope.initializeAlert();
		$scope.registerUser = function() {
			if($scope.user.password === $scope.repassword) {
			let sendUserObj = $scope.user;
			sendUserObj['roleId'] = parseInt($scope.user['roleId']);
			sendUserObj['specializationId'] = parseInt($scope.user['specializationId']);
			//alert($scope.user['specializationId'] + '$scope.user["specializationId"]');
			HealNowService.signUpUser(sendUserObj)
				.$promise
				.then(function(response) {
					
					b6.session.signup({'identity': 'usr:' + $scope.user.email, 'password': $scope.user.password}, function(err) {
						if (err) {
							//alert('auth error'+ JSON.stringify(err));
                            $scope.alert = {display: true, message: error.message};
                            $scope.alert['type'] = 'failed';
                            $timeout(function() {
                                $scope.initializeAlert();
                            }, 5000);
						}
						else {
							window.localStorage.setItem('bit6_auth', JSON.stringify(b6.session.save()));
							//alert('auth done');
                            if($scope.isDoctor) {
                                    $localStorage.userId = response.doctor.userId;
                                    $localStorage.roleId = response.roleId;
                                    
                                    $scope.alert['display'] = true;
                                    $scope.alert['type'] = 'success';
                                    $scope.alert['message'] = 'Successfully registered. Redirecting to login page in moment';
                                    $timeout(function() {
                                        $scope.initializeAlert();
                                        $location.path('/login');
                                    }, 5000);
                                } else {
                                    $localStorage.userId = response.patient.userId;
                                    $localStorage.roleId = response.roleId;
                                    $scope.alert['display'] = true;
                                    $scope.alert['type'] = 'success';
                                    $scope.alert['message'] = 'Successfully registered. Redirecting to login page in a moment';
                                    $timeout(function() {
                                        $scope.initializeAlert();
                                        $location.path('/login');
                                    }, 5000);
                                }
						}
					});
                }).catch(function(error) {
                            $scope.alert = {display: true, message: error.data.message};
                            $scope.alert['type'] = 'failed';
                            $timeout(function() {
                                $scope.initializeAlert();
                            }, 5000);
                        });
			} else {
				$scope.alert = {display: true, message: 'Passwords does not match'};
				$scope.alert['type'] = 'failed';
				$timeout(function() {
					$scope.initializeAlert();
				}, 5000);
			}
		};
		
		$scope.navigateToLogin = function() {
			$location.path('/login');
		};
	});

	healNow.controller('HomeCtrl', function($scope, $location, categories, HealNowService, $timeout, $filter, $localStorage, roles) {
		var opts = {'apikey': '3qio1-DzKnISagC0Of'}; // TODO: insert your API key here
        var b6 = Bit6.init(opts);
        //var currentChatUri = '';
         //var useMixMediaMode = false;
         //var typingLabelTimer = 0;
         //var selectedUserId = '';
		//initApp(b6, true);
	
        $scope.newChatStart = function(details) {
            HealNowService.getUserDetails({userId: details.patientId})
                .$promise.then(function(response) {
                    $('#authUsername').val($localStorage.username);
                    $('#authPassword').val($localStorage.password);
                    //$('#loginButton').click();
                    $('#newChatUsername').val(response.email);
                    initApp(b6, true);
                });
        };
		
        $scope.newPatientChatStart = function() {
            HealNowService.getUserDetails({userId: $scope.selectedDoctor})
                .$promise.then(function(response) {
                    $('#authUsername').val($localStorage.username);
                    $('#authPassword').val($localStorage.password);
                    //$('#loginButton').click();
                    $('#newChatUsername').val(response.email);
                    initApp(b6, true);
                });
        };
	
		$scope.categories = categories;
		$scope.selectedDoctor = '';
		//$scope.isUserDoctor = ;
		$scope.patientSlots = [];
		$scope.checkForDoctorRole = function () {
			roles.filter(function(role){
				if(role.id === $localStorage.roleId) {
					if(role.role === 'Doctor') {
						$scope.isUserDoctor = true;
					} else {
						$scope.isUserDoctor = false;
					}
				}
			});
		};
		$scope.checkForDoctorRole();
		$scope.initializeAlert = function() {
			$scope.alert = {display: false,message: ''};
		};
		
		$scope.initializeAlert();
		//$scope.bookSlot = false;
		$scope.logoutUser = function() {
            currentChatUri = '';
            b6.session.logout();
            window.localStorage.setItem("bit6_auth", "");
			$location.path('/login');
		};
		
		$scope.initializeDoctorSlots =  function() {
			$scope.doctorSlots = [
								{id:1,time:'09:00A.M - 09:15A.M', selected: false},
								{id:1,time:'09:15A.M - 09:30A.M', selected: false},
								{id:1,time:'09:30A.M - 09:45A.M', selected: false},
								{id:1,time:'09:45A.M - 10:00A.M', selected: false},
								{id:1,time:'10:00A.M - 10:15A.M', selected: false},
								{id:1,time:'10:15A.M - 10:30A.M', selected: false},
								{id:1,time:'10:30A.M - 10:45A.M', selected: false},
								{id:1,time:'10:45A.M - 11:00A.M', selected: false},
								{id:1,time:'11:00A.M - 11:15A.M', selected: false},
								{id:1,time:'11:15A.M - 11:30A.M', selected: false},
								{id:1,time:'11:30A.M - 11:45A.M', selected: false},
								{id:1,time:'11:45A.M - 12:00P.M', selected: false},
								{id:1,time:'12:00P.M - 12:15P.M', selected: false},
								{id:1,time:'12:15P.M - 12:30P.M', selected: false},
								{id:1,time:'12:30P.M - 12:45P.M', selected: false},
								{id:1,time:'12:45P.M - 01:00P.M', selected: false},
								{id:1,time:'01:00P.M - 01:15P.M', selected: false},
								{id:1,time:'01:15P.M - 01:30P.M', selected: false},
								{id:1,time:'01:30P.M - 01:45P.M', selected: false},
								{id:1,time:'01:45P.M - 02:00P.M', selected: false}];
		};
		
		$scope.initializeDoctorSlots();
					
		$scope.navigateToUserDetails = function() {
			$location.path('/profile');
		};
		$scope.displayDoctorsForSelectedCategory = function(specialization) {
			//console.log($scope.specialization);
			let specializationValue = parseInt(specialization);
			HealNowService.getDoctorsByCategory({categoryId: specializationValue})
				.$promise.then((response) => {
					$scope.doctorsList = response;
					$scope.initializeDoctorDetails();
				});
		};

		$scope.initializeDoctorDetails = function() {
			$scope.selectedDoctor ='';
			$scope.oDate1 = new Date();
		};
		
		 /* Datepicker local configuration */
        $scope.rmConfig1 = {
          mondayStart: false,
          initState: "month", /* decade || year || month */
          maxState: "decade",
          minState: "month",
          decadeSize: 12,
          monthSize: 42, /* "auto" || fixed nr. (35 or 42) */
          min: new Date(),
          max: new Date('2023-11-21'),
          format: "yyyy-MM-dd" /* https://docs.angularjs.org/api/ng/filter/date */
        };

        $scope.oDate1 = new Date();

		$scope.selectDate = function(selectedDate) {
			$scope.displaySelectedDoctorDetails($scope.selectedDoctor, selectedDate);
		};
		
		$scope.displaySelectedDoctorDetails = function(docId, selectedDate) {
			$scope.selectedDoctor = docId;
			HealNowService.getDoctorAvailabilityForDate({doctorId: docId, date: $filter('date')(selectedDate, 'yyyy-MM-dd')})
				.$promise.then(function(response) {
					$scope.initializeDoctorSlots();
					$scope.doctorSlots.map(function(slot) {
						response.filter(function(bookedSlot) {
							if(bookedSlot.startTime === slot.time.split('-')[0].substr(0,5)) {
								slot['selected'] = true;
							}
						 });
					});
				});
		};
		
		$scope.bookSlotForDoctor = function(selectedSlot, index) {
			let requestPayLoad = {doctorId: $scope.selectedDoctor, date: $filter('date')($scope.oDate1, 'yyyy-MM-dd'), startTime: selectedSlot.time.split('-')[0].substr(0,5), endTime: selectedSlot.time.split('-')[1].substr(1,5)};
			HealNowService.bookAppointment({userId: $localStorage.userId}, requestPayLoad)
				.$promise.then(function(response) {
					$('#confirmBooking'+ (index + 1)).modal('hide');
                    $(".modal-backdrop.in").hide();
					$scope.alert['display'] = true;
					$scope.alert['message'] = 'Successfully booked appointment for the selected slot';
					selectedSlot.selected = true;
					$timeout(function() {
						$scope.initializeAlert();
					}, 5000);
				}).catch(function(error) {
					$('#confirmBooking' + (index + 1)).modal('hide');
					$scope.alert['display'] = true;
					$scope.alert['message'] = 'Some error occured. please try again.'
					$timeout(function() {
						$scope.initializeAlert();
					}, 5000);
				});
		};
		
		$scope.getDoctorAppointments = function() {
			HealNowService.getDoctorAppointmentDetails({userId: $localStorage.userId})
				.$promise
				.then(function(response) {
					$scope.patientSlots = response;
				});
		};
		
		if($scope.isUserDoctor) {
			$scope.getDoctorAppointments();
		}
	})
	/*.directive('healnowHeader', function($location) {
	return  {
	  restrict: 'E',
	  replace: true,
	  templateUrl: 'views/components/header.html',
	  controller: function($scope) {
		$scope.navigateToUserDetails = function() {
			$location.path('/profile');
		};
	  },
	  scope: {},
	  link: function(scope, element) {}
	};
	}).directive('healNowFooter', function() {
	return  {
	  restrict: 'E',
	  templateUrl: 'views/components/footer.html',
	  scope: {},
	  link: function(scope, element) {}
	};
	})*/;
	
	healNow.factory('HealNowService', function($resource) {
    var Resource = $resource('/user', {
		userId: '@userId',
		categoryId: '@categoryId',
		doctorId: '@doctorId',
		date: '@date'
    }, {
      signUpUser: {
        method: 'POST',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/user/register'
      }, 
      login: {
        method: 'POST',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/user/login'
      }, 
      getRoles: {
        method: 'GET',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/roles',
		isArray: true
      }, 
      getCategories: {
        method: 'GET',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/categories',
		isArray: true
      }, 
      getDoctorsByCategory: {
        method: 'GET',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/user/doctor/category/:categoryId',
		isArray: true
      }, 
      getUserDetails: {
        method: 'GET',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/user/:userId'
      },
	  getPatientAppointmentDetails: {
		method: 'GET',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/user/patient/:userId',
		isArray: true
	  },
	  getDoctorAppointmentDetails: {
		method: 'GET',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/user/doctor/:userId',
		isArray: true
	  },
	  getDoctorAvailabilityForDate: {
		method: 'GET',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/user/doctor/:doctorId/date/:date',
		isArray: true
	  },
	  bookAppointment: {
		method: 'POST',
		url: 'http://ec2-34-209-214-108.us-west-2.compute.amazonaws.com:8080/user/patient/:userId/bookAppointment'
	  }
    });
    return Resource;
  });