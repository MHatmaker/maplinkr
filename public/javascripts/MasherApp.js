'use strict';

(function() {
    'use strict';
    
    var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
    //locationPath =  "./";
    console.log(locationPath);
    
    define('angular', function () {
        if (angular) {
            return angular;
        }
        return {};
    });
    
    require({
        async: true,
        aliases: [['text', 'dojo/text']],
        packages: [{
            name: 'controllers',
            location: locationPath + 'javascripts/controllers'
        }, 
        {
            name: 'javascripts',
            location: locationPath + 'javascripts'
        }/* ,
        { 
            name: 'dojo',
            location: '//ajax.googleapis.com/ajax/libs/dojo/1.9.3/'
        } */
        ]
    });

    require([
        // "dojo",
        "dojo/domReady",
        // 'dojo/ready',
        // 'dojo/domReady',
        // 'ready!',
        // "dojo/dom", 
        'javascripts/bootstrap'
    ], function(domReady, bootstrap) {
        console.debug('call ready');
        console.log(domReady);
        // console.log(dom);
        domReady(function () {
            console.info('start the bootstrapper');
            console.debug(bootstrap);
            bootstrap.start();
        });
    });

}).call(this);
