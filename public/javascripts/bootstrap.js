
(function() {
    "use strict";

    console.debug('bootstrap setup method');
    define([
        'angular',
        //'angular/angular-route',
        'controllers/AppController'
    ], function(angular, AppController) {
        console.debug('bootstrap define fn');
        
        function init() {
            // var App = angular.module('app', ['ui.bootstrap']);
            console.debug('bootstrap init method');
            
            var MasherApp = angular.module("app", ['ngRoute', 'ui.bootstrap', 'ui.layout'])
                .config(['$routeProvider', '$locationProvider', 
                function($routeProvider, $locationProvider) {
                    console.debug('MasherApp module route provider');
                    var isCollapsed = false;
                     
                    $routeProvider.
                      when('/', {
                        templateUrl: 'partials/SystemSelector.jade',
                        // templateUrl: '/',
                        controller: MasherApp.MasherCtrl, reloadOnSearch: true
                      }).
                      when('/views/partials/:id',  {
                        templateUrl: function(params){ return '/partials/' + params.id; },
                        controller: MasherApp.MapCtrl, reloadOnSearch: true
                      }).
                      otherwise({
                          redirectTo: '/'
                      }); 
                      
                    console.debug('html5Mode');
                    $locationProvider.html5Mode(true);
                    console.debug('html5Mode again')
                   }
            ]);
            
            AppController.start(MasherApp);
            // need to bootstrap angular since we wait for dojo/DOM to load
            angular.bootstrap(document.body, ['app']);
            return MasherApp;
        }

        return { start: init };

    });

}).call(this);