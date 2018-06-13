'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('DashboardCtrl', function($scope, $state, $location, pwdService, $timeout, $window) {

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

  });
