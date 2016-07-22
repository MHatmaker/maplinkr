

/*global define */
/*global require */
/*global esri */

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
    ], function (dojo, domReady, esriPortal, MLConfig, bootstrap) {
        console.debug('call ready');

        console.log('MLConfig initialization');
        MLConfig.showConfigDetails('MasherApp startup before modifying default settings');

        console.log("before domready, url is " + location.search);
        console.log("before domready, href is " + location.href);
        MLConfig.setLocationPath(location.origin + location.pathname);
        MLConfig.setSearch(location.search);

        if (location.search === '') {
            MLConfig.setInitialUserStatus(true);
            MLConfig.setprotocol(location.protocol);
            MLConfig.sethost(location.host);
            MLConfig.sethostport(location.port);
            MLConfig.setReferrerId(-99);
        } else {
            MLConfig.setprotocol(location.protocol);
            MLConfig.sethost(location.host);
            MLConfig.sethostport(location.port);

            MLConfig.setInitialUserStatus(false);
            var channel = MLConfig.getChannelFromUrl();
            if (channel !== '') {
                MLConfig.setChannel(channel);
                MLConfig.setNameChannelAccepted(true);
            }
            MLConfig.setStartupView(true, false);
            console.log("MLConfig.SETSTARTUPVIEW");
        }

        console.log("is Initial User ? " + MLConfig.getInitialUserStatus());
        MLConfig.sethref(location.href);
        MLConfig.sethostport(location.port);

        MLConfig.showConfigDetails('MasherApp startup after modifying default settings');
        domReady(function () {
            var
                portalUrl = document.location.protocol + '//www.arcgis.com',
                portalForSearch = new esri.arcgis.Portal(portalUrl);
            console.info('start the bootstrapper');
            bootstrap.start(portalForSearch);
        });
    });
}());
// }).call(this);
