// define('google', function () {
    // if (google) {
        // return google;
    // }
    // return {};
// });

(function() {
    "use strict";
    require(["lib/utils", 'angular']);

    define([
        // 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAwAOGAxY5PZ8MshDtaJFk2KgK7VYxArPA', 
        'angular'
        // 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAwAOGAxY5PZ8MshDtaJFk2KgK7VYxArPA&callback=skipScript'
        ], function(angular) {

        var mph = null,
            scale2Level = [],
            zoomLevels = 0,
            minZoom = 0,
            zmG,
            cntrxG,
            cntryG,
            bounds,
            channel,
            pusher,
            userZoom = true,
            self = null;
        var selfPusherDetails = {
            channel : null,
            pusher : null
        };
              
        mph = MapHosterGoogle.prototype;
        userZoom = true;
        
        function configureMap(gMap, google) {
            self = this;
            self.mph = mph;
            mph.map = gMap;
            mph.google = google;
            this.google = google;
            mph.updateGlobals("init", -87.7, 41.8,  13, 0.0);
            // self.updateGlobals("init", -0.09, 51.50, 13, 0.0);
            mph.showGlobals("Prior to new Map");
            google.maps.event.addListener(gMap, 'dragend', function() 
                {self.setBounds('pan');});
            google.maps.event.addListener(gMap, "zoom_changed", function() {
                if(userZoom == true)
                    self.setBounds('zoom', null);
                // self.userZoom = true;
                }
            );
            function gotResize(){
                console.log("resize event hit");
                console.log(mph.map.getBounds());
            }
            
            google.maps.event.addListener(gMap, 'resize', gotResize); //function() {
                // console.log("resize event hit");
                // console.log(self.mph.map.getBounds());
            // });
            google.maps.event.addListener(gMap, "mousemove", function(e) 
                {
                    var ltln = e.latLng;
                    var fixedLL = utils.toFixed(ltln.lng(),ltln.lat(), 3);
                    var evlng = fixedLL.lon;
                    var evlat = fixedLL.lat;
                    var zm = gMap.getZoom();
                    var cntr = gMap.getCenter();
                    var fixedCntrLL = utils.toFixed(cntr.lng(),cntr.lat(), 3);
                    var cntrlng = fixedCntrLL.lon;
                    var cntrlat = fixedCntrLL.lat;
                    if(mph.scale2Level)
                    {
                        var view = "Zoom : " + zm + " Scale : " + mph.scale2Level[zm].scale + " Center : " + cntrlng + ", " + cntrlat + " Current : " + evlng + ", " + evlat;
                        document.getElementById("mpnm").innerHTML = view;
                    }
                }
            );
            mph.mapReady = true;
            var center = mph.map.getCenter();
            this.google.maps.event.trigger(mph.map, 'resize');
            mph.map.setCenter(center);
            mph.addInitialSymbols();
            
            mph.minZoom = mph.maxZoom = mph.zoomLevels = 0;
            var zsvc = new google.maps.MaxZoomService();
            var cntr = new google.maps.LatLng(mph.cntryG, mph.cntrxG);
            
            zsvc.getMaxZoomAtLatLng(cntr, function(response) 
            {
                if (response && response['status'] == google.maps.MaxZoomStatus.OK) 
                {
                    self.mph.maxZoom = response['zoom'];
                    self.mph.zoomLevels = self.mph.maxZoom - self.mph.minZoom;
                    self.mph.collectScales(self.mph.zoomLevels);
                }
            });
            
            this.extractBounds = function (action)
            {
                var zm = mph.map.getZoom();
                var cntr = mph.map.getCenter();
                var fixedLL = utils.toFixed(cntr.lng(),cntr.lat(), 3);
                var xtntDict = {'src' : 'google', 
                    'zoom' : zm, 
                    'lon' : fixedLL.lon, 
                    'lat' : fixedLL.lat,
                    'scale': mph.scale2Level[zm].scale,
                    'action': action};
                return xtntDict;
            }
                
             this.retrievedBoundsInternal = function(xj)
            {
                console.log("Back in retrievedBounds");
                var zm = xj.zoom
                var cmp = mph.compareExtents("retrievedBounds", {'zoom' : zm, 'lon' : xj.lon, 'lat' : xj.lat});
                var view = xj.lon + ", " + xj.lat + " : " + zm + " " + mph.scale2Level[zm].scale;
                document.getElementById("mpnm").innerHTML = view;
                if(cmp == false)
                {
                    var tmpLon = mph.cntrxG;
                    var tmpLat = mph.cntryG;
                    var tmpZm = mph.zmG;
                    
                    mph.updateGlobals("retrievedBounds with cmp false", xj.lon, xj.lat, xj.zoom);
                    mph.userZoom = false;
                    var cntr = new google.maps.LatLng(xj.lat, xj.lon);
                    mph.userZoom = true;
                    if(xj.action == 'pan')
                    {
                        if(tmpZm != zm)
                        {
                            mph.map.setZoom(zm);
                        }
                        mph.map.setCenter(cntr);
                    }
                    else
                    {
                        if(tmpLon != xj.lon || tmpLat != xj.lat)
                        {
                            mph.map.setCenter(cntr);
                        }
                        mph.map.setZoom(zm);
                    }
                    // self.userZoom = true;
                }
            }

            this.setBounds = function(action)
            {
                if(mph.mapReady == true) // && self.stomp && self.stomp.ready == true)
                {
                    // runs this code after you finishing the zoom
                    var xtExt = self.extractBounds(action);
                    var xtntJsonStr = JSON.stringify(xtExt);
                    console.log("extracted bounds " + xtntJsonStr);
                    var cmp = mph.compareExtents("setBounds", xtExt);
                    if(cmp == false)
                    {
                        console.log("MapHoster setBounds pusher send to channel " + selfPusherDetails.channel);
                        if(selfPusherDetails.pusher)
                        {
                            selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapXtntEvent', xtExt);
                        }
                        mph.updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);
                    }
                }
            }
            
            this.getBoundsZoomLevel = function(bounds)
            {
                var GLOBE_HEIGHT = 256; // Height of a google map that displays the entire world when zoomed all the way out
                var GLOBE_WIDTH = 256; // Width of a google map that displays the entire world when zoomed all the way out

                var ne = bounds.getNorthEast();
                var sw = bounds.getSouthWest();

                var latAngle = ne.lat() - sw.lat();
                if (latAngle < 0) {
                    latAngle += 360;
                }

                var lngAngle = ne.lng() - sw.lng();

                var latZoomLevel = Math.floor(Math.log(self.map.height * 360 / latAngle / GLOBE_HEIGHT) / Math.LN2);
                var lngZoomLevel = Math.floor(Math.log(self.map.width * 360 / lngAngle / GLOBE_WIDTH) / Math.LN2);

                return (latZoomLevel < lngZoomLevel) ? latZoomLevel : lngZoomLevel;
            }
            mph.getGlobalsForUrl = function()
            {
                return "&lon=" + mph.cntrxG + "&lat=" + mph.cntryG + "&zoom=" + mph.zmG; 
            }
        }

        MapHosterGoogle.prototype.collectScales = function(levels)
        {
            this.scale2Level = [];
            var sc2lv = this.scale2Level;
            var topLevel = ++levels;
            var scale = 1128.497220;
            for(var i=topLevel; i>0; i--)
            {
                var obj = {"scale" : scale, "level" : i};
                scale = scale * 2;
                // console.log("scale " + obj.scale + " level " + obj.level);
                sc2lv.push(obj);
            }
        }
         
        MapHosterGoogle.prototype.updateGlobals = function(msg, cntrx, cntry, zm)
        {
            console.log("updateGlobals ");
            var gmBounds = this.map.getBounds();
            if(gmBounds)
            {
                var ne = gmBounds.getNorthEast();
                var sw = gmBounds.getSouthWest();
                this.bounds = gmBounds;
                gmBounds.xmin = sw.lng();
                gmBounds.ymin = sw.lat();
                gmBounds.xmax = ne.lng();
                gmBounds.ymax = ne.lat();
            }
            this.zmG = zm; this.cntrxG = cntrx; this.cntryG = cntry;
            console.log("Updated Globals " + msg + " " + this.cntrxG + ", " + this.cntryG + " : " + this.zmG);
        }

        MapHosterGoogle.prototype.showGlobals = function(cntxt)
        {
            console.log( cntxt + " Globals : lon " + this.cntrxG + " lat " + this.cntryG + " zoom " + this.zmG);
        }

        MapHosterGoogle.prototype.compareExtents = function(msg, xtnt)
        {
            var cmp = true;
            var gmBounds = this.map.getBounds();
            if(gmBounds)
            {
                var ne = gmBounds.getNorthEast();
                var sw = gmBounds.getSouthWest();
                var cmp = xtnt.zoom == this.zmG;
                var wdth = Math.abs(ne.lng() - sw.lng());
                var hgt = Math.abs(ne.lat() - sw.lat());
                var lonDif = Math.abs((xtnt.lon - mph.cntrxG) / wdth);
                var latDif =  Math.abs((xtnt.lat - mph.cntryG) / hgt);
                // cmp = ((cmp == true) && (xtnt.lon == this.cntrxG) && (xtnt.lat == this.cntryG));
                cmp = ((cmp == true) && (lonDif < 0.0005) && (latDif < 0.0005));
                console.log("compareExtents " + msg + " " + cmp)
            }
            return cmp;
        }

        MapHosterGoogle.prototype.polygon = function(coords)
        {
            arrayLatLng = []
            for(var i=0; i<coords.length; i++)
            {
                arrayLatLng.push(new this.google.maps.LatLng(coords[i][0], coords[i][1]));
            }
            pgn = new this.google.maps.Polygon({
                paths: arrayLatLng,
                strokeColor: "#0000FF",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                fillColor: "#FF0000",
                fillOpacity: 0.25
                });

            pgn.setMap(this.map);
        }

        MapHosterGoogle.prototype.circle = function(cntr, rds)
        {
            var cntrLatLng = new this.google.maps.LatLng(cntr[0], cntr[1]);
            crcl = new this.google.maps.Circle({
                center: cntrLatLng,
                radius: rds,
                strokeColor: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5
            });

            crcl.setMap(this.map);
        }

        MapHosterGoogle.prototype.markerInfoPopup = function(pos, content, title)
        {
            var popId = "id" + title;
            var map = this.map;
            var contentString = '<div id="content">'+
                    '<h3 id="' + popId + '">' + title + '</h3>'+
                    '<div id="bodyContent">'+
                    content +
                    '</div>'+
                    '</div>';

                var infowindow = new this.google.maps.InfoWindow({
                    content: contentString
                });

                var marker = new this.google.maps.Marker({
                    position: pos,
                    map: map,
                    title: title
                });
                this.google.maps.event.addListener(marker, 'click', function() {
                  infowindow.open(map,marker);
                });
        }


        MapHosterGoogle.prototype.addInitialSymbols = function ()
        {  
            var popPt = new this.google.maps.LatLng(41.795, -87.695);
            var content = "Great home with spectacular view of abandoned industrial site";
            this.markerInfoPopup(popPt, content, "Prime home for sale");
            popPt = new this.google.maps.LatLng(41.805, -87.705);
            content = "Perfect hangout for the undiscriminating cave dweller";
            this.markerInfoPopup(popPt, content, "Perfection in Paradise");
            // this.polygon([
                // [51.509, -0.08],
                // [51.503, -0.06],
                // [51.51, -0.047]
            // ]);
            // this.circle([51.508, -0.11], 500);
        }

        MapHosterGoogle.prototype.setPusherClient = function (pusher, channel)
        {   
            selfPusherDetails.pusher = pusher;
            selfPusherDetails.channel = channel;
        }
        
        MapHosterGoogle.prototype.retrievedBounds = function(xj)
        {
            return this.retrievedBoundsInternal(xj);
        }
        
        function MapHosterGoogle()
        {
            var self = this;
            self.mph = this.mph;
            this.mapReady = false;
            this.pusher = null;
            this.bounds = null;
            this.userZoom = true;
        }
        
        function init() {
            mph = MapHosterGoogle.prototype;
            return MapHosterGoogle;
        }
        
        function getInternals(){
            return mph;
        }
        function resizeWebSiteVertical(isMapExpanded){
            console.log('resizeWebSiteVertical');
            // mph.map.invalidateSize(true);
            var center = mph.map.getCenter();
            var bnds = mph.map.getBounds();
            console.debug(bnds);
            this.google.maps.event.trigger(mph.map, 'resize');
            mph.map.setCenter(center);
        }
        function resizeVerbageHorizontal(isMapExpanded){
            console.log('resizeVerbageHorizontal');
            // mph.map.invalidateSize(true);
            var center = mph.map.getCenter();
            this.google.maps.event.trigger(mph.map, 'resize');
            mph.map.setCenter(center);
        }

        return { start: init, config : configureMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal, internals: getInternals,
                  retrievedBounds: MapHosterGoogle.prototype.retrievedBounds };
    });

}).call(this);
