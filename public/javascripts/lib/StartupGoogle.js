/*global require*/
/*global define*/
/*global L*/
/*global dojo*/
/*global google*/


// define('google', function () {
    // if (google) {
        // return google;
    // }
    // return {};
// });
/*
var isGoogleLoaded = false,
    isPlacesLoaded = false;
*/
/*
function loadScript(scrpt, loadedTest, callback) {
    "use strict";
    var script = document.createElement('script');
    script.type = 'text/javascript';
    console.log('loadScript before append');
    if (loadedTest === false) {
        console.log("load google api library" + scrpt);

        if (callback) {
            script.onload = callback;
        }

        // script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&'  + 'callback=skipScript';
        loadedTest = true;
        document.body.appendChild(script);
        script.src = scrpt + '&callback=' + callback;
        console.log('loadScript after append');
    } else {
        console.log("google api already loaded");
    }
}

function skipScript() {
    "use strict";
    console.log('skipScript');
}

function initPlaces() {
    "use strict";
    console.log('skipScript');
}
*/
// window.onload = loadScript;

(function () {
    "use strict";
    // require(['lib/MapHosterGoogle', 'lib/AgoNewWindowConfig']);

    console.log('StartupGoogle setup');
    define([
        'lib/MapHosterGoogle',
        'controllers/StompSetupCtrl',
        'lib/AgoNewWindowConfig',
        'lib/utils'
    ], function (MapHosterGoogle, StompSetupCtrl, AgoNewWindowConfig, utils) {
        console.log('StartupGoogle define');
        var
            gMap = null,
            newSelectedWebMapId = "",
            pusherChannel = null,
            pusher = null;

        // loadScript();
        // console.debug(google);

        function getMap() {
            return gMap;
        }

        function showLoading() {
            console.log("show loading");
            esri.show(loading);
        }

        function hideLoading(error) {
            console.log("hide loading");
            esri.hide(loading);
        }

        function configure(newMapId) {
            var $inj,
                evtSvc,
                centerLatLng,
                initZoom,
                mapOptions = {},
                mpcanhgt,
                qlat,
                qlon,
                bnds,
                zoomStr,
                userName,
                canelem = document.getElementById('map_canvas'),

                openAgoWindow = function (channel, userName) {
                    var url = "?id=" + newSelectedWebMapId + MapHosterGoogle.getGlobalsForUrl() + "&channel=" + channel + "&userName=" + userName;
                    console.log("open new ArcGIS window with URI " + url);
                    console.log("using channel " + channel + " with user name " + userName);
                    AgoNewWindowConfig.setUrl(url);
                    AgoNewWindowConfig.setChannel(channel);
                    AgoNewWindowConfig.userName(userName);
                    window.open(AgoNewWindowConfig.gethref() + "arcgis/" + url, newSelectedWebMapId, AgoNewWindowConfig.getSmallFormDimensions());
                };

            newSelectedWebMapId = newMapId;
            console.log("newSelectedWebMapId " + newMapId);

            window.loading = dojo.byId("loadingImg");
            showLoading();

            if (newSelectedWebMapId !== null) {
                if (AgoNewWindowConfig.isNameChannelAccepted() === false) {
                    $inj = angular.injector(['app']);
                    evtSvc = $inj.get('StompEventHandlerService');
                    evtSvc.addEvent('client-MapXtntEvent', MapHosterGoogle.retrievedBounds);
                    evtSvc.addEvent('client-MapClickEvent',  MapHosterGoogle.retrievedClick);

                    StompSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                        AgoNewWindowConfig.getUserName(), function (channel, userName) {
                            AgoNewWindowConfig.setUserName(userName);
                            openAgoWindow(channel, userName);
                        });
                } else {
                    userName = AgoNewWindowConfig.getUserName();
                    openAgoWindow(AgoNewWindowConfig.masherChannel(false), userName);
                }
            } else {
                $inj = angular.injector(['app']);
                evtSvc = $inj.get('StompEventHandlerService');
                evtSvc.addEvent('client-MapXtntEvent', MapHosterGoogle.retrievedBounds);
                evtSvc.addEvent('client-MapClickEvent',  MapHosterGoogle.retrievedClick);

                console.debug(AgoNewWindowConfig);
                // var centerLatLng = new google.maps.LatLng(41.8, -87.7);
                centerLatLng = new google.maps.LatLng(41.888996, -87.623294);
                initZoom = 15;

                if (AgoNewWindowConfig.testUrlArgs()) {
                    qlat = AgoNewWindowConfig.lat();
                    qlon = AgoNewWindowConfig.lon();
                    centerLatLng = new google.maps.LatLng(qlat, qlon);
                    bnds = AgoNewWindowConfig.getBoundsFromUrl();
                    console.log("getBoundsFromUrl..................");
                    console.debug(bnds);
                    zoomStr = AgoNewWindowConfig.zoom();
                    initZoom = parseInt(zoomStr, 10);
                }

                mpcanhgt = utils.getElemHeight('map_canvas');
                console.log("mpcanhgt before new google.map is " + mpcanhgt);

                mapOptions = {
                    center: centerLatLng, //new google.maps.LatLng(41.8, -87.7),
                    // center: new google.maps.LatLng(51.50, -0.09),
                    zoom: initZoom,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };


                // console.log("before first invalidate : " + canelem.clientHeight);
                // invalidateMapWrapper();

                console.log("before map create : " + canelem.clientHeight);
                console.log("create a google map with option: " + mapOptions.mapTypeId);
                gMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

                console.log("before second invalidate : " + canelem.clientHeight);

                // invalidateMapWrapper();
                // canelem = document.getElementById('map_canvas');
                // console.log("after second invalidate : " + canelem.clientHeight);

                // loadScript('https://maps.googleapis.com/maps/api/js?libraries=places', isPlacesLoaded);
                MapHosterGoogle.start();
                MapHosterGoogle.config(gMap, google, google.maps.places);

                pusherChannel = AgoNewWindowConfig.masherChannel(false);
                console.debug(pusherChannel);
                pusher = StompSetupCtrl.createPusherClient(
                    {
                        'client-MapXtntEvent' : MapHosterGoogle.retrievedBounds,
                        'client-MapClickEvent' : MapHosterGoogle.retrievedClick,
                        'client-NewMapPosition' : MapHosterGoogle.retrievedNewPosition
                    },
                    pusherChannel,
                    AgoNewWindowConfig.getUserName(),
                    function (channel, userName) {
                        AgoNewWindowConfig.setUserName(userName);
                    }
                );
                if (!pusher) {
                    console.log("failed to create Pusher in StartupGoogle");
                }
            }
        }

/*
        function invalidateMapWrapper() {

            var element = 'map_wrapper',
                wrapHgt,
                wrapWdth,
                // cnvsHgt,
                cnvsWdth;
            console.log("MapHosterGoogle map_wrapper : invalidateSize");
            // gMap.invalidateSize(true);
            wrapHgt = utils.getElementDimension(element, 'height') + 1;
            console.log('reset ' + element + ' height to ' + wrapHgt);
            utils.setElementDimension(element, 'height', wrapHgt);

            wrapWdth = utils.getElementDimension(element, 'width');
            console.log('reset ' + element + ' width to ' + wrapWdth);
            utils.setElementDimension(element, 'width', wrapWdth);

            element = 'map_canvas';
            // gMap.invalidateSize(true);
            // cnvsHgt = '100'; // wrapHgt; //utils.getElementDimension(element, 'height') + 1;
            console.log('reset ' + element + ' height to ' + wrapHgt + 'px'); //cnvsHgt + '%');
            utils.setElementDimension(element, 'height', wrapHgt); // cnvsHgt, '%');

            cnvsWdth = utils.getElementDimension(element, 'width');
            console.log('reset ' + element + ' width to ' + cnvsWdth);
            utils.setElementDimension(element, 'width', cnvsWdth);
        }
*/

        function StartupGoogle() {
            console.log('StartupGoogle unused block');
        }

        function init() {
            console.log('StartupGoogle init');
            return StartupGoogle;
        }

        return {
            start: init,
            config : configure,
            getMap: getMap,
        };

    });
}());
