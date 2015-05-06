/*global define */

var selectedMapType = 'arcgis';

(function () {
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
    ], function (angular, AppController, MasherCtrl, TabsCtrl, AgoNewWindowConfig,
            EmailCtrl, SpaCtrl, MapCtrl,  GeoCoder, MapHosterLeaflet, MapHosterGoogle, MapHosterArcGIS) {
        console.debug('bootstrap define fn');

        function init(portalForSearch) {
            // var App = angular.module('app', ['ui.bootstrap']);
            console.debug('bootstrap init method');

            // var App = angular.module("app", ['ngRoute', 'ngGrid', 'ui.bootstrap', 'ui.bootstrap.transition', 'ui.bootstrap.collapse', 'ui.bootstrap.accordion', 'ui.bootstrap.modal'])

            var eventDct = {
                'client-MapXtntEvent' : null,
                'client-MapClickEvent' : null,
                'client-NewMapPosition' : null
            },

                mapRestUrlToType = {
                    'Leaflet': 'leaflet',
                    'GoogleMap' : 'google',
                    'ArcGIS' : 'arcgis'
                },

                googleQueryDct = {'query' : null, 'rootScope': null},

                App = angular.module("app", ['ngRoute', 'ui.bootstrap', 'ngGrid', 'ui.router'])

                .config(['$routeProvider', '$locationProvider', '$urlRouterProvider', '$stateProvider',
                        function ($routeProvider, $locationProvider, $urlRouterProvider, $stateProvider) {
                        console.debug('App module route provider');

                        $routeProvider.
                            when('/', {
                                templateUrl : 'partials/SystemSelector.jade',
                                // templateUrl: '/',
                                controller : App.MasherCtrl,
                                reloadOnSearch: true
                            }).
                            when('/partials/agonewwindow/:id',  {
                                templateUrl: function (params) {
                                    console.log("when string is " + '/partials/agonewwindow/:id');
                                    console.log("params = " + params.id);
                                    console.log("prepare to return " + '/partials/agonewwindow' + params.id);
                                    return '/partials/agonewwindow' + params.id;
                                },
                                controller: App.MasherCtrl,
                                reloadOnSearch: true
                            }).
                            when('/views/partials/:id',  {
                                templateUrl: function (params) {
                                    console.log("when string is " + '/views/partials/:id');
                                    console.log(" params.id : " +  params.id);
                                    console.log("prepare to return " + '/partials/' + params.id);
                                    return '/partials/' + params.id;
                                },
                                controller: App.MapCtrl,
                                reloadOnSearch: true
                            }).
                            when('/templates/:id',  {
                                templateUrl: function (params) {
                                    console.log("when string is " + '/templates/:id');
                                    console.log(" params.id : " +  params.id);
                                    console.log("prepare to return " + '/templates/' + params.id);
                                    return '/templates/' + params.id;
                                },
                                controller: App.DestWndSetupCtrl,
                                reloadOnSearch: true
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


                factory("CurrentWebMapIdService", function () {
                    var currentWebMapId = "fooWebMapId";
                    return {
                        setCurrentWebMapId : function (newId) { currentWebMapId = newId; },
                        getCurrentWebMapId : function () { return currentWebMapId; }
                    };
                }).
                factory("CurrentMapTypeService", function () {
                    var mapTypes = {
                        'leaflet': MapHosterLeaflet,
                        'google' : MapHosterGoogle,
                        'arcgis' : MapHosterArcGIS
                    },

                        mapRestUrl = {
                            'leaflet': 'Leaflet',
                            'google' : 'GoogleMap',
                            'arcgis' : 'ArcGIS'
                        },

                        currentMapType = 'arcgis',
                        previousMapType = 'arcgis',
                        isNewAgoWindow,
                        maphost,
                        $inj,
                        serv,
                        gmquery,
                        searchService,

                        getMapTypes = function () {
                            var values = Object.keys(mapTypes).map(function (key) {
                                return mapTypes[key];
                            });
                            return values;

                            // var mapTypeValues = [];
                            // for (var key in mapTypes){
                                // mapTypeValues.push(mapTypes[key]);
                            // return mapTypes;
                        },
                        getMapType = function () {
                            return mapTypes[currentMapType];
                        },
                        getMapTypeKey = function () {
                            return selectedMapType;
                        },
                        getMapRestUrl = function () {
                            return mapRestUrl[selectedMapType];
                        },
                        setMapType = function (mpt) {
                            previousMapType = currentMapType;
                            selectedMapType = mpt;
                            currentMapType = mpt;
                            console.log("selectedMapType set to " + selectedMapType);
                        },
                        getPreviousMapType = function () {
                            return mapTypes[previousMapType];
                        },
                        getSelectedMapType = function () {
                            console.log("getSelectedMapType : " + selectedMapType);
                            return mapTypes[selectedMapType];
                        };
                    return {
                        getMapTypes: getMapTypes,
                        getCurrentMapType : getMapType,
                        setCurrentMapType : setMapType,
                        getPreviousMapType : getPreviousMapType,
                        getSelectedMapType : getSelectedMapType,
                        getMapTypeKey : getMapTypeKey,
                        getMapRestUrl : getMapRestUrl
                    };
                }).


                factory("StompEventHandlerService", function () {
                    var getEventDct = function () {
                        return eventDct;
                    },

                        addEvent = function (evt, handler) {
                            eventDct[evt] = handler;
                        },

                        getHandler = function (evt) {
                            return eventDct[evt];
                        };
                    return {
                        getEventDct : getEventDct,
                        addEvent : addEvent,
                        getHandler : getHandler
                    };
                }).

                factory("GoogleQueryService", function ($rootScope) {
                    googleQueryDct.rootScope = $rootScope;
                    var getRootScope = function () {
                        return googleQueryDct.rootScope;
                    },
                        getQueryDestinationDialogScope = function () {
                            var e = document.getElementById('DestWndDialogGoogle'),
                                scope = angular.element(e).scope();
                            return scope;
                        },

                        setDialogVisibility = function () {
                            var e = document.getElementById('Verbage'),
                                scope = angular.element(e).scope();
                            scope.VerbVis = 'flex';
                        },

                        getQueryDct = function () {
                            return googleQueryDct;
                        },
                        setQuery = function (q) {
                            // alert('setQuery' + q);
                            googleQueryDct.query = q;
                        };
                    return {
                        getQueryDct: getQueryDct,
                        setQuery : setQuery,
                        getQueryDestinationDialogScope : getQueryDestinationDialogScope,
                        setDialogVisibility : setDialogVisibility,
                        getRootScope : getRootScope
                    };
                }).

                factory("ControllerService", function ($rootScope) {
                    var getController = function () {
                        return MapCtrl;
                    };

                    return {getController: getController};
                });

            App.directive('autoFocus', function ($timeout) {
                return {
                    restrict: 'AC',
                    link: function (locscope, locelement) {
                        console.log("directive autoFocus");
                        $timeout(function () {
                            locelement[0].focus();
                        }, 0);
                    }
                };
            });
            App.directive('ngEnter', function () {
                return function (scope, element, attrs) {
                    element.bind("keydown keypress", function (event) {
                        if (event.which === 13) {
                            scope.$apply(function () {
                                scope.$eval(attrs.ngEnter);
                            });

                            event.preventDefault();
                        }
                    });
                };
            });

            AppController.start(App, portalForSearch);
            // need to bootstrap angular since we wait for dojo/DOM to load
            angular.bootstrap(document.body, ['app']);

            console.log("url is " + location.search);
            isNewAgoWindow = AgoNewWindowConfig.testUrlArgs();
            AgoNewWindowConfig.setDestinationPreference('New Pop-up Window');
            if(isNewAgoWindow){
                maphost = AgoNewWindowConfig.maphost();
                console.log('maphost : ' + maphost);

                $inj = angular.injector(['app']);
                serv = $inj.get('CurrentMapTypeService');
                serv.setCurrentMapType(mapRestUrlToType[maphost]);
                console.log('maptype' + mapRestUrlToType[maphost]);

                if(maphost == 'GoogleMap'){
                    gmquery = AgoNewWindowConfig.query();
                    searchService = $inj.get('GoogleQueryService');
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
