
var details = {
    locationPath : "/",
    search: "/",
    webmapId : "a4bb8a91ecfb4131aa544eddfbc2f1d0 ",
    masherChannel : "private-channel-mashchannel",
    masherChannelInitialized : false,
    protocol : 'http',
    host : '', //"http://localhost",
    hostport : '3035',
    href : '', //"http://localhost",
    url: '',
    lat : '',
    lon : '',
    zoom : '',
    destPref : '',
    maphost : '',
    query : '',
    bounds : {'llx' : '', 'lly' : '', 'urx' : '', 'ury' : ''},
    userId : null,
    referrerId : null
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
            
            function search(searchDetails){
                console.log("setSearch from " + details.search + " to " + searchDetails);
                details.search = searchDetails.substring(0);
                console.log("copied to details : " + details.search);
                //var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
            };
            function getParameterByName(name) {
                console.log("get paramater " + name + " from " + details.search);
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(details.search);
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
                return rslt.length != 0;
            },
            masherChannel: function (newWindow) {
                // alert(getParameterByName('channel'));
                // alert(details.masherChannel);
                return newWindow ? getParameterByName('channel') : details.masherChannel;
            },
            setChannel : function(chnl){
                if(masherChannelInitialized == false){
                    details.masherChannelInitialized = true;
                }
                details.masherChannel = chnl;
            },
            isChannelInitialized : function(){
                return details.masherChannelInitialized;
            },
            webmapId: function (newWindow) {
                return newWindow ? getParameterByName('id') : details.webmapId;
            },
            setWebmapId : function (id){
                details.webmapId = id;
            },
            setLocationPath : function (locPath){
                details.locationPath = locPath;
            },
            getLocationPath: function(){
                return details.locationPath;
            },
            setSearch : function (searchDetails){
                details.search = searchDetails;
            },
            lon: function(){
                return getParameterByName('lon');
            },
            lat: function(){
                return getParameterByName('lat');
            },
            zoom: function(){
                return getParameterByName('zoom');
            },
            maphost: function(){
                return getParameterByName('maphost');
            },
            query: function(){
                return getParameterByName('gmquery');
            },
            setPosition: function(position){
                details.lon = position.lon;
                details.lat = position.lat;
                details.zoom = position.zoom;
            },
            getPosition: function(){
                return {"webmapId" : details.webmapId, "lon" : details.lon, "lat" : details.lat, "zoom" : details.zoom};
            },
            sethref: function(hrf){
                console.log("sethref : " + hrf);
                details.href = hrf;
                console.log("details href : " + details.href);
            },
            gethref: function(){
                var pos = details.href.indexOf("/arcgis");
                if(pos  > -1){
                    return details.href; //.substring(0, pos);
                }
                return details.href;
            },
            sethost: function(h){
                details.host = h;
                console.log("host : " + details.host);
            },
            gethost: function(){
                return details.host;
            },
            setprotocol: function(p){
                details.protocol = p;
                console.log("protocol : " + details.protocol);
            },
            getprotocol: function(){
                return details.protocol;
            },
            sethostport: function(hp){
                details.hostport = hp;
                console.log("hostport : " + details.hostport);
            },
            gethostport: function(){
                return details.hostport;
            },
            getbaseurl : function(){
                var baseurl = details.protocol + "//" + details.host + "/";
                console.log( "getbaseurl --> " + baseurl);
                return baseurl;
            },
            setUrl: function(u){
                details.url = u;
            },
            getUrl: function(){
                return details.url;
            },
            setMapHost: function(h){
                details.maphost = h;
            },
            getMapHost: function(){
                return details.maphost;
            },
            setQuery: function(q){
                details.query = q;
            },
            getQuery: function(){
                return details.query;
            },
            setBounds : function(bnds){
                details.bounds = bnds;
            },
            getBoundsForUrl : function(){
                var bnds = details.bounds;
                var bndsUrl = "&llx=" + bnds.llx + "&lly=" + bnds.lly + "&urx=" + bnds.urx + "&ury=" + bnds.ury;
                return bndsUrl;
            },
            getBoundsFromUrl : function(){
                var llx = getParameterByName('llx');
                var lly = getParameterByName('lly');
                var urx = getParameterByName('urx');
                var ury = getParameterByName('ury');
                return {'llx' : llx, 'lly' : lly, 'urx' : urx, 'ury' : ury};
            },
            getUpdatedUrl : function(){
                var updatedUrl = String.format("?id={0}&lon={1}&lat={2}&zoom={3}&channel={4}", details.webmapId,details.lon, details.lat, details.zoom, details.masherChannel);
                console.log(updatedUrl);
                return updatedUrl;
            },
            getDestinationPreference : function(){
                return details.destPref;
            },
            setDestinationPreference : function(pref){
                details.destPref = pref;
            },
            getUserId : function(){
                return details.userId;
            },
            setUserId : function(id){
                details.userId = id;
            },
            getReferrerId : function(){
                return details.referrerId;
            },
            getReferrerIdFromUrl : function(){
                details.referrerId = getParameterByName('referrerId');
                return details.referrerId;
            },
            setReferrerId : function(id){
                details.referrerId = id;
            },
            showConfigDetails: function(){ referrerId
                console.log(
                    "userId : "  + details.userId + "\n" +
                    "referrerId : "  + details.referrerId + "\n" +
                    "locationPath : "  + details.locationPath + "\n" +
                    "host : "  + details.host + "\n" +
                    "hostport : "  + details.hostport + "\n" +
                    "href : "  + details.href + "\n"  +
                    "search : "  + details.search + "\n" +
                    "maphost : "  + details.maphost + "\n" +
                    "webmapId : "  + details.webmapId + "\n" +
                    "masherChannel : "  + details.masherChannel + "\n" +
                    "lon :" + details.lon + '\n' +
                    "lat : " + details.lat + "\n" +
                    "zoom : " + details.zoom);
                    
            }
        };
    });

}).call(this);