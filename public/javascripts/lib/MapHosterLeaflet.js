
// define('leaflet', function () {
    // if (leaflet) {
        // return leaflet;
    // }
    // return {};
// });
define('GeoCoder', function () {
    if (GeoCoder) {
        return GeoCoder;
    }
    return {};
});
    
(function() {
    "use strict";
    console.log("ready to require stuff in MapHosterLeaflet");
    require(['http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js', "lib/utils", 'angular', 'lib/GeoCoder']);

    define(['controllers/PositionViewCtrl', 'lib/GeoCoder', 'lib/utils', 'lib/AgoNewWindowConfig'], 
    
        function(PositionViewCtrl, GeoCoder, utils, AgoNewWindowConfig) {

        var scale2Level = [],
            zmG,
            userZoom = true,
            mphmapCenter,
            cntrxG,
            cntryG,
            bounds,
            minZoom,
            maxZoom,
            zoomLevels,
            channel,
            pusher,
            popup,
            geoCoder,
            marker,
            mphmap;
        var selfPusherDetails = {
            channel : null,
            pusher : null
        };
                    
        function configureMap(lmap) 
        {
            console.debug("ready to show mphmap");
            mphmap = lmap; //L.map('map_canvas').setView([51.50, -0.09], 13);
            console.debug(mphmap);
            showLoading();
                        
			geoCoder =  GeoCoder; //.nominatim();
            
            if(AgoNewWindowConfig.testUrlArgs()){
                var qlat = AgoNewWindowConfig.lat();
                var qlon = AgoNewWindowConfig.lon();
                var qzoom = AgoNewWindowConfig.zoom();;
                mphmap.setView([qlat, qlon], qzoom);
                updateGlobals("init with qlon, qlat", qlon, qlat, qzoom);
             }
             else{
                mphmap.setView([41.8, -87.7], 13);
                updateGlobals("init with hard-coded values", -87.7, 41.8,  13);
             }
             console.log( mphmap.getCenter().lng + " " +  mphmap.getCenter().lat);
             
            showGlobals("Prior to new Map");

            var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            // L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
            var lyr = L.tileLayer(osmUrl, {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
            }).addTo(mphmap);
            lyr.on("loading", function( e ) {
                    showLoading()}  );
            lyr.on("load", function( e ) {
                    hideLoading()}  );

            minZoom = mphmap.getMinZoom();
            maxZoom = mphmap.getMaxZoom();
            zoomLevels = maxZoom - minZoom + 1;
            collectScales();
            bounds = mphmap.getBounds(); // returns LatLngBounds  -- also check getBoundsZoom(bounds, inside? bool)
            
            addInitialSymbols();
            
            console.log("again " + mphmap.getCenter().lng + " " +  mphmap.getCenter().lat);
            mphmapCenter = mphmap.getCenter();
            mphmap.on("mousemove", function( e ) {
                onMouseMove(e);}  );
            mphmap.on("click", function( e ) {
                onMapClick(e);}  );
            mphmap.on("zoomend", function( e ){
                if(userZoom == true)
                {
                    setBounds('zoom', null);
                }
            });
            
            mphmap.on("moveend", function( e ) {
                if(userZoom == true){
                    setBounds('pan', e.latlng);
                }
            });
        }
        function showLoading(){
            utils.showLoading();
        }
        function hideLoading(){
            utils.hideLoading();
        }
        
        function onMouseMove( e) 
        {
            var ltln = e.latlng;
            var fixedLL = utils.toFixed(ltln.lng,ltln.lat, 3);
            var evlng = fixedLL.lon;
            var evlat = fixedLL.lat;
            var zm = mphmap.getZoom();
            var cntr = mphmap.getCenter();
            var fixedCntrLL = utils.toFixed(cntr.lng,cntr.lat, 3);
            var cntrlng = fixedCntrLL.lon;
            var cntrlat = fixedCntrLL.lat;
             
            PositionViewCtrl.update('coords', {
                'zm' : zm,
                'scl' : scale2Level[zm].scale,
                'cntrlng' : cntrlng,
                'cntrlat': cntrlat,
                'evlng' : evlng,
                'evlat' : evlat
            });
        }
        
        function showClickResult(r){
            if (r) {
                console.log("showClickResultp at " + r.lat + ", " + r.lon);
                var cntr = new L.latLng(r.lat, r.lon, 0);
                if (marker) {
                    marker.closePopup();
                    marker.
                        setLatLng(cntr).
                        setPopupContent(r.display_name).
                        openPopup();
                } else {
                    marker = L.marker(cntr).bindPopup(r.display_name).addTo(mphmap).openPopup();
                }
                if(selfPusherDetails.pusher){
                    var fixedLL = utils.toFixed(r.lon, r.lat, 6);
                    var referrerId = AgoNewWindowConfig.getUserId();
                    var pushLL = {"x" : fixedLL.lon, "y" : fixedLL.lat, "z" : "0",
                        "referrerId" : referrerId };
                    console.log("You, " + referrerId + ", clicked the map at " + r.lat + ", " + r.lon);
                    console.debug(pushLL);
                    selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
                }
            }
        }
            
        function onMapClick(e) 
        {
			geoCoder.reverse(e.latlng, mphmap.options.crs.scale(mphmap.getZoom())).
                then(function(results) {
				var r = results;
				showClickResult(r);
            });
        }

        function setBounds(action, latlng)
        {
            // runs this code after finishing the zoom
            var xtExt = extractBounds(action, latlng);
            var xtntJsonStr = JSON.stringify(xtExt);
            console.log("extracted bounds " + xtntJsonStr);
            var cmp = compareExtents("setBounds", xtExt);
            if(cmp == false)
            {
                console.log("MapHoster setBounds pusher send to channel " + selfPusherDetails.channel);
                // var sendRet = self.pusher.send(xtntJsonStr, channel);
                if(selfPusherDetails.pusher)
                {
                    selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapXtntEvent', xtExt);
                }
                updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);
                //console.debug(sendRet);
            }
        }
        
        function extractBounds(action, latlng)
        {
            var zm = mphmap.getZoom();
            var scale = mphmap.options.crs.scale(zm);
            var oldMapCenter = mphmapCenter;
            mphmapCenter = mphmap.getCenter();
            // var cntr = action == 'pan' ? latlng : mphmap.getCenter();
            var cntr = mphmap.getCenter();
            var fixedLL = utils.toFixed(cntr.lng,cntr.lat, 3);
            var xtntDict = {'src' : 'leaflet_osm', 
                'zoom' : zm, 
                'lon' : fixedLL.lon, 
                'lat' : fixedLL.lat,
                'scale': scale2Level[zm].scale,
                'action': action};
            return xtntDict;
        }
        
        function retrievedClick(clickPt)
        {
            console.log("Back in retrievedClick - with a click at " +  clickPt.x + ", " + clickPt.y);
            var latlng = L.latLng(clickPt.y, clickPt.x, clickPt.y);
            if(clickPt.referrerId != AgoNewWindowConfig.getUserId()){
                popup
                    .setLatLng(latlng)
                    .setContent("Received Pushed Click from user " + clickPt.referrerId + " at " + latlng.toString())
                    .openOn(mphmap);
            }
        }
        function retrievedBounds(xj)
        {
            console.log("Back in retrievedBounds");
            var zm = xj.zoom
            var cmp = compareExtents("retrievedBounds", {'zoom' : zm, 'lon' : xj.lon, 'lat' : xj.lat});
            var view = xj.lon + ", " + xj.lat + " : " + zm + " " + scale2Level[zm].scale;
            document.getElementById("mppos").innerHTML = view;
            if(cmp == false)
            {
                var tmpLon = cntrxG;
                var tmpLat = cntryG;
                var tmpZm = zmG;
                
                updateGlobals("retrievedBounds with cmp false", xj.lon, xj.lat, xj.zoom);
                userZoom = false;
                var cntr = new L.LatLng(xj.lat, xj.lon);
                
                if(xj.action == 'pan')
                {
                    mphmap.setView(cntr, zm);
                }
                else
                {
                    if(tmpLon != xj.lon || tmpLat != xj.lat)
                    {
                        mphmap.setView(cntr, zm);
                    }
                    else
                    {
                        mphmap.setZoom(zm);
                    }
                }
                userZoom = true;
            }
            
            AgoNewWindowConfig.setPosition({'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG});
        }
        
        function getEventDictionary(){
            var $inj = angular.injector(['app']);
            var evtSvc = $inj.get('StompEventHandlerService');
            var eventDct = evtSvc.getEventDct();
            return eventDct;
        }

        function collectScales()
        {
            console.log('collectScales');
            var zm = mphmap.getZoom();
            scale2Level = [];
            var sc2lv = scale2Level;
            for(var i=0; i<zoomLevels + 1; i++)
            {
                var scale = mphmap.options.crs.scale(i);
                var obj = {"scale" : scale, "level" : i};
                // console.log("scale " + obj.scale + " level " + obj.level);
                sc2lv.push(obj);
            }
        }
         
        // MapHosterLeaflet.prototype.updateGlobals = function(msg, cntrx, cntry, zm)
        function updateGlobals(msg, cntrx, cntry, zm)
        {
            console.log("updateGlobals " + msg);
            var lfltBounds = mphmap.getBounds();
            console.debug(lfltBounds);
            if(lfltBounds)
            {
                var ne = lfltBounds.getNorthEast();
                var sw = lfltBounds.getSouthWest();
                bounds = lfltBounds;
                lfltBounds.xmin = sw.lng;
                lfltBounds.ymin = sw.lat;
                lfltBounds.xmax = ne.lng;
                lfltBounds.ymax = ne.lat;
            }
            zmG = zm; cntrxG = cntrx; cntryG = cntry;
            console.log("Updated Globals " + msg + " " + cntrxG + ", " + cntryG + " : " + zmG);
            PositionViewCtrl.update('zm', {
                'zm' : zmG,
                'scl' : scale2Level.length > 0 ? scale2Level[zmG].scale : 3,
                'cntrlng' : cntrxG,
                'cntrlat': cntryG,
                'evlng' : cntrxG,
                'evlat' : cntryG
            });
            AgoNewWindowConfig.setPosition({'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG});
        }
        
        function showGlobals(cntxt)
        {
            console.log( cntxt + " Globals : lon " + cntrxG + " lat " + cntryG + " zoom " + zmG);
        }

        function compareExtents(msg, xtnt)
        {
            var cmp = xtnt.zoom == zmG;
            var wdth = Math.abs(bounds.xmax - bounds.xmin);
            var hgt = Math.abs(bounds.ymax - bounds.ymin);
            var lonDif = Math.abs((xtnt.lon - cntrxG) / wdth);
            var latDif =  Math.abs((xtnt.lat - cntryG) / hgt);
            // cmp = ((cmp == true) && (xtnt.lon == this.cntrxG) && (xtnt.lat == this.cntryG));
            cmp = ((cmp == true) && (lonDif < 0.0005) && (latDif < 0.0005));
            console.log("compareExtents " + msg + " " + cmp)
            return cmp;
        }

        function markerInfoPopup(pos, content, hint)
        {
            var allContent = '<h3>' + hint + '</h3>' + content;
            L.marker(pos).addTo(mphmap)
                .bindPopup(allContent).openPopup();
        }

        function addInitialSymbols()
        {   
            var hint = "Seanery Beanery Industrial Row";
            markerInfoPopup([41.790, -87.735], "Seanery Beanery with spectacular view of abandoned industrial site", hint);
            hint = "Seanery Beanery For Discriminating Beaners";
            markerInfoPopup([41.810, -87.715], "Seanery Beanery located adjacent to great entertainment venues", hint);
            hint = "Seanery Beanery For Walking Averse";
            markerInfoPopup([41.785, -87.70], "Seanery Beanery located close to the pedicab terminal", hint);
            
            // L.circle([51.508, -0.11], 500, {
                // color: 'red',
                // fillColor: '#f03',
                // fillOpacity: 0.5
            // }).addTo(mphmap).bindPopup("I am a circle.");

            // L.polygon([
                // [51.509, -0.08],
                // [51.503, -0.06],
                // [51.51, -0.047]
            // ], {
                // color: 'blue',
                // fillColor: '#00f',
                // fillOpacity: 0.25
            // }).addTo(mphmap).bindPopup("I am a polygon.");

            popup = L.popup();
        }

        function setPusherClient(pusher, channel)
        {   
            selfPusherDetails.pusher = pusher;
            selfPusherDetails.channel = channel;
            
            var $inj = angular.injector(['app']);
            var evtSvc = $inj.get('StompEventHandlerService');
            var evtDct = evtSvc.getEventDct();
            for (var key in evtDct) {
                    pusher.subscribe( key, evtDct[key]);
                }
            console.log("reset MapHosterLeaflet setPusherClient, selfPusherDetails.pusher " +  selfPusherDetails.pusher);
        }
        // MapHosterLeaflet.prototype.getGlobalsForUrl = function()
        function getGlobalsForUrl()
        {
            console.log(" MapHosterLeaflet.prototype.getGlobalsForUrl");
            console.log("&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG);
            return "&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG; 
        }
        
        
        function publishPosition(pos)
        {
            if(selfPusherDetails.pusher)
            {
                console.log("MapHosterLeaflet.publishPosition");
                // pos['maphost'] = 'Leaflet';
                console.log(pos);
                
                var lfltBounds = mphmap.getBounds();
                console.debug(lfltBounds);
                if(lfltBounds)
                {
                    var ne = lfltBounds.getNorthEast();
                    var sw = lfltBounds.getSouthWest();
                    bounds = lfltBounds;
                    lfltBounds.xmin = sw.lng;
                    lfltBounds.ymin = sw.lat;
                    lfltBounds.xmax = ne.lng;
                    lfltBounds.ymax = ne.lat;
                
                    var bnds = {'llx' :sw.lng, 'lly' : sw.lat,
                                 'urx' : ne.lng, 'ury' : ne.lat};
                    AgoNewWindowConfig.setBounds(bnds);
                }
                
                var bnds = AgoNewWindowConfig.getBoundsForUrl();
                pos.search += bnds;
                
                selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-NewMapPosition', pos);
            }
                
        }
        
        function getCenter(){
            var pos = { 'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG};
            console.log("return accurate center from getCenter()");
            console.debug(pos);
            return pos;
        }
        
        function MapHosterLeaflet()
        {
            var self = this;
            this.pusher = null;
            // selfPusherDetails.pusher = null;
            userZoom = true;
                            
            // this.getGlobalsForUrl = function()
            // {
                // return "&lon=" + this.cntrxG + "&lat=" + this.cntryG + "&zoom=" + this.zmG; 
            // }
        }
        
        function init() {
            return MapHosterLeaflet;
        }
        
        
        function resizeWebSiteVertical(isMapExpanded){
            console.log('resizeWebSiteVertical');
            mphmap.invalidateSize(false);
        }
        function resizeVerbageHorizontal(isMapExpanded){
            console.log('resizeVerbageHorizontal');
            mphmap.invalidateSize(false);
        }

        return { start: init, config : configureMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal,
                  retrievedBounds: retrievedBounds, retrievedClick: retrievedClick, 
                  setPusherClient: setPusherClient, getGlobalsForUrl: getGlobalsForUrl,
                  getEventDictionary : getEventDictionary, publishPosition : publishPosition, getCenter : getCenter };
    });

}).call(this);

    