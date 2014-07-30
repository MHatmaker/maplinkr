
(function() {
    'use strict';
    
    var locationPath = "";
    var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
    //locationPath =  "./";
    // console.log(locationPath);
    
    define('angular', function () {
        if (angular) {
            return angular;
        }
        return {};
    });
  /*   define('ngGrid', function () {
        if (ngGrid) {
            return ngGrid;
        }
        return {};
    }); */
    define('leaflet', function () {
        if (leaflet) {
            return leaflet;
        }
        return {};
    });
    // define('google', function () {
    // if (google) {
        // return google;
    // }
    // return {};
// });
    
    require({
        async: true,
        aliases: [['text', 'dojo/text']],
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
        // 'dojo/ready',
        // 'dojo/domReady',
        // 'ready!',
        // "dojo/dom", 
        'javascripts/bootstrap'
    ], function(dojo, domReady, esriPortal, bootstrap) {
        console.debug('call ready');
        // console.log(domReady);
        // console.log(dom);
        // domReady(function () {
            var portal, portalUrl = document.location.protocol + '//www.arcgis.com';
            portal = new esri.arcgis.Portal(portalUrl);
            console.info('start the bootstrapper');
            console.debug(bootstrap);
            readyForSearchGrid(portal);
            readyForSearchGridMap(portal);
            bootstrap.start();
        // });
    });

}).call(this);
