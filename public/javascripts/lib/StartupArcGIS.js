/*global dojo */
/*global define */
/*global require */
/*global esri */

(function () {
    "use strict";

    var selfDetails = {},
        aMap = null;
    console.log('StartupGArcGIS setup');
    require(['lib/MapHosterArcGIS', 'lib/utils']);

    dojo.require("esri.map");
    dojo.require("dijit.layout.BorderContainer");
    dojo.require("dijit.layout.AccordionContainer");
    dojo.require("dijit.layout.AccordionPane");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("esri.tasks.geometry");
    dojo.require("esri.tasks.locator");
    dojo.require("esri/geometry/webMercatorUtils");
    dojo.require("esri.IdentityManager");
    dojo.require("esri.dijit.Scalebar");
    dojo.require("esri.arcgis.utils");
    dojo.require("dgrid.Grid");
    dojo.require("dgrid/Selection");
    dojo.require("dijit.Dialog");
    dojo.require("dojo.parser");

    define([
        'lib/MapHosterArcGIS',
        'controllers/StompSetupCtrl',
        'lib/AgoNewWindowConfig',
        'lib/utils',
        'controllers/TabsCtrl',
        'angular',
        'esri/map'
    ], function (MapHosterArcGIS, StompSetupCtrl, AgoNewWindowConfig, utils, TabsCtrl) {
        console.log('StartupArcGIS defined');

        var
            configOptions,
            selectedWebMapId = "a4bb8a91ecfb4131aa544eddfbc2f1d0 ", // Requires a space after map ID
            previousSelectedWebMapId = selectedWebMapId,
            zoomWebMap = null,
            pointWebMap = [null, null],
            channel = null,
            pusherChannel = null,
            pusher = null;

        selfDetails.mph = null;

        function getMap() {
            return aMap;
        }

        function resizeWebSiteVertical(isMapExpanded) {
            if (aMap) {
                MapHosterArcGIS.resizeWebSite(isMapExpanded);
            }
        }

        function resizeVerbageHorizontal(isMapExpanded) {
            if (aMap) {
                MapHosterArcGIS.resizeVerbage(isMapExpanded);

                // var lnkr = angular.element(document.getElementById("linkerDirectiveId"));
                //     minmaxr = angular.element(document.getElementById("mapmaximizerDirectiveId"));

                //     cnvs = angular.element(document.getElementById('map_canvas_root'));
                //     mpcanvas = angular.element(document.getElementById("map_canvas"));
                //     canElem = document.getElementById("map_canvas");
                // canElem.resize();
                //     djtmapcan = dojo.byId("map_wrapper");

                window.setTimeout(function () {

                    // cnvs.css('width', '100%');
                    MapHosterArcGIS.resizeVerbage(isMapExpanded);
                    // cnvs.css('width', '100%');
                    // window.resizeBy(0, 0);

                    // mpcanvas = angular.element(document.getElementById("map_canvas"));
                    // cnvs = angular.element(document.getElementById('map_canvas_root'));
                    // cnvs[0].clientWidth = mpcanvas[0].clientWidth;
                    // cnvs.css('width', '100%');
                }, 1000);
            }
        }

        function resizeMapPane(isMapExpanded) {
            console.log("StartupArcGIS.resizeMapPane : invalidateSize with current isMapExpanded = "
                + isMapExpanded);
        }

        function showLoading() {
            utils.showLoading();
            aMap.disableMapNavigation();
            aMap.hideZoomSlider();
        }

        function hideLoading(error) {
            utils.hideLoading(error);
            aMap.enableMapNavigation();
            aMap.showZoomSlider();
        }

        function placeCustomControls() {
            var $inj = angular.injector(['app']),
                ctrlSvc = $inj.get('ControllerService'),
                mapCtrl = ctrlSvc.getController();
            mapCtrl.placeCustomControls();
            //
            //     lnkrText = document.getElementById("idLinkerText");
            //     lnkrSymbol = document.getElementById("idLinkerSymbol");
            //     refreshDelay = 2000;
            // if (lnkrSymbol && lnkrText) {
            //     refreshDelay = 10;
            // }
            // setTimeout(function () {
            //   mapCtrl.placeCustomControls();
            // }, refreshDelay);
        }

        function initUI() {
          //add scalebar or other components like a legend, overview map etc
            // dojo.parser.parse();
            console.debug(aMap);
            var curmph = null,
                $inj,
                serv,
                currentPusher,
                currentChannel;

            /* Scalebar refuses to appear on map.  It appears outside the map on a bordering control.
            var scalebar = new esri.dijit.Scalebar({
                map: aMap,
                scalebarUnit:"english",
                attachTo: "top-left"
            });
             */
            console.log("start MapHoster with center " + pointWebMap[0] + ", " + pointWebMap[1] + ' zoom ' + zoomWebMap);
            console.log("selfDetails.mph : " + selfDetails.mph);
            if (selfDetails.mph === null) {
                console.log("self.Details.mph is null");
                // alert("StartupArcGIS.initUI : selfDetails.mph == null");
                selfDetails.mph = MapHosterArcGIS.start();
                MapHosterArcGIS.config(aMap, zoomWebMap, pointWebMap);
                // mph = new MapHosterArcGIS(window.map, zoomWebMap, pointWebMap);
                console.log("StartupArcGIS.initUI : selfDetails.mph as initially null and should now be set");
                console.debug(MapHosterArcGIS);
                console.debug(pusherChannel);
                curmph = null;
                // if (AgoNewWindowConfig.isChannelInitialized() == false) {
                $inj = angular.injector(['app']);
                serv = $inj.get('CurrentMapTypeService');
                curmph = serv.getSelectedMapType();
                    // }
                placeCustomControls();  // TEST REMOVING THIS ON 3/5
                pusher = StompSetupCtrl.createPusherClient(
                    {
                        'client-MapXtntEvent' : MapHosterArcGIS.retrievedBounds,
                        'client-MapClickEvent' : MapHosterArcGIS.retrievedClick,
                        'client-NewMapPosition' : curmph.retrievedNewPosition
                    },
                    pusherChannel,
                    AgoNewWindowConfig.getUserName(),
                    function (callbackChannel, userName) {
                        console.log("callback - don't need to setPusherClient");
                        console.log("It was a side effect of the createPusherClient:PusherClient process");
                        AgoNewWindowConfig.setUserName(userName);
                        // MapHosterArcGIS.prototype.setPusherClient(pusher, callbackChannel);
                    },
                    {'destination' : displayDestination, 'currentMapHolder' : curmph, 'newWindowId' : newSelectedWebMapId}
                );

            } else {
                console.log("self.Details.mph is something or other");
                currentPusher = pusher;
                currentChannel = channel;
                selfDetails.mph = MapHosterArcGIS.start();
                MapHosterArcGIS.config(aMap, zoomWebMap, pointWebMap);
                resizeWebSiteVertical(true);
                // mph = new MapHosterArcGIS(window.map, zoomWebMap, pointWebMap);
                console.log("use current pusher - now setPusherClient");
                MapHosterArcGIS.setPusherClient(currentPusher, currentChannel);
                placeCustomControls();  // MOVED TEMPORARILY on 3/15
            }


            /*
            mpDiv = document.getElementById("map_wrapper");
            // var mpDivNG = angular.element(mpDiv)[0];
            console.debug(mpDiv);
            // dojo.connect(mpDivNG, 'resize', function () {  //resize the map if the div is resized
            mpDiv.onresize( function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout( function () {
                    console.log("resize handler hit");
                    aMap.resize();
                    aMap.reposition();
                }, 500);
            });
            console.log("onResize should be hooked to map_wrapper div");
            console.debug(mpDiv);
             */
        }



        function initializePostProc(newSelectedWebMapId) {
            var urlparams,
                idWebMap,
                $inj,
                serv,
                curmph,
                url,
                lonWebMap,
                latWebMap,
                zmw,
                position,
                mapDeferred;

            window.loading = dojo.byId("loadingImg");  //loading image. id
            console.log("initializePostProc");
            if (newSelectedWebMapId && newSelectedWebMapId !== null) {
                urlparams = dojo.queryToObject(window.location.search);
                console.log("initializePostProc - urlparams");
                console.log(urlparams);

                // Get the idWebMap from the url if it is present, otherwise return current webmapId
                idWebMap = AgoNewWindowConfig.webmapId(true);

                AgoNewWindowConfig.setMapHost('ArcGIS');
                $inj = angular.injector(['app']);
                serv = $inj.get('CurrentMapTypeService');
                serv.setCurrentMapType('arcgis');

                TabsCtrl.forceAGO();
                /*
                    Force the master site web sub-site to host an AGO webmap.  Prepare to initialize or replace details in the AgoNewWindowConfig with ArcGIS-specific attributes.
                */
                if (idWebMap && idWebMap !== "") {
                    if (idWebMap !== newSelectedWebMapId) {
                        /*
                        idWebMap should have been initiated through a replace current map selection
                        in the AGO group/map search process.
                         */
                        curmph = MapHosterArcGIS;
                        selectedWebMapId = newSelectedWebMapId;
                        AgoNewWindowConfig.setWebmapId(selectedWebMapId);
                        url = "?id=" + newSelectedWebMapId + curmph.getGlobalsForUrl() + "&channel=" + channel;
                        console.log("initialize or replace map in current window with URI " + url);
                        console.log("using channel " + channel);
                        // set up config in the event that this map environment might be published.
                        AgoNewWindowConfig.setUrl(url);
                    } else {
                        console.log("selectedWebMapId == newSelectedWebMapId " + newSelectedWebMapId);
                        selectedWebMapId = idWebMap;
                        AgoNewWindowConfig.setWebmapId(selectedWebMapId);
                    }

                    /*
                    These accessors only return values from checking the url.  If it doesn't find them,
                    the value should be an empty string
                    */
                    lonWebMap = AgoNewWindowConfig.lon();
                    latWebMap = AgoNewWindowConfig.lat();
                    zmw = AgoNewWindowConfig.zoom();
                    pusherChannel = AgoNewWindowConfig.masherChannel(true);

                    // alert("initializePostProc - pusherChannel = " + pusherChannel);
                    console.log("initializePostProc - pusherChannel = " + pusherChannel);
                    // AgoNewWindowConfig.setUrl(url);

                    if (lonWebMap && latWebMap && zoomWebMap) {
                        /*
                        zoomWebMap would only be non-null if the ArcGIS map system was invoked through
                        the GUI in a "Show the map" selection.
                        */
                        zoomWebMap =  zmw;
                        console.log("zoomWebMap from URI " + zoomWebMap);
                        pointWebMap = [lonWebMap, latWebMap];
                        console.log(pointWebMap);
                        // stompChannel = urlparams['channel'];
                    }
                } else {
                    selectedWebMapId = newSelectedWebMapId;
                    lonWebMap = AgoNewWindowConfig.lon();
                    latWebMap = AgoNewWindowConfig.lat();
                    zmw = AgoNewWindowConfig.zoom();
                    pusherChannel = AgoNewWindowConfig.masherChannel(false);
                    curmph = MapHosterArcGIS;
                    url = "?id=" + newSelectedWebMapId + curmph.getGlobalsForUrl() + "&channel=" + channel;
                    console.log("replace map in current window with URI " + url);
                    console.log("using channel " + channel);
                    AgoNewWindowConfig.setUrl(url);
                    position = curmph.getGlobalPositionComponents();
                    AgoNewWindowConfig.setPosition(position);
                    AgoNewWindowConfig.setWebmapId(newSelectedWebMapId);
                    AgoNewWindowConfig.showConfigDetails('StartupArcGIS : initializePostProc - origina.l initialization or replace map');
                }
            }
            console.debug("initializePostProc proceeding with " + selectedWebMapId);
            //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications.
            esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

            //specify any default settings for your map
            //for example a bing maps key or a default web map id
            configOptions = {
                // webmap: '4b99c1fb712d4fe694805717df5fadf2', // selectedWebMapId,
                webmap: selectedWebMapId,
                title: "",
                subtitle: "",
                //arcgis.com sharing url is used modify this if yours is different
                sharingurl: "http://arcgis.com/sharing/content/items",
                //enter the bing maps key for your organization if you want to display bing maps
                bingMapsKey: "/*Please enter your own Bing Map key*/"
            };

            esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
            esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";

            //create the map using the web map id specified using configOptions or via the url parameter
            // var cpn = new dijit.layout.ContentPane({}, "map_canvas").startup();

            // dijit.byId("map_canvas").addChild(cpn).placeAt("map_canvas").startup();

            mapDeferred = esri.arcgis.utils.createMap(configOptions.webmap, "map_canvas", {
                mapOptions: {
                    slider: true,
                    nav: false,
                    wrapAround180: true

                },
                ignorePopups: false,
                bingMapsKey: configOptions.bingMapsKey,
                geometryServiceURL: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"

            });

            console.log("set up mapDeferred anonymous method");
            mapDeferred.then(function (response) {
                console.log("mapDeferred.then");
                if (previousSelectedWebMapId !== selectedWebMapId) {
                    previousSelectedWebMapId = selectedWebMapId;
                    //dojo.destroy(map.container);
                }
                if (aMap) {
                    aMap.destroy();
                }
                aMap = response.map;
                console.log("in mapDeferred anonymous method");
                console.log("configOptions title " + configOptions.title);
                console.debug("ItemInfo object " + response.itemInfo);
                console.log("ItemInfo.item object " + response.itemInfo.item);
                console.log("response title " + response.itemInfo.item.title);
                dojo.connect(aMap, "onUpdateStart", showLoading);
                dojo.connect(aMap, "onUpdateEnd", hideLoading);
               /*
            var resizeTimer;
            var mapcan = dijit.byId('map_canvas');
            console.debug(mapcan);
            dojo.connect(dijit.byId('map_canvas'), 'resize', function () {  //resize the map if the div is resized
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout( function () {
                    console.log("resize handler hit");
                    aMap.resize();
                    aMap.reposition();
                }, 500);
            });
             */
                if (aMap.loaded) {
                    initUI();
                } else {
                    dojo.connect(aMap, "onLoad", initUI);
                }
            }, function (error) {
                alert("Create Map Failed ");
                console.log('Create Map Failed: ' + dojo.toJson(error));
            });
        }


        function initialize(newSelectedWebMapId, displayDestination, selectedMapTitle, referringMph) {
            var curmph = MapHosterArcGIS,
                $inj,
                serv,
                evtSvc,
                url,
                baseUrl,
                openNewDisplay;
            /*
            This branch should only be encountered after a DestinationSelectorEvent in the AGO group/map search process.  The user desires to open a new popup or tab related to the current map view, without yet publishing the new map environment.
             */
            if (displayDestination === 'New Pop-up Window' || displayDestination === 'New Tab') {
                prepareWindow(newSelectedWebMapId, referringMph, displayDestination);
            } else {
                /*
                This branch handles a new ArcGIS Online webmap presentation from either selecting the ArcGIS tab in the master site or opening the webmap from a url sent through a publish event.
                 */
                $inj = angular.injector(['app']);
                evtSvc = $inj.get('StompEventHandlerService');
                evtSvc.addEvent('client-MapXtntEvent', curmph.retrievedBounds);
                evtSvc.addEvent('client-MapClickEvent',  curmph.retrievedClick);

                initializePostProc(newSelectedWebMapId);
            }
        }

        function prepareWindow(newSelectedWebMapId, referringMph, displayDestination) {

            var curmph = MapHosterArcGIS,
                $inj,
                serv,
                evtSvc,
                url,
                baseUrl,
                openNewDisplay;

            $inj = angular.injector(['app']);
            serv = $inj.get('CurrentMapTypeService');
            curmph = serv.getSelectedMapType();

            evtSvc = $inj.get('StompEventHandlerService');
            evtSvc.addEvent('client-MapXtntEvent', curmph.retrievedBounds);
            evtSvc.addEvent('client-MapClickEvent', curmph.retrievedClick);

            openNewDisplay = function (channel, userName) {
                url = "?id=" + newSelectedWebMapId + curmph.getGlobalsForUrl() +
                    "&channel=" + channel + "&userName=" + userName +
                    "&maphost=ArcGIS" + "&referrerId=" + AgoNewWindowConfig.getUserId();
                if (referringMph) {
                    url = "?id=" + newSelectedWebMapId + referringMph.getGlobalsForUrl() +
                        "&channel=" + channel + "&userName=" + userName +
                        "&maphost=ArcGIS" + "&referrerId=" + AgoNewWindowConfig.getUserId();
                }

                console.log("open new ArcGIS window with URI " + url);
                console.log("using channel " + channel + "with userName " + userName);
                AgoNewWindowConfig.setUrl(url);
                AgoNewWindowConfig.setUserName(userName);
                if (displayDestination === 'New Pop-up Window') {
                    baseUrl = AgoNewWindowConfig.getbaseurl();
                    window.open(baseUrl + "/arcgis/" + url, newSelectedWebMapId, AgoNewWindowConfig.getSmallFormDimensions());
                } else {
                    baseUrl = AgoNewWindowConfig.getbaseurl();
                    window.open(baseUrl + "arcgis/" + url, '_blank');
                    window.focus();
                }
            };

            if (AgoNewWindowConfig.isNameChannelAccepted() === false) {
                StompSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                    AgoNewWindowConfig.getUserName(), openNewDisplay,
                        {'destination' : displayDestination, 'currentMapHolder' : curmph, 'newWindowId' : newSelectedWebMapId});
            } else {
                openNewDisplay(AgoNewWindowConfig.masherChannel(false), AgoNewWindowConfig.getUserName());
            }
        }


        function initializePreProc() {
            console.log('initializePreProc entered');
            // var urlparams=dojo.queryToObject(window.location.search);
            // console.debug(urlparams);
            // var idWebMap=urlparams['?id'];
            var idWebMap = AgoNewWindowConfig.webmapId(true),
                llon,
                llat;

            console.debug(idWebMap);
            // initUI();
            if (!idWebMap) {
                console.log("no idWebMap");
                selectedWebMapId = "a4bb8a91ecfb4131aa544eddfbc2f1d0 "; //"e68ab88371e145198215a792c2d3c794";
                AgoNewWindowConfig.setWebmapId(selectedWebMapId);
                console.log("use " + selectedWebMapId);
                // pointWebMap = [-87.7, lat=41.8];
                pointWebMap = [-87.7, 41.8];
                zoomWebMap = 15;
                initialize(selectedWebMapId, '', '');
            } else {
                console.log("found idWebMap");
                console.log("use " + idWebMap);
                zoomWebMap = AgoNewWindowConfig.zoom();
                llon = AgoNewWindowConfig.lon();
                llat = AgoNewWindowConfig.lat();
                pointWebMap = [llon, llat];
                initialize(idWebMap, '', '');
            }
        }


        function StartupArcGIS() {
            console.log("nothing happening yet in StartupArcGIS function");
        }

        function init() {
            console.log('StartupArcGIS init');
            return StartupArcGIS;
        }

        return {
            start: init,
            config : initializePreProc,
            getMap: getMap,
            replaceWebMap : initialize,
            resizeWebSite: resizeWebSiteVertical,
            resizeVerbage: resizeVerbageHorizontal,
            resizeMapPane: resizeMapPane,
            prepareWindow: prepareWindow
        };

    });

}());
// }).call(this);

// dojo.ready(initializePreProc);
