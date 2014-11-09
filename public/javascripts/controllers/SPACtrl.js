
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
    define(['angular', 'lib/fsm'], function(angular, finstatmach) {
        console.log('SPACtrl define');
        
        function SPACtrl($scope) {
            console.debug('SPACtrl - initialize collapsed bool');
            $scope.isVerbageVisible = false;
            $scope.isSummaryCollapsed = false;
            $scope.isWebSiteVisible = true;
            $scope.verbageExpandCollapse = "Expand";
            $scope.webSiteVisible = "Hide";
            
            var status = {
                'website' : true,
                'plugin' : false
                };
                
            var verbageWidth = {
                true : '70%',
                false : '0%'
                };
            var websiteVisibility = {
                true : 'true',
                false : 'false'
                };
                
            function printStatus(msg){ 
                var msgstr = String.format("{0}... site ? : {1}, plugin ? : {2}", 
                         msg, status['website'], status['plugin']);
                console.log(msgstr)
                msgstr = String.format("verbage {0}, website {1}", verbageWidth[status['plugin']], websiteVisibility[       status['website']]);
                console.log(msgstr)
             }

            function onShowPlugin(e, from, to, msg){ 
                status['plugin'] = true;
                printStatus('Show Plug-in!');
             }
             
            function onHidePlugin(e, from, to, msg){ 
                status['plugin'] = false;
                printStatus('Hide Plug-in!');
             }
                
            function onShowWebSite(e, from, to, msg){ 
                status['website'] = true;
                printStatus('Show Web Site!');
             }
                
            function onHideWebSite(e, from, to, msg){ 
                status['website'] = false;
                printStatus('Hide Web Site!');
             }
            
            var fsm = finstatmach.create({
              'initial': 'FullWebSite',
              'events': [
                {'name': 'showplugin',  'from': 'FullWebSite',  'to': 'FullWebSiteWPlugin'},
                {'name': 'showplugin',  'from': 'NoWebSite',  'to': 'NoWebSiteWPlugin'},
                {'name': 'hideplugin', 'from': 'FullWebSiteWPlugin', 'to': 'FullWebSite'},
                {'name': 'hideplugin', 'from': 'NoWebSiteWPlugin', 'to': 'NoWebSite'},
                {'name': 'showwebsite',  'from': 'NoWebSite',  'to': 'FullWebSite'},
                {'name': 'hidewebsite',  'from': 'FullWebSiteWPlugin',  'to': 'NoWebSiteWPlugin'},
                {'name': 'showwebsite', 'from': 'NoWebSiteWPlugin', 'to': 'FullWebSiteWPlugin'},
                {'name': 'hidewebsite', 'from': 'FullWebSite', 'to': 'NoWebSite'}
              ],
              'callbacks': {
                'onshowplugin':  onShowPlugin,
                'onhideplugin':  onHidePlugin,
                'onshowwebsite': onShowWebSite,
                'onhidewebsite': onHideWebSite
              }
            })
            
            var samplePageTopRowDefault = 0;
            
            $scope.ContentsHeight = 'auto';
            console.log("init with isVerbageVisible = " + $scope.isVerbageVisible);
            var sumHead = angular.element(document.getElementById("summary_header"));
            var sumHeadHeightStart = sumHead[0].offsetHeight;
            console.log("sumHeadHeight at startup = " + sumHeadHeightStart);
            var samplePageTopRow = angular.element(document.getElementById("SamplePageTopRowId"));
            var samplePageTopRowHgtInit = $scope.isVerbageVisible ?  samplePageTopRowDefault : samplePageTopRow[0].offsetHeight;
            // samplePageTopRowHgtInit += 22;
            layoutPanes(false);
            
            $scope.siteHider = function(){
                console.log("isWebSiteVisible before " + $scope.isWebSiteVisible);
                if($scope.isWebSiteVisible == true){
                    fsm.onhidewebsite();
                }else{
                    fsm.onshowwebsite();
                }
                $scope.isWebSiteVisible = status['website'];
                $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : $scope.isWebSiteVisible,
                                                               'verbage' : $scope.isVerbageVisible});
                $scope.webSiteVisible =  $scope.isWebSiteVisible ? "Hide" : "Show";
                console.log("isWebSiteVisible after  " + $scope.isWebSiteVisible);
            }
            
            $scope.collapser = function(){
                // $scope.$broadcast('CollapseVerbageEvent', { 'collapseIt' : $scope.isVerbageVisible });
                console.log("isVerbageVisible before " + $scope.isVerbageVisible);
                if($scope.isVerbageVisible == true){
                    fsm.onhideplugin();
                }else{
                    fsm.onshowplugin();
                }
                $scope.isVerbageVisible = status['plugin'];
                $scope.$broadcast('CollapseVerbageEvent', { 'website' : $scope.isWebSiteVisible,
                                                             'verbage' : $scope.isVerbageVisible});
                $scope.verbageExpandCollapse =  $scope.isVerbageVisible ? "Collapse" : "Expand";
                $scope.ContentsHeight =  layoutPanes($scope.isSummaryCollapsed);
                console.log("isVerbageVisible after  " + $scope.isVerbageVisible);
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
                var samplePageTopRowHgt = $scope.isVerbageVisible ?  samplePageTopRowDefault : samplePageTopRowHgtInit;
                if($scope.isWebSiteVisible == false)
                    samplePageTopRowHgt = 0;
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