
(function () {
    'use strict';
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
            var locationPath = "/";
            var webmapId = "a4bb8a91ecfb4131aa544eddfbc2f1d0 ";
            var masherChannel = "private-channel-mashover";
    
            function setLocationPath(locpath){
                console.log("setLocationPath from " + locationPath + " to " + locPath);
                locationPath = locpath;
                //var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
            };
            function getParameterByName(name) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
                return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            };

        return {
            testUrlArgs: function(args){
                return getParameterByName('id') != null;
            },
            masherChannel: function (newWindow) {
                return newWindow ? getParameterByName('channel') : masherChannel;
            },
            webmapId: function (newWindow) {
                return newWindow ? getParameterByName('id') : webmapId;
            },
        };
    });

}).call(this);