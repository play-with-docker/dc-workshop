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
  .config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
  })
  .config(function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {

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
  })
  .run(function($location, $rootScope){
    // takes TLD from single dotted domains. ".co.uk" wouldn't work.
    $rootScope.tld = $location.host().split('.').slice(-2).join('.');
  });
