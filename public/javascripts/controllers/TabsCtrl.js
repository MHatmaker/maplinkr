
String.format = function() {
    // console.debug("lets format something");
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];
    // console.debug(arguments[0]);
    
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
    "use strict";

    console.log('TabsCtrl setup');
    define(['angular'], function(angular) {
        console.log('TabsCtrl define');
        var selfMethods = {};

        function TabsCtrl($scope, $location) {
            console.debug('TabsCtrl - initialize tabs');

            var contentsText = 'The {0} tab opens a typical web page displaying typical web page stuff, including a div with {1}  programmed with {2} embedded in it.';

            $scope.tabs = [
            { 
              maptype : 'google',
              title:'Google Maps', 
              site: 'Web Site featuring a Google Map',
              content: String.format(contentsText, 'Google Map', 'a Google map', 'google map content'),
              url: "/views/partials/GoogleMap.jade",
              imgSrc: "stylesheets/images/googlemap.png",
              imgAlt: "Google Map",
              active: true,
              disabled: false
            },
            { 
              maptype : 'leaflet',
              title:'Leaflet/OSM Maps', 
              site: 'Web Site featuring a Leaflet Map',
              content: String.format(contentsText, 'Leaflet/OSM Map',  'a Leaflet/OSM map', 'Leaflet content'),
              url: "/views/partials/Leaflet.jade",
              imgSrc:  "stylesheets/images/Leaflet.png",
              imgAlt: "Leaflet/OSM Maps",
              active: false,
              disabled: false
            },
            { 
              maptype : 'arcgis',
              title:'ArcGIS Web Maps', 
              site: 'Web Site featuring an ArcGIS Online Map',
              content: String.format(contentsText, 'ArcGIS', 'an ArcGIS Web Map', 'ArcGIS Online content'),
              url: "/views/partials/ArcGIS.jade",
              imgSrc: "stylesheets/images/arcgis.png",
              imgAlt: "ArcGIS Web Maps",
              active: false,
              disabled: false
            }
            ];
            
            $scope.currentTab = $scope.tabs[0]; 
            $scope.$parent.currentTab = $scope.currentTab;
            console.log("currentTab - url initialized to " + $scope.currentTab.url);
            
            var $inj = angular.injector(['app']);
            var serv = $inj.get('CurrentMapTypeService');
            serv.setCurrentMapType($scope.currentTab.maptype);

            $scope.onClickTab = function (tb) {
                //alert("clicked on " + tb.url);
                $scope.currentTab =$scope.$parent.currentTab = tb;
                var $inj = angular.injector(['app']);
                var serv = $inj.get('CurrentMapTypeService');
                serv.setCurrentMapType($scope.currentTab.maptype);
            
                console.debug("clicked on tab : " + tb.url);
            }
            $scope.isActiveTab = function(tabUrl) {
                //console.debug("set active tab testing " + tabUrl);
                return tabUrl == $scope.currentTab.url;
            }
            console.log("onClickTab and isActiveTab defined ");
            
            $scope.selectAgo = function(){
                $scope.currentTab =$scope.$parent.currentTab = $scope.tabs[2];
                console.log("currentTab - url reset to " + $scope.currentTab.url);
                var newPath = "/views/partials/ArcGIS";
                console.log("selectAgo setting path to : " + newPath);
                $location.path(newPath);
            }
            selfMethods["selectAgo"] = $scope.selectAgo;
            
            $scope.forceAgo = function(){
                $scope.currentTab =$scope.$parent.currentTab = $scope.tabs[2];
            }
            selfMethods["forceAgo"] = $scope.forceAgo;
            
            $scope.selectGoogle = function(){
                $scope.currentTab =$scope.$parent.currentTab = $scope.tabs[0];
                console.log("currentTab - url reset to " + $scope.currentTab.url);
                var newPath = "/views/partials/GoogleMap";
                console.log("selectGoogle setting path to : " + newPath);
                $location.path(newPath);
            }
            selfMethods["selectGoogle"] = $scope.selectGoogle;
            
            $scope.forceGoogle = function(){
                $scope.currentTab =$scope.$parent.currentTab = $scope.tabs[0];
            }
            selfMethods["forceGoogle"] = $scope.forceGoogle;
            console.debug(selfMethods);
           
        };
            
        TabsCtrl.prototype.selectAgo = function (){
            selfMethods["selectAgo"]();
        }
            
        TabsCtrl.prototype.forceAgo = function (){
            selfMethods["forceAgo"]();
        }
        
        TabsCtrl.prototype.selectGoogle = function (){
            selfMethods["selectGoogle"]();
        }
            
        TabsCtrl.prototype.forceGoogle = function (){
            selfMethods["forceGoogle"]();
        }

        function init(App) {
            console.log('TabsCtrl init');
            App.controller('TabsCtrl', ['$scope', '$location', TabsCtrl]);
            return TabsCtrl;
        }

        return { start: init, selectAgo : TabsCtrl.prototype.selectAgo, forceAgo :  TabsCtrl.prototype.forceAgo,
                               selectGoogle : TabsCtrl.prototype.selectGoogle, forceGoogle :  TabsCtrl.prototype.forceGoogle};

    });

}).call(this);