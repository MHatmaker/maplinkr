
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
        function MapCtrl($scope, $routeParams, $compile) {
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
            if(mptp != 'arcgis'){
                placeCustomControls();
            }

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
                // refreshLinker();
                // refreshMinMax();
                var refreshDelay = 1000;
                setTimeout(function(){
                    // $scope.$apply(function(){
                    console.log("REFRESH LINKER AND MINMAX");
                    refreshLinker();
                    refreshMinMax();
                // } );
              }, refreshDelay);
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
                refreshMinMax();
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
                refreshLinker();
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

            function refreshLinker(){
                var lnkrText = document.getElementById("idLinkerText");
                var lnkrSymbol = document.getElementById("idLinkerSymbol");
                if(lnkrSymbol && lnkrText){
                    var lnkrTxt =  $scope.$parent.data.ExpandPlug;
                    lnkrText.innerHTML = lnkrTxt;
                    console.log("refresh Linker Text with " + lnkrText.innerHTML);
                    var lnkrSmbl = "../stylesheets/images/" + $scope.$parent.data.verbageExpandCollapse + ".png";
                    lnkrSymbol.src = lnkrSmbl;
                    console.log("refresh Linker Symbol with " + lnkrSymbol.src);
                }
            }

            function refreshMinMax(){
                var minMaxText = document.getElementById("idMinMaxText");
                var minMaxSymbol = document.getElementById("idMinMaxSymbol");
                if(minMaxText && minMaxSymbol){
                    minMaxText.innerHTML = $scope.$parent.data.ExpandSite;
                    console.log("refresh MinMax Text with " + minMaxText.innerHTML);
                    minMaxSymbol.src="../stylesheets/images/" + $scope.$parent.data.webSiteVisible + ".png";
                    console.log("refresh MinMax Symbol with " + minMaxSymbol.src);
                }
            }

            function placeCustomControls(){
                var contextScope = $scope;
                var cnvs = angular.element(document.getElementById(whichCanvas));
                var lnkr0 = angular.element(document.getElementById("linkerDirectiveId"));
                var minmaxr0 = angular.element(document.getElementById("lnkmaximizerDirectiveId"));

                var parentScope = $scope.$parent;

                var templateLnkr = '<div id="linkerDirectiveId" > \
                      <label id="idLinkerText" class="lnkmaxcontrol_label lnkcontrol_margin"  \
                          style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                      </label> \
                      <img id="idLinkerSymbol" class="lnkmaxcontrol_symbol lnkcontrol_margin" \
                          style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;" > \
                      </div>';

                var templateMinMaxr = '<div id="mapmaximizerDirectiveId" > \
                      <label id="idMinMaxText" class="lnkmaxcontrol_label maxcontrol_margin" \
                          style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                      </label> \
                      <img id="idMinMaxSymbol" class="lnkmaxcontrol_symbol maxcontrol_margin" \
                          style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                      </div>';

                var lnkr1 = angular.element(templateLnkr);
                var lnkr = cnvs.append(lnkr1);

                var minmaxr1 = angular.element(templateMinMaxr);
                var minmaxr = cnvs.append(minmaxr1);

                lnkr = angular.element(document.getElementById("linkerDirectiveId"));

                minmaxr = angular.element(document.getElementById("mapmaximizerDirectiveId"));
                lnkr.bind('mouseup', function(event){
                    console.log('lnkr[0].onclick   displayLinkerEvent');
                    event.stopPropagation();
                    contextScope.$emit('displayLinkerEvent');
                });

                minmaxr.bind('mouseup',  function(event){
                    console.log('minmaxr[0].onclick   mapMaximizerEvent');
                    event.stopPropagation();
                    contextScope.$emit('mapMaximizerEvent');
                });

                var lnkrText = document.getElementById("idLinkerText");
                var lnkrSymbol = document.getElementById("idLinkerSymbol");
                var refreshDelay = 2000;
                if(lnkrSymbol && lnkrText){
                    refreshDelay = 10;
                }
                setTimeout(function(){
                    refreshLinker();
                    refreshMinMax();
                }, refreshDelay);
            }
            selfMethods["placeCustomControls"] = placeCustomControls;
            console.debug(selfMethods);
        }

        MapCtrl.prototype.placeCustomControls = function (){
            console.log("placeCustomControls");
            selfMethods["placeCustomControls"]();
        }

        function init(App) {
            console.log('MapCtrl init');
            App.controller('MapCtrl', ['$scope', '$routeParams', '$compile', MapCtrl]);
            return MapCtrl;
        }

        return { start: init, placeCustomControls : MapCtrl.prototype.placeCustomControls };

    });

}).call(this);
