'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
  .module('clientApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
          redirectTo: '/tool/all'
      })
      .when('/about', {
        templateUrl: 'app/views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/active_Tools', {
        redirectTo: '/tool/all'
      })
      .when('/tool/:toolname', {
        templateUrl: 'app/views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/tool/all'
      });
  });

  $('#current_date').html("");
  $('#current_date').append(moment().format('MMMM Do YYYY'));
  $('#current_date').append('  <small>'+moment().format('h:mm:ss:a')+'</small>');

  var socket =io('/dashboard_channel');
