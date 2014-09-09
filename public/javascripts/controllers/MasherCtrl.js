
(function() {
    "use strict";

    console.log('MasherCtrl setup');
    define(['angular'], function(angular) {
        console.log('MasherCtrl define');
        var selfMethods = {};
        
        function MasherCtrl($scope) {
            console.debug('MasherCtrl - initialize collapsed bool');
            // alert('MasherCtrl - initialize some tabs');
            $scope.isCollapsed = false;
            $scope.currentTab = null;
            console.log("init with isCollapsed = " + $scope.isCollapsed);
            
            $scope.summmaryCollapser = function(){
                $scope.$broadcast('CollapseSummaryEvent')
                console.log("MasherCtrl isCollapsed before broadcast " + $scope.isCollapsed);
                $scope.isCollapsed = !$scope.isCollapsed;
                console.log("MasherCtrl isCollapsed after broadcast " + $scope.isCollapsed);
            }
            selfMethods["summmaryCollapser"] = $scope.summmaryCollapser;
            console.debug(selfMethods);
        };
        
        MasherCtrl.prototype.sumClaps = function (){
                selfMethods["summmaryCollapser"]();
            }
        
        function init(App) {
            console.log('MasherCtrl init');
            App.controller('MasherCtrl', ['$scope', MasherCtrl]);
            return MasherCtrl;
        }
        function startArcGIS(){
            console.log("startArcGIS");
            MasherCtrl.prototype.sumClaps();
        }

        return { start: init, startArcGIS: startArcGIS };

    });

}).call(this);