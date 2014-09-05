

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


(function() {
    'use strict';
    /* 
    var locationPath = "";
    var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
    //locationPath =  "./";
    // console.log(locationPath);
     */
    var locationPath = "/";
    //var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
    console.log(location.pathname);
    console.log(location.search);
    console.log(locationPath);
    var webmapId = getParameterByName('id');
    var masherChannel = getParameterByName('channel');
    console.log("webmapId " + webmapId + " channel " + masherChannel);
    
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
        // 'dojo/ready',
        // 'dojo/domReady',
        // 'ready!',
        // "dojo/dom", 
        'javascripts/bootstrap' //, 
        // 'javascripts/Modal311'
    // ], function(dojo, domReady, esriPortal, bootstrap, modal311) {
    ], function(dojo, domReady, esriPortal, bootstrap) {
        console.debug('call ready');
        console.log(bootstrap);
        // console.log(domReady);
        // console.log(dom);
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
