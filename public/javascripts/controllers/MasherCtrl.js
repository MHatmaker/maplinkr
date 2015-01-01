
(function() {
    "use strict";
    var isFirstViewing = true;

    console.log('MasherCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig', 'controllers/WebSiteDescriptionCtrl', 'lib/utils'], function(angular,  AgoNewWindowConfig, WebSiteDescriptionCtrl, utils) {
        console.log('MasherCtrl define');
        var selfMethods = {};
        var descriptions = {
            'leaflet': 'A selection of coffee shops that were retrieved from a query to a geographic information lookup service, using open source maps and data, displayed on a Leaflet Map.  Alternatively, this could be the web site for a single organization where one of the web site pages contains a Leaflet map of its multiple locations.',
            'google' : 'A selection of restaurants that were retrieved from a query to a geographic information lookup service, such as Google, displayed on a Google Map using an Open Street Map base layer.  Alternatively, this could be the web site for a single organization where one of the web site pages contains a Google map of its multiple locations.',
            'arcgis' : 'A typical Web Map from the ArcGIS Online user contributed database.  The intially displayed map is chosen to provide a working environment for this demo.'
        };
        
        var hgtComponents = {
            "totalHgt" : null,
            "idMasterSite" : null,
            "idMasterSiteExpander": null,
            "idMasterSiteSummary" : null,
            "idNavigator" : null,
            "idSiteTopRow" : null,
            "idFooter" : null,
        };
  
        function MasherCtrl($scope, $location, $route, $routeParams, $window) {
            console.debug('MasherCtrl - initialize collapsed bool');
            // alert('MasherCtrl - initialize some tabs');
            
            $scope.ExpandSum = "Collapse";
            $scope.ExpandNav = "Collapse";
            $scope.MasterSiteVis = "inline";
            $scope.NavigatorVis = "flex";
  
            $scope.expBtnHeight = 1.2;  //utils.getButtonHeight(1.2); //'ExpandSumImgId');
            $scope.isCollapsed = false;
            
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
                $scope.MasterSiteVis = $scope.ExpandSum == "Expand" ? "inline" : "none";
                $scope.ExpandSum = $scope.ExpandSum == "Expand" ? "Collapse" : "Expand";
            
                console.log("MasherCtrl isCollapsed before broadcast " + $scope.isCollapsed);
                $scope.$broadcast('CollapseSummaryEvent', {'mastersitevis' : $scope.MasterSiteVis,
                                                            'navVis' : $scope.NavigatorVis });
                $scope.isCollapsed = !$scope.isCollapsed;
                console.log("MasherCtrl isCollapsed after broadcast " + $scope.isCollapsed);
                
                /* From flexbox.js plunker
                  var totalHgt = utils.getComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                  showHeights(prevTotalHgt, totalHgt);
                  prevTotalHgt = totalHgt;
                  var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, $scope.SiteVis);
                  $scope.innerTblHeight = colHgt + hgtComponents.idSiteTopRow + hgtComponents.idFooter;
                  $scope.bodyColHeight = colHgt;
                  $scope.wrapperHeight = utils.getMasterSiteHeight() - totalHgt;
                  $scope.childSiteHeight = colHgt;
                 */
            };
            selfMethods["summmaryCollapser"] = $scope.summmaryCollapser;
            console.debug(selfMethods);
            
            $scope.onExpNavClick = function(){
                $scope.NavigatorVis = $scope.ExpandNav == "Expand" ? "flex" : "none";
                $scope.ExpandNav = $scope.ExpandNav == "Expand" ? "Collapse" : "Expand";

                $scope.$broadcast('CollapseNavigatorEvent', {'mastersitevis' : $scope.MasterSiteVis,
                                                            'navVis' : $scope.NavigatorVis });
                
                /* From flexbox.js plunker
                var totalHgt = utils.getComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                showHeights(prevTotalHgt, totalHgt);
                prevTotalHgt = totalHgt;
                var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, $scope.SiteVis);
                $scope.innerTblHeight = colHgt + hgtComponents.idSiteTopRow + hgtComponents.idFooter;
                $scope.bodyColHeight = colHgt;
                $scope.wrapperHeight = utils.getMasterSiteHeight() - totalHgt;
                $scope.childSiteHeight = colHgt;
                 */
            };
            
            $scope.windowResized = function(){
                $scope.$broadcast('windowResized');
                // $scope.$apply(function() {
                    // $scope.width = window.innerWidth;
                    // $scope.height = window.innerHeight;
                // });
                
                /* From flexbox.js plunker
                    calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                    var totalHgt = getComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                    showHeights(prevTotalHgt, totalHgt);
                    prevTotalHgt = totalHgt;
                    var colHgt = getAvailableSiteColumnHeights($scope.MasterSiteVis, $scope.SiteVis);
                    $scope.innerTblHeight = colHgt + hgtComponents.idSiteTopRow + hgtComponents.idFooter;
                    $scope.bodyColHeight = colHgt;
                    $scope.wrapperHeight = getMasterSiteHeight() - totalHgt;
                    $scope.childSiteHeight = colHgt;
                    */
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
            
            $scope.onNewMapPosition = function(pos){
                console.log("In onNewMapPosition scope handler");
                console.log(pos);
                var agoId = pos.webmapId && pos.webmapId != '' ? pos.webmapId : '';
                var pos2prt = String.format('open map using framework {0} at x {1}, y {2}, zoom {3}, webmapId {4}', 
                    pos.maphost, pos.lon, pos.lat, pos.zoom, agoId);
                console.log(pos2prt);
                    
                var isNewAgoWindow = pos.maphost && pos.maphost == 'arcgis';
                if(isNewAgoWindow){
                    // alert("isNewAgoWindow is true");
                    /* 
                    AgoNewWindowConfig.setSearch(pos.search);
                    AgoNewWindowConfig.setWebmapId(agoId);
                    AgoNewWindowConfig.setPosition({'lon' : pos.lon, 'lat' : pos.lat, 'zoom' : pos.zoom});
                    AgoNewWindowConfig.setDestination('New Pop-up Window');
                    AgoNewWindowConfig.setSearch(pos.search);
                    // AgoNewWindowConfig.setChannel(pos.search);
                     */
                    var completeUrl = AgoNewWindowConfig.gethref() + "arcgis/" + pos.search;
                    console.log('completeUrl');
                    console.log(completeUrl);
                    window.open(completeUrl, pos.webmapId, "top=1, left=1, height=400,width=500");
                    console.log("after call to window.open");
                }
            }
            selfMethods["onNewMapPosition"] = $scope.onNewMapPosition;
        };
        
        MasherCtrl.prototype.windowResized = function(){
            selfMethods["windowResized"]();
        }
        
        function init(App) {
            console.log('MasherCtrl init');
            App.controller('MasherCtrl', ['$scope', '$location', MasherCtrl]);
            //calling tellAngular on resize event
            window.onresize = MasherCtrl.prototype.windowResized;
        
            var $inj = angular.injector(['app']);
            var evtSvc = $inj.get('StompEventHandlerService');
            evtSvc.addEvent('client-NewMapPosition', onNewMapPosition);
            return MasherCtrl;
        }
        function startArcGIS(){
            console.log("startArcGIS");
            isFirstViewing = false;
            selfMethods["summmaryCollapser"]();
        }
         
        function onNewMapPosition(pos){
            console.log("onNewMapPosition");
            
            selfMethods["onNewMapPosition"](pos);
        }
 
        return { start: init, startArcGIS: startArcGIS, onNewMapPosition : onNewMapPosition };

    });

}).call(this);