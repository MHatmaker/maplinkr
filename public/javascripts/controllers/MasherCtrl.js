
(function() {
    "use strict";
    var isFirstViewing = true;

    console.log('MasherCtrl setup');
    define(['angular', 'controllers/WebSiteDescriptionCtrl'], function(angular, WebSiteDescriptionCtrl) {
        console.log('MasherCtrl define');
        var selfMethods = {};
        var descriptions = {
            'leaflet': 'A selection of coffee shops that were retrieved from a query to a geographic information lookup service, using open source maps and data, displayed on a Leaflet Map.  Alternatively, this could be the web site for a single organization where one of the web site pages contains a Leaflet map of its multiple locations.',
            'google' : 'A selection of restaurants that were retrieved from a query to a geographic information lookup service, such as Google, displayed on a Google Map using an Open Street Map base layer.  Alternatively, this could be the web site for a single organization where one of the web site pages contains a Google map of its multiple locations.',
            'arcgis' : 'A typical Web Map from the ArcGIS Online user contributed database.  The intially displayed map is chosen to provide a working environment for this demo.'
        };
        
        function MasherCtrl($scope, $location, $route, $routeParams) {
            console.debug('MasherCtrl - initialize collapsed bool');
            // alert('MasherCtrl - initialize some tabs');
            
            $scope.Header = "Site Exerciser";
            $scope.ExpandPlug = "Show Plugin";
            $scope.ExpandSum = "Hide Summary";
            $scope.ExpandNav = "Hide Navigator";
            $scope.ExpandSite = "Hide WebSite";
            $scope.VerbVis = "none";
            $scope.MasterSiteVis = "inline";
            $scope.NavigatorVis = "flex";
            $scope.SiteVis = "flex";
  
            $scope.expBtnHeight = getButtonHeight();
            $scope.isCollapsed = false;
            $scope.sumExpandCollapse = "Collapse";
            
            $scope.currentTab = null;
            console.log("init with isCollapsed = " + $scope.isCollapsed);
            $scope.showDescriptionDialog = false;
            
            $scope.$on('$viewContentLoaded', function(){
                // alert($route.current.templateUrl + ' is loaded !!');
                // alert('templateUrl  is loaded !!');
                if(isFirstViewing == false){
                    $scope.summmaryCollapser();
                }
                else{
                    isFirstViewing = false;
                }
            });
            
            $scope.summmaryCollapser = function(){
                console.log("MasherCtrl isCollapsed before broadcast " + $scope.isCollapsed);
                $scope.$broadcast('CollapseSummaryEvent');
                $scope.isCollapsed = !$scope.isCollapsed;
                $scope.sumExpandCollapse =  $scope.isCollapsed ? "Expand" : "Collapse";
                console.log("MasherCtrl isCollapsed after broadcast " + $scope.isCollapsed);
            };
            selfMethods["summmaryCollapser"] = $scope.summmaryCollapser;
            console.debug(selfMethods);
            
            
            $scope.windowResized = function(){
                $scope.$broadcast('windowResized');
                // $scope.$apply(function() {
                    // $scope.width = window.innerWidth;
                    // $scope.height = window.innerHeight;
                // });
            };
            selfMethods["windowResized"] = $scope.windowResized;
            
            $scope.showMeTheMapClicked = function(){
                console.log("currentTab - url reset to " + $scope.currentTab.url);
                console.debug($location);
                $location.path($scope.currentTab.url);
                // $scope.summmaryCollapser();
            };
            
            $scope.describeTheWebsiteClicked = function(){
                console.log("Describe the website for currentTab " + $scope.currentTab.title);
                WebSiteDescriptionCtrl.setDescription(descriptions[$scope.currentTab.maptype], $scope.currentTab.imgSrc);
                $scope.showDescriptionDialog = true;
                // $scope.$broadcast('ShowWebSiteDescriptionModalEvent');
            };
            
            $scope.$on('WebSiteDescriptionEvent', function() {
                console.log("WebSiteDescriptionEvent received, currentTab - url reset to " + $scope.currentTab.url);
                console.debug($location);
                var showElem = document.getElementById('showMeTheMap');
                var showElemA = angular.element(showElem);
                var showElem0 = showElemA[0];

                // $location.path($scope.currentTab.url);
                showElem0.click();
            });
        };
        
        MasherCtrl.prototype.windowResized = function(){
            selfMethods["windowResized"]();
        }
        
        function init(App) {
            console.log('MasherCtrl init');
            App.controller('MasherCtrl', ['$scope', '$location', MasherCtrl]);
            //calling tellAngular on resize event
            window.onresize = MasherCtrl.prototype.windowResized;
            return MasherCtrl;
        }
        function startArcGIS(){
            console.log("startArcGIS");
            isFirstViewing = false;
            selfMethods["summmaryCollapser"]();
        }

        return { start: init, startArcGIS: startArcGIS };

    });

}).call(this);