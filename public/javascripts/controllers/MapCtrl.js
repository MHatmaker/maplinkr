
(function() {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'angular',
        'esri/map',
        'dijit/Dialog'
    ], function(angular, Map) {
        console.log('MapCtrl define');

        function mapConfigs() {
            return {
                basemap: 'streets',
                center: [-118.1704035141802,34.03597014510993],
                zoom: 15
            };
        }

        function mapGen(elem) {
            return new Map(elem, mapConfigs());
        }

        function MapCtrl($scope) {
            console.log("MapCtrl initializing");
            $scope.map = mapGen('map');
            console.debug($scope.map);
        }
        
        function init(App) {
            console.log('MapCtrl init');
            App.controller('MapCtrl', ['$scope', MapCtrl]);
            return MapCtrl;
        }

        return { start: init };

    });

}).call(this);