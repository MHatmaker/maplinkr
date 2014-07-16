
(function() {
    "use strict";

    console.log('StartupLeaflet setup');
    define([
        'leaflet',
        'MapHosterLeaflet'
    ], function(MapHosterLeaflet) {
        console.log('StartupLeaflet define');
        var CHANNEL = '/mapxtnt/';
        var mph = null; 
        var loading;
        var newSelectedWebMapId = "";

        function StartupLeaflet() {
            function configure(newMapId) 
            {
                newSelectedWebMapId = newMapId;
                window.loading = dojo.byId("loadingImg")
                console.log(window.loading);
                if( newSelectedWebMapId )
                {
                    setupPusherClient(mph, function(channel){
                        var url = "?id=" + newSelectedWebMapId + mph.getGlobalsForUrl() + "&channel=" + channel;
                        console.log("open new ArcGIS window with URI " + url);
                        console.log("using channel " + channel);
                        window.open("http://localhost:8080/arcgis/" + url);
                        });
                }
                else
                {
                    var lMap = L.map('map_canvas').setView([41.8, -87.7], 13);
                    // var lMap = L.map('map').setView([51.50, -0.09], 13);
                    // mph = new MapHosterLeaflet(lMap); 
                    mph = MapHosterLeaflet.start(); 
                    mph.configureMap(lMap);
                    // stomper = new StompClient(mph);
                }
            }   
        };
        function init() {
            console.log('StartupLeaflet init');
            return StartupLeaflet;
        }

        return { start: init };

    });

}).call(this);

// window.onload = function(){initialize()};
