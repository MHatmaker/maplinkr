
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>

(function() {
    "use strict";

    console.log('SPACtrl setup');
    define(['angular', 'lib/fsm', 'lib/utils'], function(angular, finstatmach, utils) {
        console.log('SPACtrl define');
        
        function SPACtrl($scope) {
            console.debug('SPACtrl - initialize collapsed bool');
            $scope.isVerbageVisible = false;
            $scope.isSummaryCollapsed = false;
            $scope.isNavigatorCollapsed = false;
            $scope.verbageExpandCollapse = "Expand";
            $scope.webSiteVisible = "Collapse";
            
            $scope.ExpandSite = "Hide WebSite";
            $scope.ExpandPlug = "Show Plugin";
            $scope.VerbVis = "none";
            $scope.MasterSiteVis = "inline";
            $scope.NavigatorVis = "flex";
            $scope.SiteVis = "flex";
            var prevTotalHgt = 0;
            // var utils = utilmod;
            
            // $scope.expBtnHeight = utils.getButtonHeight();
            
            var status = {
                'website' : "flex",
                'plugin' : "none",
                'navigator' : 'flex'
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
                
            function onShowWebSite(e, from, to, msg){ 
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
                        
            utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
            var totalHgt = utils.getComponentHeights($scope, $scope.MasterSiteVis, $scope.SiteVis);
            utils.showHeights(prevTotalHgt, totalHgt);
            prevTotalHgt = totalHgt;
            var colHgt = utils.getAvailableSiteColumnHeights($scope, $scope.MasterSiteVis, $scope.SiteVis);
            $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight();
            $scope.bodyColHeight = colHgt;
            $scope.wrapperHeight = utils.getDocHeight() - totalHgt; // - utils.getFooterHeight();
            $scope.childSiteHeight = utils.getDocHeight() - totalHgt  + utils.getElemHeight("idNavigator") + 
                utils.getElemHeight("idSiteTopRow") + utils.getElemHeight("idFooter");
            $scope.mapColWidth = $scope.ExpandSite == "Show WebSite" ? "100%" : "inherit";
            
            
            $scope.onExpSiteClick = function(){
                console.log("status['website'] before " + status['website']);
                if(status['website'] == 'flex'){
                    fsm.onhidewebsite();
                    $scope.mapColWidth = "100%";
                }else{
                    fsm.onshowwebsite();
                    $scope.mapColWidth = "inherit";
                }
                console.log("status['website'] after  " + status['website']);
                
                $scope.SiteVis = $scope.ExpandSite == "Show WebSite" ? "flex" : "none";
                $scope.ExpandSite = $scope.ExpandSite == "Show WebSite" ? "Hide WebSite" : "Show WebSite";
                var totalHgt = utils.getComponentHeights($scope, $scope.MasterSiteVis, status['website']);
                utils.showHeights(prevTotalHgt, totalHgt);
                prevTotalHgt = totalHgt;
                var colHgt = utils.getAvailableSiteColumnHeights($scope, $scope.MasterSiteVis, status['website']);
                if($scope.SiteVis == 'flex'){
                    $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight();
                }
                else{
                    $scope.innerTblHeight = colHgt; // + utils.getTopRowHeight() + utils.getFooterHeight();
                }               
                $scope.bodyColHeight = colHgt;
                $scope.wrapperHeight = utils.getDocHeight() - totalHgt;
                $scope.childSiteHeight = colHgt;
                $scope.webSiteVisible = status['website'] == 'flex' ? "Collapse" : "Expand";
                $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : status['website'],
                                                               'verbage' : status['plugin']});
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
                if($scope.VerbVis == 'flex'){
                    fsm.onhideplugin();
                }
                else{
                    fsm.onshowplugin();
                }
                $scope.VerbVis = $scope.ExpandPlug == "Show Plugin" ? "flex" : "none";
                $scope.ExpandPlug = $scope.ExpandPlug == "Show Plugin" ? "Hide Plugin" : "Show Plugin";

                var totalHgt = utils.getComponentHeights($scope, $scope.MasterSiteVis, status['website']);
                utils.showHeights(prevTotalHgt, totalHgt);
                prevTotalHgt = totalHgt;
                var colHgt = utils.getAvailableSiteColumnHeights($scope, $scope.MasterSiteVis, status['website']);
                                                             
                $scope.bodyColHeight = colHgt;
                $scope.wrapperHeight = utils.getDocHeight() - totalHgt;
                $scope.childSiteHeight = colHgt;
                $scope.verbageExpandCollapse =  status['plugin'] == 'flex' ? "Collapse" : "Expand";
                $scope.innerTblHeight = status['website'] == 'none' ? colHgt : colHgt + utils.getTopRowHeight() + utils.getFooterHeight();
                $scope.$broadcast('CollapseVerbageEvent', { 'website' : status['website'],
                                                             'verbage' : status['plugin']});
            };
            
            $scope.$on('CollapseSummaryEvent', function(event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
                $scope.NavigatorVis = args.navVis;
                console.log("isSummaryCollapsed before " + $scope.isSummaryCollapsed);
                $scope.isSummaryCollapsed = $scope.MasterSiteVis == 'flex' ? false  : true;
                console.log("isSummaryCollapsed after  " + $scope.isSummaryCollapsed);
                // $scope.ContentsHeight =  layoutPanes($scope.isSummaryCollapsed);
                adjustHeights($scope);
                
            });
            
            $scope.$on('CollapseNavigatorEvent', function(event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
                $scope.NavigatorVis = args.navVis;
                console.log("isSummaryCollapsed before " + $scope.isSummaryCollapsed);
                $scope.isNavigatorCollapsed = $scope.NavigatorVis == 'flex' ? false  : true;
                console.log("isSummaryCollapsed after  " + $scope.isNavigatorCollapsed);
                // $scope.ContentsHeight =  layoutPanes($scope.isSummaryCollapsed);
                adjustHeights($scope);
            });
            
            $scope.$on('windowResized', function() {
                console.log("windowResized with isSummaryCollapsed " + $scope.isSummaryCollapsed);
                //layoutPanes($scope.isSummaryCollapsed);
            });
            
            function adjustHeights(scope){
                /* From flexbox.js plunker  */
                var totalHgt = utils.getComponentHeights(scope, scope.MasterSiteVis, scope.SiteVis);
                utils.showHeights(prevTotalHgt, totalHgt);
                prevTotalHgt = totalHgt;
                var colHgt = utils.getAvailableSiteColumnHeights(scope.MasterSiteVis, scope.SiteVis);
                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight();
                $scope.bodyColHeight = colHgt;
                $scope.wrapperHeight = utils.getDocHeight() - totalHgt;
                $scope.childSiteHeight = colHgt;
            }
            /* 
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
            */
        };
        
        function init(App) {
            console.log('SPACtrl init');
            App.controller('SPACtrl', ['$scope', SPACtrl]);
            return SPACtrl;
        }
    

        return { start: init };

    });

}).call(this);