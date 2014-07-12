
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
            $scope.isSummaryCollapsed = false;
            $scope.ContentsHeight = 'auto';
            console.log("init with isVerbageCollapsed = " + $scope.isVerbageCollapsed);
            
            $scope.collapser = function(){
                $scope.$broadcast('CollapseVerbageEvent')
                // $scope.mapCtrl.resizeMap();
                console.log("isVerbageCollapsed before " + $scope.isVerbageCollapsed);
                $scope.isVerbageCollapsed = !$scope.isVerbageCollapsed;
                console.log("isVerbageCollapsed after  " + $scope.isVerbageCollapsed);
            }
            $scope.$on('CollapseSummaryEvent', function() {
                $scope.isSummaryCollapsed = ! $scope.isSummaryCollapsed;
                console.log("isSummaryCollapsed after " +  $scope.isSummaryCollapsed);
                var sumHead = angular.element(document.getElementById("summary_header"));
                var sumHeadHeight = sumHead[0].offsetHeight;
                console.log("sumHeadHeight = " + sumHeadHeight);
                
                var tblwnd = angular.element(document.getElementById("tableWindow"));
                var spaWnd = angular.element(document.getElementById("spa_window"));
                var w = window;
                console.log("width " + w.innerWidth + " height " + w.innerHeight);
                var h = w.innerHeight - sumHeadHeight - 10;
                if($scope.isSummaryCollapsed == true)
                    h = w.innerHeight - 10;
                $scope.ContentsHeight =  h; // $scope.isSummaryCollapsed ? h : h;
                var hstr = String.format("{0}px", h);
                spaWnd.css({"height": hstr});
                tblwnd.css({"height": hstr});
                console.log("ContentsHeight = " + $scope.ContentsHeight);
                console.log("hstr = " + hstr);
            });
        };
        
        function init(App) {
            console.log('SPACtrl init');
            App.controller('SPACtrl', ['$scope', SPACtrl]);
            return SPACtrl;
        }
    

        return { start: init };

    });

}).call(this);