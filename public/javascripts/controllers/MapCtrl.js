
(function() {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'angular',
        'esri/map',
        'lib/StartupLeaflet',
        'lib/StartupGoogle',
        'lib/StartupArcGIS'
    ], function(angular, Map, StartupLeaflet, StartupGoogle, StartupArcGIS) {
        console.log('MapCtrl define');
        
        var mapTypes = {'leaflet': StartupLeaflet,
                    'google' : StartupGoogle,
                    'arcgis' : StartupArcGIS};
        var currentMapType = null;

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
            if(map && map.resize)
                map.resize();
            currentMapType.resizeMapPane(isMapExpanded);
        }

        function MapCtrl($scope, $routeParams) {
            console.log("MapCtrl initializing with maptype " +  $scope.currentTab.maptype);
            currentMapType = mapTypes[$scope.currentTab.maptype];
            var height = document.body.clientHeight;
            var width = document.body.clientWidth;
            console.log("width " + width + ", height " + height);
            var mapWrp = angular.element(document.getElementById("map_wrapper"));
            console.log("map_wrapper height");
            console.debug(mapWrp);
            var hstr = String.format("{0}px", utils.toFixedOne(height * 0.7));
            console.log(hstr);
            mapWrp.css({"height": hstr});
            var mapCnv = angular.element(document.getElementById("map_wrapper"));
            mapCnv.css({"height": hstr});
            $scope.MapWdth = '50%';
            hstr = String.format("{0}px", utils.toFixedOne(width  * 0.7, 0));
            console.log(hstr);
            mapWrp.css({"width": hstr});
                    
            var stup = currentMapType.start();
            console.debug(stup);
            var lflt = currentMapType.config(null);
            $scope.map = currentMapType.getMap();
            // $scope.map.width = '70%';
            $scope.MapWdth = '50%';
            $scope.isMapExpanded = false;
            console.debug($scope.map);
            // resizeMap($scope.isMapExpanded, $scope.map);
            currentMapType.resizeWebSite($scope.isMapExpanded);
            
            var tmpltName = $routeParams.id;
            console.log(tmpltName);
                 
            $scope.$on('CollapseSummaryEvent', function() {
                // if($scope.map.resize)
                    // $scope.map.resize();
                currentMapType.resizeMapPane($scope.isMapExpanded);
                currentMapType.resizeWebSite($scope.isMapExpanded);
            });
            
            $scope.$on('WebSiteVisibilityEvent', function(event, args){
                console.log('WebSiteVisibilityEvent');
                var isVerbageVisible = args.verbage;
                var isWebSiteVisible = args.website;
                $scope.isMapExpanded = ! isVerbageVisible;
                // $scope.isMapExpanded = ! $scope.isMapExpanded;
                if(isWebSiteVisible){
                     $scope.MapWdth = isVerbageVisible? '100%' : '50%';
                }
                else{
                     $scope.MapWdth = isVerbageVisible? '100%' : '100%';
                }
                // $scope.MapWdth =  $scope.isMapExpanded ? '100%' : '50%';
                resizeMap($scope.isMapExpanded, $scope.map);
                currentMapType.resizeVerbage($scope.isMapExpanded);
            });
            
            $scope.$on('CollapseVerbageEvent', function(event, args) {
                // $scope.map.width = $scope.map_canvas_root = $scope.MapWdth = $scope.MapWdth == '70%' ? '9999em' : '70%';
                var isVerbageVisible = args.verbage;
                var isWebSiteVisible = args.website;
                // $scope.isMapExpanded = ! $scope.isMapExpanded;
                $scope.isMapExpanded = ! isVerbageVisible;
                // $scope.MapWdth =  $scope.isMapExpanded ? '100%' : '50%';
                
                if(isWebSiteVisible){
                     $scope.MapWdth = isVerbageVisible? '70%' : '50%';
                }
                else{
                     $scope.MapWdth = isVerbageVisible? '100%' : '100%';
                }
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