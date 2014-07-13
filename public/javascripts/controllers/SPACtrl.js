
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>
function getDocHeight() {
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
}

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
            var sumHead = angular.element(document.getElementById("summary_header"));
            var sumHeadHeightStart = sumHead[0].offsetHeight;
            console.log("sumHeadHeight at startup = " + sumHeadHeightStart);
            
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
                
                var mnwnd = angular.element(document.getElementById("mainWindow"));
                var mnWndHgt = mnwnd[0].offsetHeight;
                console.log("mnwnd height : " + mnWndHgt);
                var wndHgt = window.innerHeight; //getDocHeight();
                console.log(" window.innerHeight height " + wndHgt);
                console.log(" sumHeadHeightStart " + sumHeadHeightStart);
                var h = $scope.isSummaryCollapsed == true ?
                    wndHgt - mnWndHgt - 25 - 10 - 20: wndHgt - mnWndHgt - sumHeadHeightStart - 25 - 10 - 20;
                    // window.innerHeight - 10 : window.innerHeight - sumHeadHeightStart - 10;
                $scope.ContentsHeight =  h; // $scope.isSummaryCollapsed ? h : h;
                var hstr = String.format("{0}px", h);
                var ngvwnd = angular.element(document.getElementById("ngview_container"));
                var tblwnd = angular.element(document.getElementById("tableWindow"));
                var spaWnd = angular.element(document.getElementById("spa_window"));
                var mapCnvs = angular.element(document.getElementById("map_canvas"));
                var mapCnRt = angular.element(document.getElementById("map_canvas_root"));
                var vrbgPan = angular.element(document.getElementById("verbagePan"));
                mapCnRt.css({"height": hstr});
                mapCnvs.css({"height": hstr});
                vrbgPan.css({"height": hstr});
                ngvwnd.css({"height": hstr});
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