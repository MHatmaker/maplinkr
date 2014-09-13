
var details = {
    locationPath : "/",
    webmapId : "a4bb8a91ecfb4131aa544eddfbc2f1d0 ",
    masherChannel : "private-channel-mashover"
};
    

(function () {
    'use strict';
    console.debug('AgoNewWindowConfig.js setup method');
   /*  
    var locationPath = "/";
    //var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
    console.log(location.pathname);
    console.log(location.search);
    console.log(locationPath);
    console.log("webmapId " + webmapId + " channel " + masherChannel);
 */
    define([
    ], function (Color, Symbol) {
            console.debug('AgoNewWindowConfig define fn');
            
            function setLocationPath(locPath){
                console.log("setLocationPath from " + details.locationPath + " to " + locPath);
                details.locationPath = locPath.substring(0);
                console.log("copied to details : " + details.locationPath);
                //var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
            };
            function getParameterByName(name) {
                console.log("get location from " + details.locationPath);
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(details.locationPath);
                return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            };

        return {
            testUrlArgs: function(args){
                var rslt = getParameterByName('id');
                // alert("getParameterByName('id') = " + rslt);
                // alert(rslt.length);
                // alert(rslt.length != 0);
                
                console.log("getParameterByName('id') = " + rslt);
                console.log(rslt.length);
                console.log(rslt.length != 0);
                return getParameterByName('id').length != 0;
            },
            masherChannel: function (newWindow) {
                return newWindow ? getParameterByName('channel') : details.masherChannel;
            },
            webmapId: function (newWindow) {
                return newWindow ? getParameterByName('id') : details.webmapId;
            },
            locationPath : function (locPath){
                setLocationPath(locPath);
            },
            lon: function(){
                return getParameterByName('lon');
            },
            lat: function(){
                return getParameterByName('lat');
            },
            zoom: function(){
                return getParameterByName('zoom');
            }
        };
    });

}).call(this);