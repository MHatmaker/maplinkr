
dojo.require("esri.map");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.tasks.geometry");

var CHANNEL = '/mapxtnt/';
var stomp = null;
var mph = null; 

var xtntMap;
function initialize() 
{
    xtntMap = new esri.Map("mapDiv",{
      basemap: "streets",
      center: [-0.09, 51.50],
      zoom: 13
    });
    dojo.connect(xtntMap, "onLoad", function() 
    {
        mph = new MapHosterArcGIS(xtntMap); 
        stomper = new StompClient(mph);
     } );
}
//dojo.connect(dojo.byId('toggle'), 'onclick', function(e) {
//  mph.toggleLayer();
//});

//dojo.addOnLoad(initialize);
dojo.ready(initialize);