
(function() {
    "use strict";

    console.log('StartupGArcGIS setup');
    require(['lib/MapHosterArcGIS']);
        
    dojo.require("esri.map");
    dojo.require("dijit.layout.BorderContainer");
    dojo.require("dijit.layout.AccordionContainer");
    dojo.require("dijit.layout.AccordionPane");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("esri.tasks.geometry");
    dojo.require("esri.IdentityManager");
    dojo.require("esri.dijit.Scalebar");
    dojo.require("esri.arcgis.utils");
    dojo.require("dgrid.Grid");
    dojo.require("dgrid/Selection");
    // dojo.require("esri.arcgis.Portal");
    dojo.require("dijit.Dialog");
    dojo.require("dojo.parser");
    
    define([
        'lib/MapHosterArcGIS',
        'angular',
        'esri/map'
    ], function(MapHosterArcGIS) {
        console.log('StartupArcGIS defined');
        
        var CHANNEL = '/mapxtnt/';
        var mph = null; 
        var aMap = null;
        var loading;
        var newSelectedWebMapId = "";

        function configit(nmpid){
            console.log("nmpid " + nmpid);
        }
        function getMap(){
            return aMap;
        }
        
        function resizeWebSiteVertical(isMapExpanded){
            if(aMap)
                MapHosterArcGIS.resizeWebSite(isMapExpanded);
        }
        function resizeVerbageHorizontal(isMapExpanded){
            if(aMap)
                MapHosterArcGIS.resizeVerbage(isMapExpanded);
        }
        function resizeMapPane(isMapExpanded){
            console.log("StartupArcGIS : invalidateSize");
        }
        

        var stomp = null;
        var mph = null; 

        var map, urlObject;
        var configOptions;
        // var portal, portalUrl = document.location.protocol + '//www.arcgis.com';
        var gridGroup;
        var gridMap;
        var selectedGroupId;
        var selectedWebMapId = "e39fa319c45c483aa2ba93595583c1d5"; //"e68ab88371e145198215a792c2d3c794";
        var previousSelectedWebMapId = selectedWebMapId;
                
        var zoomWebMap = null;
        var pointWebMap = [null, null];
        var pusherChannel = null;
        var loading;
            
        function initialize(newSelectedWebMapId, promptForDestination, selectedMapTitle) 
        {
            if(promptForDestination == false)
            {
                initializePostProc(newSelectedWebMapId);
            }
            else
            {
                dialogDestinationWindowSelector("Select Destination Window",
                    "Where do you want to display " + selectedMapTitle + "?",
                    "Replace map in this window",
                    "Open map in new tab(window)",
                        function() {
                            console.log('You selected same window');
                            initializePostProc(newSelectedWebMapId);
                        },
                        function() {
                            console.log('You selected new window');
                            setupPusherClient(mph, function(channel){
                                var url = "?id=" + newSelectedWebMapId + mph.getGlobalsForUrl() + "&channel=" + channel;
                                console.log("open new ArcGIS window with URI " + url);
                                console.log("using channel " + channel);
                                window.open("http://localhost:8080/arcgis/" + url);
                                });
                        },
                        function() {
                           console.log('You cancelled new map operation');
                        },
                        500,
                        150
                    );
            }
        }

        function initializePostProc(newSelectedWebMapId)
        {
            window.loading = dojo.byId("loadingImg");  //loading image. id
            if(newSelectedWebMapId && newSelectedWebMapId != null)
            {
                var urlparams=dojo.queryToObject(window.location.search); 
                var idWebMap=urlparams['?id'];
                if(idWebMap && idWebMap != "")
                {
                    if(idWebMap != newSelectedWebMapId)
                    {
                        selectedWebMapId = newSelectedWebMapId;
                    }
                    else
                    {
                        console.log("selectedWebMapId == newSelectedWebMapId " + newSelectedWebMapId);
                        selectedWebMapId = idWebMap;
                    }
                    
                    var lonWebMap = urlparams['lon'];
                    var latWebMap = urlparams['lat'];
                    var zmw = urlparams['zoom'];
                    pusherChannel = urlparams['channel'];
                    if(lonWebMap && latWebMap && zoomWebMap)
                    {
                        zoomWebMap =  zmw;
                        console.log("from URI " + zoomWebMap);
                        pointWebMap = [lonWebMap, latWebMap];
                        console.log(pointWebMap);
                        // stompChannel = urlparams['channel'];
                    }
                }
            }
            console.debug("initializePostProc proceeding with " + selectedWebMapId);
            //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications. 
            esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

            //specify any default settings for your map 
            //for example a bing maps key or a default web map id
            configOptions = {
                webmap: '4b99c1fb712d4fe694805717df5fadf2', // selectedWebMapId,
                title:"",
                subtitle:"",
                //arcgis.com sharing url is used modify this if yours is different
                sharingurl:"http://arcgis.com/sharing/content/items",
                //enter the bing maps key for your organization if you want to display bing maps
                bingMapsKey:"/*Please enter your own Bing Map key*/"
            }

            esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
            esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";

            // get the web map id from the url 
            // urlObject = esri.urlToObject(document.location.href);
            // urlObject.query = urlObject.query || {};
            // if(urlObject.query && urlObject.query.webmap){
             // configOptions.webmap = urlObject.query.webmap;
            // }

            //create the map using the web map id specified using configOptions or via the url parameter
            var mapDeferred = esri.arcgis.utils.createMap(configOptions.webmap, "map_canvas", {
                mapOptions: {
                  slider: true,
                  nav: false,
                  wrapAround180:true
                },
                ignorePopups:false,
                bingMapsKey: configOptions.bingMapsKey,
                geometryServiceURL: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"

            });
            console.log("set up mapDeferred anonymous method");
            mapDeferred.then(function (response) 
            {
                console.log("mapDeferred.then");
                if(previousSelectedWebMapId != selectedWebMapId)
                {
                    previousSelectedWebMapId = selectedWebMapId;
                    //dojo.destroy(map.container);
                }
                if(aMap)
                {
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
                if (aMap.loaded) {
                    initUI();
                } else {
                    dojo.connect(map, "onLoad", initUI);
                }       
              }, function(error){
                    console.log('Create Map Failed: ' , dojo.toJson(error));
              });
        }
            
        function showLoading() 
        {
            utils.showLoading() ;
            aMap.disableMapNavigation();
            aMap.hideZoomSlider();
        }

        function hideLoading(error) 
        {
            utils.hideLoading(error);
            aMap.enableMapNavigation();
            aMap.showZoomSlider();
        }

        function initUI(){   
          //add scalebar or other components like a legend, overview map etc
            var scalebar = new esri.dijit.Scalebar({
                map: aMap,
                scalebarUnit:"english" 
            });    
            console.log("start MapHoster with center " + pointWebMap[0] + ", " + pointWebMap[1]);
            if(mph == null)
            {
                mph = MapHosterArcGIS.start();
                MapHosterArcGIS.config(aMap, zoomWebMap, pointWebMap);
                // mph = new MapHosterArcGIS(window.map, zoomWebMap, pointWebMap); 
                pusher = new PusherClient(mph, pusherChannel, null);     
            }
            else
            {
                currentPusher = mph.pusher;
                currentChannel = mph.channel;
                mph = MapHosterArcGIS.start();
                MapHosterArcGIS.config(aMap, zoomWebMap, pointWebMap);
                resizeWebSiteVertical(true);
                // mph = new MapHosterArcGIS(window.map, zoomWebMap, pointWebMap);
                mph.setPusherClient(currentPusher, currentChannel);
            }
        }
                     
        function dialogDestinationWindowSelector(title, message, sameLabel, newLabel, 
                onSameLabel, onNewLabel, onNo, width, height) 
        {
            dijit.byId('idDialogButtonSameWindow').set("style", "color:crimson;font-weight:bold");
            dijit.byId('idDialogButtonSameWindow').set("label", sameLabel);
            dojo.byId('idDialogButtonSameWindow').onclick  = onSameLabel;
            dijit.byId('idDialogButtonNewWindow').set("style", "color:#131313;font-weight:bold");
            dijit.byId('idDialogButtonNewWindow').set("label", newLabel);
            dojo.byId('idDialogButtonNewWindow').onclick  = onNewLabel;
            document.getElementById('idDialogContainer').style.width=width;
            document.getElementById('idDialogContainer').style.height=height;
            var p = dijit.byId('idWindowSelectionDialog');
            p.set( "title", title );
            dojo.byId('idDialogText').innerHTML = message;
            p.execute = dojo.hitch( p, function() 
            {
                if( dojo.isObject( arguments ) ) 
                {
                    // var arg0Str = arguments[0].toString();
                    // console.log(arg0Str);
                    // var arg0Val = arguments[0].valueOf();
                    // console.log(arg0Val);
                    // onSameLabel();
                } 
                else 
                {
                    onNo();
                }
            });
            p.show();
        }
                    
        function initializePreProc()
        {
            console.log('initializePreProc entered');
            var urlparams=dojo.queryToObject(window.location.search); 
            console.debug(urlparams);
            var idWebMap=urlparams['?id'];
            console.debug(idWebMap);
            // initUI();
            if(! idWebMap)
            {
                console.log("no idWebMap");
                selectedWebMapId = "e39fa319c45c483aa2ba93595583c1d5"; //"e68ab88371e145198215a792c2d3c794";
                console.log("use " + selectedWebMapId);
                // pointWebMap = [-87.7, lat=41.8];
                pointWebMap = [-87.7, 41.8];
                zoomWebMap = 13;
                initialize(selectedWebMapId, false, "");
            }
            else
            {
                console.log("found idWebMap");
                console.log("use " + idWebMap);
                initialize(idWebMap, false, "");
            }
        }


        function StartupArcGIS() {
        };
        function init() {
            console.log('StartupArcGIS init');
            return StartupArcGIS;
        }

        return { start: init, config : initializePreProc, getMap: getMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal,
                 resizeMapPane: resizeMapPane};

    });

}).call(this);

// dojo.ready(initializePreProc);