
var selectedMapType = 'arcgis';

(function() {
    "use strict";

    console.debug('bootstrap setup method');
    define([
        'angular',
        'controllers/AppController',
        'controllers/MasherCtrl',
        'controllers/TabsCtrl',
        'lib/AgoNewWindowConfig',
        'controllers/EmailCtrl',
        'lib/GeoCoder',
        'lib/MapHosterLeaflet',
        'lib/MapHosterGoogle',
        'lib/MapHosterArcGIS'
    ], function(angular, AppController, MasherCtrl, TabsCtrl, AgoNewWindowConfig, EmailCtrl,  GeoCoder, MapHosterLeaflet, MapHosterGoogle, MapHosterArcGIS) {
        console.debug('bootstrap define fn');
        
        function init() {
            // var App = angular.module('app', ['ui.bootstrap']);
            console.debug('bootstrap init method');
            
            // var App = angular.module("app", ['ngRoute', 'ngGrid', 'ui.bootstrap', 'ui.bootstrap.transition', 'ui.bootstrap.collapse', 'ui.bootstrap.accordion', 'ui.bootstrap.modal'])
            
            var eventDct = 
                    {'client-MapXtntEvent' : null,
                    'client-MapClickEvent' : null,
                    'client-NewMapPosition' : null};
                        
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
                      when('/contact', {
                          controller: EmailCtrl
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
             }).
             factory("CurrentMapTypeService", function(){
                var mapTypes = {'leaflet': MapHosterLeaflet,
                            'google' : MapHosterGoogle,
                            'arcgis' : MapHosterArcGIS};
                var currentMapType = 'arcgis';
                var previousMapType = 'arcgis';
                
                
                var getMapType = function(){
                    return mapTypes[currentMapType];
                }
                var getMapTypeKey = function(){
                    return selectedMapType;
                }
                var setMapType = function(mpt){
                    previousMapType = currentMapType;
                    selectedMapType = mpt;
                    currentMapType = mpt;
                    console.log("selectedMapType set to " + selectedMapType);
                }
                var getPreviousMapType = function(){
                    return mapTypes[previousMapType];
                }
                var getSelectedMapType = function(){
                    console.log("getSelectedMapType : " + selectedMapType);
                    return mapTypes[selectedMapType];
                }
                return { getCurrentMapType : getMapType, setCurrentMapType : setMapType, getPreviousMapType : getPreviousMapType, getSelectedMapType : getSelectedMapType, getMapTypeKey : getMapTypeKey };
            }).
                
            
             factory("StompEventHandlerService", function(){
                // var eventDct = 
                        // {'client-MapXtntEvent' : null,
                        // 'client-MapClickEvent' : null,
                        // 'client-NewMapPosition' : null};
                        
                var getEventDct = function(){
                    return eventDct;
                }
                
                var addEvent = function(evt, handler){
                    eventDct[evt] = handler;
                }
                
                var getHandler = function(evt){
                    return eventDct[evt];
                }
                return { getEventDct : getEventDct, addEvent : addEvent, getHandler : getHandler};
            });
                
            AppController.start(App);
            // need to bootstrap angular since we wait for dojo/DOM to load
            angular.bootstrap(document.body, ['app']);
            
            console.log("url is " + location.search);
            var isNewAgoWindow = AgoNewWindowConfig.testUrlArgs();
            if(isNewAgoWindow){
                // alert("isNewAgoWindow is true");
                TabsCtrl.selectAgo();
                TabsCtrl.forceAgo();
                
                var $inj = angular.injector(['app']);
                var serv = $inj.get('CurrentMapTypeService');
                serv.setCurrentMapType('arcgis');
                MasherCtrl.startArcGIS();
            };
            return App;
        }

        return { start: init };

    });

}).call(this);