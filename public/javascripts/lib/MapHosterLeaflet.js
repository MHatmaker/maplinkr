
// define('leaflet', function () {
    // if (leaflet) {
        // return leaflet;
    // }
    // return {};
// });

(function() {
    "use strict";
    require(["lib/utils", 'angular']);

    define(['http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js', 'angular'], function(leaflet, angular) {

        var mph = null,
            scale2Level = [],
            zmG,
            cntrxG,
            cntryG,
            bounds,
            channel,
            pusher;
            
        function configureMap(lmap) 
        {
            console.debug("ready to show mph");
            console.debug(mph);
            mph.map = lmap; //L.map('map_canvas').setView([51.50, -0.09], 13);
            console.debug(mph.map);
            mph.map.setView([41.8, -87.7], 13);
            console.log( mph.map.getCenter().lng + " " +  mph.map.getCenter().lat);
            
            mph.updateGlobals("init", -87.7, 41.8, 13, 0.0);
            // self.updateGlobals("ctor", -0.09, 51.50, 13, 0.0);
            mph.showGlobals("Prior to new Map");

            var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            // L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
            L.tileLayer(osmUrl, {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
            }).addTo(mph.map);

            mph.minZoom = mph.map.getMinZoom();
            mph.maxZoom = mph.map.getMaxZoom();
            mph.zoomLevels = mph.maxZoom - mph.minZoom + 1;
            mph.collectScales();
            mph.bounds = mph.map.getBounds(); // returns LatLngBounds  -- also check getBoundsZoom(bounds, inside? bool)
            
            mph.addInitialSymbols();
            
            console.log("again " + mph.map.getCenter().lng + " " +  mph.map.getCenter().lat);
            mph.mapCenter = mph.map.getCenter();
            mph.map.on("mousemove", function( e ) {
                onMouseMove(e);}  );
            mph.map.on("click", function( e ) {
                onMapClick(e);}  );
            mph.map.on("zoomend", function( e ){
                if(mph.userZoom == true)
                {
                    mph.setBounds('zoom', null);
                }
                });
            
            mph.map.on("moveend", function( e ) {
                setBounds('pan', e.latlng);}  );
            // mph.map.on("loading", function( e ) {
                // showLoading()};  );
            // mph.map.on("load", function( e ) {
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
            var zm = mph.map.getZoom();
            var cntr = mph.map.getCenter();
            var fixedCntrLL = utils.toFixed(cntr.lng,cntr.lat, 3);
            var cntrlng = fixedCntrLL.lon;
            var cntrlat = fixedCntrLL.lat;
            var view = cntrlng + ", " + cntrlat + " : " + evlng + ", " + evlat + " : " + 
                zm + " " + scale2Level[zm].scale;
            document.getElementById("mppos").innerHTML = view;
        }
        function onMapClick(e) 
        {
            mph.popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(mph.map);
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
                    console.log("MapHoster setBounds pusher send to channel " + channel);
                    // var sendRet = self.pusher.send(xtntJsonStr, channel);
                    if(pusher)
                    {
                        pusher.channel(channel).trigger('client-MapXtntEvent', xtExt);
                    }
                    mph.updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);
                    //console.debug(sendRet);
                }
            }
        }
        
        function extractBounds(action, latlng)
        {
            var zm = mph.map.getZoom();
            var scale = mph.map.options.crs.scale(zm);
            var oldMapCenter = mph.mapCenter;
            mph.mapCenter = mph.map.getCenter();
            // var cntr = action == 'pan' ? latlng : this.map.getCenter();
            var cntr = mph.map.getCenter();
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
            var cmp = mph.compareExtents("retrievedBounds", {'zoom' : zm, 'lon' : xj.lon, 'lat' : xj.lat});
            var view = xj.lon + ", " + xj.lat + " : " + zm + " " + self.scale2Level[zm].scale;
            document.getElementById("mpnm").innerHTML = view;
            if(cmp == false)
            {
                var tmpLon = mph.cntrxG;
                var tmpLat = mph.cntryG;
                var tmpZm = mph.zmG;
                
                mph.updateGlobals("retrievedBounds with cmp false", xj.lon, xj.lat, xj.zoom);
                mph.userZoom = false;
                var cntr = new L.LatLng(xj.lat, xj.lon);
                mph.userZoom = true;
                if(xj.action == 'pan')
                    // mph.map.panTo(cntr);
                    mph.map.setView(cntr, zm);
                else
                {
                    if(tmpLon != xj.lon || tmpLat != xj.lat)
                    {
                        mph.map.setView(cntr, zm);
                    }
                    else
                    {
                        mph.map.setZoom(zm);
                    }
                }
                // mph.userZoom = true;
            }
            //mph.map.setView(cntr, zm);
        }

            

        MapHosterLeaflet.prototype.collectScales = function()
        {
            console.log('collectScales');
            var zm = this.map.getZoom();
            scale2Level = [];
            var sc2lv = scale2Level;
            for(var i=0; i<this.zoomLevels + 1; i++)
            {
                var scale = this.map.options.crs.scale(i);
                var obj = {"scale" : scale, "level" : i};
                // console.log("scale " + obj.scale + " level " + obj.level);
                sc2lv.push(obj);
            }
        }
         
        MapHosterLeaflet.prototype.updateGlobals = function(msg, cntrx, cntry, zm)
        {
            console.log("updateGlobals " + msg);
            var gmBounds = this.map.getBounds();
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
        }

        MapHosterLeaflet.prototype.showGlobals = function(cntxt)
        {
            console.log( cntxt + " Globals : lon " + this.cntrxG + " lat " + this.cntryG + " zoom " + this.zmG);
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

        MapHosterLeaflet.prototype.markerInfoPopup = function(pos, content, title)
        {
            var allContent = '<h3>' + title + '</h3>' + content;
            L.marker(pos).addTo(this.map)
                .bindPopup(allContent).openPopup();
        }

        MapHosterLeaflet.prototype.addInitialSymbols = function ()
        {   
            var content = "Great home with spectacular view of abandoned industrial site";
            this.markerInfoPopup([41.795, -87.695], content, "Prime home for sale");
            content = "Perfect hangout for the undiscriminating cave dweller";
            this.markerInfoPopup([41.805, -87.705], content, "Perfection in Paradise");
            
            // L.circle([51.508, -0.11], 500, {
                // color: 'red',
                // fillColor: '#f03',
                // fillOpacity: 0.5
            // }).addTo(this.map).bindPopup("I am a circle.");

            // L.polygon([
                // [51.509, -0.08],
                // [51.503, -0.06],
                // [51.51, -0.047]
            // ], {
                // color: 'blue',
                // fillColor: '#00f',
                // fillOpacity: 0.25
            // }).addTo(this.map).bindPopup("I am a polygon.");

            this.popup = L.popup();
        }

        MapHosterLeaflet.prototype.setPusherClient = function (pusher, channel)
        {   
            pusher = pusher;
            channel = channel;
        }
        
        function MapHosterLeaflet()
        {
            var self = this;
            this.pusher = null;
            this.userZoom = true;
                            
            this.getGlobalsForUrl = function()
            {
                return "&lon=" + this.cntrxG + "&lat=" + this.cntryG + "&zoom=" + this.zmG; 
            }
        }
        
        function init() {
            mph = MapHosterLeaflet.prototype;
            return MapHosterLeaflet;
        }
        
        function resizeWebSiteVertical(isMapExpanded){
            console.log('resizeWebSiteVertical');
            mph.map.invalidateSize(true);
        }
        function resizeVerbageHorizontal(isMapExpanded){
            console.log('resizeVerbageHorizontal');
            mph.map.invalidateSize(true);
        }

        return { start: init, config : configureMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal };
    });

}).call(this);

    