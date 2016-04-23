/*global define */
/*jslint es5: true */
/*global jQuery */

(function () {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'angular',
        'esri/map',
        'controllers/DestWndSetupCtrl',
        'lib/StartupLeaflet',
        'lib/StartupGoogle',
        'lib/StartupArcGIS',
        'lib/utils',
        'lib/AgoNewWindowConfig'
    ], function (angular, Map, DestWndSetupCtrl, StartupLeaflet, StartupGoogle, StartupArcGIS, utils, AgoNewWindowConfig) {
        console.log('MapCtrl define');

        var mapTypes = {'leaflet': StartupLeaflet,
                    'google' : StartupGoogle,
                    'arcgis' : StartupArcGIS},
            currentMapType = null,
            whichCanvas = 'map_canvas',
            // mapSize = {
            //     'small' : '40%',
            //     'medium' : '70%',
            //     'full' : '100%'
            // },
            selfMethods = {};
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

        function MapCtrl($scope, $routeParams, $compile, $uibModal) {
            console.log("MapCtrl initializing with maptype " +  $scope.currentTab.maptype);

            var mptp = $scope.currentTab.maptype,
                gmquery = AgoNewWindowConfig.query(),
                height,
                width,
                mapWrp,
                hstr,
                stup,
                lflt,
                tmpltName,
                elem,
                aelem;

            $scope.destSelections = ["Same Window", "New Tab", "New Pop-up Window"];
            $scope.selected = "Same Window";
            $scope.data = {
                dstSel : $scope.destSelections[0],
                prevDstSel : $scope.destSelections[0],
                title : 'map has no title',
                icon : null,
                snippet : 'nothing in snippet',
                mapType : $scope.currentTab.maptype,
                imgSrc : $scope.currentTab.imgSrc,
                destSelections : $scope.destSelections,
                query : "no query yet"

            };

            $scope.preserveState = function () {
                console.log("preserveState");

                $scope.data.prevDstSel = $scope.data.dstSel;
                console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.dstSel);
            };

            $scope.restoreState = function () {
                console.log("restoreState");

                console.log("restore " + $scope.data.dstSel + " from " + $scope.data.prevDstSel);
                $scope.data.dstSel = $scope.data.prevDstSel;
            };
            $scope.updateState = function (selectedDestination) {
                console.log("updateState");
                $scope.selected  = selectedDestination;
                $scope.data.dstSel = $scope.data.prevDstSel = selectedDestination;
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.$on('displayLinkerEvent', function (event, data) {
                refreshLinker();
            });

            function refreshLinker() {
                var lnkrText = document.getElementById("idLinkerText"),
                    lnkrSymbol = document.getElementById("idLinkerSymbol"),
                    lnkrTxt,
                    lnkrSmbl;
                if (lnkrSymbol && lnkrText) {
                    lnkrTxt =  $scope.$parent.mldata.ExpandPlug;
                    lnkrText.innerHTML = lnkrTxt;
                    console.log("refresh Linker Text with " + lnkrText.innerHTML);
                    lnkrSmbl = "../stylesheets/images/" + $scope.$parent.mldata.verbageExpandCollapse + ".png";
                    lnkrSymbol.src = lnkrSmbl;
                    console.log("refresh Linker Symbol with " + lnkrSymbol.src);
                }
            }

            function refreshMinMax() {
                var minMaxText = document.getElementById("idMinMaxText"),
                    minMaxSymbol = document.getElementById("idMinMaxSymbol");
                if (minMaxText && minMaxSymbol) {
                    minMaxText.innerHTML = $scope.$parent.$parent.data.ExpandSite;
                    console.log("refresh MinMax Text with " + minMaxText.innerHTML);
                    minMaxSymbol.src = "../stylesheets/images/" + $scope.$parent.$parent.data.webSiteVisible + ".png";
                    console.log("refresh MinMax Symbol with " + minMaxSymbol.src);
                }
            }

            function placeCustomControls() {
                /*jslint unparam: true*/
                function stopLintUnusedComplaints(lnkr, minmaxr, lflt, aelem) {
                    console.log("stopLintUnusedComplaints");
                }

                var contextScope = $scope,
                    cnvs = angular.element(document.getElementById(whichCanvas)),

                    templateLnkr = '<div id="linkerDirectiveId" class="lnkrclass"> \
                      <label id="idLinkerText" class="lnkmaxcontrol_label lnkcontrol_margin"  \
                          style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                      </label> \
                      <img id="idLinkerSymbol" class="lnkmaxcontrol_symbol lnkcontrol_margin" \
                          style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;" > \
                      </div>',

                    templateMinMaxr = '<div id="mapmaximizerDirectiveId" class="mnmxclass" > \
                      <label id="idMinMaxText" class="lnkmaxcontrol_label maxcontrol_margin" \
                          style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                      </label> \
                      <img id="idMinMaxSymbol" class="lnkmaxcontrol_symbol maxcontrol_margin" \
                          style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                      </div>',

                    lnkr1 = angular.element(templateLnkr),
                    lnkr = cnvs.append(lnkr1),

                    minmaxr1 = angular.element(templateMinMaxr),
                    minmaxr = cnvs.append(minmaxr1),

                    lnkrdiv = document.getElementsByClassName('lnkrclass')[0],
                    mnmxdiv,
                    lnkrText,
                    lnkrSymbol,
                    refreshDelay;
                stopLintUnusedComplaints(lnkr, minmaxr, lflt, aelem);

                lnkrdiv.addEventListener('click', function (event) {
                    console.log('lnkr[0].onclick   displayLinkerEvent');
                    event.stopPropagation();
                    contextScope.$emit('displayLinkerEvent');
                });

                mnmxdiv = document.getElementsByClassName('mnmxclass')[0];

                mnmxdiv.addEventListener('click', function (event) {
                    console.log('minmaxr[0].onclick   mapMaximizerEvent');
                    event.stopPropagation();
                    contextScope.$emit('mapMaximizerEvent');
                    contextScope.$apply();
                    refreshMinMax();
                });

                lnkrText = document.getElementById("idLinkerText");
                lnkrSymbol = document.getElementById("idLinkerSymbol");
                refreshDelay = 2000;
                if (lnkrSymbol && lnkrText) {
                    refreshDelay = 10;
                }
                setTimeout(function () {
                    refreshLinker();
                    refreshMinMax();
                }, refreshDelay);
            }

            selfMethods.placeCustomControls = placeCustomControls;
            console.debug(selfMethods);

            $scope.gsearchVisible = mptp === 'google' ?  'block' : 'none';
            whichCanvas = mptp === 'arcgis' ? 'map_canvas_root' : 'map_canvas';

            if (gmquery !== '') {
                $scope.gsearch = {'query' : gmquery};
            } else {
                $scope.gsearch = {'query' : 'SearcherBox'};
            }
            // utils.getMapContainerHeight($scope);

            currentMapType = mapTypes[mptp];
            /*
            height = document.body.clientHeight;
            width = document.body.clientWidth;
            console.log(" document.body.client : width " + width + ", height " + height);
            mapWrp = angular.element(document.getElementById("IDMapContainerRow"));

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

            /*
            hstr = String.format("{0}px", utils.toFixedOne(width  * 0.7, 0));
            console.log(hstr);
            mapWrp.css({"width": hstr});
            */

            stup = currentMapType.start();
            console.debug(stup);
            lflt = currentMapType.config(null);
            $scope.map = currentMapType.getMap();
            // $scope.map.width = mapSize['medium'];
            // $scope.MapWdth = mapSize['small'];
            $scope.isMapExpanded = false;
            console.debug($scope.map);
            // resizeMap($scope.isMapExpanded, $scope.map);
            currentMapType.resizeWebSite($scope.isMapExpanded);
            if (mptp !== 'arcgis') {
                placeCustomControls();
            }

            tmpltName = $routeParams.id;
            console.log(tmpltName);

            if (gmquery !== '') {
                elem = document.getElementById('pac-input');
                aelem = angular.element(elem);
                // aelem.trigger('return');
            }

            $scope.$on('CollapseSummaryEvent', function (event, args) {
                // currentMapType.resizeMapPane($scope.isMapExpanded);
                // currentMapType.resizeWebSite($scope.isMapExpanded);
                console.log("unused CollapseSummaryEvent");
            });

            $scope.$on('CollapseSummaryCompletionEvent', function (event, args) {
                console.log("MapCtrl handling CollapseSummaryCompletionEvent - resize WindowBy");

                var refreshDelay = 1000;
                $scope.safeApply();

                utils.getMapContainerHeight($scope);
                setTimeout(function () {
                    // $scope.$apply(function(){
                    console.log("REFRESH LINKER AND MINMAX");
                    refreshLinker();
                    refreshMinMax();
                    $scope.safeApply();
                    window.resizeBy(0, 0);
                    // currentMapType.resizeMapPane($scope.isMapExpanded);
                    $scope.safeApply();
                    currentMapType.resizeWebSite($scope.isMapExpanded);

                }, refreshDelay);
            });

            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof fn === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            $scope.$on('WebSiteVisibilityEvent', function (event, args) {
                console.log('WebSiteVisibilityEvent');
                var VerbVis = args.verbage;
                    // isWebSiteVisible = args.website === 'flex' ? true : false;
                $scope.isMapExpanded = VerbVis === 'flex' ? false : true;
                // $scope.isMapExpanded = ! $scope.isMapExpanded;
                // if(isWebSiteVisible){
                     // $scope.MapWdth = VerbVis === 'none' ? mapSize['full'] : mapSize['small'];
                // }
                // else{
                     // $scope.MapWdth = mapSize['full'];
                // }
                // $scope.MapWdth =  $scope.isMapExpanded ? mapSize['full'] : mapSize['small'];
                // resizeMap($scope.isMapExpanded, $scope.map);
                currentMapType.resizeWebSite($scope.isMapExpanded);
                refreshMinMax();
            });

            $scope.$on('searchClickEvent', function (event, args) {
                console.log("MapCtrl 'searchClickEvent' handler");
                var element = document.getElementById('pac-input'),
                    pacnpt,
                    paccon;
                if (element) {
                    element.focus();
                }
                // element.trigger({ type : 'keypress', which : 13 });
                pacnpt = $('#pac-input');
                if (pacnpt) {
                    pacnpt.focus();
                }
                console.log('trigger keypress event on pac-input');
                pacnpt.trigger(jQuery.Event('keypress', {which: 13}));
                paccon = $('#pac-container');
                console.log('trigger keydown event on pac_container');
                paccon.trigger(jQuery.Event('keydown', {keyCode: 40, which: 40}));
                // google.maps.event.trigger(searchBox, { type : 'keypress', which : 13 });

                // alert('searchClickEvent in MapCtrl with ' + args);
                // $scope.$apply(function () {
                    // $scope.current = AgoNewWindowConfig.getQuery();
                // });
            });

            $scope.$on('minmaxDirtyEvent', function (event, args) {
                refreshMinMax();
            });

            $scope.queryChanged = function () {
                AgoNewWindowConfig.setQuery($scope.gsearch.query);
            };

            $scope.showDestDialog = function (callback, details) {
                console.log("showDestDialog for currentTab " + $scope.currentTab.title);
                $scope.preserveState();
//                var hostElement = $document.find('mashbox').eq(0);
                // $scope.$broadcast('ShowWebSiteDescriptionModalEvent');

                $scope.data.mapType = $scope.currentTab.maptype;
                $scope.data.icon = $scope.currentTab.imgSrc;
                $scope.data.query = $scope.gsearch.query;
                $scope.data.callback = callback;

                var modalInstance = $uibModal.open({
                    templateUrl : '/templates/DestSelectDlgGen',   // .jade will be appended
                    controller : 'DestWndSetupCtrl',
                    backdrop : 'false',

                    resolve : {
                        data: function () {
                            return $scope.data;
                        }
                    }
                });

                modalInstance.result.then(function (selectedDestination) {
                    $scope.updateState(selectedDestination);
                    $scope.data.callback(selectedDestination);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                    $scope.restoreState();
                });

            };

        }

        MapCtrl.prototype.placeCustomControls = function () {
            console.log("placeCustomControls");
            selfMethods.placeCustomControls();
        };

        function init(App) {
            console.log('MapCtrl init');
            App.controller('MapCtrl', ['$scope', '$routeParams', '$compile', '$uibModal', MapCtrl]);
            return MapCtrl;
        }

        return { start: init, placeCustomControls : MapCtrl.prototype.placeCustomControls };

    });

}());
