
(function() {
    "use strict";
    require(["lib/utils", 'angular']);

    define([
        'angular'
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
            userZoom,
            self = null;
            
        var selfPusherDetails = {
            channel : null,
            pusher : null
        };
        
        var selfMethods = {retrievedBoundsInner : null};
        self = this;
              
        
        mph = MapHosterArcGIS.prototype;
        // function configureMap(gMap, google) {
        // }
        function configureMap(xtntMap, zoomWebMap, pointWebMap)
        {
            self = this;
            self.mph = mph;
            mph.map = xtntMap;
            mph.pusher = null;
            mph.mapReady = false;
            mph.map = xtntMap;
            // alert("before first update globals");
            if(zoomWebMap != null)
                mph.updateGlobals("init with attributes in args", pointWebMap[0], pointWebMap[1], zoomWebMap, 0.0);
            else
                mph.updateGlobals("init standard", -87.7, 41.8, 13, 0.0);
            // this.updateGlobals("init", -0.09, 51.50, 13, 0.0);
            // alert("prior to showing first globals");
            mph.showGlobals("Prior to new Map");
            // alert("showed first globals");
            var startCenter = new esri.geometry.Point(mph.cntrxG, mph.cntryG, new esri.SpatialReference({wkid:4326}));
            
            mph.updateGlobals("using startCenter", startCenter.x, startCenter.y, mph.zmG, 0.0)
            mph.showGlobals("Prior to startup centerAndZoom");
            mph.map.centerAndZoom(startCenter, mph.zmG);
            mph.showGlobals("After centerAndZoom");
            mph.initialPan == true;

            mph.initMap("mapDiv_layer0");
            // self.addInitialSymbols();
            mph.bounds = xtntMap.geographicExtent;
            mph.userZoom = true;
                 
            dojo.connect(xtntMap, "onZoomStart", function (extent, zoomFactor, anchor, level)
                {
                    self.zmG = level;
                });
            dojo.connect(xtntMap, "onZoomEnd", function (extent, zoomFactor, anchor, level)
                {
                    console.debug("onZoomEnd with self.userZoom = " + self.userZoom);
                    if(self.userZoom == true)
                    {
                        var cntr = extent.getCenter();
                        var xtnt = self.extractBounds(mph.map.getLevel(), cntr, 'zoom');
                        self.setBounds(xtnt);
                    }
                    // self.userZoom = true;
                });
            dojo.connect(xtntMap, "onPanStart", function (extent, startPoint)
                {
                });
            dojo.connect(xtntMap, "onPanEnd", function (extent, endPoint)
                {
                    var cntr = extent.getCenter();
                    var xtnt = self.extractBounds(mph.map.getLevel(), cntr, 'pan');
                    // var xtnt = self.extractBounds(self.zmG, endPoint, 'pan');
                    self.setBounds(xtnt);
                    // if(self.initialPan == false)
                    // {
                        // self.userZoom = false;
                    // }
                    // else
                    // {
                        // self.initialPan = false;
                    // }
                });
            dojo.connect(xtntMap, "onMouseMove", function(e)
                {
                    var ltln = esri.geometry.webMercatorToGeographic(e.mapPoint);
                    var fixedLL = utils.toFixed(ltln.x,ltln.y, 3);
                    var evlng = fixedLL.lon;
                    var evlat = fixedLL.lat;
                    var zm = mph.map.getLevel();
                    var xtnt = mph.map.extent;
                    var cntr = esri.geometry.webMercatorToGeographic(xtnt.getCenter());
                    var fixedCntrLL = utils.toFixed(cntr.x,cntr.y, 3);
                    var cntrlng = fixedCntrLL.lon;
                    var cntrlat = fixedCntrLL.lat;
                    var view = "Zoom : " + zm + " Center : " + cntrlng + ", " + cntrlat + " Current  : " + evlng + ", " + evlat;      // + selectedWebMapId;
                    document.getElementById("mppos").value = view;
                });
            this.mapReady = true;
            this.userZoom = true;
            
            this.extractBounds = function (zm, cntr, action)
            {
                var source = new Proj4js.Proj('GOOGLE'); 
                var dest = new Proj4js.Proj('EPSG:4326'); 
                var p = new Proj4js.Point(cntr.x, cntr.y); 
                Proj4js.transform(source, dest, p);
                var cntrpt = new esri.geometry.Point(p.x, p.y, new esri.SpatialReference({wkid:4326}));
                console.log("cntr " + cntr.x + ", " + cntr.y);
                console.log("cntrpt " + cntrpt.x + ", " + cntrpt.y);
                var fixedLL = utils.toFixed(cntrpt.x,cntrpt.y, 3);
                var xtntDict = {'src' : 'arcgis', 
                    'zoom' : zm, 
                    'lon' : fixedLL.lon, 
                    'lat' : fixedLL.lat,
                    'scale': mph.scale2Level[zm].scale,
                    'action': action};
                return xtntDict;
            }
                
             this.retrievedBoundsInner = function(xj)
            {
                console.log("Back in retrievedBoundsInner");
                var zm = xj.zoom;
                var cmp = self.mph.compareExtents("retrievedBounds", 
                    {'zoom' : xj.zoom, 'lon' : xj.lon, 'lat' : xj.lat});
                var view = xj.lon + ", " + xj.lat + " : " + zm + " " + self.mph.scale2Level[zm].scale;
                ;
                document.getElementById("mpnm").innerHTML = view;
                if(cmp == false)
                {
                    var tmpLon = self.cntrxG;
                    var tmpLat = self.cntryG;
                    var tmpZm = self.zmG;
                    
                    self.mph.updateGlobals("retrievedBounds with cmp false", xj.lon, xj.lat, xj.zoom);
                    // self.userZoom = false;
                    console.log("retrievedBounds centerAndZoom at zm = " + zm);
                    var cntr = new esri.geometry.Point(xj.lon, xj.lat, new esri.SpatialReference({wkid:4326}));
                    // self.userZoom = true;
                    if(xj.action == 'pan')
                    {
                        if(tmpZm != zm)
                        {
                            self.userZoom = false;
                            self.mph.map.centerAndZoom(cntr, zm);
                            self.userZoom = true;
                        }
                        else
                        {
                            self.userZoom = false;
                            self.mph.map.centerAt(cntr);
                            self.userZoom = true;
                        }
                    }
                    else
                    {
                        if(tmpLon != xj.lon || tmpLat != xj.lat)
                        {
                            // var tmpCenter = new esri.geometry.Point(tmpLon, tmpLat, new esri.SpatialReference({wkid:4326}));
                            self.userZoom = false;
                            self.mph.map.centerAndZoom(cntr, zm);
                            self.userZoom = true;
                        }
                        else
                        {
                            self.userZoom = false;
                            self.mph.map.setZoom(zm);
                            self.userZoom = true;
                        }
                    }
                    // self.userZoom = true;
                }
            }
            
            console.log("selfMethods");
            console.debug(selfMethods);
            selfMethods["retrievedBoundsInner"] = this.retrievedBoundsInner;
            console.debug(selfMethods);


            this.setBounds = function(xtExt)
            {
                console.log("MapHosterArcGIS setBounds with selfPusherDetails.pusher " + selfPusherDetails.pusher);
                if(self.mapReady == true && selfPusherDetails.pusher) // && self.pusher.ready == true)
                {
                    // runs this code after you finishing the zoom
                    console.log("setBounds ready to process json xtExt");
                    var xtntJsonStr = JSON.stringify(xtExt);
                    console.log("extracted bounds " + xtntJsonStr);
                    var cmp = self.mph.compareExtents("setBounds", xtExt);
                    if(cmp == false)
                    {
                        console.log("MapHoster setBounds pusher send ");
                        // var sendRet = self.stomp.send(xtntJsonStr, self.channel);
                    if(selfPusherDetails.pusher)
                    {
                        selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapXtntEvent', xtExt);
                    }
                        self.mph.updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);
                        //console.debug(sendRet);
                    }
                }
            }
            this.getGlobalsForUrl = function()
            {
                console.log(" MapHosterArcGIS.prototype.getGlobalsForUrl");
                console.log("&lon=" + this.cntrxG + "&lat=" + this.cntryG + "&zoom=" + this.zmG);
                return "&lon=" + this.cntrxG + "&lat=" + this.cntryG + "&zoom=" + this.zmG; 
            }
        }
        MapHosterArcGIS.prototype.initMap = function(value, precision) 
        {
            var tileInfo = this.map.__tileInfo;
            var lods = tileInfo.lods;
            this.zoomLevels = lods.length;
            this.scale2Level = [];
            var sc2lv = this.scale2Level;
            dojo.forEach(lods, function(item, i){
                var obj = {"scale" : item.scale, "resolution" : item.resolution, "level" : item.level};
                sc2lv.push(obj);
                // console.log("scale " + obj.scale + " level " + obj.level + " resolution " + obj.resolution);
              });
            console.log("zoom levels : " + this.zoomLevels);
        }

        MapHosterArcGIS.prototype.updateGlobals = function(msg, cntrx, cntry, zm)
        {
            console.log("updateGlobals ");
            this.zmG = zm; this.cntrxG = cntrx; this.cntryG = cntry;
            if(this.map != null)
                this.bounds = this.map.geographicExtent;
            console.log("Updated Globals " + msg + " " + this.cntrxG + ", " + this.cntryG + " : " + this.zmG);
        }

        MapHosterArcGIS.prototype.showGlobals = function(cntxt)
        {
            console.log( cntxt + " Globals : lon " + this.cntrxG + " lat " + this.cntryG + " zoom " + this.zmG);
        }

        MapHosterArcGIS.prototype.compareExtents = function(msg, xtnt)
        {
            var cmp = xtnt.zoom == this.zmG;
            var wdth = Math.abs(this.bounds.xmax - this.bounds.xmin);
            var hgt = Math.abs(this.bounds.ymax - this.bounds.ymin);
            var lonDif = Math.abs((xtnt.lon - this.cntrxG) / wdth);
            var latDif =  Math.abs((xtnt.lat - this.cntryG) / hgt);
            // cmp = ((cmp == true) && (xtnt.lon == this.cntrxG) && (xtnt.lat == this.cntryG));
            cmp = ((cmp == true) && (lonDif < 0.0005) && (latDif < 0.0005));
            console.log("compareExtents " + msg + " " + cmp)
            return cmp;
        }

        MapHosterArcGIS.prototype.polygon = function(coords)
        {
            var latLonPts = [];
            var source = new Proj4js.Proj('EPSG:4326'); 
            var dest = new Proj4js.Proj('GOOGLE'); 
            for(i=0; i<coords.length; i++)
            {
                var p = new Proj4js.Point(coords[i][1], coords[i][0]); 
                Proj4js.transform(source, dest, p);
                var pt = new esri.geometry.Point(p.x, p.y, new esri.SpatialReference({wkid:102100}));
                latLonPts.push([pt.x, pt.y]);
            }
            var polygonJson  = {"rings":[latLonPts],"spatialReference":{"wkid":102100 }};
            var pgn = new esri.geometry.Polygon(polygonJson);
            var polygonSymbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([0, 0, 255]), 4),
                new dojo.Color([0, 0, 255, 0.25]));

            this.map.graphics.add(new esri.Graphic(pgn, polygonSymbol));
        }

        MapHosterArcGIS.prototype.circle = function( cntr, rds)
        {
            var source = new Proj4js.Proj('EPSG:4326'); 
            var dest = new Proj4js.Proj('GOOGLE'); 
            var p = new Proj4js.Point(cntr[1], cntr[0]); 
            Proj4js.transform(source, dest, p);
            var pt = new esri.geometry.Point(p.x, p.y, new esri.SpatialReference({wkid:102100}));
            var ptSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, rds, 
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
                new dojo.Color([255,0,0]), 4), new dojo.Color([127, 0, 0,0.25]));
            this.map.graphics.add(new esri.Graphic(pt, ptSymbol));
        }

        MapHosterArcGIS.prototype.addInitialSymbols = function ()
        {   
            this.polygon([
                [51.509, -0.08],
                [51.503, -0.06],
                [51.51, -0.047],
                [51.509, -0.08]
            ]);
            this.circle([51.508, -0.11], 100);
        }
        
 
        // MapHosterArcGIS.prototype.setPusherClient = function (pusher, channel)
        function setPusherClient(pusher, channel)
        {   
            console.log("MapHosterArcGIS setPusherClient, selfPusherDetails.pusher " +  selfPusherDetails.pusher);
            if(selfPusherDetails.pusher == null)
            {
                selfPusherDetails.pusher = pusher;
                selfPusherDetails.channel = channel;
                console.log("reset MapHosterArcGIS setPusherClient, selfPusherDetails.pusher " +  selfPusherDetails.pusher);
            }
        }
        // MapHosterArcGIS.prototype.getGlobalsForUrl = function()
        function getGlobalsForUrl()
        {
            return "&lon=" + this.cntrxG + "&lat=" + this.cntryG + "&zoom=" + this.zmG; 
        }
        MapHosterArcGIS.prototype.retrievedBounds = function(x)
        {
            console.log("MapHosterArcGIS.prototype.retrievedBounds");
            return selfMethods.retrievedBoundsInner(x);
        }

         /* 
        function setPusherClient(pusher, channel)
        {   
            if(mph.pusher == null)
            {
                mph.pusher = pusher;
                mph.channel = channel;
            }
        }
         */
         
        function MapHosterArcGIS()
        {
            // self = this;
            mph = MapHosterArcGIS.prototype;
            self.mph = mph;
        /* 
            var setPusherClient = function (pusher, channel)
            {   
                if(mph.pusher == null)
                {
                    mph.pusher = pusher;
                    mph.channel = channel;
                }
            };
              */
            // var self = this;
            // self.mph = mph;
            // this.mapReady = false;
            // this.pusher = null;
            // this.bounds = null;
            // this.userZoom = true;
        }
        
      /*   
        MapHosterArcGIS.prototype.setPusherClient = function (pusher, channel)
        {   
            if(mph.pusher == null)
            {
                mph.pusher = pusher;
                mph.channel = channel;
            }
        }
         */
        
        function init() {
            self = this;
            mph = MapHosterArcGIS.prototype;
            self.mph = mph;
            // setPusherClient = function (pshr, chnl)
            // {   
                // if(pusher == null)
                // {
                    // pusher = pshr;
                    // channel = chnl;
                // }
            // };
            // MapHosterArcGIS();
            return MapHosterArcGIS;
        }
        
        function getInternals(){
            return mph;
        }
        
        function resizeWebSiteVertical(isMapExpanded){
            console.log('resizeWebSiteVertical');
            var tmpLon = mph.cntrxG;
            var tmpLat = mph.cntryG;
            var tmpZm = mph.zmG;
            
            var cntr = new esri.geometry.Point(tmpLon, tmpLat, new esri.SpatialReference({wkid:4326}));
            mph.map.resize();
            mph.map.centerAndZoom(cntr, tmpZm);
        }
        function resizeVerbageHorizontal(isMapExpanded){
            console.log('resizeVerbageHorizontal');
            var tmpLon = mph.cntrxG;
            var tmpLat = mph.cntryG;
            var tmpZm = mph.zmG;
            
            var cntr = new esri.geometry.Point(tmpLon, tmpLat, new esri.SpatialReference({wkid:4326}));
            mph.map.resize();
            mph.map.centerAndZoom(cntr, tmpZm);
        }

        return { start: init, config : configureMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal, internals: getInternals,
                retrievedBounds: MapHosterArcGIS.prototype.retrievedBounds,
                setPusherClient: setPusherClient, getGlobalsForUrl: getGlobalsForUrl};
    });

}).call(this);

 
 
    