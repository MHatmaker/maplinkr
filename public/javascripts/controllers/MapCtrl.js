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
        'lib/AgoNewWindowConfig',
        'controllers/StompSetupCtrl',
        'controllers/WindowStarter'
    ], function (angular, Map, DestWndSetupCtrl, StartupLeaflet, StartupGoogle, StartupArcGIS, utils,
            AgoNewWindowConfig, StompSetupCtrl, WindowStarter_) {
        console.log('MapCtrl define');

        var mapTypes = {'leaflet': StartupLeaflet,
                    'google' : StartupGoogle,
                    'arcgis' : StartupArcGIS},
            WindowStarter = WindowStarter_,
            currentMapType = null,
            whichCanvas = 'map_canvas',
            curMapTypeInitialized = false,
            lnkrMinMaxInstalled = false,
            searchBox = null,
            placesFromSearch = null,
            $inj = null,
            gmQSvc = null,
            selfMethods = {};

        function MapCtrl($scope, $routeParams, $compile, $uibModal) {
            console.log("MapCtrl initializing with maptype " +  $scope.currentTab.maptype);

            var mptp = $scope.currentTab.maptype,
                gmquery = AgoNewWindowConfig.query(),
                height,
                width,
                mapWrp,
                hstr,
                stup,
                tmpltName,
                elem,
                aelem,
                searchInput;

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
                    lnkrSmbl = "../stylesheets/images/" + $scope.$parent.mldata.mapLinkrBtnImage + ".png";
                    lnkrSymbol.src = lnkrSmbl;
                    console.log("refresh Linker Symbol with " + lnkrSymbol.src);
                }
            }

            $scope.$on("MapLinkrClosedEvent" , function (event, args) {
                refreshLinker();
            });

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
                //if (lnkrMinMaxInstalled === false) {
                //    lnkrMinMaxInstalled = true;
                if (document.getElementById("linkerDirectiveId") === null) {

                    /*jslint unparam: true*/
                    function stopLintUnusedComplaints(lnkr, minmaxr, aelem) {
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

                        lnkrdiv,
                        mnmxdiv,
                        lnkrText,
                        lnkrSymbol,
                        refreshDelay;
                    stopLintUnusedComplaints(lnkr, minmaxr, aelem);

                    lnkrdiv = document.getElementsByClassName('lnkrclass')[0];
                    lnkrdiv.addEventListener('click', function (event) {
                        var data = {'visibility' : 'block'};
                        console.log('lnkr[0].onclick   displayLinkerEvent');
                        event.stopPropagation();
                        contextScope.$emit('displayLinkerEvent', data);
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
            }

            selfMethods.placeCustomControls = placeCustomControls;
            console.debug(selfMethods);

            $scope.gsearchVisible = mptp === 'google' || mptp === 'arcgis'?  'block' : 'none';
            whichCanvas = mptp === 'arcgis' ? 'map_canvas_root' : 'map_canvas';

            if (gmquery !== '') {
                $scope.gsearch = {'query' : gmquery};
            } else {
                $scope.gsearch = {'query' : 'SearcherBox'};
            }

            currentMapType = mapTypes[mptp];

            stup = currentMapType.start();
            console.debug(stup);

            if (mptp !== 'arcgis') {
                placeCustomControls();
            }

            tmpltName = $routeParams.id;
            console.log(tmpltName);

            function configureCurrentMapType () {
                currentMapType.config(null);
                $scope.map = currentMapType.getMap();
                // $scope.map.width = mapSize['medium'];
                // $scope.MapWdth = mapSize['small'];
                $scope.isMapExpanded = false;
                console.debug($scope.map);
                curMapTypeInitialized = true;

                // resizeMap($scope.isMapExpanded, $scope.map);
            }

            selfMethods.configureCurrentMapType = configureCurrentMapType;

            function invalidateCurrentMapTypeConfigured () {
                curMapTypeInitialized = false;
            }

            function getSearchBox () {
                return searchBox;
            }
            selfMethods.getSearchBox = getSearchBox;

            selfMethods.invalidateCurrentMapTypeConfigured = invalidateCurrentMapTypeConfigured;

            $scope.$on('CollapseSummaryEvent', function (event, args) {
                console.log("unused CollapseSummaryEvent");
            });

            $scope.$on('CollapseSummaryCompletionEvent', function (event, args) {
                console.log("MapCtrl handling CollapseSummaryCompletionEvent - resize WindowBy");

                var refreshDelay = 1000;
                $scope.safeApply();

                // alert("get dimensions and pause");
                utils.getMapContainerHeight($scope);
                setTimeout(function () {
                    // $scope.$apply(function(){
                    console.log("REFRESH LINKER AND MINMAX");
                    // refreshLinker();
                    // refreshMinMax();
                    if(curMapTypeInitialized === false) { //&& mptp !== 'arcgis') {
                        configureCurrentMapType();
                    }
                    if (mptp !== 'arcgis') {
                        placeCustomControls();
                    }

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

            $scope.$on('searchClickEvent', function (event, args) {
                console.log("MapCtrl 'searchClickEvent' handler");
                var element = document.getElementById('pac-input'),
                    pacnpt,
                    paccon,
                    searchBox;
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

            searchInput = /** @type {HTMLInputElement} */ (document.getElementById('pac-input'));
            // mphmap.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
            searchInput.value = '';
            searchBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */
                (searchInput));

            google.maps.event.addListener(searchBox, 'places_changed', function () {
                var scope = null,
                    googmph = null,
                    curmph = null,
                    curMapType = '',
                    mpTypeSvc = null,
                    gmap,
                    pacnpt,
                    searchBounds = null,
                    mapLinkrBounds,
                    position,
                    center,
                    service,
                    placesSearchResults = [],
                    onAcceptDestination,
                    queryPlaces = {
                        location: null,
                        bounds: null,
                        query: 'what do you want?'
                    };
                console.log("MapCtrl 'places_changed' listener");

                onAcceptDestination = function (info) {
                    var googmph, sourceMapType, $inj, evtSvc, mpTypeSvc, newSelectedWebMapId, destWnd;

                    $inj = angular.injector(['app']);
                    if (info) {
                        sourceMapType = info.mapType;
                        destWnd = info.dstSel;
                    }
                    newSelectedWebMapId = "NoId"

                    if (destWnd === 'New Pop-up Window' || destWnd === 'New Tab') {
                        if (AgoNewWindowConfig.isNameChannelAccepted() === false) {
                            $inj = angular.injector(['app']);
                            evtSvc = $inj.get('StompEventHandlerService');
                            evtSvc.addEvent('client-MapXtntEvent', sourceMapType.retrievedBounds);
                            evtSvc.addEvent('client-MapClickEvent', sourceMapType.retrievedClick);

                            StompSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                                AgoNewWindowConfig.getUserName(), WindowStarter.openNewDisplay,
                                    {'destination' : destWnd, 'currentMapHolder' : sourceMapType, 'newWindowId' : newSelectedWebMapId});
                        } else {
                            WindowStarter.openNewDisplay(AgoNewWindowConfig.masherChannel(false),
                                AgoNewWindowConfig.getUserName(), destWnd, sourceMapType, newSelectedWebMapId);
                        }

                    } else {  //(destWnd == "Same Window")
                        $inj = angular.injector(['app']);
                        mpTypeSvc = $inj.get("CurrentMapTypeService");
                        googmph = mpTypeSvc.getSpecificMapType('google');
                        googmph.placeMarkers(placesSearchResults);
                    }
                };

                function placesQueryCallback(placesFromSearch, status) {
                    var mpTypeSvc,
                    googmph,
                    curmph,
                    curMapType,
                    gmQSvc,
                    scope;

                    console.log('status is ' + status);

                    if (placesFromSearch && placesFromSearch.length > 0) {
                        placesSearchResults = placesFromSearch;
                        $inj = angular.injector(['app']);
                        mpTypeSvc = $inj.get("CurrentMapTypeService");
                        googmph = mpTypeSvc.getSpecificMapType('google');

                        curmph = mpTypeSvc.getCurrentMapType();
                        curMapType = mpTypeSvc.getMapTypeKey();
                        if(mpTypeSvc === 'google') {
                            googmph.setPlacesFromSearch(placesFromSearch);
                        }
                        gmQSvc = $inj.get('GoogleQueryService');
                        // currentVerbVis = gmQSvc.setDialogVisibility(true);
                        scope = gmQSvc.getQueryDestinationDialogScope(curMapType);
                        $scope.showDestDialog(
                            onAcceptDestination,
                            scope,
                            {
                                'id' : null,
                                'title' : searchInput.value,
                                'snippet' : 'No snippet available',
                                'icon' : 'stylesheets/images/googlemap.png',
                                'mapType' : curmph
                            }
                        );
                    } else {
                        console.log('searchBox.getPlaces() still returned no results');
                    }

                }
/*
                var checkBounds = searchBox.getBounds(),
                    $inj,
                    gmQSvc;
                    // scope;
                console.log(formatBounds(checkBounds));
                // var bnds = {'llx' : checkBounds.getSouthWest().lng() , 'lly' : checkBounds.getSouthWest().lat(),
                //              'urx' : checkBounds.getNorthEast().lng() , 'ury' : checkBounds.getNorthEast().lat()};
*/
                $inj = angular.injector(['app']);
                mpTypeSvc = $inj.get("CurrentMapTypeService");
                googmph = mpTypeSvc.getSpecificMapType('google');
                // googmph.setSearchBox(searchBox);
                mapLinkrBounds = AgoNewWindowConfig.getBounds();
                searchBounds = new google.maps.LatLngBounds(
                                new google.maps.LatLng({'lat' : mapLinkrBounds.lly, 'lng' : mapLinkrBounds.llx}),
                                new google.maps.LatLng({'lat' : mapLinkrBounds.ury, 'lng' : mapLinkrBounds.urx})
                            );
                position = AgoNewWindowConfig.getPosition();
                center = {'lat' :position.lat, 'lng' : position.lon};

                // placesFromSearch = searchBox.getPlaces();

                pacnpt = $('#pac-input');
                queryPlaces.bounds = searchBounds;
                queryPlaces.query = pacnpt[0].value;
                queryPlaces.location = center;
                service = new google.maps.places.PlacesService(googmph.getMap());
                service.textSearch(queryPlaces, placesQueryCallback);
/*
                console.log("after searchBox.getPlaces()");
                if (placesFromSearch && placesFromSearch.length > 0) {
                    $inj = angular.injector(['app']);
                    mpTypeSvc = $inj.get("CurrentMapTypeService");
                    googmph = mpTypeSvc.getSpecificMapType('google');
                    googmph.setPlacesFromSearch(placesFromSearch);

                    curmph = mpTypeSvc.getCurrentMapType();
                    curMapType = mpTypeSvc.getMapTypeKey();
                    gmQSvc = $inj.get('GoogleQueryService');
                    // currentVerbVis = gmQSvc.setDialogVisibility(true);
                    scope = gmQSvc.getQueryDestinationDialogScope('google');
                    $scope.showDestDialog(
                        googmph.onAcceptDestination,
                        scope,
                        {
                            'id' : null,
                            'title' : searchInput.value,
                            'snippet' : 'No snippet available',
                            'icon' : 'stylesheets/images/googlemap.png',
                            'mapType' : curmph
                        }
                    );
                } else {
                    console.log('searchBox.getPlaces() still returned no results');
                }
*/
            });

            $scope.$on('minmaxDirtyEvent', function (event, args) {
                refreshMinMax();
            });

            $scope.queryChanged = function () {
                AgoNewWindowConfig.setQuery($scope.gsearch.query);
            };

            $scope.showDestDialog = function (callback, details, info) {
                console.log("showDestDialog for currentTab " + $scope.currentTab.title);
                $scope.preserveState();
//                var hostElement = $document.find('mashbox').eq(0);
                // $scope.$broadcast('ShowWebSiteDescriptionModalEvent');

                $scope.data.mapType = $scope.currentTab.maptype;
                $scope.data.icon = $scope.currentTab.imgSrc;
                $scope.data.query = $scope.gsearch.query;
                $scope.data.callback = callback;
                if (info) {
                    $scope.data.icon = info.icon;
                    $scope.data.title = info.title;
                    $scope.data.snippet = info.snippet;
                    $scope.data.mapType = info.mapType;
                    $scope.data.id = info.id;
                }

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

                modalInstance.result.then(function (info) {
                    $scope.updateState(info.dstSel);
                    $scope.data.callback(info);
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

        MapCtrl.prototype.getSearchBox = function () {
            selfMethods.getSearchBox();
        };

        MapCtrl.prototype.configureCurrentMapType = function () {
            console.log("configureCurrentMapType");
            selfMethods.configureCurrentMapType();
        };
        MapCtrl.prototype.invalidateCurrentMapTypeConfigured = function () {
            console.log("invalidateCurrentMapTypeConfigured");
            if (selfMethods.invalidateCurrentMapTypeConfigured) {
                selfMethods.invalidateCurrentMapTypeConfigured();
            }
        }

        function init(App) {
            console.log('MapCtrl init');
            App = angular.module('app');
            App.controller('MapCtrl', ['$scope', '$routeParams', '$compile', '$uibModal', MapCtrl]);
            return MapCtrl;
        }

        return { start: init, placeCustomControls : MapCtrl.prototype.placeCustomControls,
            configureCurrentMapType : MapCtrl.prototype.configureCurrentMapType,
            invalidateCurrentMapTypeConfigured : MapCtrl.prototype.invalidateCurrentMapTypeConfigured,
            getSearchBox : MapCtrl.prototype.getSearchBox};

    });

}());
