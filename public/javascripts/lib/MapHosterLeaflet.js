
// define('leaflet', function () {
    // if (leaflet) {
        // return leaflet;
    // }
    // return {};
// });

(function() {
    "use strict";
    require(["lib/utils", 'angular']);

    define(['http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js', 'angular', 'controllers/PositionViewCtrl'], 
    
        function(leaflet, angular, PositionViewCtrl) {

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
            mphmap.setView([41.8, -87.7], 13);
            console.log( mphmap.getCenter().lng + " " +  mphmap.getCenter().lat);
            
            updateGlobals("init", -87.7, 41.8, 13, 0.0);
            // self.updateGlobals("ctor", -0.09, 51.50, 13, 0.0);
            showGlobals("Prior to new Map");

            var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            // L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
            L.tileLayer(osmUrl, {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
            }).addTo(mphmap);

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
                setBounds('pan', e.latlng);}  );
            // mphmap.on("loading", function( e ) {
                // showLoading()};  );
            // mphmap.on("load", function( e ) {
                // hideLoading()};  );
        }
        // function showLoading(){
            // utils.showLoading();
        // }
        // function hideLoading(){
            // utils.hideLoading();
        // }
        
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
          /*   
            var view = "Zoom : " + zm + " Scale : " + scale2Level[zm].scale + " Center : " + cntrlng + ", " + cntrlat + " Current: " + evlng + ", " + evlat;
            document.getElementById("mppos").value = view;
             */
            PositionViewCtrl.update({
                'zm' : zm,
                'scl' : scl,
                'cntrlng' : cntrlng,
                'cntrlat': cntrlat,
                'evlng' : evlng,
                'evlat' : evlat
            });
        }
        function onMapClick(e) 
        {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(mphmap);
        }

        function setBounds(action, latlng)
        {
            // if(self.pusher && self.pusher.ready == true)
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
                userZoom = true;
                if(xj.action == 'pan')
                    mphmap.setView(cntr, zm);
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
            }
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
            var gmBounds = mphmap.getBounds();
            console.debug(gmBounds);
            if(gmBounds)
            {
                var ne = gmBounds.getNorthEast();
                var sw = gmBounds.getSouthWest();
                bounds = gmBounds;
                gmBounds.xmin = sw.lng;
                gmBounds.ymin = sw.lat;
                gmBounds.xmax = ne.lng;
                gmBounds.ymax = ne.lat;
            }
            zmG = zm; cntrxG = cntrx; cntryG = cntry;
            console.log("Updated Globals " + msg + " " + cntrxG + ", " + cntryG + " : " + zmG);
            PositionViewCtrl.update({
                'zm' : zmG,
                'scl' : scale2Level[zmG].scale,
                'cntrlng' : cntrxG,
                'cntrlat': cntryG,
                'evlng' : cntrxG,
                'evlat' : cntryG
            });
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

        function markerInfoPopup(pos, content, title)
        {
            var allContent = '<h3>' + title + '</h3>' + content;
            L.marker(pos).addTo(mphmap)
                .bindPopup(allContent).openPopup();
        }

        function addInitialSymbols()
        {   
            var content = "Great home with spectacular view of abandoned industrial site";
            markerInfoPopup([41.795, -87.695], content, "Prime home for sale");
            content = "Perfect hangout for the undiscriminating cave dweller";
            markerInfoPopup([41.805, -87.705], content, "Perfection in Paradise");
            
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

        // MapHosterLeaflet.prototype.setPusherClient = function (pusher, channel)
        function setPusherClient(pusher, channel)
        {   
            selfPusherDetails.pusher = pusher;
            selfPusherDetails.channel = channel;
        }
        // MapHosterLeaflet.prototype.getGlobalsForUrl = function()
        function getGlobalsForUrl()
        {
            console.log(" MapHosterLeaflet.prototype.getGlobalsForUrl");
            console.log("&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG);
            return "&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG; 
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
            mphmap.invalidateSize(true);
        }
        function resizeVerbageHorizontal(isMapExpanded){
            console.log('resizeVerbageHorizontal');
            mphmap.invalidateSize(true);
        }

        return { start: init, config : configureMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal,
                  retrievedBounds: retrievedBounds, setPusherClient: setPusherClient, getGlobalsForUrl: getGlobalsForUrl };
    });

}).call(this);

    