
dojo.require("esri.map");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.AccordionPane");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.tasks.geometry");
dojo.require("esri.IdentityManager");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.arcgis.utils");
dojo.require("dgrid.Grid");
dojo.require("dgrid/Selection");
// dojo.require("esri.arcgis.Portal");

var CHANNEL = '/mapxtnt/';
var stomp = null;
var mph = null; 

var map, urlObject;
var configOptions;
// var portal, portalUrl = document.location.protocol + '//www.arcgis.com';
var gridGroup;
var gridMap;
var selectedGroupId;
var selectedWebMapId = "e68ab88371e145198215a792c2d3c794";
var previousSelectedWebMapId = selectedWebMapId;
var loading;

function initialize(newSelectedWebMapId) 
{
    window.loading = dojo.byId("loadingImg")
	console.log(window.loading);
    //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications. 
    esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
  
    //specify any default settings for your map 
    //for example a bing maps key or a default web map id
    configOptions = {
        webmap:newSelectedWebMapId,
        title:"",
        subtitle:"",
        //arcgis.com sharing url is used modify this if yours is different
        sharingurl:"http://arcgis.com/sharing/content/items",
        //enter the bing maps key for your organization if you want to display bing maps
        bingMapsKey:"/*Please enter your own Bing Map key*/"
    }
      
    esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
    esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";
      
    //get the web map id from the url 
    urlObject = esri.urlToObject(document.location.href);
    urlObject.query = urlObject.query || {};
    if(urlObject.query && urlObject.query.webmap){
         configOptions.webmap = urlObject.query.webmap;
    }
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
		mph = new MapHosterLeaflet(lMap); 
		// stomper = new StompClient(mph);
	}
}   


window.onload = function(){initialize()};