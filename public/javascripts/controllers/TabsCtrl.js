/*global define */

String.format = function () {
    // console.debug("lets format something");
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.

    "use strict";
    var theString = arguments[0],
        i,
        regEx;
    // console.debug(arguments[0]);

    // start with the second argument (i = 1)
    for (i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }

    return theString;
};

(function () {
    "use strict";

    console.log('TabsCtrl setup');
    define(['angular'], function (angular) {
        console.log('TabsCtrl define');
        var selfMethods = {},
            mapSystemDct = {
                'GoogleMap' : 0,
                'ArcGIS' : 1,
                'Leaflet' : 2
            };

        function TabsCtrl($scope, $location, CurrentMapTypeService) {
            console.debug('TabsCtrl - initialize tabs');

            var contentsText = 'The {0} tab opens a typical web page displaying typical web page stuff, including a div with {1}  programmed with {2} embedded in it.';

            $scope.tabs = [
                {
                    maptype : 'google',
                    title : 'Google Maps',
                    site : 'Web Site featuring a Google Map',
                    content : String.format(contentsText, 'Google Map', 'a Google map', 'google map content'),
                    url : "/views/partials/GoogleMap.jade",
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
                    url : "/views/partials/ArcGIS.jade",
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
                    url : "/views/partials/Leaflet.jade",
                    imgSrc :  "stylesheets/images/Leaflet.png",
                    imgAlt : "Leaflet/OSM Maps",
                    active : false,
                    disabled : false
                }
            ];

            $scope.currentTab = $scope.tabs[0];
            $scope.$parent.currentTab = $scope.currentTab;
            console.log("currentTab - url initialized to " + $scope.currentTab.url);

            CurrentMapTypeService.setCurrentMapType($scope.currentTab.maptype);

            $scope.onClickTab = function (tb) {
                $scope.currentTab = $scope.$parent.currentTab = tb;
                CurrentMapTypeService.setCurrentMapType($scope.currentTab.maptype);

                console.debug("clicked on tab : " + tb.url);
            };
            $scope.isActiveTab = function (tabUrl) {
                return tabUrl === $scope.currentTab.url;
            };
            console.log("onClickTab and isActiveTab defined ");

            $scope.forceMapSystem = function (mapSystem) {
            // Simulate a click on one of the mapSystem "Show the Map" buttons under the map system tabs.
            // Resets the $locationPath under the ng-view.
            // This code should be entered in a new window created by a publish event with the map system // in the url
                var tab = mapSystemDct[mapSystem],
                    newPath = "/views/partials/" + mapSystem;
                $scope.currentTab = $scope.$parent.currentTab = $scope.tabs[tab];
                console.log("currentTab - url reset to " + $scope.currentTab.url);
                console.log("forceMapSystem setting path to : " + newPath);
                $location.path(newPath);
            };
            selfMethods.forceMapSystem = $scope.forceMapSystem;

            $scope.forceAGO = function () {
            // Simulate a click on the ArcGIS mapSystem "Show the Map" button under the map system tabs.
            // Does not reset the $locationPath under the ng-view
            // The ArcGIS map should appear in the map canvas div without replacing the host sub website.
            // However, the angular GUI sync variable for mapsystem should reflect the ArcGIS map system.
            // This cocde would be entered on a "Replace Map" selection in the AGO group/map search process
                var tab = mapSystemDct.ArcGIS;
                $scope.currentTab = $scope.$parent.currentTab = $scope.tabs[tab];
                console.log("currentTab - url reset to " + $scope.currentTab.url);
            };
            selfMethods.forceAGO = $scope.forceAGO;
            console.debug(selfMethods);

        }

        TabsCtrl.prototype.forceMapSystem = function (mapSystem) {
            selfMethods.forceMapSystem(mapSystem);
        };

        TabsCtrl.prototype.forceAGO = function (mapSystem) {
            selfMethods.forceAGO();
        };

        function init(App) {
            console.log('TabsCtrl init');
            App.controller('TabsCtrl', ['$scope', '$location', 'CurrentMapTypeService', TabsCtrl]);
            return TabsCtrl;
        }

        return { start: init, forceMapSystem : TabsCtrl.prototype.forceMapSystem,
            forceAGO : TabsCtrl.prototype.forceAGO};

    });

}).call(this);
