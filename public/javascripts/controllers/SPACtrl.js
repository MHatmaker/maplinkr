
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>


(function() {
    "use strict";

    console.log('SPACtrl setup');
    define(['angular'], function(angular) {
        console.log('SPACtrl define');
        
        function SPACtrl($scope) {
            console.debug('SPACtrl - initialize collapsed bool');
            // alert('SPACtrl - initialize some tabs');
            $scope.isVerbageCollapsed = false;
            console.log("init with isVerbageCollapsed = " + $scope.isVerbageCollapsed);
            
            $scope.collapser = function(){
                $scope.$broadcast('CollapseVerbageEvent')
                // $scope.mapCtrl.resizeMap();
                console.log("isVerbageCollapsed before " + $scope.isVerbageCollapsed);
                $scope.isVerbageCollapsed = !$scope.isVerbageCollapsed;
                console.log("isVerbageCollapsed after  " + $scope.isVerbageCollapsed);
            }
        };
        
        function init(App) {
            console.log('SPACtrl init');
            App.controller('SPACtrl', ['$scope', SPACtrl]);
            return SPACtrl;
        }
    

        return { start: init };

    });

}).call(this);