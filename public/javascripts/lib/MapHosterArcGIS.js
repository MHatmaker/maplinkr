
(function() {
    "use strict";
    console.log("ready to require stuff in MapHosterArcGIS");
    require(["lib/utils", 'angular', "esri/tasks/locator"]);

    define([
        'angular', 'controllers/PositionViewCtrl', 'lib/utils', 'lib/AgoNewWindowConfig'
        ], function(angular, PositionViewCtrl, utils, AgoNewWindowConfig) {

        var mphmap = null,
            mapReady = true,
            initialPan = true,
            scale2Level = [],
            zoomLevels = 0,
            minZoom = 0,
            zmG,
            cntrxG,
            cntryG,
            bounds,
            userZoom = true,
            selectedMarkerId = 101,
            initialActionListHtml = '',
            geoLocator = null;
            
        var selfPusherDetails = {
            channel : null,
            pusher : null
        };
                      
        
        function configureMap(xtntMap, zoomWebMap, pointWebMap)
        {
            console.log("configureMap");
            mphmap = xtntMap;
            mapReady = false;
            // alert("before first update globals");
            if(zoomWebMap != null){
                updateGlobals("init with attributes in args", pointWebMap[0], pointWebMap[1], zoomWebMap);
            }
            else{
            
                var qlat = AgoNewWindowConfig.lat();
                var qlon = AgoNewWindowConfig.lon();
                var qzoom = AgoNewWindowConfig.zoom();
                
                if(qlat != ''){
                    updateGlobals("init with qlon, qlat", qlon, qlat, qzoom);
                 }
                 else{
                    updateGlobals("init with hard-coded values", -87.7, 41.8,  13);
                 }
            
                // updateGlobals("init standard", -87.7, 41.8, 13);
            }
            showGlobals("Prior to new Map");
            // alert("showed first globals");
            var startCenter = new esri.geometry.Point(cntrxG, cntryG, new esri.SpatialReference({wkid:4326}));
            
            updateGlobals("using startCenter", startCenter.x, startCenter.y, zmG, 0.0)
            showGlobals("Prior to startup centerAndZoom");
            mphmap.centerAndZoom(startCenter, zmG);
            showGlobals("After centerAndZoom");
            initialPan == true;

            initMap("mapDiv_layer0");
            geoLocator = new esri.tasks.Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");

            // addInitialSymbols();
            bounds = mphmap.geographicExtent;
            userZoom = true;
                 
            dojo.connect(mphmap, "onZoomStart", function (extent, zoomFactor, anchor, level)
                {
                    zmG = level;
                });
            dojo.connect(mphmap, "onZoomEnd", function (extent, zoomFactor, anchor, level)
                {
                    console.debug("onZoomEnd with userZoom = " + userZoom);
                    if(userZoom == true)
                    {
                        var cntr = extent.getCenter();
                        var xtnt = extractBounds(mphmap.getLevel(), cntr, 'zoom');
                        setBounds(xtnt);
                    }
                    // userZoom = true;
                });
            dojo.connect(mphmap, "onPanStart", function (extent, startPoint)
                {
                });
            dojo.connect(mphmap, "onPanEnd", function (extent, endPoint)
                {
                    if(userZoom == true)
                    {
                        var cntr = extent.getCenter();
                        var xtnt = extractBounds(mphmap.getLevel(), cntr, 'pan');
                        // var xtnt = extractBounds(zmG, endPoint, 'pan');
                        setBounds(xtnt);
                    }
                });
            dojo.connect(mphmap, "onMouseMove", function(e)
                {
                    var ltln = esri.geometry.webMercatorToGeographic(e.mapPoint);
                    var fixedLL = utils.toFixed(ltln.x,ltln.y, 3);
                    var evlng = fixedLL.lon;
                    var evlat = fixedLL.lat;
                    var zm = mphmap.getLevel();
                    var xtnt = mphmap.extent;
                    var cntr = esri.geometry.webMercatorToGeographic(xtnt.getCenter());
                    var fixedCntrLL = utils.toFixed(cntr.x,cntr.y, 3);
                    var cntrlng = fixedCntrLL.lon;
                    var cntrlat = fixedCntrLL.lat;
                    // var view = "Zoom : " + zm + " Center : " + cntrlng + ", " + cntrlat + " Current  : " + evlng + ", " + evlat;      // + selectedWebMapId;
                    // document.getElementById("mppos").value = view;
                    PositionViewCtrl.update('coords', {
                        'zm' : zm,
                        'scl' : scale2Level[zm].scale,
                        'cntrlng' : cntrlng,
                        'cntrlat': cntrlat,
                        'evlng' : evlng,
                        'evlat' : evlat
                    });
                });
            mphmap.on("click", onMapClick);
            geoLocator.on("location-to-address-complete", function(evt) {
                if (evt.address.address) {
                    var address = evt.address.address;
                    var location = esri.geometry.geographicToWebMercator(evt.address.location);
                    showClickResult(address.Address);
                }
                else{
                    showClickResult(null);
                }
            });
            mapReady = true;
            userZoom = true;
        }
        
        function extractBounds(zm, cntr, action)
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
                'scale': scale2Level[zm].scale,
                'action': action};
            return xtntDict;
        }
        
        var screenPt = null;
        var fixedLLG = null;
        
        function showClickResult(content){
            var actionList = document.getElementsByClassName('actionList')[0];
            console.debug(actionList);
            var shareBtnId = 'shareSomehtingId' + selectedMarkerId;
            var addedShareBtn = '<button id="' + shareBtnId + '" >Share</button>';
            if(selectedMarkerId == 101){
                initialActionListHtml = actionList.innerHTML;
            }
            selectedMarkerId += 1;
            actionList.innerHTML = initialActionListHtml + addedShareBtn;
            
            if(content == null){
                mphmap.infoWindow.setTitle("Ready to Push Click");
                mphmap.infoWindow.setContent("lat/lon : " + fixedLLG.lat + ", " + fixedLLG.lon);
            }
            else{
                mphmap.infoWindow.setContent(content);
            }
            var showSomething = function (){
                if(selfPusherDetails.pusher)
                {
                    var referrerId = AgoNewWindowConfig.getUserId();
                    var referrerName = AgoNewWindowConfig.getUserName();
                    var pushLL = {"x" : fixedLLG.lon, "y" : fixedLLG.lat, "z" : "0",
                            "referrerId" : referrerId, "referrerName" : referrerName };
                    console.log("You, " + referrerName + ", " + referrerId + ", clicked the map at " + fixedLL.lat + ", " + fixedLL.lon);
                    selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
                }
            };
            
            mphmap.infoWindow.show(screenPt, mphmap.getInfoWindowAnchor(screenPt));
        
            var btnShare = document.getElementById(shareBtnId);
            btnShare.onclick=function(){showSomething();};
                
            if(selfPusherDetails.pusher)
            {
                var referrerId = AgoNewWindowConfig.getUserId();
                var referrerName = AgoNewWindowConfig.getUserName();
                var pushLL = {"x" : fixedLLG.lon, "y" : fixedLLG.lat, "z" : "0",
                        "referrerId" : referrerId, "referrerName" : referrerName };
                    console.log("You, " + referrerName + ", " + referrerId + ", clicked the map at " + fixedLL.lat + ", " + fixedLL.lon);
                selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
            }
        }
        
        function onMapClick(e)
        {
            var mapPt = {x : e.mapPoint.x, y : e.mapPoint.y};
            screenPt = e.screenPoint;
            var source = new Proj4js.Proj('GOOGLE'); 
            var dest = new Proj4js.Proj('EPSG:4326'); 
            console.log("e.screenPoint");
            console.debug(e.screenPoint);
            var p = new Proj4js.Point(e.mapPoint.x, e.mapPoint.y); 
            Proj4js.transform(source, dest, p);
            var cntrpt = new esri.geometry.Point(p.x, p.y, new esri.SpatialReference({wkid:4326}));
            console.log("clicked Pt " + mapPt.x + ", " + mapPt.y);
            console.log("converted Pt " + cntrpt.x + ", " + cntrpt.y);
            fixedLLG = utils.toFixed(cntrpt.x,cntrpt.y, 3);
            geoLocator.locationToAddress(esri.geometry.webMercatorToGeographic(e.mapPoint), 100);
         /*    
            // mphmap.infoWindow.setTitle("Coordinates");
            // mphmap.infoWindow.setContent("lat/lon : " + fixedLL.lat + ", " + fixedLL.lon);
            mphmap.infoWindow.show(e.screenPoint,mphmap.getInfoWindowAnchor(e.screenPoint));
            
            if(selfPusherDetails.pusher)
            {
                var latlng = {"x" : fixedLL.lon, "y" : fixedLL.lat,  "z" : "0"};
                console.log("Push coordinates");
                console.debug(latlng);
                selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', latlng);
            }
             */
        }
            
        function retrievedClick(clickPt)
        {
            console.log("Back in retrievedClick");
            // var latlng = L.latLng(clickPt.y, clickPt.x, clickPt.y);
            console.log("You clicked the map at " + clickPt.x + ", " + clickPt.y);
            // alert("You clicked the map at " + clickPt.x + ", " + clickPt.y);
            console.debug(clickPt);
            var mpDiv = document.getElementById("map_canvas");
            var mpDivNG = angular.element(mpDiv);
            
            var wdt = mpDivNG[0].clientWidth;
            var hgt = mpDivNG[0].clientHeight;
            
            var mppt = new esri.geometry.Point(clickPt.x, clickPt.y);
            var screenGeo = new esri.geometry.toScreenGeometry(mphmap.geographicExtent, wdt, hgt, mppt);
            console.log("screenGeo");
            console.debug(screenGeo);
            
            // var screengraphic = new esri.geometry.toScreenGeometry(mphmap.extent,800,600,userdrawlayer.graphics[0].geometry); 

            if(clickPt.referrerId != AgoNewWindowConfig.getUserId()){
                mphmap.infoWindow.setTitle("Received Pushed Click");
                mphmap.infoWindow.setContent("from user " + clickPt.referrerName + ", " + clickPt.referrerId + " at lat/lon : " + clickPt.y + ", " + clickPt.x);
            }
            
            mphmap.infoWindow.show(mppt, mphmap.getInfoWindowAnchor(screenGeo));
            // popup
                // .setLatLng(latlng)
                // .setContent("You clicked the map at " + latlng.toString())
                // .openOn(mphmap);
        }
        
        function retrievedBounds(xj)
        {
            console.log("Back in retrievedBounds");
            var zm = xj.zoom;
            var cmp = compareExtents("retrievedBounds", 
                {'zoom' : xj.zoom, 'lon' : xj.lon, 'lat' : xj.lat});
            var view = xj.lon + ", " + xj.lat + " : " + zm + " " + scale2Level[zm].scale;
            ;
            document.getElementById("mppos").value = view;
            if(cmp == false)
            {
                var tmpLon = cntrxG;
                var tmpLat = cntryG;
                var tmpZm = zmG;
                
                updateGlobals("retrievedBounds with cmp false", xj.lon, xj.lat, xj.zoom);
                // userZoom = false;
                console.log("retrievedBounds centerAndZoom at zm = " + zm);
                var cntr = new esri.geometry.Point(xj.lon, xj.lat, new esri.SpatialReference({wkid:4326}));
                
                userZoom = false;
                if(xj.action == 'pan')
                {
                    if(tmpZm != zm)
                    {
                        mphmap.centerAndZoom(cntr, zm);
                    }
                    else
                    {
                        mphmap.centerAt(cntr);
                    }
                }
                else
                {
                    if(tmpLon != xj.lon || tmpLat != xj.lat)
                    {
                        // var tmpCenter = new esri.geometry.Point(tmpLon, tmpLat, new esri.SpatialReference({wkid:4326}));
                        mphmap.centerAndZoom(cntr, zm);
                    }
                    else
                    {
                        mphmap.setZoom(zm);
                    }
                }
                userZoom = true;
            }
        }
        
        function retrievedNewPosition(pos)
        {
            console.log("Back in retrievedNewPosition");
            console.log(pos);
            String.format('open map using framework {0} at x {1}, y {2}, zoom (3)', 
                pos.maphost, pos.lon, pos.lat, pos.zoom);
        }
        
        function getEventDictionary(){
            var $inj = angular.injector(['app']);
            var evtSvc = $inj.get('StompEventHandlerService');
            var eventDct = evtSvc.getEventDct();
            return eventDct;
        }
        
        function setBounds(xtExt)
        {
            console.log("MapHosterArcGIS setBounds with selfPusherDetails.pusher " + selfPusherDetails.pusher);
            if(mapReady == true && selfPusherDetails.pusher) // && self.pusher.ready == true)
            {
                // runs this code after you finishing the zoom
                console.log("setBounds ready to process json xtExt");
                var xtntJsonStr = JSON.stringify(xtExt);
                console.log("extracted bounds " + xtntJsonStr);
                var cmp = compareExtents("setBounds", xtExt);
                if(cmp == false)
                {
                    console.log("MapHoster setBounds pusher send ");
                    // var sendRet = self.stomp.send(xtntJsonStr, self.channel);
                    if(selfPusherDetails.pusher)
                    {
                        selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapXtntEvent', xtExt);
                    }
                    updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);
                    //console.debug(sendRet);
                }
            }
        }
        function getGlobalsForUrl()
        {
            console.log(" MapHosterArcGIS.prototype.getGlobalsForUrl");
            console.log("&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG);
            return "&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG; 
        }
        
        function publishPosition(pos)
        {
            if(selfPusherDetails.pusher)
            {
                console.log("MapHosterArcGIS.publishPosition");
                pos['maphost'] = 'arcgis';
                console.log(pos);
                
                var bnds = AgoNewWindowConfig.getBoundsForUrl();
                pos.search += bnds;
                
                selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-NewMapPosition', pos);
            }
                
        }
            
        function initMap(value, precision) 
        {
            var tileInfo = mphmap.__tileInfo;
            var lods = tileInfo.lods;
            zoomLevels = lods.length;
            scale2Level = [];
            var sc2lv = scale2Level;
            dojo.forEach(lods, function(item, i){
                var obj = {"scale" : item.scale, "resolution" : item.resolution, "level" : item.level};
                sc2lv.push(obj);
                // console.log("scale " + obj.scale + " level " + obj.level + " resolution " + obj.resolution);
              });
            console.log("zoom levels : " + zoomLevels);
        }

        function updateGlobals(msg, cntrx, cntry, zm)
        {
            console.log("updateGlobals ");
            zmG = zm; cntrxG = cntrx; cntryG = cntry;
            if(mphmap != null)
                bounds = mphmap.geographicExtent;
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
            // cmp = ((cmp == true) && (xtnt.lon == cntrxG) && (xtnt.lat == cntryG));
            cmp = ((cmp == true) && (lonDif < 0.0005) && (latDif < 0.0005));
            console.log("compareExtents " + msg + " " + cmp)
            return cmp;
        }

        function polygon(coords)
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

            mphmap.graphics.add(new esri.Graphic(pgn, polygonSymbol));
        }

        function circle( cntr, rds)
        {
            var source = new Proj4js.Proj('EPSG:4326'); 
            var dest = new Proj4js.Proj('GOOGLE'); 
            var p = new Proj4js.Point(cntr[1], cntr[0]); 
            Proj4js.transform(source, dest, p);
            var pt = new esri.geometry.Point(p.x, p.y, new esri.SpatialReference({wkid:102100}));
            var ptSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, rds, 
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
                new dojo.Color([255,0,0]), 4), new dojo.Color([127, 0, 0,0.25]));
            mphmap.graphics.add(new esri.Graphic(pt, ptSymbol));
        }

        function addInitialSymbols ()
        {   
            polygon([
                [51.509, -0.08],
                [51.503, -0.06],
                [51.51, -0.047],
                [51.509, -0.08]
            ]);
            circle([51.508, -0.11], 100);
        }
        
        function setUserName(name){
            AgoNewWindowConfig.setUserName(name);
        }
 
        // MapHosterArcGIS.prototype.setPusherClient = function (pusher, channel)
        function setPusherClient(pusher, channel)
        {   
            console.log("MapHosterArcGIS setPusherClient, selfPusherDetails.pusher " +  selfPusherDetails.pusher);
            if(selfPusherDetails.pusher === null)
            {
                selfPusherDetails.pusher = pusher;
                selfPusherDetails.channel = channel;
                
                var $inj = angular.injector(['app']);
                var evtSvc = $inj.get('StompEventHandlerService');
                var evtDct = evtSvc.getEventDct();
                for (var key in evtDct) {
                        pusher.subscribe( key, evtDct[key]);
                    }

                // pusher.subscribe( 'client-MapXtntEvent', retrievedBounds);
                // pusher.subscribe( 'client-MapClickEvent', retrievedClick);
                // pusher.subscribe( 'client-NewMapPosition', retrievedNewPosition);
                console.log("reset MapHosterArcGIS setPusherClient, selfPusherDetails.pusher " +  selfPusherDetails.pusher);
            }
        }
        // MapHosterArcGIS.prototype.getGlobalsForUrl = function()
        function getGlobalsForUrl()
        {
            return "&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG; 
        }
        
        function getGlobalPositionComponents(){
            return {"lon" : cntrxG, "lat" : cntryG, "zoom" : zmG};
        }
         
        function getCenter(){
            var pos = { 'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG};
            console.log("return accurate center from getCenter()");
            console.debug(pos);
            return pos;
        }
        
        function MapHosterArcGIS()
        {
        }
        
        function init() {
            console.log("MapHosterArcGIS start - init");
            return MapHosterArcGIS;
        }
        
        function resizeWebSiteVertical(isMapExpanded){
            console.log('resizeWebSiteVertical');
            var tmpLon = cntrxG;
            var tmpLat = cntryG;
            var tmpZm = zmG;
            
            var cntr = new esri.geometry.Point(tmpLon, tmpLat, new esri.SpatialReference({wkid:4326}));
            mphmap.resize();
            mphmap.centerAndZoom(cntr, tmpZm);
        }
        
        function resizeVerbageHorizontal(isMapExpanded){
            console.log('resizeVerbageHorizontal');
            var tmpLon = cntrxG;
            var tmpLat = cntryG;
            var tmpZm = zmG;
            
            var cntr = new esri.geometry.Point(tmpLon, tmpLat, new esri.SpatialReference({wkid:4326}));
            mphmap.resize();
            mphmap.centerAndZoom(cntr, tmpZm);
        }

        return { start: init, config : configureMap,
                  resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal,
                  retrievedBounds: retrievedBounds, retrievedClick: retrievedClick,
                  setPusherClient: setPusherClient, getGlobalsForUrl: getGlobalsForUrl,
                  getEventDictionary : getEventDictionary, setUserName : setUserName,getGlobalPositionComponents : getGlobalPositionComponents,
                  publishPosition : publishPosition, retrievedNewPosition : retrievedNewPosition, getCenter : getCenter};
    });

}).call(this);

 
 
    