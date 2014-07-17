
define('leaflet', function () {
    if (leaflet) {
        return leaflet;
    }
    return {};
});

(function() {
    "use strict";

    define(['http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js'], function(leaflet) {

        var mph = null;
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
            mph.mapCenter = mph.map.getCenter
            console.log("mousemove next");
            mph.map.on('mousemove', function(e){self.onMouseMove(e); })
            console.log("cllick next");
            mph.map.on('click', function(e){mph.onMapClick(e); })
            mph.map.on( "zoomend", function( e ) 
            {
                if(mph.userZoom == true)
                {
                    mph.setBounds('zoom', null);
                }
                }
            );
        }

        function MapHosterLeaflet()
        {
            var self = this;
            this.pusher = null;
            this.userZoom = true;
            
            this.map.on( "moveend", function( e ) {
                //console.log("moveend");
                self.setBounds('pan', e.latlng);}  );

            this.onMouseMove = function(e) 
            {
                var ltln = e.latlng;
                var fixedLL = utils.toFixed(ltln.lng,ltln.lat, 3);
                var evlng = fixedLL.lon;
                var evlat = fixedLL.lat;
                var zm = self.map.getZoom();
                var cntr = self.mph.map.getCenter();
                var fixedCntrLL = utils.toFixed(cntr.lng,cntr.lat, 3);
                var cntrlng = fixedCntrLL.lon;
                var cntrlat = fixedCntrLL.lat;
                var view = cntrlng + ", " + cntrlat + " : " + evlng + ", " + evlat + " : " + 
                    zm + " " + self.scale2Level[zm].scale;
                document.getElementById("mpnm").innerHTML = view;
            }
            
            this.onMapClick = function(e) 
            {
                self.popup
                    .setLatLng(e.latlng)
                    .setContent("You clicked the map at " + e.latlng.toString())
                    .openOn(this.map);
            }

            this.extractBounds = function(action, latlng)
            {
                var zm = this.map.getZoom();
                var scale = this.map.options.crs.scale(zm);
                var oldMapCenter = this.mapCenter;
                this.mapCenter = this.map.getCenter();
                // var cntr = action == 'pan' ? latlng : this.map.getCenter();
                var cntr = this.map.getCenter();
                var fixedLL = utils.toFixed(cntr.lng,cntr.lat, 3);
                var xtntDict = {'src' : 'cloudmade', 
                    'zoom' : zm, 
                    'lon' : fixedLL.lon, 
                    'lat' : fixedLL.lat,
                    'scale': self.scale2Level[zm].scale,
                    'action': action};
                return xtntDict;
            }
                
             this.retrievedBounds = function(xj)
            {
                console.log("Back in retrievedBounds");
                var zm = xj.zoom
                var cmp = self.compareExtents("retrievedBounds", {'zoom' : zm, 'lon' : xj.lon, 'lat' : xj.lat});
                var view = xj.lon + ", " + xj.lat + " : " + zm + " " + self.scale2Level[zm].scale;
                document.getElementById("mpnm").innerHTML = view;
                if(cmp == false)
                {
                    var tmpLon = self.cntrxG;
                    var tmpLat = self.cntryG;
                    var tmpZm = self.zmG;
                    
                    self.updateGlobals("retrievedBounds with cmp false", xj.lon, xj.lat, xj.zoom);
                    self.userZoom = false;
                    var cntr = new L.LatLng(xj.lat, xj.lon);
                    self.userZoom = true;
                    if(xj.action == 'pan')
                        // self.map.panTo(cntr);
                        self.map.setView(cntr, zm);
                    else
                    {
                        if(tmpLon != xj.lon || tmpLat != xj.lat)
                        {
                            self.map.setView(cntr, zm);
                        }
                        else
                        {
                            self.map.setZoom(zm);
                        }
                    }
                    // self.userZoom = true;
                }
                //self.map.setView(cntr, zm);
            }

            this.setBounds = function(action, latlng)
            {
                // if(self.pusher && self.pusher.ready == true)
                {
                    // runs this code after finishing the zoom
                    var xtExt = self.extractBounds(action, latlng);
                    var xtntJsonStr = JSON.stringify(xtExt);
                    console.log("extracted bounds " + xtntJsonStr);
                    var cmp = self.compareExtents("setBounds", xtExt);
                    if(cmp == false)
                    {
                        console.log("MapHoster setBounds pusher send to channel " + this.channel);
                        // var sendRet = self.pusher.send(xtntJsonStr, this.channel);
                        if(self.pusher)
                        {
                            self.pusher.channel(this.channel).trigger('client-MapXtntEvent', xtExt);
                        }
                        self.updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);
                        //console.debug(sendRet);
                    }
                }
            }
            this.getGlobalsForUrl = function()
            {
                return "&lon=" + this.cntrxG + "&lat=" + this.cntryG + "&zoom=" + this.zmG; 
            }
        }

        MapHosterLeaflet.prototype.collectScales = function()
        {
            var zm = this.map.getZoom();
            this.scale2Level = [];
            var sc2lv = this.scale2Level;
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
                this.bounds = gmBounds;
                gmBounds.xmin = sw.lng;
                gmBounds.ymin = sw.lat;
                gmBounds.xmax = ne.lng;
                gmBounds.ymax = ne.lat;
            }
            this.zmG = zm; this.cntrxG = cntrx; this.cntryG = cntry;
            console.log("Updated Globals " + msg + " " + this.cntrxG + ", " + this.cntryG + " : " + this.zmG);
        }

        MapHosterLeaflet.prototype.showGlobals = function(cntxt)
        {
            console.log( cntxt + " Globals : lon " + this.cntrxG + " lat " + this.cntryG + " zoom " + this.zmG);
        }

        MapHosterLeaflet.prototype.compareExtents = function(msg, xtnt)
        {
            cmp = xtnt.zoom == this.zmG;
            var wdth = Math.abs(this.bounds.xmax - this.bounds.xmin);
            var hgt = Math.abs(this.bounds.ymax - this.bounds.ymin);
            lonDif = Math.abs((xtnt.lon - this.cntrxG) / wdth);
            latDif =  Math.abs((xtnt.lat - this.cntryG) / hgt);
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
            
            // L.marker([51.5, -0.09]).addTo(this.map)
                // .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

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
            this.pusher = pusher;
            this.channel = channel;
        }
        
        function init() {
            mph = MapHosterLeaflet.prototype;
            return MapHosterLeaflet;
        }

        return { start: init, config : configureMap };
    });

}).call(this);

    