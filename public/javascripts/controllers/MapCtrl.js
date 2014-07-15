
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
                zoom: 15,
                autoResize: true
            };
        }

        function mapGen(elem) {
            return new Map(elem, mapConfigs());
        }
        
        function resizeMap(isMapExpanded, map){
            if(isMapExpanded){
                angular.element(document.getElementById("map_canvas_container")).addClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).addClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).css({"width": "100%;"});
                angular.element(document.getElementById("map_canvas_layer0")).css({"width": "100%;"});
                angular.element(document.getElementById("map_canvas")).addClass("max-map-width");
            }
            else{
                angular.element(document.getElementById("map_canvas_container")).removeClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).removeClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).css({"width": "100%"});
                angular.element(document.getElementById("map_canvas_layer0")).css({"width": "100%"});
                angular.element(document.getElementById("map_canvas")).removeClass("max-map-width");
            }
            map.resize();
        }

        function MapCtrl($scope, $routeParams) {
            console.log("MapCtrl initializing with maptype " +  $scope.currentTab.maptype);
            $scope.map = mapGen('map_canvas');
            // $scope.map.width = '70%';
            $scope.MapWdth = '70%';
            $scope.isMapExpanded = false;
            console.debug($scope.map);
            resizeMap($scope.isMapExpanded, $scope.map);
            
            var tmpltName = $routeParams.id;
            console.log(tmpltName);
            /* 
            $http.get('/partials/' + tmpltName)
                .then(function(results){
                    //Success;
                    console.log("Success: " + results.status);
                    console.log($routeParams.id);
                    $scope.doc = results.data;
                    console.debug($scope.doc);
                }, function(results){
                    //error
                    console.log("Error: " + results.data + "; "
                                          + results.status);
                })
                 */
                 
            $scope.$on('CollapseSummaryEvent', function() {
                $scope.map.resize();
            });
            
            $scope.$on('CollapseVerbageEvent', function() {
                // $scope.map.width = $scope.map_canvas_root = $scope.MapWdth = $scope.MapWdth == '70%' ? '9999em' : '70%';
                $scope.isMapExpanded = ! $scope.isMapExpanded;
                $scope.MapWdth =  $scope.isMapExpanded ? '100%' : '70%';
                resizeMap($scope.isMapExpanded, $scope.map);
            });
        }
        
        function init(App) {
            console.log('MapCtrl init');
            App.controller('MapCtrl', ['$scope', '$routeParams', MapCtrl]);
            return MapCtrl;
        }

        return { start: init };

    });

}).call(this);