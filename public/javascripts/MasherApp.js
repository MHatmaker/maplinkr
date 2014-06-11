String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];
    
    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    
    return theString;
}

var MasherApp = angular.module("MasherApp", ['ngRoute', 'ui.bootstrap']);
/* 
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    alert('MasherApp module route provider');
    $routeProvider.
      when('/', {
        // templateUrl: 'index',
        templateUrl: '/partials/index',
        controller: MasherCtrl, reloadOnSearch: true
      }).
      when('/showDoc/:id', {
        templateUrl: 'partials/readDoc',
        controller: DocShowCtrl
      }).
      otherwise({
          redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
   }
]); */

var MasherCtrl = function ($scope) {
  alert('MasherCtrl - initialize some tabs');
  $scope.isCollapsed = false;
  var contentsText = 'This tab opens a typical web page which displays typical web page stuff, including a div with {0}  programmed with {1} embedded in it.  Right click on the link below and select open in a new window or open in a new tab.';
    
  $scope.tabs = [
    { title:'Google Maps', 
      content: "a Google map", 
      /* 
      //String.Format(contentsText, 'a Google map', 'google map content'),
      ref: "http://localhost:8080/googlemap",
      refLabel: "Web Site with Google Maps Embedded...",
      imgSrc: "stylesheets/images/googlemap.png",
      imgAlt: "Google Map",
       */
      active: true,
      disabled: false
    },
    { title:'Leaflet/Cloudmade Maps', 
      content: "a Leaflet/Cloudmade map",
/* 
      //String.Format(contentsText, 'a Leaflet/Cloudmade map', 'Leaflet content'),
      ref: "http://localhost:8080/leaflet}",
      refLabel: "Web Site with Leaflet/Cloudmade Maps Embedded...",
      imgSrc:  "stylesheets/images/Leaflet.png",
      imgAlt: "Leaflet/Cloudmade Maps",
       */
      active: false,
      disabled: false
    },
    { title:'ArcGIS Web Maps', 
      content: "an ArcGIS Web Map",
      /*
      // String.Format(contentsText, 'an ArcGIS Web Map', 'ArcGIS Online content'),
      ref: "http://localhost:8080/arcgis",
      refLabel: "Web Site with ArcGIS Web Maps Embedded...",
      imgSrc: "stylesheets/images/arcgis.png",
      imgAlt: "ArcGIS Web Maps",
       */
      active: false,
      disabled: false
    }
  ];

};