

/*global define */
/*global require */
/*global esri */

// document.domain=document.domain   <<<<<<< was originally in separate js file referenced
// in layout.jade before any other js references.  lib/djConfig.js was also removed from
// lib folder and from reference in layout.jade

(function () {
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
        packages: [
            {
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
        ]
    });

    require([
        "dojo",
        "dojo/domReady",
        "esri/arcgis/Portal",
        'javascripts/lib/MLConfig',
        'javascripts/bootstrap'
    ], function (dojo, dojodomReady, esriPortal, MLConfig, bootstrap) {
        var channel;

        console.debug('call ready');

        console.log('MLConfig initialization');
        MLConfig.showConfigDetails('MasherApp startup before modifying default settings and dojodomReady');

        MLConfig.setLocationPath(location.origin + location.pathname);
        MLConfig.setSearch(location.search);
        MLConfig.setprotocol(location.protocol);
        MLConfig.sethost(location.host);
        MLConfig.sethostport(location.port);
        MLConfig.sethref(location.href);

        if (location.search === '') {
            MLConfig.setInitialUserStatus(true);
            MLConfig.setReferrerId(-99);
        } else {
            MLConfig.setInitialUserStatus(false);
            channel = MLConfig.getChannelFromUrl();
            if (channel !== '') {
                MLConfig.setChannel(channel);
                MLConfig.setNameChannelAccepted(true);
            }
            MLConfig.setStartupView(true, false);
            console.log("MLConfig.SETSTARTUPVIEW to sumvis true, sitevis false");
        }

        console.log("is Initial User ? " + MLConfig.getInitialUserStatus());

        MLConfig.showConfigDetails('MasherApp startup after modifying default settings');
        dojodomReady(function () {
            var
                portalUrl = document.location.protocol + '//www.arcgis.com',
                portalForSearch = new esri.arcgis.Portal(portalUrl);
            console.info('start the bootstrapper');
            bootstrap.start(portalForSearch);
        });
    });
}());
// }).call(this);
