
(function() {
    "use strict";

    console.debug('bootstrap setup method');
    define([
        'angular',
        'controllers/AppController',
        'controllers/MasherCtrl',
        'controllers/TabsCtrl',
        'lib/AgoNewWindowConfig'
    ], function(angular, AppController, MasherCtrl, TabsCtrl, AgoNewWindowConfig) {
        console.debug('bootstrap define fn');
        
        function init() {
            // var App = angular.module('app', ['ui.bootstrap']);
            console.debug('bootstrap init method');
            
            // var App = angular.module("app", ['ngRoute', 'ngGrid', 'ui.bootstrap', 'ui.bootstrap.transition', 'ui.bootstrap.collapse', 'ui.bootstrap.accordion', 'ui.bootstrap.modal'])
            var App = angular.module("app", ['ngRoute', 'ui.bootstrap', 'ngGrid', 'ui.router'])
                .config(['$routeProvider', '$locationProvider', '$urlRouterProvider', '$stateProvider',
                function($routeProvider, $locationProvider, $urlRouterProvider, $stateProvider) {
                    console.debug('App module route provider');
                    var isCollapsed = false;
                     
                    $routeProvider.
                      when('/', {
                        templateUrl: 'partials/SystemSelector.jade',
                        // templateUrl: '/',
                        controller: App.MasherCtrl, reloadOnSearch: true
                      }).
                      when('/partials/agonewwindow/:id',  {
                        templateUrl: function(params){
                        console.log("when string is " + '/partials/agonewwindow/:id');
                        console.log("params = " + params.id);
                        console.log("prepare to return " + '/partials/agonewwindow' + params.id);
                        return '/partials/agonewwindow' + params.id; 
                        },
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
            
            console.log("url is " + location.search);
            var isNewAgoWindow = AgoNewWindowConfig.testUrlArgs();
            if(isNewAgoWindow){
                // alert("isNewAgoWindow is true");
                MasherCtrl.startArcGIS();
                TabsCtrl.selectAgoOnline();
            };
            return App;
        }

        return { start: init };

    });

}).call(this);