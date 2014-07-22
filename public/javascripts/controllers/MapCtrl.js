
(function() {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'angular',
        'esri/map',
        'lib/StartupLeaflet',
        'lib/StartupGoogle'
    ], function(angular, Map, StartupLeaflet, StartupGoogle) {
        console.log('MapCtrl define');
        
        var mapTypes = {'leaflet': StartupLeaflet,
                        'google' : StartupGoogle};
                        // 'arcgis' : StartupArcGIS};
        var currentMapType = null;

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
                // angular.element(document.getElementById("map_canvas")).addClass("max-map-width");
                angular.element(document.getElementById("map_wrapper")).addClass("max-map-width");
            }
            else{
                angular.element(document.getElementById("map_canvas_container")).removeClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).removeClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).css({"width": "100%"});
                angular.element(document.getElementById("map_canvas_layer0")).css({"width": "100%"});
                // angular.element(document.getElementById("map_canvas")).removeClass("max-map-width");
                angular.element(document.getElementById("map_wrapper")).removeClass("max-map-width");
            }
            if(map.resize)
                map.resize();
            currentMapType.resizeMapPane(isMapExpanded);
        }

        function MapCtrl($scope, $routeParams) {
            console.log("MapCtrl initializing with maptype " +  $scope.currentTab.maptype);
            currentMapType = mapTypes[$scope.currentTab.maptype];
            
            // $scope.map = mapGen('map_canvas');
            var stup = currentMapType.start();
            console.debug(stup);
            var lflt = currentMapType.config(null);
            $scope.map = currentMapType.getMap();
            // $scope.map.width = '70%';
            $scope.MapWdth = '70%';
            $scope.isMapExpanded = false;
            console.debug($scope.map);
            // resizeMap($scope.isMapExpanded, $scope.map);
            currentMapType.resizeWebSite($scope.isMapExpanded);
            
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
                // if($scope.map.resize)
                    // $scope.map.resize();
                currentMapType.resizeMapPane($scope.isMapExpanded);
                currentMapType.resizeWebSite($scope.isMapExpanded);
            });
            
            $scope.$on('CollapseVerbageEvent', function() {
                // $scope.map.width = $scope.map_canvas_root = $scope.MapWdth = $scope.MapWdth == '70%' ? '9999em' : '70%';
                $scope.isMapExpanded = ! $scope.isMapExpanded;
                $scope.MapWdth =  $scope.isMapExpanded ? '100%' : '70%';
                resizeMap($scope.isMapExpanded, $scope.map);
                currentMapType.resizeVerbage($scope.isMapExpanded);
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