/*global require*/
/*global define*/
/*global L*/
/*global dojo*/
/*global google*/

(function () {
    "use strict";
    // require(['lib/MapHosterLeaflet']);

    console.log('StartupLeaflet setup');
    define([
        'lib/MapHosterLeaflet',
        'controllers/StompSetupCtrl',
        'lib/AgoNewWindowConfig'
    ], function (MapHosterLeaflet, StompSetupCtrl, AgoNewWindowConfig) {
        console.log('StartupLeaflet define');
        var
            lMap,
            // mph = null,
            newSelectedWebMapId = "",
            pusher = null,
            pusherChannel = null;
/*
        function configit(nmpid) {
            console.log("nmpid " + nmpid);
        }
*/
        function getMap() {
            return lMap;
        }

        function openAGOWindow(channel, userName) {
            var url = "?id=" + newSelectedWebMapId + MapHosterLeaflet.getGlobalsForUrl() + "&channel=" + channel + "&userName=" + userName;
            console.log("open new ArcGIS window with URI " + url);
            console.log("using channel " + channel + " with user name " + userName);
            AgoNewWindowConfig.setUrl(url);
            AgoNewWindowConfig.setChannel(channel);
            AgoNewWindowConfig.userName(userName);
            window.open(AgoNewWindowConfig.gethref() + "arcgis/" + url, newSelectedWebMapId, AgoNewWindowConfig.getSmallFormDimensions());
        }
/*
        openNewDisplay = function (channel, userName) {
            url = "?id=" + newSelectedWebMapId + curmph.getGlobalsForUrl() +
                "&channel=" + channel + "&userName=" + userName +
                "&maphost=ArcGIS" + "&referrerId=" + AgoNewWindowConfig.getUserId();
            if (referringMph) {
                url = "?id=" + newSelectedWebMapId + referringMph.getGlobalsForUrl() +
                    "&channel=" + channel + "&userName=" + userName +
                    "&maphost=Leaflet" + "&referrerId=" + AgoNewWindowConfig.getUserId();
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
*/
        function configure(newMapId) {
            var $inj = angular.injector(['app']),
                evtSvc = $inj.get('StompEventHandlerService');
            newSelectedWebMapId = newMapId;
            window.loading = dojo.byId("loadingImg");
            console.log(window.loading);
            console.log("newSelectedWebMapId " + newMapId);
            if (newSelectedWebMapId !== null) {
                if (AgoNewWindowConfig.isChannelInitialized() === false) {
                    evtSvc.addEvent('client-MapXtntEvent', MapHosterLeaflet.retrievedBounds);
                    evtSvc.addEvent('client-MapClickEvent',  MapHosterLeaflet.retrievedClick);

                    StompSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                        AgoNewWindowConfig.getUserName(), function (channel, userName) {
                            AgoNewWindowConfig.setUserName(userName), openNewDisplay,
                                {'destination' : displayDestination, 'currentMapHolder' : curmph, 'newWindowId' : newSelectedWebMapId};
                            openAGOWindow(channel, userName);
                        });
                } else {
                    openAGOWindow(AgoNewWindowConfig.masherChannel(false));
                }
            } else {
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
                MapHosterLeaflet.start();
                MapHosterLeaflet.config(lMap);

                pusherChannel = AgoNewWindowConfig.masherChannel(false);
                console.debug(pusherChannel);
                pusher = StompSetupCtrl.createPusherClient(
                    {
                        'client-MapXtntEvent' : MapHosterLeaflet.retrievedBounds,
                        'client-MapClickEvent' : MapHosterLeaflet.retrievedClick,
                        'client-NewMapPosition' : MapHosterLeaflet.retrievedNewPosition
                    },
                    pusherChannel,
                    AgoNewWindowConfig.getUserName(),
                    function (channel, userName) {
                        AgoNewWindowConfig.setUserName(userName);
                    },
                    null
                    // {'destination' : displayDestination, 'currentMapHolder' : curmph, 'newWindowId' : newSelectedWebMapId}
                );
                if (!pusher) {
                    console.log("createPusherClient failed in StartupLeaflet");
                }
            }
        }

        function StartupLeaflet() {
            console.log("StartupLeaflet unused block");
        }

        function init() {
            console.log('StartupLeaflet init');
            return StartupLeaflet;
        }

        return {
            start: init,
            config : configure,
            getMap: getMap,
        };

    });
}());
