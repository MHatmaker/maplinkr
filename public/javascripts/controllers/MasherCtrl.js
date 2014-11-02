
(function() {
    "use strict";
    var isFirstViewing = true;

    console.log('MasherCtrl setup');
    define(['angular', 'controllers/WebSiteDescriptionCtrl'], function(angular, WebSiteDescriptionCtrl) {
        console.log('MasherCtrl define');
        var selfMethods = {};
        var descriptions = {
            'leaflet': 'Tell me about the leaflet site',
            'google' : 'Tell me about the google site',
            'arcgis' : 'Tell me about the arcgis site'
        };
        
        function MasherCtrl($scope, $location, $route, $routeParams, WebSiteDescriptionCtrl) {
            console.debug('MasherCtrl - initialize collapsed bool');
            // alert('MasherCtrl - initialize some tabs');
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
                WebSiteDescriptionCtrl.setDescription($scope.currentTab.maptype);
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
            App.controller('MasherCtrl', ['$scope', '$location', 'WebSiteDescriptionCtrl', MasherCtrl]);
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