
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
        'controllers/SpaCtrl',
        'controllers/MapCtrl',
        'lib/GeoCoder',
        'lib/MapHosterLeaflet',
        'lib/MapHosterGoogle',
        'lib/MapHosterArcGIS'
    ], function(angular, AppController, MasherCtrl, TabsCtrl, AgoNewWindowConfig, EmailCtrl, SpaCtrl, MapCtrl,  GeoCoder, MapHosterLeaflet, MapHosterGoogle, MapHosterArcGIS) {
        console.debug('bootstrap define fn');
        
        function init() {
            // var App = angular.module('app', ['ui.bootstrap']);
            console.debug('bootstrap init method');
            
            // var App = angular.module("app", ['ngRoute', 'ngGrid', 'ui.bootstrap', 'ui.bootstrap.transition', 'ui.bootstrap.collapse', 'ui.bootstrap.accordion', 'ui.bootstrap.modal'])
            
            var eventDct = 
                    {'client-MapXtntEvent' : null,
                    'client-MapClickEvent' : null,
                    'client-NewMapPosition' : null};
                        
            var mapRestUrlToType = {'Leaflet': 'leaflet',
                        'GoogleMap' : 'google',
                        'ArcGIS' : 'arcgis'};
                            
            var googleQueryDct = {'query' : null};
            
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
                        templateUrl: function(params){ 
                            console.log("when string is " + '/views/partials/:id');
                            console.log(" params.id : " +  params.id);
                            console.log("prepare to return " + '/partials/' + params.id);
                            return '/partials/' + params.id; 
                        },
                        controller: App.MapCtrl, reloadOnSearch: true
                      }).
                      when('/contact', {
                          controller: EmailCtrl
                      }).
                      otherwise({
                          redirectTo: '/'
                      }); 
                             
                    $locationProvider.html5Mode(true);
                    console.debug('Here we are at the end of routeProvider logic');
                    
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
                            
                var mapRestUrl = {'leaflet': 'Leaflet',
                            'google' : 'GoogleMap',
                            'arcgis' : 'ArcGIS'};
                            
                var currentMapType = 'arcgis';
                var previousMapType = 'arcgis';
                
                
                var getMapTypes = function(){
                    var values = Object.keys(mapTypes).map(function(key){
                        return mapTypes[key];
                        });
                    return values;
                    
                    // var mapTypeValues = [];
                    // for (var key in mapTypes){
                        // mapTypeValues.push(mapTypes[key]);
                    // return mapTypes;
                }
                var getMapType = function(){
                    return mapTypes[currentMapType];
                }
                var getMapTypeKey = function(){
                    return selectedMapType;
                }
                var getMapRestUrl = function(){
                    return mapRestUrl[selectedMapType];
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
                return { getMapTypes: getMapTypes, getCurrentMapType : getMapType, setCurrentMapType : setMapType, getPreviousMapType : getPreviousMapType, getSelectedMapType : getSelectedMapType, getMapTypeKey : getMapTypeKey, getMapRestUrl : getMapRestUrl };
            }).
                
            
             factory("StompEventHandlerService", function(){
                        
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
            }).
            
            factory("GoogleQueryService", function($rootScope){
                var getQueryDct = function() {
                    return googleQueryDct;
                }
                var setQuery = function(q){
                    // alert('setQuery' + q);
                    googleQueryDct.query = q;
                }
                var clickSearch = function(){
                    var gmquery = AgoNewWindowConfig.query();
                    // alert('clickSearch ready to broadcast ' + gmquery);
                    var spaElem = document.getElementById('spa_window');
                    var spaElemA = angular.element(spaElem);
                    var spaScope = spaElemA.scope();
                    spaScope.$broadcast('searchClickEvent', gmquery);
                    MapHosterGoogle.firePlacesQuery();
                }
                return {getQueryDct: getQueryDct, setQuery : setQuery, clickSearch : clickSearch };
            });
                
            App.directive('autoFocus', function($timeout) {
                return {
                    restrict: 'AC',
                    link: function(_scope, _element) {
                        console.log("directive autoFocus");
                        $timeout(function(){
                            _element[0].focus();
                        }, 0);
                    }
                };
            });
            
            AppController.start(App);
            // need to bootstrap angular since we wait for dojo/DOM to load
            angular.bootstrap(document.body, ['app']);
            
            console.log("url is " + location.search);
            var isNewAgoWindow = AgoNewWindowConfig.testUrlArgs();
            AgoNewWindowConfig.setDestinationPreference('New Pop-up Window');
            if(isNewAgoWindow){
                var maphost = AgoNewWindowConfig.maphost();
                console.log('maphost : ' + maphost);
                                
                var $inj = angular.injector(['app']);
                var serv = $inj.get('CurrentMapTypeService');
                serv.setCurrentMapType(mapRestUrlToType[maphost]);
                console.log('maptype' + mapRestUrlToType[maphost]);

                if(maphost == 'GoogleMap'){
                    var gmquery = AgoNewWindowConfig.query();
                    var searchService = $inj.get('GoogleQueryService');
                    searchService.setQuery(gmquery);
                }
                    
                MasherCtrl.startMapSystem();
                TabsCtrl.forceMapSystem(maphost);
                AgoNewWindowConfig.setHideWebSiteOnStartup(true);
                // SpaCtrl.hideWebsite();
            };
            return App;
        }

        return { start: init };

    });

}).call(this);