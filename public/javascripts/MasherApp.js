

// var portalForSearch;

(function() {
    'use strict';
    var locationPath = "/";

    define('angular', function () {
        if (angular) {
            return angular;
        }
        return {};
    });
    // define('ui.bootstrap.modal', function () {
    //     if (ui.bootstrap.modal) {
    //         return ui.bootstrap.modal;
    //     }
    //     return {};
    // });

    require({
        async: true,
        //aliases: [['text', 'dojo/text']],
        packages: [{
            name: 'controllers',
            location: locationPath + 'javascripts/controllers'
        },
        {
            name: 'lib',
            location: locationPath + 'javascripts/lib'
        },
        {
            name: 'javascripts',
            location: locationPath + 'javascripts'
        }
      /*   ,
        {
            name: 'Geocoder',
            location: locationPath + 'javascripts/lib/L.Control.Geocoder'
        }
        {
            name: 'bootstrap',
            location: locationPath + 'javascripts'
        }
         */
        // ,
        // {
            // name: 'dojo',
            // location: '//ajax.googleapis.com/ajax/libs/dojo/1.9.3/'
        // }
        ]
    });

    require([
        "dojo",
        "dojo/domReady",
        "esri/arcgis/Portal",
        'javascripts/lib/MLConfig',
        'javascripts/bootstrap',
        'lib/GeoCoder',
        'controllers/MapCtrl',
        'lib/MapHosterLeaflet',
        'lib/MapHosterGoogle',
        'lib/MapHosterArcGIS',
        'lib/Modal311',
        'lib/fsm',
        'lib/utils'
    // ], function(dojo, domReady, esriPortal, bootstrap, modal311) {
    ], function(dojo, domReady, esriPortal, MLConfig, bootstrap ) {
        console.debug('call ready');
        console.log(bootstrap);
        console.log('MLConfig initialization');
        MLConfig.showConfigDetails('MasherApp startup before modifying default settings');

        console.log("before domready, url is " + location.search);
        console.log("before domready, href is " + location.href);
        MLConfig.setLocationPath(location.origin + location.pathname);
        MLConfig.setSearch(location.search);

        if(location.search == ''){
            MLConfig.setInitialUserStatus(true);
            MLConfig.setprotocol(location.protocol);
            MLConfig.sethost(location.host);
            MLConfig.sethostport(location.port);
            MLConfig.setReferrerId(-99);
        }
        else{
            MLConfig.setprotocol(location.protocol);
            MLConfig.sethost(location.host);
            MLConfig.sethostport(location.port);
            var referrerId = MLConfig.getReferrerIdFromUrl(); // sets id in config object
            var referrerName = MLConfig.getReferrerNameFromUrl(); // sets id in config object
            // MLConfig.setUserId(referrerId);
            MLConfig.setInitialUserStatus(false);
            var channel = MLConfig.getChannelFromUrl();
            if(channel != ''){
              MLConfig.setChannel(channel);
              MLConfig.setNameChannelAccepted(true);
            }
            MLConfig.setStartupView(true, false);
            console.log("MLConfig.SETSTARTUPVIEW")
        }
        // console.log("userId " + MLConfig.getUserId() + " referrerId " + MLConfig.getReferrerId());
        console.log("is Initial User ? " + MLConfig.getInitialUserStatus());
        MLConfig.sethref(location.href);
        MLConfig.sethostport(location.port);

        MLConfig.showConfigDetails('MasherApp startup after modifying default settings');
        domReady(function () {
            var portal, portalUrl = document.location.protocol + '//www.arcgis.com';
            portal = new esri.arcgis.Portal(portalUrl);
            var portalForSearch = portal;
            console.info('start the bootstrapper');
            console.debug(bootstrap);
            //readyForSearchGrid(portal);
            // readyForSearchGridMap(portal);
            bootstrap.start(portalForSearch);
        });
    });

}).call(this);
