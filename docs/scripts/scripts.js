'use strict';

/**
 * @ngdoc overview
 * @name yapp
 * @description
 * # yapp
 *
 * Main module of the application.
 */
angular
  .module('yapp', [
    'ui.router',
    'ngAnimate'
  ])
  .config(["$sceDelegateProvider", function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
  }])
  .config(["$stateProvider", "$urlRouterProvider", "$httpProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {

    $locationProvider.html5Mode({enabled: true, requireBase: false}).hashPrefix("!");
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    $stateProvider
      .state('base', {
        abstract: true,
        url: '?aliId',
        templateUrl: 'views/base.html'
      })
        .state('login', {
          url: '/',
          parent: 'base',
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .state('dashboard', {
          url: '/:sessionId',
          parent: 'base',
          templateUrl: 'views/dashboard.html',
          controller: 'DashboardCtrl'
        })
  }])
  .run(["$location", "$rootScope", function($location, $rootScope){
    // takes TLD from single dotted domains. ".co.uk" wouldn't work.
    $rootScope.tld = $location.host().split('.').slice(-2).join('.');
  }]);

'use strict';

angular.module('yapp')
  .factory('pwdService', ["$http", "$location", "$rootScope", function($http, $location, $rootScope) {
    var p = {

      assignSession: function() {
       return $http.post('https://ee-beta2.play-with-docker.com/workshops/ec3610ac-e21a-41f1-8cf3-5700790a4737/session', {}, {headers: {'Accept': 'application/json'}}).then(function(response) {
            return response.data.session_id;
        });
      },

      getSession: function() {
        var sessionId = $location.path().replace('/','');
        if (!sessionId) {
          return new Promise(function(resolve,reject){reject()});
        }
        return $http.get('https://ee-beta2.play-with-docker.com/sessions/' + sessionId).then(function(response) {
          response.data.hostname = 'ee-beta2.play-with-docker.com';
          return response.data;
        });
      },


      init: function(session) {
        // init the pwd session
        return  new Promise(function(resolve, reject) {
          pwd.init(session.id, {baseUrl: 'https://ee-beta2.play-with-docker.com'}, function() {
            resolve();
          });
        });
      },

    };

    return p;
  }]);

'use strict';

angular.module('yapp')
  .factory('elemService', function() {
    var e = {

      onElementReady: function(w, selector) {
        return new Promise((resolve) => {
          var waitForElement = function() {
            var element = w.document.querySelector(selector);
            if (element) {
              resolve(element);
            } else {
              w.requestAnimationFrame(waitForElement);
            }
          };
          waitForElement();
        })
      }
    }

  return e;
});

'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('DashboardCtrl', ["$scope", "$state", "$location", "pwdService", "$timeout", "$window", function($scope, $state, $location, pwdService, $timeout, $window) {

    $scope.instances = [];

    $scope.$state = $state;
    $scope.dtrHost=""
    $scope.ucpHost=""
    $scope.winHost=""

    pwdService.getSession().then(function(session) {
      pwdService.init(session).then(function() {
        for (var i in session.instances) {
          let instance = session.instances[i];
          if (instance.hostname == "manager1") {
            $scope.ucpHost = instance.proxy_host + '.direct.' + session.hostname;
          } else if (instance.hostname == "worker1") {
            $scope.dtrHost = instance.proxy_host + '.direct.' + session.hostname;
          }
          $scope.instances.push(instance);
        }
        $scope.$apply();
        $scope.showInstance($scope.instances[0]);
      });
    }, function() {
      //$location.path('/')
    });

    $scope.openDTR = function() {
      $window.open('https://' + $scope.dtrHost, '_blank');
    }


    $scope.openUCP = function() {
      $window.open('https://' + $scope.ucpHost, '_blank');
    }

    $scope.showInstance = function(instance) {
      $scope.selectedInstance = instance;
      // Wait for the DOM to be ready
      $timeout(function(){
        // create the term if it doesn't exist
        if (!instance.term && !instance.url) {
            var terms = pwd.createTerminal({selector: '#term-'+ $scope.instances.indexOf(instance)}, instance.name);
            // we'll handle one term per instance
            instance.term = terms[0];
            $timeout(function(){
              // fit the term after it's rendered
              instance.term.fit();
            }, 0);
        }
      }, 0);
    };

  }]);

'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('LoginCtrl', ["$scope", "$location", "pwdService", "$stateParams", "$window", function($scope, $location, pwdService, $stateParams, $window) {

    if (!$stateParams.aliId) {
      $window.location.href = 'https://dockr.ly/ee-workshop-test';
      return;
    }


    pwdService.assignSession()
      .then(function(sessionId) {
        $location.path('/'+sessionId);
      }, function() {
        waitingDialog.show('No more sessions available');
      });
  }]);
