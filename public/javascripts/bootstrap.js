
(function() {
    "use strict";

    console.debug('bootstrap setup method');
    define([
        'angular',
        //'angular/angular-route',
        'controllers/AppController' //,
        // 'ngGrid'
    ], function(angular, AppController) {
        console.debug('bootstrap define fn');
        
        function init() {
            // var App = angular.module('app', ['ui.bootstrap']);
            console.debug('bootstrap init method');
            
            // var App = angular.module("app", ['ngRoute', 'ngGrid', 'ui.bootstrap', 'ui.bootstrap.transition', 'ui.bootstrap.collapse', 'ui.bootstrap.accordion', 'ui.bootstrap.modal'])
            var App = angular.module("app", ['ngRoute', 'ui.bootstrap', 'ngGrid'])
                .config(['$routeProvider', '$locationProvider', 
                function($routeProvider, $locationProvider) {
                    console.debug('App module route provider');
                    var isCollapsed = false;
                     
                    $routeProvider.
                      when('/', {
                        templateUrl: 'partials/SystemSelector.jade',
                        // templateUrl: '/',
                        controller: App.MasherCtrl, reloadOnSearch: true
                      }).
                      when('/views/partials/:id',  {
                        templateUrl: function(params){ return '/partials/' + params.id; },
                        controller: App.MapCtrl, reloadOnSearch: true
                      }).
                      otherwise({
                          redirectTo: '/'
                      }); 
                      
                    console.debug('html5Mode');
                    $locationProvider.html5Mode(true);
                    console.debug('html5Mode again')
                   }
            ]).
            
            
            factory("CurrentWebMapIdService", function(){
                var currentWebMapId = "fooWebMapId";
                return {
                        setCurrentWebMapId : function(newId){ currentWebMapId = newId; },
                        getCurrentWebMapId : function(){ return currentWebMapId;}
                 };
             });
            
            AppController.start(App);
            // need to bootstrap angular since we wait for dojo/DOM to load
            angular.bootstrap(document.body, ['app']);
            return App;
        }

        return { start: init };

    });

}).call(this);