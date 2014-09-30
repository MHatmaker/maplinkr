// define('google', function () {
    // if (google) {
        // return google;
    // }
    // return {};
// });

var isGoogleLoaded = false;
function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    console.log('loadScript before append');
    if(isGoogleLoaded == false){
        console.log("load google api v3.exp");
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&'  +
            'callback=skipScript';
        isGoogleLoaded = true;
        document.body.appendChild(script);
        console.log('loadScript after append');
    }
    else{
        console.log("google api already loaded");
    }
}

function skipScript() {
    console.log('skipScript');
}

// window.onload = loadScript;

(function() {
    "use strict";
    require(['lib/MapHosterGoogle', 'lib/AgoNewWindowConfig']);

    console.log('StartupGoogle setup');
    define([
        'lib/MapHosterGoogle',
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyAwAOGAxY5PZ8MshDtaJFk2KgK7VYxArPA&callback=skipScript'
    ], function(MapHosterGoogle, AgoNewWindowConfig) {
        console.log('StartupGoogle define');
        var CHANNEL = '/mapxtnt/';
        var mph = null; 
        var gMap = null;
        var loading;
        var newSelectedWebMapId = "";
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
            console.log("StartupGoogle : invalidateSize");
            // gMap.invalidateSize(true);
        }
        
        var urlObject;
        var configOptions;
        // var portal, portalUrl = document.location.protocol + '//www.arcgis.com';
        var selectedWebMapId = "e68ab88371e145198215a792c2d3c794";
        var previousSelectedWebMapId = selectedWebMapId;
        var loading;

        function configure(newMapId) 
        {
            newSelectedWebMapId = newMapId;
            console.log("newSelectedWebMapId " + newMapId);
            // window.loading = dojo.byId("loadingImg")
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
              
            // esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
            // esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";
              
            // get the web map id from the url 
            // urlObject = esri.urlToObject(document.location.href);
            // urlObject.query = urlObject.query || {};
            // if(urlObject.query && urlObject.query.webmap){
                 // configOptions.webmap = urlObject.query.webmap;
            // }
            if( newSelectedWebMapId )
            {
                setupPusherClient(mph, function(channel){
                    var url = "?id=" + newSelectedWebMapId + mph.getGlobalsForUrl() + "&channel=" + channel;
                    console.log("open new ArcGIS window with URI " + url);
                    console.log("using channel " + channel);
                    // window.open("http://localhost:3035/arcgis/" + url, "MashMash", "top=1, left=1, height=400,width=500");
                    window.open(AgoNewWindowConfig.gethref() + "arcgis/" + url, newSelectedWebMapId, "top=1, left=1, height=400,width=500");
                    
                    });
            }
            else
            {
            
                // loadScript();
                var mapOptions = {
                  center: new google.maps.LatLng(41.8, -87.7),
                  // center: new google.maps.LatLng(51.50, -0.09),
                  zoom: 13,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                console.log("create a google map with option: " + mapOptions.mapTypeId);
                gMap = new google.maps.Map(document.getElementById("map_canvas"),
                    mapOptions);
                // mph = new MapHosterGoogle(gMap); 
                mph = MapHosterGoogle.start(); 
                MapHosterGoogle.config(gMap, google);
                MapHosterGoogle.resizeWebSite(true);
            }
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

// window.onload = function(){initialize()};