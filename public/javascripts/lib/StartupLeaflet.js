
(function() {
    "use strict";
    // require(['lib/MapHosterLeaflet']);

    console.log('StartupLeaflet setup');
    define([
        'lib/MapHosterLeaflet', 
        'controllers/StompSetupCtrl',
        'lib/AgoNewWindowConfig'
    ], function(MapHosterLeaflet, StompSetupCtrl, AgoNewWindowConfig) {
        console.log('StartupLeaflet define');
        var CHANNEL = '/mapxtnt/';
        var mph = null; 
        var lMap = null;
        var loading;
        var newSelectedWebMapId = "";
        var pusherChannel = null;
        var pusher = null;
        
        function configit(nmpid){
            console.log("nmpid " + nmpid);
        }
        function getMap(){
            return lMap;
        }
        
        function resizeWebSiteVertical(isMapExpanded){
            MapHosterLeaflet.resizeWebSite(isMapExpanded);
        }
        function resizeVerbageHorizontal(isMapExpanded){
            MapHosterLeaflet.resizeVerbage(isMapExpanded);
        }
        function resizeMapPane(isMapExpanded){
            console.log("StartupLeaflet : invalidateSize");
            // lMap.invalidateSize(true);
        }
        function configure(newMapId) 
        {
            newSelectedWebMapId = newMapId;
            window.loading = dojo.byId("loadingImg")
            console.log(window.loading);
            console.log("newSelectedWebMapId " + newMapId);
            if( newSelectedWebMapId !== null)
            {
                if(AgoNewWindowConfig.isChannelInitialized() == false){
                    var $inj = angular.injector(['app']);
                    var evtSvc = $inj.get('StompEventHandlerService');
                    evtSvc.addEvent('client-MapXtntEvent', MapHosterLeaflet.retrievedBounds);
                    evtSvc.addEvent('client-MapClickEvent',  MapHosterLeaflet.retrievedClick);
                    
                    StompSetupCtrl.setupPusherClient(evtSvc.getEventDct(), function(channel, userName){
                        AgoNewWindowConfig.setUserName(userName);
                        openAgoWindow(channel, userName);
                        });
                }
                else{
                    openAgoWindow(AgoNewWindowConfig.masherChannel(false));
                }
            }
            else
            {
                var $inj = angular.injector(['app']);
                var evtSvc = $inj.get('StompEventHandlerService');
                evtSvc.addEvent('client-MapXtntEvent', MapHosterLeaflet.retrievedBounds);
                evtSvc.addEvent('client-MapClickEvent',  MapHosterLeaflet.retrievedClick);
                
                // lMap = new L.Map('map_canvas', {loadingControl: true}); //.setView([41.8, -87.7], 13);
                lMap = new L.Map('map_canvas'); //.setView([41.8, -87.7], 13);
                // console.debug(lMap);
                // var loadingControl = L.Control.loading({
                    // spinjs: true
                // });
                // lMap.addControl(loadingControl);
                // var lMap = L.map('map').setView([51.50, -0.09], 13);
                // mph = new MapHosterLeaflet(lMap); 
                mph = MapHosterLeaflet.start(); 
                MapHosterLeaflet.config(lMap);
                 
                pusherChannel = AgoNewWindowConfig.masherChannel(false);
                console.debug(pusherChannel);
                pusher = StompSetupCtrl.createPusherClient(
                        {'client-MapXtntEvent' : MapHosterLeaflet.retrievedBounds,
                        'client-MapClickEvent' : MapHosterLeaflet.retrievedClick,
                        'client-NewMapPosition' : MapHosterLeaflet.retrievedNewPosition},
                        pusherChannel,  
                        "NoNameYet",
                        function(channel, userName){
                                AgoNewWindowConfig.setUserName(userName);
                                }
                        );
            }
        }
        
        function openAGOWindow(channel, userName){
            var url = "?id=" + newSelectedWebMapId + MapHosterLeaflet.getGlobalsForUrl() + "&channel=" + channel + "&userName=" + userName;
            console.log("open new ArcGIS window with URI " + url);
            console.log("using channel " + channel + " with user name " + userName);
            AgoNewWindowConfig.setUrl(url);
            AgoNewWindowConfig.setChannel(channel);
            AgoNewWindowConfig.userName(userName);
            window.open(AgoNewWindowConfig.gethref() + "arcgis/" + url, newSelectedWebMapId, AgoNewWindowConfig.getSmallFormDimensions());
        }

        function StartupLeaflet() {
        };
        function init() {
            console.log('StartupLeaflet init');
            return StartupLeaflet;
        }

        return { start: init, config : configure, getMap: getMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal,
                 resizeMapPane: resizeMapPane};

    });

}).call(this);

