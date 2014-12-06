
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>

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
            
  $scope.ExpandSite = "Hide WebSite";
  $scope.VerbVis = "none";
  $scope.MasterSiteVis = "inline";
  $scope.NavigatorVis = "flex";
  $scope.SiteVis = "flex";
            
            $scope.expBtnHeight = getButtonHeight();
            
            var status = {
                'website' : "flex",
                'plugin' : "none"
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
                status['plugin'] = "flex";
                printStatus('Show Plug-in!');
             }
             
            function onHidePlugin(e, from, to, msg){ 
                status['plugin'] = "none";
                printStatus('Hide Plug-in!');
             }
                
            function onShowWebSite(e, from, to, msg){     "flex" : "none"
                status['website'] = "flex";
                printStatus('Show Web Site!');
             }
                
            function onHideWebSite(e, from, to, msg){ 
                status['website'] = "none";
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
            
            /*
            var samplePageTopRowDefault = 0;            
            var samplePageLeftColDefault = 0;
            
            $scope.ContentsHeight = 'auto';
            console.log("init with isVerbageVisible = " + $scope.isVerbageVisible);
            var sumHead = angular.element(document.getElementById("summary_header"));
            var sumHeadHeightStart = sumHead[0].offsetHeight;
            console.log("sumHeadHeight at startup = " + sumHeadHeightStart);
            var samplePageTopRow = angular.element(document.getElementById("SamplePageTopRowId"));
            var samplePageTopRowHgtInit = $scope.isVerbageVisible ?  samplePageTopRowDefault : samplePageTopRow[0].offsetHeight;
            // samplePageTopRowHgtInit += 22;
            var samplePageLeftCol = angular.element(document.getElementById("samplePageLeftColId"));
            var samplePageLeftColHgtInit = $scope.isVerbageVisible ?  samplePageLeftColDefault : samplePageLeftCol[0].offsetHeight;
            layoutPanes(false);
            */
            
            utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
            var totalHgt = utils.getComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
            showHeights(prevTotalHgt, totalHgt);
            prevTotalHgt = totalHgt;
            var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, $scope.SiteVis);
            $scope.innerTblHeight = colHgt + hgtComponents.idSiteTopRow + hgtComponents.idFooter;
            $scope.bodyColHeight = colHgt;
            $scope.wrapperHeight = utils.getDocHeight() - totalHgt; // - hgtComponents.idFooter;
            $scope.childSiteHeight = utils.getDocHeight() - totalHgt  + getElemHeight("idNavigator") + 
            getElemHeight("idSiteTopRow") + utils.getElemHeight("idFooter");
            $scope.mapColWidth = $scope.ExpandSite == "Show WebSite" ? "100%" : "inherit";
            
            
            $scope.siteHider = function(){
                console.log("isWebSiteVisible before " + $scope.isWebSiteVisible);
                if($scope.isWebSiteVisible == true){
                    fsm.onhidewebsite();
                }else{
                    fsm.onshowwebsite();
                }
                $scope.isWebSiteVisible = status['website'];
                $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : status['website'],
                                                               'verbage' : status['plugin']);
                $scope.webSiteVisible =  $scope.isWebSiteVisible ? "Hide" : "Show";
                console.log("isWebSiteVisible after  " + $scope.isWebSiteVisible);
            }
            /* 
            $scope.collapser = function(){
                // $scope.$broadcast('CollapseVerbageEvent', { 'collapseIt' : $scope.isVerbageVisible });
                console.log("verbage status before " + status['plugin'];
                if(status['plugin'] == 'flex'){
                    fsm.onhideplugin();
                }else{
                    fsm.onshowplugin();
                }
                $scope.isVerbageVisible = status['plugin'];
                $scope.$broadcast('CollapseVerbageEvent', { 'website' : status['website'],
                                                             'verbage' : status['plugin']});
                $scope.verbageExpandCollapse =  status['plugin'] == 'flex' ? "Collapse" : "Expand";
                $scope.ContentsHeight =  layoutPanes($scope.isSummaryCollapsed);
                console.log("verbage status after  " + status['plugin']);
            }
             */
            $scope.onExpPlugClick = function(){
                $scope.VerbVis = $scope.ExpandPlug == "Show Plugin" ? "flex" : "none";
                $scope.ExpandPlug = $scope.ExpandPlug == "Show Plugin" ? "Hide Plugin" : "Show Plugin";

                var totalHgt = utils.getComponentHeights($scope.MasterSiteVis, status['website']);
                showHeights(prevTotalHgt, totalHgt);
                prevTotalHgt = totalHgt;
                var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status['website']);
                if($scope.SiteVis == 'flex'){
                    $scope.innerTblHeight = colHgt + hgtComponents.idSiteTopRow + hgtComponents.idFooter;
                }
                else{
                    $scope.innerTblHeight = colHgt; // + hgtComponents.idSiteTopRow + hgtComponents.idFooter;
                }
                $scope.$broadcast('CollapseVerbageEvent', { 'website' : status['website'],
                                                             'verbage' : status['plugin']});
                                                             
                $scope.bodyColHeight = colHgt;
                $scope.wrapperHeight = getDocHeight() - totalHgt;
                $scope.childSiteHeight = colHgt;
            };
            
            $scope.$on('CollapseSummaryEvent', function(event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
                $scope.NavigatorVis = args.navVis;
                console.log("isSummaryCollapsed before " + $scope.isSummaryCollapsed);
                $scope.isSummaryCollapsed = $scope.MasterSiteVis == 'flex' ? false  : true;
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
                var samplePageTopRow = angular.element(document.getElementById("SamplePageTopRowId"));
                
                var topLineHgt = commonTopLine[0].offsetHeight;
                var mnwndHgt = mnwnd[0].offsetHeight;
                
                var samplePageTopRowHgt = $scope.isVerbageVisible ?  samplePageTopRowDefault : samplePageTopRowHgtInit;
                if($scope.isWebSiteVisible == false)
                    samplePageTopRowHgt = 0;
                    
                var samplePageLeftColHgt = $scope.isVerbageVisible ?  samplePageLeftColDefault : samplePageLeftColHgtInit;
                if($scope.isWebSiteVisible == false)
                    samplePageLeftColHgt = 0;
                    
                var ftPaneHgt = ftPane[0].offsetHeight;
                console.log("topLineHgt " + topLineHgt + " mnwndHgt " + mnwndHgt + " samplePageTopRowHgt " + samplePageTopRowHgt  + " samplePageLeftColHgt " + samplePageLeftColHgt + " ftPaneHgt " + ftPaneHgt);
                return topLineHgt + mnwndHgt + samplePageTopRowHgt + samplePageLeftColHgt + ftPaneHgt + 20;
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