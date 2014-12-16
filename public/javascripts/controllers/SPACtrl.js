
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>

(function() {
    "use strict";

    console.log('SPACtrl setup');
    define(['angular', 'lib/fsm', 'lib/utils'], function(angular, finstatmach, utils) {
        console.log('SPACtrl define');
        
        function SPACtrl($scope) {
            console.debug('SPACtrl - initialize collapsed bool');
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
                status['website'] = $scope.SiteVis = "flex";
                $scope.mapColWidth = "inherit";
                $scope.ExpandSite = "Hide WebSite" ;
                $scope.webSiteVisible = "Collapse";
                printStatus('Show Web Site!');
             }
                
            function onHideWebSite(e, from, to, msg){ 
                status['website'] = $scope.SiteVis = "none";
                $scope.mapColWidth = "100%";
                $scope.ExpandSite = "Show WebSite";
                $scope.webSiteVisible = "Expand";
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
                        
            // utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
            /* 
            var totalHgt = utils.getComponentHeights($scope, $scope.MasterSiteVis, $scope.SiteVis);
            utils.showHeights(prevTotalHgt, totalHgt);
            prevTotalHgt = totalHgt;
            var colHgt = utils.getAvailableSiteColumnHeights($scope, $scope.MasterSiteVis, $scope.SiteVis);
            $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight();
            $scope.bodyColHeight = colHgt;
            $scope.wrapperHeight = utils.getMasterSiteHeight() - totalHgt; // - utils.getFooterHeight();
            // $scope.childSiteHeight = utils.getMasterSiteHeight() - totalHgt  + utils.getNavigatorHeight() + 
                // utils.getTopRowHeight() + utils.getFooterHeight();
            var childSiteHgt = utils.getMasterSiteHeight() - totalHgt  + utils.getNavigatorHeight() + 
                utils.getTopRowHeight() + utils.getFooterHeight();
            utils.setElementHeight('idChildWebSite', childSiteHgt);
            console.log("ctor childSiteHgt : " + childSiteHgt);
            $scope.mapColWidth = $scope.ExpandSite == "Show WebSite" ? "100%" : "inherit";
             */
            
            $scope.onExpSiteClick = function(){
                console.log("status['website'] before " + status['website']);
                if(status['website'] == 'flex'){
                    fsm.onhidewebsite();
                }else{
                    fsm.onshowwebsite();;
                }
                console.log("status['website'] after  " + status['website']);
                
                var totalHgt = utils.getComponentHeights($scope, $scope.MasterSiteVis, status['website']);
                utils.showHeights(prevTotalHgt, totalHgt);
                prevTotalHgt = totalHgt;
                var colHgt = utils.getAvailableSiteColumnHeights($scope, $scope.MasterSiteVis, status['website']);
                
                $scope.bodyColHeight = colHgt + (status['website'] == 'flex' ? 
                    utils.getFooterHeight()/*  + 20  */: utils.getFooterHeight());
                                                
                $scope.childSiteHeight = colHgt;
                // utils.setElementHeight('idChildWebSite', $scope.bodyColHeight);
                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() + 20;
                // $scope.webSiteVisible = status['website'] == 'flex' ? "Collapse" : "Expand";
                $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : status['website'],
                                                               'verbage' : status['plugin']});
            }
            
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
                                                   
                $scope.bodyColHeight = colHgt + (status['website'] == 'flex' ? 
                    utils.getFooterHeight()/*  + 20 */ : utils.getFooterHeight());
                                                   
                // utils.setElementHeight('idChildWebSite', $scope.bodyColHeight);
                $scope.verbageExpandCollapse =  status['plugin'] == 'flex' ? "Collapse" : "Expand";
                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() + 20;
                $scope.$broadcast('CollapseVerbageEvent', { 'website' : status['website'],
                                                             'verbage' : status['plugin']});
            };
            
            $scope.$on('CollapseSummaryEvent', function(event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
                $scope.NavigatorVis = args.navVis;
                console.log("on CollapseSummaryEvent, call adjustHeights");
                setTimeout(function(){
                    utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                    adjustHeights($scope);
                    },1000)  
                
            });
            
            $scope.$on('CollapseNavigatorEvent', function(event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
                $scope.NavigatorVis = args.navVis;
                adjustHeights($scope);
            });
            
            $scope.$on('windowResized', function() {
                console.log("windowResized method in SPACtrl.js");
                utils.calculateComponentHeights($scope.MasterSiteVis, status['website']);
                utils.setElementHeight('idMasherCtrl', utils.getMasterSiteHeight());
                // utils.setElementHeight('idMasterSite', 90, '%');
                adjustHeights($scope);
            });
                        
            function adjustHeights(scope){
                /* From flexbox.js plunker  */
                var totalHgt = utils.getComponentHeights(scope, scope.MasterSiteVis, status['website']);
                utils.showHeights(prevTotalHgt, totalHgt);
                prevTotalHgt = totalHgt;
                var colHgt = utils.getAvailableSiteColumnHeights(scope, scope.MasterSiteVis, status['website']);
                scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight(); // + 20;
                
                $scope.bodyColHeight = colHgt + (status['website'] == 'flex' ? 
                    utils.getFooterHeight()/*  + 20 */ : utils.getFooterHeight());
                                               
                // $scope.childSiteHeight = colHgt;
                // utils.setElementHeight('idChildWebSite', $scope.bodyColHeight);
                console.log("adjustHeights childSiteHgt : " + colHgt);
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