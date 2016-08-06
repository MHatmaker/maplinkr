/*global define */
/*jslint es5: true */

var selectedMapType = 'arcgis',
    currentMapType = 'arcgis',
    previousMapType = 'arcgis';

(function () {
    "use strict";

    console.debug('bootstrap setup method');
    define([
        'angular',
        'controllers/ControllerStarter',
        'controllers/MasherCtrl',
        'controllers/TabsCtrl',
        'lib/MLConfig',
        'controllers/ShareCtrl',
        'controllers/SPACtrl',
        'controllers/TopRowCtrl',
        'controllers/LeftColCtrl',
        'controllers/MapColCtrl',
        'controllers/RightColCtrl',
        'controllers/MapCtrl',
        'controllers/MapLinkrPluginCtrl',
        'controllers/MapLinkrMgrCtrl',
        'lib/GeoCoder',
        'lib/MapHosterLeaflet',
        'lib/MapHosterGoogle',
        'lib/MapHosterArcGIS',
        'lib/StartupGoogle',
        'lib/StartupLeaflet',
        'lib/StartupArcGIS'

    ], function (angular, ControllerStarter, MasherCtrl, TabsCtrl, MLConfig,
            ShareCtrl, SpaCtrl, TopRowCtrl, LeftColCtrl, MapColCtrl, RightColCtrl, MapCtrl,
            MapLinkrPluginCtrl, MapLinkrMgrCtrl, GeoCoder, MapHosterLeaflet, MapHosterGoogle, MapHosterArcGIS,
            StartupGoogle, StartupLeaflet, StartupArcGIS) {
        console.debug('bootstrap define fn');

        function init(portalForSearch) {
            // var App = angular.module('app', ['ui.bootstrap']);
            console.debug('bootstrap init method');

            // var App = angular.module("app", ['ngRoute', 'ngGrid', 'ui.bootstrap',
            //    'ui.bootstrap.transition', 'ui.bootstrap.collapse', 'ui.bootstrap.accordion', 'ui.bootstrap.modal'])

            var eventDct = {
                'client-MapXtntEvent' : null,
                'client-MapClickEvent' : null,
                'client-NewMapPosition' : null
            },

                mapRestUrlToType = {
                    'leaflet': 'leaflet',
                    'google' : 'google',
                    'arcgis' : 'arcgis',
                    'Leaflet': 'leaflet',
                    'GoogleMap' : 'google',
                    'ArcGIS' : 'arcgis'
                },

                isNewAgoWindow,
                maphost,
                $inj,
                serv,
                gmquery,
                searchService,

                googleQueryDct = {'query' : null, 'rootScope': null},

                App = angular.module("app", ['ngRoute', 'ui.bootstrap', 'ngTouch', 'ui.grid', 'ui.grid.expandable',
                    'ui.grid.selection', 'ui.grid.pinning', 'ui.router', 'ngAnimate'])

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
                            when('/views/partials/:id',  {
                                templateUrl: function (params) {
                                    console.log("when string is " + '/views/partials/:id');
                                    console.log(" params.id : " +  params.id);
                                    console.log("prepare to return " + '/partials/' + params.id);
                                    return '/partials/' + params.id;
                                },
                                controller: App.MapCtrl,
                                reloadOnSearch: true,
                                disableCache: true
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
                                controller: ShareCtrl
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

                factory("SiteViewService", function () {
                    var ExpandSite = "Max Map",
                        Symbol = "Expand";
                    return {
                        setSiteExpansion : function (tf) {
                            ExpandSite = tf ? "Max Map" : "Min Map";
                            Symbol = tf ? "Expand" : "Collapse";
                        },
                        getSiteExpansion : function () {
                            return ExpandSite;
                        },
                        getMinMaxSymbol : function () {
                            return Symbol;
                        }
                    };
                }).

                value('mapsvcScopes', {
                    scopes : [],
                    addScope : function (s) {
                        this.scopes.push(s);
                    },
                    getScopes : function () {
                        return this.scopes;
                    }
                }).
                factory("CurrentMapTypeService", ['mapsvcScopes', function (mapsvcScopes) {
                    var mapTypes = {
                        'leaflet': MapHosterLeaflet,
                        'google' : MapHosterGoogle,
                        'arcgis' : MapHosterArcGIS
                    },
                        mapStartups = {
                            'leaflet': StartupLeaflet,
                            'google' : StartupGoogle,
                            'arcgis' : StartupArcGIS
                        },

                        mapRestUrl = {
                            'leaflet': 'leaflet',
                            'google' : 'google',
                            'arcgis' : 'arcgis',
                            'Leaflet': 'leaflet',
                            'GoogleMap' : 'google',
                            'ArcGIS' : 'arcgis'

                        },

                        mapType2Config = {
                            'leaflet': 2,
                            'google' : 0,
                            'arcgis' : 1
                        },

                        contentsText = ' \
                            The {0} tab opens a typical web page \
                            displaying typical web page stuff, including a div with {1} \
                            programmed with {2} embedded in it.',
                        mapSystemDct = {
                            'google' : 0,
                            'arcgis`' : 1,
                            'leaflet' : 2
                        },
                        mapconfigs = [
                            {
                                maptype : 'google',
                                title : 'Google Maps',
                                site : 'Web Site featuring a Google Map',
                                content : String.format(contentsText, 'Google Map', 'a Google map', 'google map content'),
                                url : "/views/partials/google.jade",
                                imgSrc : "stylesheets/images/googlemap.png",
                                imgAlt : "Google Map",
                                active : true,
                                disabled : false
                            },
                            {
                                maptype : 'arcgis',
                                title : 'ArcGIS Web Maps',
                                site : 'Web Site featuring an ArcGIS Online Map',
                                content : String.format(contentsText, 'ArcGIS', 'an ArcGIS Web Map', 'ArcGIS Online content'),
                                url : "/views/partials/arcgis.jade",
                                imgSrc : "stylesheets/images/arcgis.png",
                                imgAlt : "ArcGIS Web Maps",
                                active : false,
                                disabled : false
                            },
                            {
                                maptype : 'leaflet',
                                title : 'Leaflet/OSM Maps',
                                site : 'Web Site featuring a Leaflet Map',
                                content : String.format(contentsText, 'Leaflet/OSM Map',  'a Leaflet/OSM map', 'Leaflet content'),
                                url : "/views/partials/leaflet.jade",
                                imgSrc :  "stylesheets/images/Leaflet.png",
                                imgAlt : "Leaflet/OSM Maps",
                                active : false,
                                disabled : false
                            }
                        ],

                        getMapTypes = function () {
                            var values = Object.keys(mapTypes).map(function (key) {
                                return {'type' : key, 'mph' : mapTypes[key]};
                            });
                            return values;

                            // var mapTypeValues = [];
                            // for (var key in mapTypes){
                                // mapTypeValues.push(mapTypes[key]);
                            // return mapTypes;
                        },
                        getMapConfigurations = function () {
                            return mapconfigs;
                        },
                        getCurrentMapConfiguration = function () {
                            return mapconfigs[mapType2Config[currentMapType]];
                        },
                        getSpecificMapType = function (key) {
                            return mapTypes[key];
                        },
                        getCurrentMapType = function () {
                            return mapTypes[currentMapType];
                        },
                        getMapStartup = function () {
                            return mapStartups[currentMapType];
                        },
                        getMapTypeKey = function () {
                            return selectedMapType;
                        },
                        getMapRestUrl = function () {
                            return mapRestUrl[selectedMapType];
                        },
                        getMapRestUrlForType = function (tp) {
                            return mapRestUrl[tp];
                        },
                        setCurrentMapType = function (mpt) {
                            previousMapType = currentMapType;
                            selectedMapType = mpt;
                            currentMapType = mpt;
                            console.log("selectedMapType set to " + selectedMapType);
                            MapCtrl.invalidateCurrentMapTypeConfigured();
                        },
                        getPreviousMapType = function () {
                            return mapTypes[previousMapType];
                        },
                        getSelectedMapType = function () {
                            console.log("getSelectedMapType : " + selectedMapType);
                            return mapTypes[selectedMapType];
                        },

                        addScope = function (scope) {
                            mapsvcScopes.addScope(scope);
                        },
                        forceAGO = function () {
                        // Simulate a click on ArcGIS Ago mapSystem "Show the Map" buttons under the map system tabs.
                        // The listener resets the $locationPath under the ng-view.
                        // This code should be entered in a new window created by a publish event with the map system
                        // in the url

                            var data = {'whichsystem' : mapSystemDct.mapSystem, 'newpath' : "/views/partials/arcgis"},
                                scp = mapsvcScopes.getScopes()[0];
                            if (scp) {
                                scp.$broadcast('ForceAGOEvent', data);
                            }
                            console.log("forceAGO setting path to : " + data.newpath);
                            // window.location.pathname += "/views/partials/GoogleMap";
                            // window.location.reload();
                        },

                        forceMapSystem = function (mapSystem) {
                        // Simulate a click on one of the mapSystem "Show the Map" buttons under the map system tabs.
                        // The listener resets the $locationPath under the ng-view.
                        // This code should be entered in a new window created by a publish event with the map system
                        // in the url

                            var data = {'whichsystem' : mapSystemDct.mapSystem, 'newpath' : "/views/partials/" + mapSystem},
                                scp = mapsvcScopes.getScopes()[0];
                            if (scp) {
                                scp.$broadcast('ForceMapSystemEvent', data);
                            }
                            console.log("forceMapSystem setting path to : " + data.newpath);
                        };
                    return {
                        addScope : addScope,
                        getMapTypes: getMapTypes,
                        getCurrentMapType : getCurrentMapType,
                        getMapConfigurations : getMapConfigurations,
                        getCurrentMapConfiguration : getCurrentMapConfiguration,
                        getMapStartup : getMapStartup,
                        setCurrentMapType : setCurrentMapType,
                        getPreviousMapType : getPreviousMapType,
                        getSelectedMapType : getSelectedMapType,
                        getMapTypeKey : getMapTypeKey,
                        getMapRestUrl : getMapRestUrl,
                        getMapRestUrlForType : getMapRestUrlForType,
                        getSpecificMapType : getSpecificMapType,
                        forceMapSystem : forceMapSystem,
                        forceAGO : forceAGO
                    };
                }]).


                factory("PusherEventHandlerService", function () {
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
                        getQueryDestinationDialogScope = function (mapsys) {
                            var elemID = 'DestWndDialogNode',
                                e = document.getElementById(elemID),
                                scope = angular.element(e).scope();
                            return scope;
                        },

                        getPusherDialogScope = function () {
                            var elemID = 'PusherChannelDialog',
                                e = document.getElementById(elemID),
                                scope = angular.element(e).scope();
                            return scope;
                        },

                        setDialogVisibility = function (tf) {
                            var e = document.getElementById('Verbage'),
                                scope = angular.element(e).scope(),
                                previousVisibility = scope.VerbVis;
                            scope.VerbVis = tf ? 'flex' : 'none';
                            if (tf === false) {
                                angular.element(e).css({'display' : 'none'});
                            }
                            return previousVisibility;
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
                        getPusherDialogScope : getPusherDialogScope,
                        setDialogVisibility : setDialogVisibility,
                        getRootScope : getRootScope
                    };
                }).

                value('linkrScopes', {
                    scopes : [],
                    addScope : function (s) {
                        this.scopes.push(s);
                    },
                    getScopes : function () {
                        return this.scopes;
                    }
                }).

                factory("LinkrService", ['linkrScopes', function (linkrScopes) {
                    var hideLinkr,
                        showLinkr,
                        addScope;

                    addScope = function (scope) {
                        linkrScopes.addScope(scope);
                    };
                    hideLinkr = function () {
                        var data = {'visibility' : 'none'},
                            scp = linkrScopes.getScopes()[0];
                        if (scp) {
                            scp.$broadcast('displayLinkerEvent', data);
                        }
                    };
                    showLinkr = function () {
                        var data = {'visibility' : 'block'};
                        angular.forEach(linkrScopes.getScopes(), function (scp) {
                            if (scp) {
                                scp.$broadcast('displayLinkerEvent', data);
                            }
                        });
                    };

                    return {addScope : addScope, hideLinkr: hideLinkr, showLinkr: showLinkr};
                }]).

                factory("MapControllerService", function () {
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

            ControllerStarter.start(App, portalForSearch);

            // need to bootstrap angular since we wait for dojo/DOM to load
            angular.bootstrap(document.body, ['app']);

            console.log("url is " + location.search);
            isNewAgoWindow = MLConfig.testUrlArgs();
            MLConfig.setDestinationPreference('New Pop-up Window');
            if (isNewAgoWindow) {
                $inj = angular.injector(['app']);
                serv = $inj.get('CurrentMapTypeService');
                maphost = MLConfig.maphost();
                console.log('maphost : ' + maphost);
                //maphost = serv.getMapTypeKey();
                maphost = mapRestUrlToType[maphost];
                serv.setCurrentMapType(maphost);
                console.log('maptype' + mapRestUrlToType[maphost]);
                maphost = serv.getMapTypeKey();

                if (maphost === 'google') {
                    gmquery = MLConfig.getQueryFromUrl();
                    searchService = $inj.get('GoogleQueryService');
                    searchService.setQuery(gmquery);
                }

                // MasherCtrl.startMapSystem();
                serv.forceMapSystem(maphost);
                MLConfig.setHideWebSiteOnStartup(true);   /////// Probably never used via getHideWebSiteOnStartup()
                // $timeout = $inj.get('$timeout');
                // $timeout( function () {
                //     console.log("bootstrap after forceMapSystem")l
                // }, 1000);
            }

            return App;
        }

        return { start: init };

    });

}());

// }).call(this);
