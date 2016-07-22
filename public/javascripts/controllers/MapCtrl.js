/*global define */
/*jslint es5: true */
/*global jQuery */
/*global google */
/*jslint es5: true */

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
        'lib/MLConfig',
        'controllers/PusherSetupCtrl',
        'controllers/WindowStarter',
        'controllers/MapLinkrMgrCtrl'
        // 'controllers/GoogleSearchDirective',
    ], function (angular, Map, DestWndSetupCtrl, StartupLeaflet, StartupGoogle, StartupArcGIS, utils,
            MLConfig, PusherSetupCtrl, WindowStarterArg, MapLinkrMgrCtrl) {
        console.log('MapCtrl define');

        var mapTypes = {'leaflet': StartupLeaflet,
                    'google' : StartupGoogle,
                    'arcgis' : StartupArcGIS},
            WindowStarter = WindowStarterArg,
            currentMapType = null,
            whichCanvas = 'map_canvas',
            curMapTypeInitialized = false,
            searchBox = null,
            gmQSvc = null,
            modalInstance,
            selfMethods = {};

        function MapCtrl($scope, $routeParams, $compile, $uibModal, $uibModalStack, LinkrSvc,
            CurrentMapTypeService, PusherEventHandlerService, GoogleQueryService) {
            console.log("MapCtrl initializing with maptype " +  $scope.currentTab.maptype);

            var mptp = $scope.currentTab.maptype,
                gmquery = MLConfig.query(),
                stup,
                tmpltName,
                connectQuery,
                queryForNewDisplay = "",
                queryForSameDisplay = "",
                searchInput;

            $scope.LinkrSvc = LinkrSvc;
            $scope.CurrentMapTypeService = CurrentMapTypeService;
            $scope.PusherEventHandlerService = PusherEventHandlerService;
            $scope.GoogleQueryService = GoogleQueryService;

            $scope.destSelections = [
                {'option' : "Same Window", 'showing' : "destination-option-showing"},
                {'option' : "New Tab", 'showing' : "destination-option-showing"},
                {'option' : "New Pop-up Window", 'showing' : "destination-option-showing"}];
            $scope.selected = "Same Window";
            $scope.gsearch = {};
            $scope.data = {
                dstSel : $scope.destSelections[0].option,
                prevDstSel : $scope.destSelections[0].option,
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
                modalInstance.dismiss('cancel');
            };


            function refreshLinker() {
                var lnkrText = document.getElementById("idLinkerText"),
                    lnkrSymbol = document.getElementById("idLinkerSymbol"),
                    lnkrTxt,
                    lnkrSmbl;
                if (lnkrSymbol && lnkrText) {
                    lnkrTxt =  MapLinkrMgrCtrl.getLinkrMgrData().ExpandPlug;
                    lnkrText.innerHTML = lnkrTxt;
                    console.log("refresh Linker Text with " + lnkrText.innerHTML);
                    lnkrSmbl = "../stylesheets/images/" + MapLinkrMgrCtrl.getLinkrMgrData().mapLinkrBtnImage + ".png";
                    lnkrSymbol.src = lnkrSmbl;
                    console.log("refresh Linker Symbol with " + lnkrSymbol.src);
                }
            }

            // $scope.$on('displayLinkerEvent', function (event, data) {
            //     refreshLinker();
            // });
            //
            // $scope.$on("MapLinkrClosedEvent", function (event, args) {
            //     refreshLinker();
            // });

            function placesQueryCallback(placesFromSearch, status) {
                var mpTypeSvc = $scope.CurrentMapTypeService,
                    googmph,
                    curmph,
                    curMapType,
                    placesSearchResults,
                    onAcceptDestination,
                    scope;

                console.log('status is ' + status);
                utils.hideLoading();

                onAcceptDestination = function (info) {
                    var sourceMapType,
                        evtSvc = $scope.PusherEventHandlerService,
                        newSelectedWebMapId,
                        destWnd;


                    if (info) {
                        sourceMapType = info.mapType;
                        destWnd = info.dstSel;
                    }
                    newSelectedWebMapId = "NoId";

                    if (destWnd === 'New Pop-up Window' || destWnd === 'New Tab') {
                        if (MLConfig.isNameChannelAccepted() === false) {

                            evtSvc.addEvent('client-MapXtntEvent', sourceMapType.retrievedBounds);
                            evtSvc.addEvent('client-MapClickEvent', sourceMapType.retrievedClick);

                            PusherSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                                MLConfig.getUserName(), WindowStarter.openNewDisplay,
                                {
                                    'destination' : destWnd,
                                    'currentMapHolder' : sourceMapType,
                                    'newWindowId' : newSelectedWebMapId,
                                    'query' : queryForNewDisplay
                                });
                            queryForNewDisplay = "";
                        } else {
                            WindowStarter.openNewDisplay(MLConfig.masherChannel(false),
                                MLConfig.getUserName(), destWnd, sourceMapType, newSelectedWebMapId, queryForNewDisplay);
                            queryForNewDisplay = "";
                        }

                    } else {  //(destWnd == "Same Window")
                        googmph = mpTypeSvc.getSpecificMapType('google');
                        googmph.placeMarkers(placesSearchResults);
                        MLConfig.setQuery(queryForNewDisplay);
                        queryForSameDisplay = queryForNewDisplay;
                    }
                };

                if (placesFromSearch && placesFromSearch.length > 0) {
                    placesSearchResults = placesFromSearch;
                    googmph = mpTypeSvc.getSpecificMapType('google');

                    curmph = mpTypeSvc.getCurrentMapType();
                    curMapType = mpTypeSvc.getMapTypeKey();
                    if (curMapType === 'google') {
                        googmph.setPlacesFromSearch(placesFromSearch);
                        $scope.destSelections[0].showing = 'destination-option-showing';
                    } else {
                        $scope.destSelections[0].showing = 'destination-option-hidden';
                    }

                    gmQSvc = $scope.GoogleQueryService;
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

            connectQuery = function () {
                var mpTypeSvc,
                    googmph,
                    mapLinkrBounds,
                    searchBounds,
                    position,
                    center,
                    googleCenter,
                    gmap,
                    mapOptions,
                    pacnpt,
                    queryPlaces = {},
                    service;

                mpTypeSvc = $scope.CurrentMapTypeService;
                googmph = mpTypeSvc.getSpecificMapType('google');

                mapLinkrBounds = MLConfig.getBounds();
                searchBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng({'lat' : mapLinkrBounds.lly, 'lng' : mapLinkrBounds.llx}),
                    new google.maps.LatLng({'lat' : mapLinkrBounds.ury, 'lng' : mapLinkrBounds.urx})
                );
                position = MLConfig.getPosition();
                center = {'lat' : position.lat, 'lng' : position.lon};
                googleCenter = new google.maps.LatLng(position.lat, position.lon);
                gmap = googmph.getMap();
                utils.showLoading();
                if (!gmap) {
                    mapOptions = {
                        center : googleCenter,
                        zoom : 15,
                        mapTypeId : google.maps.MapTypeId.ROADMAP
                    };
                    gmap = new google.maps.Map(document.getElementById("hiddenmap_canvas"), mapOptions);
                }

                // placesFromSearch = searchBox.getPlaces();

                pacnpt = $('#pac-input');
                queryPlaces.bounds = searchBounds;
                queryPlaces.query = pacnpt[0].value;
                queryPlaces.location = center;
                // MLConfig.setQuery(queryPlaces.query);

                service = new google.maps.places.PlacesService(gmap);
                if (queryPlaces.query !== '') {
                    service.textSearch(queryPlaces, placesQueryCallback);
                }
            };

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
                /*jslint unparam: true*/
                function stopLintUnusedComplaints(lnkr, minmaxr) {
                    console.log("stopLintUnusedComplaints");
                }
                if (document.getElementById("linkerDirectiveId") === null) {


                    var contextScope = $scope,
                        cnvs = utils.getElemById(whichCanvas),
                        templateLnkr = ' \
                            <div id="linkerDirectiveId" class="lnkrclass"> \
    	                    <label id="idLinkerText" class="lnkmaxcontrol_label lnkcontrol_margin"  \
    	                    style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                            </label> \
    	                    <img id="idLinkerSymbol" class="lnkmaxcontrol_symbol lnkcontrol_margin" \
    	                       style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;" > \
    	                    </div>',

                        templateMinMaxr = ' \
                            <div id="mapmaximizerDirectiveId" class="mnmxclass" > \
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
                    stopLintUnusedComplaints(lnkr, minmaxr);

                    lnkrdiv = document.getElementsByClassName('lnkrclass')[0];

                    lnkrdiv.addEventListener('click', function (event) {
                        console.log('lnkr[0].onclick   displayLinkerEvent');
                        event.stopPropagation();

                        $scope.LinkrSvc.showLinkr();
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
                    refreshDelay = 500;
                    if (lnkrSymbol && lnkrText) {
                        refreshDelay = 10;
                    }
                    setTimeout(function () {
                        refreshLinker();
                        refreshMinMax();
                    }, refreshDelay);
                }
                // connectQuery();
            }

            selfMethods.placeCustomControls = placeCustomControls;
            console.debug(selfMethods);

            $scope.gsearchVisible = 'inline-block';
            whichCanvas = mptp === 'arcgis' ? 'map_canvas_root' : 'map_canvas';
            $scope.selected = mptp === 'google' ? 'Same Window' : 'New Pop-up Window';
            $scope.updateState($scope.selected);

            if (gmquery !== '') {
                $scope.gsearch = {'query' : gmquery};  // was read from url when opening new window
            } else {
                $scope.gsearch = {'query' : 'SearcherBox'};
            }

            currentMapType = mapTypes[mptp];

            stup = currentMapType.start();
            console.debug(stup);

            tmpltName = $routeParams.id;
            console.log(tmpltName);

            function configureCurrentMapType() {
                mptp = $scope.currentTab.maptype;
                currentMapType = mapTypes[mptp];
                currentMapType.config(null);
                $scope.map = currentMapType.getMap();
                // $scope.map.width = mapSize['medium'];
                // $scope.MapWdth = mapSize['small'];
                $scope.isMapExpanded = false;
                console.debug($scope.map);
                curMapTypeInitialized = true;
            }

            selfMethods.configureCurrentMapType = configureCurrentMapType;

            function invalidateCurrentMapTypeConfigured() {
                curMapTypeInitialized = false;
            }

            function getSearchBox() {
                return searchBox;
            }
            selfMethods.getSearchBox = getSearchBox;

            selfMethods.invalidateCurrentMapTypeConfigured = invalidateCurrentMapTypeConfigured;

            $scope.$on('CollapseSummaryEvent', function (event, args) {
                console.log("unused CollapseSummaryEvent");
            });

            $scope.$on('CollapseSummaryCompletionEvent', function (event, args) {
                console.log("MapCtrl handling CollapseSummaryCompletionEvent - resize WindowBy");

                var refreshDelay = 500;
                setTimeout(function () {
                    // utils.calculateComponentHeights(args.mastersitevis, args.websitevis);
                    // utils.updateMapContainerHeight($scope);
                    // utils.displayHeights("Heights after CollapseSummaryCompletionEvent");
                    // console.log("REFRESH LINKER AND MINMAX");

                    if (curMapTypeInitialized === false) { //&& mptp !== 'arcgis') {
                        configureCurrentMapType();
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
                    // $scope.current = MLConfig.getQuery();
                // });
            });

            function setupQueryListener() {
                var
                    cnvs = utils.getElemById(whichCanvas),
                    mpTypeSvc = $scope.CurrentMapTypeService,
                    curMapType = mpTypeSvc.getMapTypeKey(),
                    fnLink,
                    pcnpt,
                    template = ' \
                        <div id="gmsearch" \
                            class="gmsearchclass" \
                            style="width: 28em; margin-left: 7em; margin-right : 2em;"> \
                            <input id="pac-input" \
                                class="gmsearchcontrols" className="controls" \
                                type="text" onclick="cancelBubble=true;" onmousemove="event.stopPropagation();" \
                                onmousedown="event.stopPropagation();" onmouseup="event.stopPropagation();" \
                                placeholder="Search Google Places"  \
                                ng-class="{\'gmsposition-rel\' : !gsearch.isGoogle, \'gmsposition-abs\' : gsearch.isGoogle}" \
                                ng-model="gsearch.query" \
                                ng-change="queryChanged()" auto-focus > \
                        </div>';
                if (curMapType === 'google') {
                    $scope.gsearch.isGoogle = true;
                } else {
                    $scope.gsearch.isGoogle = false;
                }
                pcnpt = document.getElementById('pac-input');
                if (!pcnpt) {
                    pcnpt = angular.element(template);
                    cnvs.append(pcnpt);
                    fnLink = $compile(pcnpt);
                    fnLink($scope);
                }

                // pcnpt.bind('keyup', function(e){
                //     var v = e.target.value;
                //     if (e.keyCode !== '13') {
                //         e.stopPropagation();
                //     }
                // })

                $scope.safeApply();

                // GoogleSearchDirective.start(MlApp);

                setTimeout(function () {
                    searchInput = /** @type {HTMLInputElement} */ (document.getElementById('pac-input'));
                    if (searchInput) {
                        // mphmap.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
                        searchInput.value = '';
                        searchBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */
                            (searchInput));

                        google.maps.event.addListener(searchBox, 'places_changed', function () {
                            console.log("MapCtrl 'places_changed' listener");
                            connectQuery();
                            searchInput.blur();
                            setTimeout(function () {
                                searchInput.value = '';
                                // searchInput.focus();},10);
                            }, 10);
                        });
                    }
                }, 500);
            }

            selfMethods.setupQueryListener = setupQueryListener;

            // setupQueryListener();

            $scope.$on('minmaxDirtyEvent', function (event, args) {
                refreshMinMax();
            });

            $scope.queryChanged = function () {
                queryForNewDisplay = $scope.gsearch.query;
                if ($scope.gsearch.query.includes(13)) {
                    MLConfig.setQuery($scope.gsearch.query);
                    if (queryForSameDisplay === "") {
                        queryForSameDisplay = queryForNewDisplay;
                    }
                }
            };

            $scope.showDestDialog = function (callback, details, info) {
                console.log("showDestDialog for currentTab " + $scope.currentTab.title);
                $scope.preserveState();

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

                modalInstance = $uibModal.open({
                    templateUrl : '/templates/DestSelectDlgGen',   // .jade will be appended
                    controller : 'DestWndSetupCtrl',
                    backdrop : true,
                    animation : false,
                    animate : 'none',
                    windowClass : 'no-animation-modal',
                    uibModalAnimationClass : 'none',

                    resolve : {
                        data: function () {
                            return $scope.data;
                        }
                    }
                });

                modalInstance.result.then(function (info) {
                    $scope.updateState(info.dstSel);
                    $scope.data.callback(info);
                    $uibModalStack.dismissAll("go away please");
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
        };

        MapCtrl.prototype.setupQueryListener = function () {
            console.log("MapCtrl.prototype.setupQueryListener");
            if (selfMethods.setupQueryListener) {
                selfMethods.setupQueryListener();
            }
        };


        function init(App) {
            console.log('MapCtrl init');
            App = angular.module('app');
            App.controller('MapCtrl', ['$scope', '$routeParams', '$compile', '$uibModal', '$uibModalStack',
                'LinkrService', 'CurrentMapTypeService', 'PusherEventHandlerService', 'GoogleQueryService', MapCtrl]);
            return MapCtrl;
        }

        return { start: init, placeCustomControls : MapCtrl.prototype.placeCustomControls,
            configureCurrentMapType : MapCtrl.prototype.configureCurrentMapType,
            invalidateCurrentMapTypeConfigured : MapCtrl.prototype.invalidateCurrentMapTypeConfigured,
            getSearchBox : MapCtrl.prototype.getSearchBox, setupQueryListener : MapCtrl.prototype.setupQueryListener};

    });

}).call(this);
