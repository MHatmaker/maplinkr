
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
            $scope.SiteVis = "flex";
            $scope.mapColWidth = "inherit";
                            
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
            var innerTableAdjustment = 20;
            var colHeightAdjustment = 40;
                
            function printStatus(msg){ 
                var msgstr = String.format("{0}... site ? : {1}, plugin ? : {2}", 
                         msg, status['website'], status['plugin']);
                console.log(msgstr)
                msgstr = String.format("verbage {0}, website {1}", verbageWidth[status['plugin'] == 'flex'], websiteVisibility[status['website'] == 'flex']);
                console.log(msgstr)
             }
                
                $scope.verbageExpandCollapse =  status['plugin'] == 'flex' ? "Collapse" : "Expand";
                
            function onShowPlugin(e, from, to, msg){ 
                status['plugin'] = $scope.VerbVis = "flex";
                $scope.ExpandPlug = "Hide Plugin";
                $scope.verbageExpandCollapse = "Collapse";
                printStatus('Show Plug-in!');
             }
             
            function onHidePlugin(e, from, to, msg){ 
                status['plugin'] = $scope.VerbVis = "none";
                $scope.ExpandPlug = "Show Plugin";
                $scope.verbageExpandCollapse  = "Expand";
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
            
            $scope.onExpSiteClick = function(){
                console.log("status['website'] before " + status['website']);
                if(status['website'] == 'flex'){
                    fsm.onhidewebsite();
                }else{
                    fsm.onshowwebsite();;
                }
                console.log("status['website'] after  " + status['website']);
                
                utils.displayHeights("####  onExpSiteClick  ###");
                utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                var colHgt = utils.getAvailableSiteColumnHeights(status['navigator'], $scope.MasterSiteVis, status['website']);
                
                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                // $scope.webSiteVisible = status['website'] == 'flex' ? "Collapse" : "Expand";
                $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : status['website'],
                                                               'verbage' : status['plugin']});
                setTimeout(function(){
                    $scope.$apply(function(){
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights(status['navigator'], $scope.MasterSiteVis, status['website']);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        utils.setElementHeight('idFooter', utils.getFooterHeight());
                        if(status['website'] == 'flex'){
                            utils.setElementHeight('idSiteTopRow', utils.getTopRowHeight());
                            utils.setElementHeight('idLeftCol', colHgt - colHeightAdjustment);
                            utils.setElementHeight('idRightCol', colHgt - colHeightAdjustment);
                        }
                        console.log("onExpSiteClick adjustments - colHgt : " + colHgt);
                        });
                    },1000);
            }
            
            $scope.onExpPlugClick = function(){
                if($scope.VerbVis == 'flex'){
                    fsm.onhideplugin();
                }
                else{
                    fsm.onshowplugin();
                }
                utils.displayHeights("####  onExpPlugClick  ###");
                utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                var colHgt = utils.getAvailableSiteColumnHeights(status['navigator'], $scope.MasterSiteVis, status['website']);
                                                 
                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                $scope.$broadcast('CollapseVerbageEvent', { 'website' : status['website'],
                                                             'verbage' : status['plugin']});
                                                            
                setTimeout(function(){
                    $scope.$apply(function(){
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights(status['navigator'], $scope.MasterSiteVis, status['website']);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.displayHeights("####  onExpPlugClick after timeout  ###");
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        if(status['website'] == 'flex'){
                            utils.setElementHeight('idSiteTopRow', utils.getTopRowHeight());
                            utils.setElementHeight('idLeftCol', colHgt - colHeightAdjustment);
                            utils.setElementHeight('idRightCol', colHgt - colHeightAdjustment);
                            utils.setElementHeight('idFooter', utils.getFooterHeight());
                        }
                        console.log("onExpPlugClick adjustments - colHgt : " + colHgt);
                        });
                    },1000);
                    
            };
            
            $scope.$on('CollapseSummaryEvent', function(event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
                status['navigator'] = args.navVis;
                console.log("on CollapseSummaryEvent, call adjustHeights");
                var innerScope = $scope;
                setTimeout(function(){
                    innerScope.$apply(function(){
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        utils.displayHeights("####  CollapseSummaryEvent  ###");
                        adjustHeights($scope, true);
                        });
                    },1000);  
                
            });
            
            $scope.$on('CollapseNavigatorEvent', function(event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
                status['navigator'] = args.navVis;
                setTimeout(function(){
                    $scope.$apply(function(){
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        utils.displayHeights("####  CollapseNavigatorEvent  ###");
                        adjustHeights($scope);
                        // utils.setElementHeight('idMasherCtrl', utils.getMasterSiteHeight());
                        });
                    },1000);
            });
            
            $scope.$on('windowResized', function() {
                utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                var colHgt = utils.getAvailableSiteColumnHeights(status['navigator'], $scope.MasterSiteVis, status['website']);
                utils.displayHeights("####  windowResized Event  ###");
                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                
                setTimeout(function(){
                    $scope.$apply(function(){
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        adjustHeights($scope);
                        // utils.setElementHeight('idMasherCtrl', utils.getMasterSiteHeight());
                        });
                    },1000);
                    
                console.log("windowResized method in SPACtrl.js");
                
                // utils.calculateComponentHeights($scope.MasterSiteVis, status['website']);
                // utils.setElementHeight('idMasherCtrl', utils.getMasterSiteHeight());
                // utils.setElementHeight('idMasterSite', 90, '%');
                // adjustHeights($scope);
            });
                        
            function adjustHeights(scope, invalidateMapPane){
                /* From flexbox.js plunker  */
                var colHgt = utils.getAvailableSiteColumnHeights(status['navigator'], scope.MasterSiteVis, status['website']);
                scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                
                setTimeout(function(){
                    $scope.$apply(function(){
                        // $scope.bodyColHeight = colHgt;
                        // $scope.bodyColHeight = colHgt;
                        // utils.setElementHeight('idBody', colHgt - 20);
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights(status['navigator'], $scope.MasterSiteVis, status['website']);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        if(status['website'] == 'flex'){
                            utils.setElementHeight('idSiteTopRow', utils.getTopRowHeight());
                            utils.setElementHeight('idLeftCol', colHgt - colHeightAdjustment);
                            utils.setElementHeight('idRightCol', colHgt - colHeightAdjustment);
                        }
                        console.log("adjustHeights colHgt : " + colHgt);
                        if(invalidateMapPane && invalidateMapPane == true){
                            console.log("NNNOOOWWW invalidateMapPane with CollapseSummaryCompletionEvent");
                            $scope.$broadcast('CollapseSummaryCompletionEvent');
                            }
                        });
                    },1000);
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