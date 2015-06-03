// define('google', function () {
    // if (google) {
        // return google;
    // }
    // return {};
// });

var isGoogleLoaded = false;
var isPlacesLoaded = false;

function loadScript(scrpt, loadedTest, callback) {
    "use strict";
    var script = document.createElement('script');
    script.type = 'text/javascript';
    console.log('loadScript before append');
    if(loadedTest == false){
        console.log("load google api library" + scrpt);

        if(callback){
            script.onload=callback;
        }

        // script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&'  + 'callback=skipScript';
        loadedTest = true;
        document.body.appendChild(script);
        script.src = scrpt + '&callback=' + callback;
        console.log('loadScript after append');
    }
    else{
        console.log("google api already loaded");
    }
}

function skipScript() {
    console.log('skipScript');
}

function initPlaces() {
    console.log('skipScript');
}

// window.onload = loadScript;

(function() {
    "use strict";
    // require(['lib/MapHosterGoogle', 'lib/AgoNewWindowConfig']);

    console.log('StartupGoogle setup');
    define([
        'lib/MapHosterGoogle',
        'controllers/StompSetupCtrl',
        'lib/AgoNewWindowConfig',
        'lib/utils'
    ], function(MapHosterGoogle, StompSetupCtrl, AgoNewWindowConfig, utils) {
        console.log('StartupGoogle define');
        var CHANNEL = '/mapxtnt/';
        var mph = null;
        var gMap = null;
        var loading;
        var newSelectedWebMapId = "";
        var pusherChannel = null;
        var pusher = null;

        // loadScript();
        console.debug(google);

        function getMap(){
            return gMap;
        }

        function resizeWebSiteVertical(isMapExpanded){
            MapHosterGoogle.resizeWebSite(isMapExpanded);
        }

        function resizeVerbageHorizontal(isMapExpanded){
            MapHosterGoogle.resizeVerbage(isMapExpanded);
        }

        function resizeMapPane(isMapExpanded){

            console.log("StartupGoogle.resizeMapPane : invalidateSize stub");
        }

        var urlObject;
        var configOptions;
        var loading;

        function configure(newMapId)
        {
            newSelectedWebMapId = newMapId;
            console.log("newSelectedWebMapId " + newMapId);
            window.loading = dojo.byId("loadingImg")
            //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications.
            // esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

            //specify any default settings for your map
            //for example a bing maps key or a default web map id
            configOptions = {
                webmap:newMapId,
                title:"",
                subtitle:"",
                //arcgis.com sharing url is used modify this if yours is different
                sharingurl:"http://arcgis.com/sharing/content/items",
                //enter the bing maps key for your organization if you want to display bing maps
                bingMapsKey:"/*Please enter your own Bing Map key*/"
            }

            if( newSelectedWebMapId !== null)
            {
                if(AgoNewWindowConfig.isNameChannelAccepted() === false){
                    var $inj = angular.injector(['app']);
                    var evtSvc = $inj.get('StompEventHandlerService');
                    evtSvc.addEvent('client-MapXtntEvent', MapHosterGoogle.retrievedBounds);
                    evtSvc.addEvent('client-MapClickEvent',  MapHosterGoogle.retrievedClick);

                    StompSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                        AgoNewWindowConfig.getUserName(), function(channel, userName){
                        AgoNewWindowConfig.setUserName(userName);
                        openAgoWindow(channel, userName);
                        });
                }
                else{
                    openAgoWindow(AgoNewWindowConfig.masherChannel(false), userName);
                }
            }
            else
            {
                var $inj = angular.injector(['app']);
                var evtSvc = $inj.get('StompEventHandlerService');
                evtSvc.addEvent('client-MapXtntEvent', MapHosterGoogle.retrievedBounds);
                evtSvc.addEvent('client-MapClickEvent',  MapHosterGoogle.retrievedClick);

                console.debug(AgoNewWindowConfig);
                // var centerLatLng = new google.maps.LatLng(41.8, -87.7);
                var centerLatLng = new google.maps.LatLng(41.880146, -87.623294);
                var initZoom = 13;

                if(AgoNewWindowConfig.testUrlArgs()){
                    var qlat = AgoNewWindowConfig.lat();
                    var qlon = AgoNewWindowConfig.lon();
                    centerLatLng = new google.maps.LatLng(qlat, qlon);
                    var bnds = AgoNewWindowConfig.getBoundsFromUrl();
                    console.log("getBoundsFromUrl..................");
                    console.debug(bnds);
                    var zoomStr = AgoNewWindowConfig.zoom();
                    initZoom = parseInt(zoomStr, 10);
                }

                var mpcanhgt = utils.getElemHeight('map_canvas');
                console.log("mpcanhgt before new google.map is " + mpcanhgt);

                var mapOptions = {
                  center: centerLatLng, //new google.maps.LatLng(41.8, -87.7),
                  // center: new google.maps.LatLng(51.50, -0.09),
                  zoom: initZoom,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                var canelem = document.getElementById('map_canvas');
                // console.log("before first invalidate : " + canelem.clientHeight);
                // invalidateMapWrapper();
                canelem = document.getElementById('map_canvas');
                console.log("before map create : " + canelem.clientHeight);
                console.log("create a google map with option: " + mapOptions.mapTypeId);
                gMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
                canelem = document.getElementById('map_canvas');
                console.log("before second invalidate : " + canelem.clientHeight);

                // invalidateMapWrapper();
                // canelem = document.getElementById('map_canvas');
                // console.log("after second invalidate : " + canelem.clientHeight);

                // loadScript('https://maps.googleapis.com/maps/api/js?libraries=places', isPlacesLoaded);
                mph = MapHosterGoogle.start();
                MapHosterGoogle.config(gMap, google, google.maps.places);
                MapHosterGoogle.resizeWebSite(true);

                pusherChannel = AgoNewWindowConfig.masherChannel(false);
                console.debug(pusherChannel);
                pusher = StompSetupCtrl.createPusherClient(
                        {'client-MapXtntEvent' : MapHosterGoogle.retrievedBounds,
                        'client-MapClickEvent' : MapHosterGoogle.retrievedClick,
                        'client-NewMapPosition' : MapHosterGoogle.retrievedNewPosition},
                        pusherChannel,
                        AgoNewWindowConfig.getUserName(),
                        function(channel, userName){
                                AgoNewWindowConfig.setUserName(userName);
                                }
                        );
            }
        }

        function openAGOWindow(channel, userName){
            var url = "?id=" + newSelectedWebMapId + MapHosterGoogle.getGlobalsForUrl() + "&channel=" + channel + "&userName=" + userName;
            console.log("open new ArcGIS window with URI " + url);
            console.log("using channel " + channel + " with user name " + userName);
            AgoNewWindowConfig.setUrl(url);
            AgoNewWindowConfig.setChannel(channel);
            AgoNewWindowConfig.userName(userName);
            window.open(AgoNewWindowConfig.gethref() + "arcgis/" + url, newSelectedWebMapId, AgoNewWindowConfig.getSmallFormDimensions());
        }

        function invalidateMapWrapper(){

            var element = 'map_wrapper';
            console.log("MapHosterGoogle map_wrapper : invalidateSize");
            // gMap.invalidateSize(true);
            var wrapHgt = utils.getElementDimension(element, 'height') + 1;
            console.log('reset ' + element + ' height to ' + wrapHgt);
            utils.setElementDimension(element, 'height', wrapHgt);

            var wrapWdth = utils.getElementDimension(element, 'width');
            console.log('reset ' + element + ' width to ' + wrapWdth);
            utils.setElementDimension(element, 'width', wrapWdth);

            element = 'map_canvas';
            // gMap.invalidateSize(true);
            var cnvsHgt = '100'; // wrapHgt; //utils.getElementDimension(element, 'height') + 1;
            console.log('reset ' + element + ' height to ' + wrapHgt + 'px'); //cnvsHgt + '%');
            utils.setElementDimension(element, 'height', wrapHgt); // cnvsHgt, '%');

            var cnvsWdth = utils.getElementDimension(element, 'width');
            console.log('reset ' + element + ' width to ' + cnvsWdth);
            utils.setElementDimension(element, 'width', cnvsWdth);
        }

        function StartupGoogle() {
        };
        function init() {
            console.log('StartupGoogle init');
            return StartupGoogle;
        }

        return { start: init, config : configure, getMap: getMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal,
                 resizeMapPane: resizeMapPane};

    });

}).call(this);
