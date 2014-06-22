'use strict';

String.format = function() {
    console.debug("lets format something");
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];
    console.debug(arguments[0]);
    
    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    
    return theString;
};

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
        },
        { 
            name: 'dojo',
            location: '//ajax.googleapis.com/ajax/libs/dojo/1.9.3/'
        }
        ]
    });

    require([
        "dojo",
        // "dojo/dom", // "dojo/domReady!",
        // 'dojo/ready',
        'dojo/domReady!',
        'javascripts/bootstrap'
    ], function(ready, bootstrap) {
        console.debug('call ready');
        console.log(ready);
        console.log(dom);
        ready(function (dom) {
            console.info('start the bootstrapper');
            console.debug(bootstrap);
            bootstrap.start();
        });
    });

}).call(this);
