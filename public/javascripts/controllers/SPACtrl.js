
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
            $scope.isVerbageCollapsed = true;
            $scope.isSummaryCollapsed = false;
            $scope.verbageExpandCollapse = "Expand";
            
            $scope.ContentsHeight = 'auto';
            console.log("init with isVerbageCollapsed = " + $scope.isVerbageCollapsed);
            var sumHead = angular.element(document.getElementById("summary_header"));
            var sumHeadHeightStart = sumHead[0].offsetHeight;
            console.log("sumHeadHeight at startup = " + sumHeadHeightStart);
            var samplePageTopRow = angular.element(document.getElementById("SamplePageTopRowId"));
            var samplePageTopRowHgtInit = $scope.isVerbageCollapsed ?  samplePageTopRow[0].offsetHeight : 0;
            layoutPanes(false);
            
            $scope.collapser = function(){
                $scope.$broadcast('CollapseVerbageEvent')
                console.log("isVerbageCollapsed before " + $scope.isVerbageCollapsed);
                $scope.isVerbageCollapsed = !$scope.isVerbageCollapsed;
                $scope.verbageExpandCollapse =  $scope.isVerbageCollapsed ? "Expand" : "Collapse";
                $scope.ContentsHeight =  layoutPanes($scope.isSummaryCollapsed);
                console.log("isVerbageCollapsed after  " + $scope.isVerbageCollapsed);
            }
            $scope.$on('CollapseSummaryEvent', function() {
                console.log("isSummaryCollapsed before " + $scope.isSummaryCollapsed);
                $scope.isSummaryCollapsed = ! $scope.isSummaryCollapsed;
                console.log("isSummaryCollapsed after  " + $scope.isSummaryCollapsed);
                $scope.ContentsHeight =  layoutPanes($scope.isSummaryCollapsed);
            });
            
            $scope.$on('windowResized', function() {
                console.log("windowResized with isSummaryCollapsed " + $scope.isSummaryCollapsed);
                layoutPanes($scope.isSummaryCollapsed);
            });
            
            function calcAdjustments(){
                var commonTopLine = angular.element(document.getElementById("top_line"));
                var mnwnd = angular.element(document.getElementById("mainWindow"));
                var ftPane = angular.element(document.getElementById("foot_pane"));
                // var samplePageTopRow = angular.element(document.getElementById("SamplePageTopRowId"));
                
                var topLineHgt = commonTopLine[0].offsetHeight;
                var mnwndHgt = mnwnd[0].offsetHeight;
                var samplePageTopRowHgt = $scope.isVerbageCollapsed ?  samplePageTopRowHgtInit : 0;
                var ftPaneHgt = ftPane[0].offsetHeight;
                console.log("topLineHgt " + topLineHgt + " mnwndHgt " + mnwndHgt + " samplePageTopRowHgt " + samplePageTopRowHgt + " ftPaneHgt " + ftPaneHgt);
                return topLineHgt + mnwndHgt + samplePageTopRowHgt +ftPaneHgt + 20;
            }
            
            function layoutPanes(isSummaryCollapsed) {
                console.log("isSummaryCollapsed in layoutPanes " +  isSummaryCollapsed);
                
                var sumwnd = angular.element(document.getElementById("summary_header"));
                var sumwndHgt = sumwnd[0].offsetHeight;
                console.log("sumwnd height : " + sumwndHgt);
                var wndHgt = window.innerHeight; //getDocHeight();
                console.log(" window.innerHeight height " + wndHgt);
                console.log(" sumHeadHeightStart " + sumHeadHeightStart);
                var adjustments = calcAdjustments(); //25 + 10 + 20;
                console.log(" adjustments " + adjustments);
                var contentsHeight = isSummaryCollapsed == true ?
                    wndHgt - adjustments: wndHgt - sumwndHgt - adjustments;
                    // wndHgt - mnWndHgt - adjustments: wndHgt - mnWndHgt - sumHeadHeightStart - adjustments;
                $scope.ContentsHeight = contentsHeight;
                var hstr = String.format("{0}px", contentsHeight);
                var mapCnvs = angular.element(document.getElementById("map_wrapper"));
                var mapCnRt = angular.element(document.getElementById("map_canvas_root"));
                mapCnRt.css({"height": hstr});
                mapCnvs.css({"height": hstr});
                console.log("ContentsHeight = " + contentsHeight);
                console.log("hstr = " + hstr);
            
                return contentsHeight;
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