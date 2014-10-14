
(function() {
    'use strict';
    var locationPath = "/";
    
    define('angular', function () {
        if (angular) {
            return angular;
        }
        return {};
    });
    
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
        },
      /*   
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
        'javascripts/lib/AgoNewWindowConfig',
        'javascripts/bootstrap',
        'lib/MapHosterLeaflet',
        'lib/MapHosterGoogle',
        'lib/MapHosterArcGIS',
        'lib/Modal311'
    // ], function(dojo, domReady, esriPortal, bootstrap, modal311) {
    ], function(dojo, domReady, esriPortal, AgoNewWindowConfig, bootstrap ) {
        console.debug('call ready');
        console.log(bootstrap);
        console.log('AgoNewWindowConfig initialization');
        console.log(AgoNewWindowConfig);
        // console.log(domReady);
        // console.log(dom);
        
        console.log("before domready, url is " + location.search);
        AgoNewWindowConfig.setLocationPath(location.origin + location.pathname);
        AgoNewWindowConfig.setSearch(location.search);
        AgoNewWindowConfig.sethref(location.href);
        AgoNewWindowConfig.sethostport(location.hostport);
        // AgoNewWindowConfig.setChannel("private-channel-mashover");
        AgoNewWindowConfig.showConfigDetails();
        domReady(function () {
            var portal, portalUrl = document.location.protocol + '//www.arcgis.com';
            portal = new esri.arcgis.Portal(portalUrl);
            console.info('start the bootstrapper');
            console.debug(bootstrap);
            readyForSearchGrid(portal);
            readyForSearchGridMap(portal);
            bootstrap.start();
        });
    });

}).call(this);
