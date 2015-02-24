
(function() {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'angular',
        'esri/map',
        'lib/StartupLeaflet',
        'lib/StartupGoogle',
        'lib/StartupArcGIS',
        'lib/utils', 
        'lib/AgoNewWindowConfig'
    ], function(angular, Map, StartupLeaflet, StartupGoogle, StartupArcGIS, utils, AgoNewWindowConfig) {
        console.log('MapCtrl define');
        
        var mapTypes = {'leaflet': StartupLeaflet,
                    'google' : StartupGoogle,
                    'arcgis' : StartupArcGIS};
        var currentMapType = null;
        var whichCanvas = 'map_canvas';
        var mapSize = {
            'small' : '40%',
            'medium' : '70%',
            'full' : '100%'
        };
        var selfMethods = {};
/* 
        function resizeMap(isMapExpanded, map){
            if(isMapExpanded){
                angular.element(document.getElementById("map_canvas_container")).addClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).addClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).css({"width": mapSize['full']});
                angular.element(document.getElementById("map_canvas_layer0")).css({"width": mapSize['full']});
                // angular.element(document.getElementById("map_canvas")).addClass("max-map-width");
                angular.element(document.getElementById("map_wrapper")).addClass("max-map-width");
            }
            else{
                angular.element(document.getElementById("map_canvas_container")).removeClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).removeClass("max-map-width");
                angular.element(document.getElementById("map_canvas_root")).css({"width": mapSize['full']});
                angular.element(document.getElementById("map_canvas_layer0")).css({"width": mapSize['full']});
                // angular.element(document.getElementById("map_canvas")).removeClass("max-map-width");
                angular.element(document.getElementById("map_wrapper")).removeClass("max-map-width");
            }
            if(map && map.resize)
                map.resize();
            currentMapType.resizeMapPane(isMapExpanded);
        }
 */
        function MapCtrl($scope, $routeParams) {
            console.log("MapCtrl initializing with maptype " +  $scope.currentTab.maptype);
            // alert("MapCtrl initializing");
            var mptp = $scope.currentTab.maptype;
            $scope.gsearchVisible = mptp == 'google' ?  'block' : 'none';
            whichCanvas = mptp == 'arcgis' ? 'map_canvas_root' : 'map_canvas';
            
            var gmquery = AgoNewWindowConfig.query();
            if(gmquery != ''){
                $scope.gsearch = {'query' : gmquery};
            }
            else{
                $scope.gsearch = {'query' : 'Search Box'};
            }
            currentMapType = mapTypes[mptp];
            var height = document.body.clientHeight;
            var width = document.body.clientWidth;
            console.log(" document.body.client : width " + width + ", height " + height);
            var mapWrp = angular.element(document.getElementById("map_wrapper"));
            /* 
            console.log("map_wrapper height");
            console.debug(mapWrp);
            var hstr = String.format("{0}px", utils.toFixedOne(height * 0.7));
            console.log(hstr);
            mapWrp.css({"height": hstr});
            
                 */
            // var parentScope = $scope.$parent;
            // var colHgt = parentScope.bodyColHeight;
            // var mapCnv = angular.element(document.getElementById("map_wrapper"));
            // mapCnv.css({"height": hstr});
            // $scope.MapWdth = mapSize['small'];
            var hstr = String.format("{0}px", utils.toFixedOne(width  * 0.7, 0));
            console.log(hstr);
            mapWrp.css({"width": hstr});
                    
            var stup = currentMapType.start();
            console.debug(stup);
            var lflt = currentMapType.config(null);
            $scope.map = currentMapType.getMap();
            // $scope.map.width = mapSize['medium'];
            // $scope.MapWdth = mapSize['small'];
            $scope.isMapExpanded = false;
            console.debug($scope.map);
            // resizeMap($scope.isMapExpanded, $scope.map);
            currentMapType.resizeWebSite($scope.isMapExpanded);
            placeCustomControls($scope);
            
            var tmpltName = $routeParams.id;
            console.log(tmpltName);
            
            if(gmquery != ''){
                var elem = document.getElementById('pac-input');
                var aelem = angular.element(elem);
                // aelem.trigger('return');
            }
                 
            $scope.$on('CollapseSummaryEvent', function(event, args) {
                // currentMapType.resizeMapPane($scope.isMapExpanded);
                // currentMapType.resizeWebSite($scope.isMapExpanded);
            });
                 
            $scope.$on('CollapseSummaryCompletionEvent', function(event, args) {
                console.log("MapCtrl handling CollapseSummaryCompletionEvent - resize WindowBy");
                window.resizeBy(0, 0);
                // currentMapType.resizeMapPane($scope.isMapExpanded);
                currentMapType.resizeWebSite($scope.isMapExpanded);
                
                // var btn = document.getElementById("idExpSiteButton");
                // btn.click();
            });
            
            $scope.$on('WebSiteVisibilityEvent', function(event, args){
                console.log('WebSiteVisibilityEvent');
                var VerbVis = args.verbage;
                var isWebSiteVisible = args.website == 'flex' ? true : false;
                $scope.isMapExpanded = VerbVis == 'flex' ? false : true;
                // $scope.isMapExpanded = ! $scope.isMapExpanded;
                // if(isWebSiteVisible){
                     // $scope.MapWdth = VerbVis == 'none' ? mapSize['full'] : mapSize['small'];
                // }
                // else{
                     // $scope.MapWdth = mapSize['full']; 
                // }
                // $scope.MapWdth =  $scope.isMapExpanded ? mapSize['full'] : mapSize['small'];
                // resizeMap($scope.isMapExpanded, $scope.map);
                currentMapType.resizeWebSite($scope.isMapExpanded);
            });
            
            $scope.$on('CollapseVerbageEvent', function(event, args) {
                var VerbVis = args.verbage;
                var isWebSiteVisible = args.website == 'flex' ? true : false;
                // $scope.isMapExpanded = ! $scope.isMapExpanded;
                $scope.isMapExpanded = VerbVis == 'flex' ? false : true;
                // $scope.MapWdth =  $scope.isMapExpanded ? mapSize['full'] : mapSize['small'];
                
                // if(isWebSiteVisible){
                     // $scope.MapWdth = VerbVis == 'none' ? mapSize['medium'] : mapSize['small'];
                // }
                // else{
                     // $scope.MapWdth = mapSize['full']; 
                // }
                // resizeMap($scope.isMapExpanded, $scope.map);
                currentMapType.resizeVerbage($scope.isMapExpanded);
            });
            
            $scope.$on('searchClickEvent', function(event, args){
                var element = document.getElementById('pac-input');
                if(element){
                    element.focus();
                }
                // alert('searchClickEvent in MapCtrl with ' + args);
                // $scope.$apply(function () {
                    // $scope.current = AgoNewWindowConfig.getQuery();
                // });
            });
            
            $scope.queryChanged = function(){
                AgoNewWindowConfig.setQuery($scope.gsearch['query']);
            }
            
            $scope.setSearchQuery = function(q){
                $scope.gsearch['query'] = q;
                AgoNewWindowConfig.setQuery($scope.gsearch['query']);
            }
            
            selfMethods["setSearchQuery"] = $scope.setSearchQuery;
            console.debug(selfMethods);
        }
        
        
        function placeCustomControls(scope){
            var cnvs = angular.element(document.getElementById(whichCanvas));
            var mpwrap = angular.element(document.getElementById("mapWrp"));
            var lnkr0 = angular.element(document.getElementById("linkerDirectiveId"));
            var minmaxr0 = angular.element(document.getElementById("mapmaximizerDirectiveId"));
            // var elemParent = lnkr0[0].parentNode; //angular.element.parent(lnkr0);
            
            var templateLnkr = '<div id="linkerDirectiveId"> \
                  <input class="lnkmaxcontrol_label" value="Show Linker" > \
                  </input> \
                  <img class="lnkmaxcontrol_symbol" src="../stylesheets/images/Expand.png"> \
                  </div>';
                  
            var templateMinMaxr = '<div id="mapmaximizerDirectiveId"> \
                  <input class="lnkmaxcontrol_label" style=" top: 65px;" value="Max Map" > \
                  </input> \
                  <img class="lnkmaxcontrol_symbol" style="top: 65px;" \
                  src="../stylesheets/images/Expand.png"> \
                  </div>';
                  
            var lnkr1 = angular.element(templateLnkr);
            var lnkr = cnvs.append(lnkr1);
            var minmaxr1 = angular.element(templateMinMaxr);
            var minmaxr = cnvs.append(minmaxr1);
            lnkr = angular.element(document.getElementById("linkerDirectiveId"));
            minmaxr = angular.element(document.getElementById("mapmaximizerDirectiveId"));
            
            lnkr.bind('click', function(){
                console.log('lnkr[0].onclick   displayLinkerEvent');
                scope.$emit('displayLinkerEvent');
            });

            minmaxr.bind('click',  function(){
                console.log('minmaxr[0].onclick   mapMaximizerEvent');
                scope.$emit('mapMaximizerEvent');
            });
        }
        /* 
        function placeCustomControls(mapWrp){
        
            // var right = mapWrp.css('right') - 20;
            
            var rgtCol = angular.element(document.getElementById("idRightCol"));
            var rightColWidth = rgtCol.css('width') + 20;
            
            var lnkr = angular.element(document.getElementById("linkerDirectiveId"));
            var minmaxr = angular.element(document.getElementById("mapmaximizerDirectiveId"));
            var hstr = String.format("{0}px", utils.toFixedOne(rightColWidth, 0));
            
            lnkr.css({"right": hstr});
            minmaxr.css({"right": hstr});
        }
         */
        function setSearchQuery(q){
            console.log("setSearchQuery");
            selfMethods["setSearchQuery"](q);
        }
        
        function init(App) {
            console.log('MapCtrl init');
            App.controller('MapCtrl', ['$scope', '$routeParams', MapCtrl]);
            return MapCtrl;
        }

        return { start: init, setSearchQuery : setSearchQuery };

    });

}).call(this);