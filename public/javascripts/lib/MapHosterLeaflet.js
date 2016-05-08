/*global require*/
/*global define*/
/*global L*/
/*global GeoCoder*/
/*global google*/
// define('leaflet', function () {
    // if (leaflet) {
        // return leaflet;
    // }
    // return {};
// });

define('GeoCoder', function () {
    "use strict";
    if (GeoCoder) {
        return GeoCoder;
    }
    return {};
});

(function () {
    "use strict";
    console.log("ready to require stuff in MapHosterLeaflet");
    require(['http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js', "lib/utils", 'angular', 'lib/GeoCoder']);

    define(['controllers/PositionViewCtrl', 'lib/GeoCoder', 'lib/utils', 'lib/AgoNewWindowConfig',
        'controllers/StompSetupCtrl', 'controllers/WindowStarter'],

        function (PositionViewCtrl, GeoCoder, utils, AgoNewWindowConfig, StompSetupCtrl, WindowStarter) {

            var
                hostName = "MapHosterLeaflet",
                scale2Level = [],
                zmG,
                userZoom = true,
                // mphmapCenter,
                cntrxG,
                cntryG,
                bounds,
                minZoom,
                maxZoom,
                zoomLevels,
                // channel,
                // pusher,
                popup,
                geoCoder,
                marker,
                mphmap,
                selfPusherDetails = {
                    channel : null,
                    pusher : null
                },
                placesFromSearch = [],
                markers = [],
                popups = [],
                mrkr,
                searchBox = null,
                searchInput = null,
                onAcceptDestination,
                self = this;
                // currentVerbVis = false;

            function showLoading() {
                utils.showLoading();
            }
            function hideLoading() {
                utils.hideLoading();
            }
            // MapHosterLeaflet.prototype.updateGlobals = function(msg, cntrx, cntry, zm)
            function updateGlobals(msg, cntrx, cntry, zm) {
                console.log("updateGlobals " + msg);
                var lfltBounds = mphmap.getBounds(),
                    ne,
                    sw;
                console.debug(lfltBounds);
                if (lfltBounds) {
                    ne = lfltBounds.getNorthEast();
                    sw = lfltBounds.getSouthWest();
                    bounds = lfltBounds;
                    lfltBounds.xmin = sw.lng;
                    lfltBounds.ymin = sw.lat;
                    lfltBounds.xmax = ne.lng;
                    lfltBounds.ymax = ne.lat;
                    AgoNewWindowConfig.setBounds({'llx' : sw.lng, 'lly' : sw.lat, 'urx' : ne.lng, 'ury' : ne.lat});
                }
                zmG = zm;
                cntrxG = cntrx;
                cntryG = cntry;
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

            function showGlobals(cntxt) {
                console.log(cntxt + " Globals : lon " + cntrxG + " lat " + cntryG + " zoom " + zmG);
            }

            function collectScales() {
                console.log('collectScales');
                var //zm = mphmap.getZoom(),
                    sc2lv,
                    scale,
                    obj,
                    i;
                scale2Level = [];
                sc2lv = scale2Level;
                for (i = 0; i < zoomLevels + 1; i++) {
                    scale = mphmap.options.crs.scale(i);
                    obj = {"scale" : scale, "level" : i};
                    // console.log("scale " + obj.scale + " level " + obj.level);
                    sc2lv.push(obj);
                }
            }


            function markerInfoPopup(pos, content, hint) {
                var shareBtnId = "idShare" + hint,
                    contentId = "idContent" + hint,
                    contextHint = hint,
                    contextContent = content,
                    container,
                    showSomething,
                    allContent = '<h4  style="color:#A0743C; visibility: visible">' + hint +
                        '</h4><div id="' + contentId + '" >' + content +
                        '</div><br><button class="trigger  btn-primary" id="' + shareBtnId + '">Share</button>',
                    contextPos = pos;

                mrkr = L.marker(pos).addTo(mphmap);


                showSomething = function () {
                    var fixedLL,
                        referrerId,
                        referrerName,
                        pushLL;
                    if (selfPusherDetails.pusher) {
                        fixedLL = utils.toFixed(contextPos[1], contextPos[0], 6);
                        referrerId = AgoNewWindowConfig.getUserId();
                        referrerName = AgoNewWindowConfig.getUserName();
                        pushLL = {"x" : fixedLL.lon, "y" : fixedLL.lat, "z" : "0",
                            "referrerId" : referrerId, "referrerName" :  referrerName,
                            'address' : contextContent, 'title' : contextHint };
                        console.log("You, " + referrerName + ", " + referrerId + ", clicked the map at " + fixedLL.lat + ", " + fixedLL.lon);
                        selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
                    }
                };

                container = $('<div />');
                // container.on('click', function() {
                    // if (this.id != "") {

                    // }showSomething();
                // });
                container.html(allContent);

                popup = L.popup().setContent(container[0]);
                mrkr.bindPopup(popup);
                markers.push(mrkr);
                popups.push(popup);
                mphmap.on('popupopen', function () {
                    // alert('pop pop pop');
                    console.debug(popup);
                    var referrerId = AgoNewWindowConfig.getReferrerId(),
                        usrId = AgoNewWindowConfig.getUserId(),
                        btnShare = document.getElementById(shareBtnId);
                    if (referrerId && referrerId !== usrId) {
                        if (btnShare) {
                            console.debug(btnShare);
                            btnShare.style.visibility = 'visible';
                            btnShare.onclick=function() {showSomething();};
                        }

                    } else {
                        if (btnShare) {
                            console.debug(btnShare);
                            btnShare.style.visibility = 'hidden';
                        }
                    }
                });

                // mphmap.on('click', '.trigger', function() {
                    // alert('Hello from Toronto!');
                    // showSomething();
                // });
                // mrkr.openPopup();
            }

            function addInitialSymbols() {
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

            function onMouseMove(e) {
                var ltln = e.latlng,
                    fixedLL = utils.toFixed(ltln.lng, ltln.lat, 3),
                    evlng = fixedLL.lon,
                    evlat = fixedLL.lat,
                    zm = mphmap.getZoom(),
                    cntr = mphmap.getCenter(),
                    fixedCntrLL = utils.toFixed(cntr.lng, cntr.lat, 3),
                    cntrlng = fixedCntrLL.lon,
                    cntrlat = fixedCntrLL.lat;

                PositionViewCtrl.update('coords', {
                    'zm' : zm,
                    'scl' : scale2Level[zm].scale,
                    'cntrlng' : cntrlng,
                    'cntrlat': cntrlat,
                    'evlng' : evlng,
                    'evlat' : evlat
                });
            }

            function showClickResult(r) {
                var cntr,
                    fixedLL,
                    referrerId,
                    referrerName,
                    pushLL = {};
                if (r) {
                    console.log("showClickResultp at " + r.lat + ", " + r.lon);
                    cntr = new L.latLng(r.lat, r.lon, 0);
                    if (marker) {
                        marker.closePopup();
                        markerInfoPopup([cntr.lat, cntr.lng], r.display_name, "The hint");
                        // marker.
                        //     setLatLng(cntr).
                        //     setPopupContent(r.display_name).
                        //     openPopup();
                    } else {
                        markerInfoPopup([cntr.lat, cntr.lng], r.display_name, "The hint");
                        // marker = L.marker(cntr).bindPopup(r.display_name).addTo(mphmap).openPopup();
                    }
                    // if (selfPusherDetails.pusher) {
                    //     fixedLL = utils.toFixed(r.lon, r.lat, 6);
                    //     referrerId = AgoNewWindowConfig.getUserId();
                    //     referrerName = AgoNewWindowConfig.getUserName();
                    //     pushLL = {"x" : fixedLL.lon, "y" : fixedLL.lat, "z" : "0",
                    //         "referrerId" : referrerId, "referrerName" :  referrerName };
                    //     console.log("You, " + referrerName + ", " + referrerId + ", clicked the map at " + fixedLL.lat + ", " + fixedLL.lon);
                    //     console.debug(pushLL);
                    //     selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
                    // }
                }
            }

            function onMapClick(e) {
                var r;
                geoCoder.reverse(e.latlng, mphmap.options.crs.scale(mphmap.getZoom())).
                    then(function (results) {
                        r = results;
                        showClickResult(r);
                    });
            }


            onAcceptDestination = function (info) {
                var $inj, evtSvc, sourceMapType, newSelectedWebMapId, destWnd;

                $inj = angular.injector(['app']);
                if (info) {
                    sourceMapType = info.mapType;
                    destWnd = info.dstSel;
                }
                newSelectedWebMapId = "NoId";

                // gmQSvc = $inj.get('GoogleQueryService');
                if (destWnd === 'New Pop-up Window' || destWnd === 'New Tab') {
                    if (AgoNewWindowConfig.isNameChannelAccepted() === false) {
                        $inj = angular.injector(['app']);
                        evtSvc = $inj.get('StompEventHandlerService');
                        evtSvc.addEvent('client-MapXtntEvent', sourceMapType.retrievedBounds);
                        evtSvc.addEvent('client-MapClickEvent', sourceMapType.retrievedClick);

                        // gmQSvc = $inj.get('GoogleQueryService');
                        // scope = gmQSvc.getPusherDialogScope();
                        // currentVerbVis = gmQSvc.setDialogVisibility(true);
                        // if (StompSetupCtrl.isInstantiated() == false) {
                        //     new StompSetupCtrl()
                        // }
                        StompSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                            AgoNewWindowConfig.getUserName(), WindowStarter.openNewDisplay,
                                {'destination' : destWnd, 'currentMapHolder' : sourceMapType, 'newWindowId' : newSelectedWebMapId});
                    } else {
                        WindowStarter.openNewDisplay(AgoNewWindowConfig.masherChannel(false),
                            AgoNewWindowConfig.getUserName(), destWnd, sourceMapType, newSelectedWebMapId);
                    }

                }
            };

            function extractBounds(action, latlng) {
                var zm = mphmap.getZoom(),
                    // scale = mphmap.options.crs.scale(zm),
                    // oldMapCenter = mphmapCenter,
                    cntr,
                    fixedLL,
                    xtntDict = {};
                    // mphmapCenter = mphmap.getCenter();
                // var cntr = action == 'pan' ? latlng : mphmap.getCenter();
                cntr = mphmap.getCenter();
                fixedLL = utils.toFixed(cntr.lng, cntr.lat, 3);
                xtntDict = {
                    'src' : 'leaflet_osm',
                    'zoom' : zm,
                    'lon' : fixedLL.lon,
                    'lat' : fixedLL.lat,
                    'scale': scale2Level[zm].scale,
                    'action': action
                };
                return xtntDict;
            }

            function compareExtents(msg, xtnt) {
                var cmp = xtnt.zoom === zmG,
                    wdth = Math.abs(bounds.xmax - bounds.xmin),
                    hgt = Math.abs(bounds.ymax - bounds.ymin),
                    lonDif = Math.abs((xtnt.lon - cntrxG) / wdth),
                    latDif =  Math.abs((xtnt.lat - cntryG) / hgt);
                // cmp = ((cmp == true) && (xtnt.lon == this.cntrxG) && (xtnt.lat == this.cntryG));
                cmp = ((cmp === true) && (lonDif < 0.0005) && (latDif < 0.0005));
                console.log("compareExtents " + msg + " " + cmp);
                return cmp;
            }

            function setBounds(action, latlng) {
                // runs this code after finishing the zoom
                var xtExt = extractBounds(action, latlng),
                    xtntJsonStr = JSON.stringify(xtExt),
                    cmp = compareExtents("setBounds", xtExt);
                console.log("extracted bounds " + xtntJsonStr);

                if (cmp === false) {
                    console.log("MapHoster setBounds pusher send to channel " + selfPusherDetails.channel);
                    // var sendRet = self.pusher.send(xtntJsonStr, channel);
                    if (selfPusherDetails.pusher) {
                        selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapXtntEvent', xtExt);
                    }
                    updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);
                    //console.debug(sendRet);
                }
            }

            function retrievedClick(clickPt) {
                console.log("Back in retrievedClick - with a click at " +  clickPt.x + ", " + clickPt.y);
                var latlng = L.latLng(clickPt.y, clickPt.x, clickPt.y),
                    $inj,
                    linkrSvc,
                    content = "Received Pushed Click from user " + clickPt.referrerName + ", " + clickPt.referrerId + " at " + latlng.toString();

                $inj = angular.injector(['app']);
                linkrSvc = $inj.get('LinkrService');
                linkrSvc.hideLinkr();
                if (clickPt.title) {
                    content += '<br>' + clickPt.title;
                }
                if (clickPt.address) {
                    content += '<br>' + clickPt.address;
                }
                if (clickPt.referrerId !== AgoNewWindowConfig.getUserId()) {
                    popup
                        .setLatLng(latlng)
                        .setContent(content)
                        .openOn(mphmap);
                }
            }

            function retrievedBounds(xj) {
                console.log("Back in retrievedBounds");
                var zm = xj.zoom,
                    cmp = compareExtents("retrievedBounds", {'zoom' : zm, 'lon' : xj.lon, 'lat' : xj.lat}),
                    view = xj.lon + ", " + xj.lat + " : " + zm + " " + scale2Level[zm].scale,
                    tmpLon,
                    tmpLat,
                    //tmpZm,
                    cntr;
                // document.getElementById("mppos").innerHTML = view;
                if (cmp === false) {
                    tmpLon = cntrxG;
                    tmpLat = cntryG;
                    //tmpZm = zmG;

                    updateGlobals("retrievedBounds with cmp false", xj.lon, xj.lat, xj.zoom);
                    userZoom = false;
                    cntr = new L.LatLng(xj.lat, xj.lon);

                    if (xj.action === 'pan') {
                        mphmap.setView(cntr, zm);
                    } else {
                        if (tmpLon !== xj.lon || tmpLat !== xj.lat) {
                            mphmap.setView(cntr, zm);
                        } else {
                            mphmap.setZoom(zm);
                        }
                    }
                    userZoom = true;
                }

                AgoNewWindowConfig.setPosition({'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG});
            }

            function configureMap(lmap) {
                var qlat = AgoNewWindowConfig.lat(),
                    qlon = AgoNewWindowConfig.lon(),
                    qzoom = AgoNewWindowConfig.zoom(),
                    osmUrl,
                    lyr,
                    elem;
                console.debug("ready to show mphmap");
                mphmap = lmap; //L.map('map_canvas').setView([51.50, -0.09], 13);
                console.debug(mphmap);
                showLoading();

                geoCoder =  GeoCoder; //.nominatim();

                if (AgoNewWindowConfig.testUrlArgs()) {
                    qlat = AgoNewWindowConfig.lat();
                    qlon = AgoNewWindowConfig.lon();
                    qzoom = AgoNewWindowConfig.zoom();
                    mphmap.setView([qlat, qlon], qzoom);
                    updateGlobals("init with qlon, qlat", qlon, qlat, qzoom);
                } else {
                    mphmap.setView([41.888941, -87.620692], 13);
                    updateGlobals("init with hard-coded values", -87.620692, 41.888941,  13);
                }
                console.log(mphmap.getCenter().lng + " " +  mphmap.getCenter().lat);

                showGlobals("Prior to new Map");

                osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

                lyr = L.tileLayer(osmUrl, {
                    maxZoom: 18,
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="http://cloudmade.com">CloudMade</a>'
                }).addTo(mphmap);

                lyr.on("loading", function (e) {
                    showLoading();
                });
                lyr.on("load", function (e) {
                    hideLoading();
                });

                minZoom = mphmap.getMinZoom();
                maxZoom = mphmap.getMaxZoom();
                zoomLevels = maxZoom - minZoom + 1;
                collectScales();
                bounds = mphmap.getBounds(); // returns LatLngBounds  -- also check getBoundsZoom(bounds, inside? bool)

                addInitialSymbols();

                console.log("again " + mphmap.getCenter().lng + " " +  mphmap.getCenter().lat);
                // mphmapCenter = mphmap.getCenter();
                mphmap.on("mousemove", function (e) {
                    onMouseMove(e);
                });
                mphmap.on("click", function (e) {
                    onMapClick(e);
                });
                mphmap.on("zoomend", function (e) {
                    if (userZoom === true) {
                        setBounds('zoom', null);
                    }
                });

                mphmap.on("moveend", function (e) {
                    if (userZoom === true) {
                        setBounds('pan', e.latlng);
                    }
                });
                elem = document.getElementById('pac-input');
                // aelem = angular.element(elem);
                elem.style.display = 'block';
            }

            function getMapHosterName() {
                return "hostName is " + hostName;
            }

            function getEventDictionary() {
                var $inj = angular.injector(['app']),
                    evtSvc = $inj.get('StompEventHandlerService'),
                    eventDct = evtSvc.getEventDct();
                return eventDct;
            }



            function setUserName(name) {
                AgoNewWindowConfig.setUserName(name);
            }

            function setPusherClient(pusher, channel) {
                var $inj = angular.injector(['app']),
                    evtSvc = $inj.get('StompEventHandlerService'),
                    evtDct = evtSvc.getEventDct(),
                    key;
                selfPusherDetails.pusher = pusher;
                selfPusherDetails.channel = channel;
                AgoNewWindowConfig.setChannel(channel);

                $inj = angular.injector(['app']);
                evtSvc = $inj.get('StompEventHandlerService');
                evtDct = evtSvc.getEventDct();
                for (key in evtDct) {
                    if (evtDct.hasOwnProperty(key)) {
                        pusher.subscribe(key, evtDct[key]);
                    }
                }
                console.log("reset MapHosterLeaflet setPusherClient, selfPusherDetails.pusher " +  selfPusherDetails.pusher);
            }

            // MapHosterLeaflet.prototype.getGlobalsForUrl = function()
            function getGlobalsForUrl() {
                console.log(" MapHosterLeaflet.prototype.getGlobalsForUrl");
                console.log("&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG);
                return "&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG;
            }


            function publishPosition(pos) {
                if (selfPusherDetails.pusher) {
                    console.log("MapHosterLeaflet.publishPosition");
                    // pos['maphost'] = 'Leaflet';
                    console.log(pos);

                    var lfltBounds = mphmap.getBounds(),
                        bnds = {},
                        ne,
                        sw;
                    console.debug(lfltBounds);
                    if (lfltBounds) {
                        ne = lfltBounds.getNorthEast();
                        sw = lfltBounds.getSouthWest();

                        bounds = lfltBounds;
                        lfltBounds.xmin = sw.lng;
                        lfltBounds.ymin = sw.lat;
                        lfltBounds.xmax = ne.lng;
                        lfltBounds.ymax = ne.lat;

                        bnds = {'llx' : sw.lng, 'lly' : sw.lat,
                                     'urx' : ne.lng, 'ury' : ne.lat};
                        AgoNewWindowConfig.setBounds(bnds);
                    }

                    bnds = AgoNewWindowConfig.getBoundsForUrl();
                    pos.search += bnds;

                    selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-NewMapPosition', pos);
                }

            }

            function getCenter() {
                var pos = { 'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG};
                console.log("return accurate center from getCenter()");
                console.debug(pos);
                return pos;
            }

            function MapHosterLeaflet() {
                // var self = this;
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

            function removeEventListeners() {
                mphmap.removeEventListener();
                mphmap.zoomControl.removeFrom(mphmap);
            }

            function resizeWebSiteVertical(isMapExpanded) {
                console.log('resizeWebSiteVertical');
                mphmap.invalidateSize(false);
            }

            function resizeVerbageHorizontal(isMapExpanded) {
                console.log('resizeVerbageHorizontal');
                mphmap.invalidateSize(false);
            }

            return {
                start: init,
                config : configureMap,
                resizeWebSite: resizeWebSiteVertical,
                resizeVerbage: resizeVerbageHorizontal,
                retrievedBounds: retrievedBounds,
                retrievedClick: retrievedClick,
                setPusherClient: setPusherClient,
                setUserName : setUserName,
                getGlobalsForUrl: getGlobalsForUrl,
                getEventDictionary : getEventDictionary,
                publishPosition : publishPosition,
                getCenter : getCenter,
                removeEventListeners : removeEventListeners,
                getMapHosterName : getMapHosterName
            };
        });
}());
