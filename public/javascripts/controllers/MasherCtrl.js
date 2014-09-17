
(function() {
    "use strict";
    var isFirstViewing = true;

    console.log('MasherCtrl setup');
    define(['angular'], function(angular) {
        console.log('MasherCtrl define');
        var selfMethods = {};
        
        function MasherCtrl($scope, $location, $route, $routeParams) {
            console.debug('MasherCtrl - initialize collapsed bool');
            // alert('MasherCtrl - initialize some tabs');
            $scope.isCollapsed = false;
            $scope.currentTab = null;
            console.log("init with isCollapsed = " + $scope.isCollapsed);
            
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
                $scope.$broadcast('CollapseSummaryEvent')
                console.log("MasherCtrl isCollapsed before broadcast " + $scope.isCollapsed);
                $scope.isCollapsed = !$scope.isCollapsed;
                console.log("MasherCtrl isCollapsed after broadcast " + $scope.isCollapsed);
            };
            selfMethods["summmaryCollapser"] = $scope.summmaryCollapser;
            console.debug(selfMethods);
            
            $scope.showMeTheMapClicked = function(){
                console.log("currentTab - url reset to " + $scope.currentTab.url);
                $location.path($scope.currentTab.url);
                // $scope.summmaryCollapser();
            };
        };
        
        MasherCtrl.prototype.sumClaps = function (){
                selfMethods["summmaryCollapser"]();
            }
        
        function init(App) {
            console.log('MasherCtrl init');
            App.controller('MasherCtrl', ['$scope', '$location', MasherCtrl]);
            return MasherCtrl;
        }
        function startArcGIS(){
            console.log("startArcGIS");
            isFirstViewing = false;
            MasherCtrl.prototype.sumClaps();
        }

        return { start: init, startArcGIS: startArcGIS };

    });

}).call(this);