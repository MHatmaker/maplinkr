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

var MasherApp = angular.module("MasherApp", ['ngRoute', 'ui.bootstrap'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    console.debug('MasherApp module route provider');
    var isCollapsed = false;
     
    $routeProvider.
      when('/', {
        templateUrl: 'index',
        // templateUrl: '/partials/index',
        controller: MasherApp.MasherCtrl, reloadOnSearch: true
      }).
      otherwise({
          redirectTo: '/'
      }); 
      
    console.debug('html5Mode');
    //alert('html5Mode before');
    $locationProvider.html5Mode(true);
    
    console.debug('html5Mode again')
    //alert('html5Mode after');
   }
]);

   var clickMe = function(){
        alert('clicked');
        isCollapsed = !isCollapsed
    }


// var MasherCtrl = function ($scope) {
MasherApp.controller('MasherCtrl', ['$scope', function ($scope) {
  console.debug('MasherCtrl - initialize collapsed bool');
  // alert('MasherCtrl - initialize some tabs');
  $scope.isCollapsed = false;
  $scope.currentTab = null;
  console.log("init with isCollapsed = " + $scope.isCollapsed);
}]);
  
  
// var TabsCtrl = function ($scope) {
MasherApp.controller('TabsCtrl', ['$scope', function ($scope) {
  console.debug('TabsCtrl - initialize tabs');
 
  var contentsText = 'This tab opens a typical web page which displays typical web page stuff, including a div with {0}  programmed with {1} embedded in it.  Right click on the link below and select open in a new window or open in a new tab.';
    
  $scope.tabs = [
    { title:'Google Maps', 
      content: String.format(contentsText, 'a Google map', 'google map content'),
 /*       
      ref: "http://localhost:8080/googlemap",
      refLabel: "Web Site with Google Maps Embedded...",
      imgSrc: "stylesheets/images/googlemap.png",
      imgAlt: "Google Map",
       */
      url: " '/views/partials/GoogleMap.jade' ",
      active: true,
      disabled: false
    },
    { title:'Leaflet/Cloudmade Maps', 
      content: String.format(contentsText, 'a Leaflet/Cloudmade map', 'Leaflet content'),
 /* 
      ref: "http://localhost:8080/leaflet}",
      refLabel: "Web Site with Leaflet/Cloudmade Maps Embedded...",
      imgSrc:  "stylesheets/images/Leaflet.png",
      imgAlt: "Leaflet/Cloudmade Maps",
       */
      url: " '/views/partials/Leaflet.jade' ",
       
      active: false,
      disabled: false
    },
    { title:'ArcGIS Web Maps', 
      content: String.format(contentsText, 'an ArcGIS Web Map', 'ArcGIS Online content'),
     /*  
      ref: "http://localhost:8080/arcgis",
      refLabel: "Web Site with ArcGIS Web Maps Embedded...",
      imgSrc: "stylesheets/images/arcgis.png",
      imgAlt: "ArcGIS Web Maps",
       */
      url: " '/views/partials/ArcGIS.jade' ",
       
      active: false,
      disabled: false
    }
  ];
   $scope.currentTab = $scope.tabs[0]; //'googlemaptab.tpl.html';
   $scope.$parent.currentTab = $scope.currentTab;
   console.log("currentTab - url initialized to " + $scope.currentTab.url);

    $scope.onClickTab = function (tb) {
        //alert("clicked on " + tb.url);
        $scope.currentTab =$scope.$parent.currentTab = tb;
        console.debug("clicked on " + tb.url);
    }
    
    $scope.isActiveTab = function(tabUrl) {
        //console.debug("set active tab testing " + tabUrl);
        return tabUrl == $scope.currentTab.url;
    }
   console.log("onClickTab and isActiveTab defined ");
   
}]);
