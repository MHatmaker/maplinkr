
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
                refreshLinker();
                refreshMinMax();
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
                    lnkrText.innerHTML = $scope.$parent.data.ExpandPlug;
                    lnkrSymbol.src="../stylesheets/images/" + $scope.$parent.data.verbageExpandCollapse + ".png";
                }
            }

            function refreshMinMax(){
                var minMaxText = document.getElementById("idMinMaxText");
                var minMaxSymbol = document.getElementById("idMinMaxSymbol");
                if(minMaxText && minMaxSymbol){
                    minMaxText.innerHTML = $scope.$parent.data.ExpandSite;
                    minMaxSymbol.src="../stylesheets/images/" + $scope.$parent.data.webSiteVisible + ".png";
                }
            }

            function placeCustomControls(){
                var contextScope = $scope;
                var cnvs = angular.element(document.getElementById(whichCanvas));
                var lnkr0 = angular.element(document.getElementById("linkerDirectiveId"));
                var minmaxr0 = angular.element(document.getElementById("mapmaximizerDirectiveId"));
                // var elemParent = lnkr0[0].parentNode; //angular.element.parent(lnkr0);

                var parentScope = $scope.$parent;

                var templateLnkr = '<div id="linkerDirectiveId" > \
                      <label id="idLinkerText" class="lnkmaxcontrol_label" > \ {{$scope.$parent.data.ExpandPlug}} \
                      </label> \
                      <img id="idLinkerSymbol" class="lnkmaxcontrol_symbol" \ src="../stylesheets/images/{{$scope.$parent.data.verbageExpandCollapse}}.png"> \
                      </div>';

                var templateMinMaxr = '<div id="mapmaximizerDirectiveId"> \
                      <label id="idMinMaxText" class="lnkmaxcontrol_label" style=" top: 125px;" value="{{$scope.$parent.data.ExpandSite}}" > \
                      </label> \
                      <img id="idMinMaxSymbol" class="lnkmaxcontrol_symbol" style="top: 125px;" \
                      src="../stylesheets/images/{{$scope.$parent.data.webSiteVisible}}.png"> \
                      </div>';

                var lnkr1 = angular.element(templateLnkr);
                // var lnkrC = $compile(lnkr1);
                var lnkr = cnvs.append(lnkr1);
                // lnkrC($scope);

                var minmaxr1 = angular.element(templateMinMaxr);
                // var minmaxrC = $compile(minmaxr1);
                var minmaxr = cnvs.append(minmaxr1);
                // minmaxrC($scope);

                lnkr = angular.element(document.getElementById("linkerDirectiveId"));
                lnkr[0].onmouseenter = function(){
                    var lnkrLabel = angular.element(document.getElementById("idLinkerText"));
                    lnkrLabel[0].style.background='#6E9096';
                    lnkrLabel[0].style.color='white';
                    var crsr = lnkrLabel[0].style.cursor;
                    lnkrLabel[0].style.cursor = "none";
                    var lnkrSymbol = angular.element(document.getElementById("idLinkerSymbol"));
                    lnkrSymbol[0].style.background='#6E9096';
                    lnkrSymbol[0].style.cursor = "none";
                    var crsrElem =  $('#lnkrcursor');
                    crsrElem.show();
                }
                lnkr[0].onmouseout = function(){
                    var lnkrLabel = angular.element(document.getElementById("idLinkerText"));
                    lnkrLabel[0].style.background='';
                    lnkrLabel[0].style.color='black';
                    lnkrLabel[0].style.cursor = "";
                    var lnkrSymbol = angular.element(document.getElementById("idLinkerSymbol"));
                    lnkrSymbol[0].style.background='';
                    lnkrSymbol[0].style.cursor = "";
                    $('#lnkrcursor').hide();
                }

                lnkr[0].onmousemove = function(e){
                    $('#lnkrcursor').css('left', e.clientX - 7).css('top', e.clientY - 35);
                }

                minmaxr = angular.element(document.getElementById("mapmaximizerDirectiveId"));

                minmaxr[0].onmouseenter = function(){
                    var minmaxrLabel = angular.element(document.getElementById("idMinMaxText"));
                    minmaxrLabel[0].style.background='#6E9096';
                    minmaxrLabel[0].style.color='white';
                    minmaxrLabel[0].style.cursor = "none";
                    var crsr = minmaxrLabel[0].style.cursor;
                    var minmaxrSymbol = angular.element(document.getElementById("idMinMaxSymbol"));
                    minmaxrSymbol[0].style.background='#6E9096';
                    minmaxrSymbol[0].style.cursor = "none";
                    $('#lnkrcursor').show();
                }
                minmaxr[0].onmouseout = function(){
                    var minmaxrLabel = angular.element(document.getElementById("idMinMaxText"));
                    minmaxrLabel[0].style.background='';
                    minmaxrLabel[0].style.color='black';
                    minmaxrLabel[0].style.cursor = "";
                    var minmaxrSymbol = angular.element(document.getElementById("idMinMaxSymbol"));
                    minmaxrSymbol[0].style.background='';
                    minmaxrSymbol[0].style.cursor = "";
                    $('#lnkrcursor').hide();
                }

                lnkr[0].onmousemove = function(e){
                    $('#lnkrcursor').css('left', e.clientX - 7).css('top', e.clientY - 35);
                }

                minmaxr[0].onmousemove = function(e){
                    $('#lnkrcursor').css('left', e.clientX - 7).css('top', e.clientY - 35);
                }

                lnkr.bind('mouseup', function(){
                    console.log('lnkr[0].onclick   displayLinkerEvent');
                    event.stopPropagation();
                    contextScope.$emit('displayLinkerEvent');
                    var crsr = $('#lnkrcursor')[0];
                    crsr.style.display = 'none';
                });

                minmaxr.bind('mouseup',  function(){
                    console.log('minmaxr[0].onclick   mapMaximizerEvent');
                    event.stopPropagation();
                    contextScope.$emit('mapMaximizerEvent');
                    var crsr = $('#lnkrcursor')[0];
                    crsr.style.display = 'none';
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
