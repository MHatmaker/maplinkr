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

        function TabsCtrl($scope, $location, CurrentMapTypeService) {
            console.debug('TabsCtrl - initialize tabs');

            $scope.tabs = CurrentMapTypeService.getMapConfigurations();

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

            $scope.$on('forceMapSystemEvent', function (evt, args) {
            // Simulate a click on one of the mapSystem "Show the Map" buttons under the map system tabs.
            // Resets the $locationPath under the ng-view.
            // This code should be entered in a new window created by a publish event with the map system // in the url
                $scope.currentTab = args.whichsystem;
            });

            $scope.$on('forceAGOEvent', function (evt, args) {
            // Simulate a click on the ArcGIS mapSystem "Show the Map" button under the map system tabs.
            // Does not reset the $locationPath under the ng-view
            // The ArcGIS map should appear in the map canvas div without replacing the host sub website.
            // However, the angular GUI sync variable for mapsystem should reflect the ArcGIS map system.
            // This cocde would be entered on a "Replace Map" selection in the AGO group/map search process
                $scope.currentTab = args.whichsystem;
                console.log("currentTab - url reset to " + $scope.currentTab.url);
            });
        }

        function init(App) {
            console.log('TabsCtrl init');
            App.controller('TabsCtrl', ['$scope', '$location', 'CurrentMapTypeService', TabsCtrl]);
            return TabsCtrl;
        }

        return {start: init};

    });

}).call(this);
