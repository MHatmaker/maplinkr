

(function() {
    "use strict";
    console.log("ready to require stuff in MapHosterGoogle");
    require(["lib/utils", 'angular']);
    // require(["lib/utils", 'angular', 'controllers/MapCtrl']);

    define([
        'angular'
        , 'controllers/PositionViewCtrl'
        , 'controllers/MapCtrl'
        , 'lib/utils'
        , 'lib/AgoNewWindowConfig'
        ], function(angular, PositionViewCtrl, MapCtrl, utils, AgoNewWindowConfig) {

        var
            mphmap,
            google,
            mapReady = true,
            scale2Level = [],
            zoomLevels = 0,
            minZoom = 0,
            maxZoom,
            zmG,
            cntrxG,
            cntryG,
            bounds,
            channel,
            userZoom = true;
        var geoCoder = null;
        var gplaces = null;
        var searchBox = null;
        var searchInput = null;
        var searchFiredFromUrl = false;

        var selfPusherDetails = {
            channel : null,
            pusher : null
        };
        var popDetails = null;
        var selfMethods = {};
        var queryPlaces = {
            location: null,
            bounds: null,
            query: 'what do you want?'
        };

        AgoNewWindowConfig.showConfigDetails('MapHosterGoogle - startup');

        function configureMap(gMap, goooogle, googPlaces) {
            mphmap = gMap;
            google = goooogle;
            gplaces = googPlaces;
            geoCoder = new google.maps.Geocoder();
            var markers = [];

            if(AgoNewWindowConfig.testUrlArgs()){
                var qlat = AgoNewWindowConfig.lat();
                var qlon = AgoNewWindowConfig.lon();
                var qzoom = AgoNewWindowConfig.zoom();
                updateGlobals("init with qlon, qlat", qlon, qlat, qzoom);
             }
             else{
                updateGlobals("init with hard-coded values", -87.700001, 41.800001,  13);
             }
            // updateGlobals("init", -0.09, 51.50, 13, 0.0);
            showGlobals("Prior to new Map");
            // google.maps.event.addListener(mphmap, 'dragend', gotDragEnd);

            // Maybe it will work at this point!!!

            minZoom = maxZoom = zoomLevels = 0;

            maxZoom = 21;
            zoomLevels = maxZoom - minZoom;
            collectScales(zoomLevels);
            AgoNewWindowConfig.showConfigDetails('MapHosterGoogle - after collectScales');
            showGlobals("after collectScales");

            google.maps.event.addListenerOnce(mphmap, 'tilesloaded', function(){
                var zsvc = new google.maps.MaxZoomService();
                var cntr = new google.maps.LatLng(cntryG, cntrxG);
                console.log(">>>>>>>>>>>>>> tiles loaded >>>>>>>>>>>>>>>>>>>>");

                mapReady = true;
                var center = mphmap.getCenter();
                google.maps.event.trigger(mphmap, 'resize');
                mphmap.setCenter(center);
                addInitialSymbols();
                google.maps.event.trigger(mphmap, 'resize');
                mphmap.setCenter(center);
                var gmQuery = AgoNewWindowConfig.query();
                console.log('gmQuery contains ' + gmQuery);
                if(gmQuery != ''){
                    searchFiredFromUrl = true;
                }
                if(searchFiredFromUrl == true){
                    console.log("getBoundsFromUrl.......in MapHosterGoogle 'places_changed' listener");
                    var bnds = AgoNewWindowConfig.getBoundsFromUrl();
                    console.debug(bnds);
                    var ll = new google.maps.LatLng(bnds.lly, bnds.llx);
                    var ur = new google.maps.LatLng(bnds.ury, bnds.urx);
                    var gBnds = new google.maps.LatLngBounds(ll, ur);
                    searchFiredFromUrl = false;

                    var qtext = AgoNewWindowConfig.query();

                    var pacnpt = $('#pac-input');
                    pacnpt.value = qtext;
                    // pacnpt.focus();
                    queryPlaces.bounds = gBnds;
                    queryPlaces.query = qtext;
                    queryPlaces.location = center;
                    var service = new google.maps.places.PlacesService(mphmap);
                    service.textSearch(queryPlaces, placesQueryCallback);
                }

                // Listen for the event fired when the user selects an item from the
                // pick list. Retrieve the matching places for that item.
                google.maps.event.addListener(searchBox, 'places_changed', function() {
                    console.log("MapHosterGoogle 'places_changed' listener");
                    console.log("before searchBox.getPlaces()");


                    var places = searchBox.getPlaces();
                    console.log("after searchBox.getPlaces()");
                    if(places && places.length > 0){
                        console.log('searchBox.getPlaces() returned : ' + places.length);
                        placeMarkers(places);
                    }
                    else{
                        console.log('searchBox.getPlaces() still returned no results');
                    }
                });

                zsvc.getMaxZoomAtLatLng(cntr, function(response)
                {
                    if (response && response['status'] == google.maps.MaxZoomStatus.OK)
                    {
                        maxZoom = response['zoom'];
                        zoomLevels = maxZoom - minZoom;
                        collectScales(zoomLevels);
                        AgoNewWindowConfig.showConfigDetails('MapHosterGoogle zsvc.getMaxZoomAtLatLng - after collectScales');
                        showGlobals("after zsvc.getMaxZoomAtLatLng collectScales");
                    }
                    else
                    {
                        if(response)
                        {
                            // alert("getMaxZoomAtLatLng service returned status other than OK");
                            console.log("getMaxZoomAtLatLng service returned status other than OK");
                            console.log(response['status']);
                        }
                        else
                        {
                            alert("getMaxZoomAtLatLng service returned null")
                        }

                    }
                  });
            });

            searchInput = /** @type {HTMLInputElement} */(
                document.getElementById('pac-input'));
            mphmap.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
            searchInput.value = '';
            searchBox = new gplaces.SearchBox(
            /** @type {HTMLInputElement} */(searchInput));

            // Bias the SearchBox results towards places that are within the bounds of the
            // current map's viewport.
            google.maps.event.addListener(mphmap, 'bounds_changed', function() {
                var bounds = mphmap.getBounds();
                // console.debug(bounds);
                searchBox.setBounds(bounds);
                var bnds = {'llx' : bounds.getSouthWest().lng() , 'lly' : bounds.getSouthWest().lat(),
                             'urx' : bounds.getNorthEast().lng() , 'ury' : bounds.getNorthEast().lat()};
                AgoNewWindowConfig.setBounds(bnds);
            });

            google.maps.event.addListener(mphmap, 'dragend', function() {
                if(userZoom == true){
                    setBounds('pan');
                }
            });
            google.maps.event.addListener(mphmap, "zoom_changed", function() {
                if(userZoom == true){
                    if(scale2Level.length > 0)
                        setBounds('zoom', null);
                // userZoom = true;
                }
            });
            function gotResize(){
                console.log("resize event hit in MapHosterGoogle");
                console.log(mphmap.getBounds());
            };

            google.maps.event.addListener(mphmap, 'resize', gotResize); //function() {
                // console.log("resize event hit");
                // console.log(mphmap.getBounds());
            // });
            google.maps.event.addListener(mphmap, "mousemove", function(e)
                {
                    var ltln = e.latLng;
                    var fixedLL = utils.toFixed(ltln.lng(),ltln.lat(), 6);
                    var evlng = fixedLL.lon;
                    var evlat = fixedLL.lat;
                    var zm = mphmap.getZoom();
                    var cntr = mphmap.getCenter();
                    var fixedCntrLL = utils.toFixed(cntr.lng(),cntr.lat(), 6);
                    var cntrlng = fixedCntrLL.lon;
                    var cntrlat = fixedCntrLL.lat;
                    if(scale2Level.length > 0)
                    {
                        // var view = "Zoom : " + zm + " Scale : " + scale2Level[zm].scale + " Center : " + cntrlng + ", " + cntrlat + " Current : " + evlng + ", " + evlat;
                        // document.getElementById("mppos").value = view;
                        PositionViewCtrl.update('coords', {
                            'zm' : zm,
                            'scl' : scale2Level[zm].scale,
                            'cntrlng' : cntrlng,
                            'cntrlat': cntrlat,
                            'evlng' : evlng,
                            'evlat' : evlat
                        });
                    }
                }
            );
            google.maps.event.addListener(mphmap, 'click', function(event) {
                onMapClick(event);
                }
            );

            function placesQueryCallback(results, status){
                console.log('status is ' + status);
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    if(results && results.length > 0){
                        console.log('PlacesService returned ' + results.length);
                        placeMarkers(results);
                    }
                    else{
                        console.log('placesService() returned no results');
                    }
                }
            }

            function placeMarkers(places){
                for (var i = 0, marker; marker = markers[i]; i++) {
                    marker.setMap(null);
                }

                // For each place, get the icon, place name, and location.
                markers = [];
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0, place; place = places[i]; i++) {
                    var image = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                  // Create a marker for each place.
                    var marker = new google.maps.Marker({
                        map: mphmap,
                        icon: image,
                        title: place.name,
                        address : place.formatted_address,
                        position: place.geometry.location
                    });

                    markers.push(marker);
                    markerInfoPopup(place.geometry.location, marker.address, marker.title, marker);

                    bounds.extend(place.geometry.location);
                }
            }


        }

        function gotDragEnd(){
            console.log("dragend event hit");
            setBounds('pan');
        }

        function showClickResult(content, popPt, marker){
            if(popDetails != null){
                popDetails.infoWnd.close();
                popDetails.infoMarker.setMap(null);
            }
            popDetails = markerInfoPopup(popPt, content, "Ready to Push Click", marker);
            // popDetails.infoWnd.open(mphmap, popDetails.infoMarker);
            // if(selfPusherDetails.pusher)
            // {
                // var fixedLL = utils.toFixed(popPt.lng(), popPt.lat(), 6);
                // var referrerId = AgoNewWindowConfig.getUserId();
                // var referrerName = AgoNewWindowConfig.getUserName();
                // var pushLL = {"x" : fixedLL.lon, "y" : fixedLL.lat, "z" : "0",
                    // "referrerId" : referrerId, "referrerName" : referrerName };
                // console.log("You, " + referrerName + ", " + referrerId + ", clicked the map at " + fixedLL.lat + ", " + fixedLL.lon);
                // selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
            // }
        }

        function onMapClick(e)
        {
            var popPt = e.latLng;
            var fixedLL = utils.toFixed(popPt.lng(), popPt.lat(), 6);
            var content = "You clicked the map at " + fixedLL.lat + ", " + fixedLL.lon;
            geoCoder.geocode({'latLng': popPt}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        var marker = new google.maps.Marker({
                            map: mphmap,
                            title: "",
                            address : results[0].formatted_address,
                            position: popPt
                        });

                        content = results[0].formatted_address;
                        showClickResult(content, popPt, marker);
                    }
                    else{
                        showClickResult(content, popPt);
                    }
                }
            });
            // showClickResult(content, popPt);
        }
        function extractBounds(action)
        {
            var zm = mphmap.getZoom();
            var cntr = mphmap.getCenter();
            var fixedLL = utils.toFixed(cntr.lng(),cntr.lat(), 6);
            var xtntDict = {'src' : 'google',
                'zoom' : zm,
                'lon' : fixedLL.lon,
                'lat' : fixedLL.lat,
                'scale': scale2Level[zm].scale,
                'action': action};
            return xtntDict;
        }

        function retrievedClick(clickPt)
        {
            var fixedLL = utils.toFixed(clickPt.x, clickPt.y, 6);
            console.log("Back in retrievedClick - with click at " +  clickPt.x + ", " + clickPt.y);
            var latlng = L.latLng(clickPt.y, clickPt.x, clickPt.y);

            var popPt = new google.maps.LatLng(clickPt.y, clickPt.x);
            var content = "Map click at " + fixedLL.lat + ", " + fixedLL.lon;
            if(clickPt.title){
                content += '<br>' + clickPt.title;
            }
            if(clickPt.address){
                content += '<br>' + clickPt.address;
            }
            if(popDetails != null && clickPt.referrerId != AgoNewWindowConfig.getUserId()){
                popDetails.infoWnd.close();
                popDetails.infoMarker.setMap(null);
            }
            if(clickPt.referrerId != AgoNewWindowConfig.getUserId()){
                popDetails = markerInfoPopup(popPt, content, "Received from user " + clickPt.referrerName + ", " + clickPt.referrerId);
                popDetails.infoWnd.open(mphmap, popDetails.infoMarker);

                var btnShare = document.getElementsByClassName('sharebutton')[0];
                if(btnShare){
                    console.debug(btnShare);
                    btnShare.style.visibility = 'hidden';
                }
            }
        }

        function getEventDictionary(){
            var $inj = angular.injector(['app']);
            var evtSvc = $inj.get('StompEventHandlerService');
            var eventDct = evtSvc.getEventDct();
            return eventDct;
        }
        function retrievedBoundsInternal(xj)
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
                var cntr = new google.maps.LatLng(xj.lat, xj.lon);
                // userZoom = true;
                if(xj.action == 'pan')
                {
                    if(tmpZm != zm)
                    {
                        mphmap.setZoom(zm);
                    }
                    mphmap.setCenter(cntr);
                }
                else
                {
                    if(tmpLon != xj.lon || tmpLat != xj.lat)
                    {
                        mphmap.setCenter(cntr);
                    }
                    mphmap.setZoom(zm);
                }
                userZoom = true;
            }
        }

        function setBounds(action)
        {
            if(mapReady == true) // && stomp && stomp.ready == true)
            {
                // runs this code after you finishing the zoom
                var xtExt = extractBounds(action);
                var xtntJsonStr = JSON.stringify(xtExt);
                console.log("extracted bounds " + xtntJsonStr);
                var cmp = compareExtents("setBounds", xtExt);
                if(cmp == false)
                {
                    console.log("MapHoster setBounds pusher send to channel " + selfPusherDetails.channel);
                    if(selfPusherDetails.pusher)
                    {
                        selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapXtntEvent', xtExt);
                    }
                    updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);
                }
            }
        }

        function getBoundsZoomLevel(bounds)
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

            var latZoomLevel = Math.floor(Math.log(mphmap.height * 360 / latAngle / GLOBE_HEIGHT) / Math.LN2);
            var lngZoomLevel = Math.floor(Math.log(mphmap.width * 360 / lngAngle / GLOBE_WIDTH) / Math.LN2);

            return (latZoomLevel < lngZoomLevel) ? latZoomLevel : lngZoomLevel;
        }

        function collectScales(levels)
        {
            scale2Level = [];
            var sc2lv = scale2Level;
            // var topLevel = ++levels;
            var topLevel = levels + 2;
            var scale = 1128.497220;
            for(var i=topLevel; i>0; i--)
            {
                var obj = {"scale" : scale, "level" : i};
                scale = scale * 2;
                // console.log("scale " + obj.scale + " level " + obj.level);
                sc2lv.push(obj);
            }
        }

        function updateGlobals(msg, cntrx, cntry, zm)
        {
            console.log("updateGlobals ");
            var gmBounds = mphmap.getBounds();
            if(gmBounds)
            {
                var ne = gmBounds.getNorthEast();
                var sw = gmBounds.getSouthWest();
                bounds = gmBounds;
                gmBounds.xmin = sw.lng();
                gmBounds.ymin = sw.lat();
                gmBounds.xmax = ne.lng();
                gmBounds.ymax = ne.lat();
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
            var cmp = true;
            var gmBounds = mphmap.getBounds();
            if(gmBounds)
            {
                var ne = gmBounds.getNorthEast();
                var sw = gmBounds.getSouthWest();
                var cmp = xtnt.zoom == zmG;
                var wdth = Math.abs(ne.lng() - sw.lng());
                var hgt = Math.abs(ne.lat() - sw.lat());
                var lonDif = Math.abs((xtnt.lon - cntrxG) / wdth);
                var latDif =  Math.abs((xtnt.lat - cntryG) / hgt);
                // cmp = ((cmp == true) && (xtnt.lon == cntrxG) && (xtnt.lat == cntryG));
                cmp = ((cmp == true) && (lonDif < 0.0005) && (latDif < 0.0005));
                console.log("compareExtents " + msg + " " + cmp)
            }
            return cmp;
        }

        function polygon(coords)
        {
            arrayLatLng = []
            for(var i=0; i<coords.length; i++)
            {
                arrayLatLng.push(new google.maps.LatLng(coords[i][0], coords[i][1]));
            }
            pgn = new google.maps.Polygon({
                paths: arrayLatLng,
                strokeColor: "#0000FF",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                fillColor: "#FF0000",
                fillOpacity: 0.25
                });

            pgn.setMap(mphmap);
        }

        function circle(cntr, rds)
        {
            var cntrLatLng = new google.maps.LatLng(cntr[0], cntr[1]);
            crcl = new google.maps.Circle({
                center: cntrLatLng,
                radius: rds,
                strokeColor: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5
            });

            crcl.setMap(mphmap);
        }

        function markerInfoPopup(pos, content, title, mrkr)
        {
            var popId = "id" + title;
            var shareBtnId = "idShare" + title;
            var contentString = '<div id="content">'+
                    '<h4 id="' + popId + '" style="color:forestgreen">' + title + '</h4>'+
                    '<div id="bodyContent" style="color:darkmagenta">'+
                    content + '<br><button class="sharebutton btn-primary" id="' + shareBtnId + '" >Share</button>' +
                    '</div>'+
                    '</div>';


            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            var marker = mrkr ? mrkr : new google.maps.Marker({
                position: pos,
                map: mphmap,
                title: title
            });
            var showSomething = function (){
                if(selfPusherDetails.pusher)
                {
                    var fixedLL = utils.toFixed(marker.position.lng(), marker.position.lat(), 6);
                    var referrerId = AgoNewWindowConfig.getUserId();
                    var referrerName = AgoNewWindowConfig.getUserName();
                    var pushLL = {"x" : fixedLL.lon, "y" : fixedLL.lat, "z" : "0",
                        "referrerId" : referrerId, "referrerName" : referrerName,
                        'address' : marker.address, 'title' : marker.title };
                    console.log("You, " + referrerName + ", " + referrerId + ", clicked the map at " + fixedLL.lat + ", " + fixedLL.lon);
                    selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
                }
            };

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(contentString);
                infowindow.open(mphmap,this);

                var btnShare = document.getElementById(shareBtnId);
                var referrerId = AgoNewWindowConfig.getReferrerId();
                var usrId = AgoNewWindowConfig.getUserId();
                // if(referrerId && referrerId != usrId){
                    // if(btnShare){
                    //     console.debug(btnShare);
                    //     btnShare.style.visibility = 'hidden';
                    // }
                // }
                btnShare.onclick=function(){showSomething();};
            });
            return { "infoWnd" : infowindow, "infoMarker" : marker};
        }


        function addInitialSymbols()
        {
            var popPt = new google.maps.LatLng(41.795, -87.695);
            var hint = "Deep Fried Butter Steaks";
            markerInfoPopup(popPt, "128 oz steaks with 4 cubes of butter on top on a bed of deep fried onion rings.", hint);
            popPt = new google.maps.LatLng(41.805, -87.705);
            hint = "Raw Fish and Seaweed";
            markerInfoPopup(popPt, "We throw whatever comes out of the water on your plate.", hint);
            popPt = new google.maps.LatLng(41.825, -87.725);
            hint = "Nothing But Vegetables";
            markerInfoPopup(popPt, "If it isn't an animal or mineral, we have it.", hint);
            // this.polygon([
                // [51.509, -0.08],
                // [51.503, -0.06],
                // [51.51, -0.047]
            // ]);
            // this.circle([51.508, -0.11], 500);
        }

        function setUserName(name){
            AgoNewWindowConfig.setUserName(name);
        }

        // MapHosterGoogle.prototype.setPusherClient = function (pusher, channel)
        function setPusherClient(pusher, channel)
        {
            selfPusherDetails.pusher = pusher;
            selfPusherDetails.channel = channel;
            AgoNewWindowConfig.setChannel(channel);
            var $inj = angular.injector(['app']);
            var evtSvc = $inj.get('StompEventHandlerService');
            var evtDct = evtSvc.getEventDct();
            for (var key in evtDct) {
                pusher.subscribe( key, evtDct[key]);
                }
            console.log("reset MapHosterGoogle setPusherClient, selfPusherDetails.pusher " +  selfPusherDetails.pusher);
        }
        function getGlobalsForUrl()
        {
            return "&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG;
        }

        function getCenter(){
            var pos = { 'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG};
            console.log("return accurate center from getCenter()");
            console.debug(pos);
            return pos;
        }

        function publishPosition(pos)
        {
            if(selfPusherDetails.pusher)
            {
                console.log("MapHosterLeaflet.publishPosition");
                console.log(pos);

                var gmQuery = AgoNewWindowConfig.getQuery();
                if(gmQuery != ''){
                    pos['gmquery'] = gmQuery;
                    pos.search += "&gmquery=" + gmQuery;
                    var bnds = AgoNewWindowConfig.getBoundsForUrl();
                    pos.search += bnds;
                }

                selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-NewMapPosition', pos);
            }

        }

        function retrievedBounds(xj)
        {
            return retrievedBoundsInternal(xj);
        }

        function MapHosterGoogle()
        {
            mapReady = false;
            bounds = null;
            userZoom = true;
        }

        function init() {
            return MapHosterGoogle;
        }

        function resizeWebSiteVertical(isMapExpanded){
            console.log('resizeWebSiteVertical');
            // map.invalidateSize(true);
            var center = mphmap.getCenter();
            var bnds = mphmap.getBounds();
            console.debug(bnds);
            google.maps.event.trigger(mphmap, 'resize');
            mphmap.setCenter(center);
        }
        function resizeVerbageHorizontal(isMapExpanded){
            console.log('resizeVerbageHorizontal');
            // mphmap.invalidateSize(true);
            var center = mphmap.getCenter();
            google.maps.event.trigger(mphmap, 'resize');
            mphmap.setCenter(center);
        }

        return { start: init, config : configureMap,
                 resizeWebSite: resizeWebSiteVertical, resizeVerbage: resizeVerbageHorizontal,
                  retrievedBounds: retrievedBounds, retrievedClick: retrievedClick,
                  setPusherClient: setPusherClient, setUserName : setUserName,
                  getGlobalsForUrl: getGlobalsForUrl, getCenter : getCenter,
                  getEventDictionary : getEventDictionary, publishPosition : publishPosition};
    });

}).call(this);
