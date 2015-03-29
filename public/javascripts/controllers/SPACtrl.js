
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>

(function() {
    "use strict";

    console.log('SPACtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig', 'lib/fsm', 'lib/utils'], function(angular, AgoNewWindowConfig, finstatmach, utils) {
        console.log('SPACtrl define');
        var selfMethods = {};

        function SPACtrl($scope) {
            console.debug('SPACtrl - initialize collapsed bool');
            $scope.verbageExpandCollapse = "Expand";
            $scope.webSiteVisible = "Expand";

            $scope.ExpandSite = "Max Map";
            $scope.ExpandPlug = "Show Linker";
            $scope.VerbVis = "none";
            $scope.MasterSiteVis = "inline";
            $scope.SiteVis = "flex";
            $scope.webSiteWidth = "inherit";
            $scope.hideWebSiteOnStartup = false;

            $scope.data = {
                verbageExpandCollapse : "Expand",
                webSiteVisible : "Expand",
                ExpandSite : 'Max Map',
                ExpandPlug : 'Show Linker'
            };

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
            var innerTableAdjustment = 0; //20;
            var colHeightAdjustment = 0; //40;

            function printStatus(msg){
                var msgstr = String.format("{0}... site ? : {1}, plugin ? : {2}",
                         msg, status['website'], status['plugin']);
                console.log(msgstr)
                msgstr = String.format("verbage {0}, website {1}",
                  verbageWidth[status['plugin'] == 'flex'],
                  websiteVisibility[status['website'] == 'flex']);
                console.log(msgstr)
             }

             $scope.data.verbageExpandCollapse = $scope.verbageExpandCollapse =  status['plugin'] == 'flex' ? "Collapse" : "Expand";

            function onShowPlugin(e, from, to, msg){
                status['plugin'] = $scope.VerbVis = "flex";
                $scope.data.ExpandPlug = $scope.ExpandPlug = "Hide Linker";
                $scope.data.verbageExpandCollapse = $scope.verbageExpandCollapse = "Collapse";
                var centerCol = document.getElementById('idCenterCol');
                var mapWrap = document.getElementById('map_wrapper');

                printStatus('Show Plug-in!');
             }

            function onHidePlugin(e, from, to, msg){
                status['plugin'] = $scope.VerbVis = "none";
                $scope.data.ExpandPlug = $scope.ExpandPlug = "Show Linker";
                $scope.data.verbageExpandCollapse = $scope.verbageExpandCollapse  = "Expand";
                printStatus('Hide Plug-in!');
             }

            function onShowWebSite(e, from, to, msg){
                status['website'] = $scope.SiteVis = "flex";
                $scope.webSiteWidth = "inherit";
                $scope.data.ExpandSite = $scope.ExpandSite = "Max Map" ;
                $scope.data.webSiteVisible = $scope.webSiteVisible = "Expand";
                printStatus('Show Web Site!');
             }

            function onHideWebSite(e, from, to, msg){
                status['website'] = $scope.SiteVis = "none";
                $scope.webSiteWidth = "100%";
                $scope.data.ExpandSite = $scope.ExpandSite = "Min Map";
                $scope.data.webSiteVisible = $scope.webSiteVisible = "Collapse";
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

            $scope.$on('mapMaximizerEvent', function(event, data){
                $scope.onExpSiteClick();
            });

            $scope.onExpSiteClick = function(){
                console.log("status['website'] before " + status['website']);
                if(status['website'] == 'flex'){
                    fsm.onhidewebsite();
                }else{
                    fsm.onshowwebsite();;
                }
                console.log("status['website'] after  " + status['website']);

                utils.displayHeights("####  onExpSiteClick  ###");

                // utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                // var colHgt = utils.getAvailableSiteColumnHeights( $scope.MasterSiteVis, status['website']);

                // $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                // $scope.webSiteVisible = status['website'] == 'flex' ? "Collapse" : "Expand";
                // $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : status['website'],
                //                                               'verbage' : status['plugin']});
                setTimeout(function(){
                    $scope.$apply(function(){
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights( $scope.MasterSiteVis, status['website']);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        $scope.bodyColHeight = colHgt;
                        // utils.setElementHeight('idFooter', utils.getFooterHeight());
                        if(status['website'] == 'flex'){
                            console.log("expanding website.........");
                            // utils.setElementHeight('idSiteTopRow', utils.getTopRowHeight());
                            // utils.setElementHeight('idLeftCol', colHgt - colHeightAdjustment);
                            // utils.setElementHeight('idRightCol', colHgt - colHeightAdjustment);
                        }
                        else{
                            console.log("hiding website.........");
                        }
                        console.log("onExpSiteClick adjustments - colHgt : " + colHgt);
                        });
                        $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : status['website'],
                                                               'verbage' : status['plugin']});
                        /*
                        $scope.$apply(function(){
                            console.log("broadcast('WebSiteVisibilityEvent')");
                            $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : status['website'],
                                                                   'verbage' : status['plugin']});
                            }, 1000);
                        */
                    },1000);
            }

            $scope.$on('displayLinkerEvent', function(event, data){
                $scope.onExpPlugClick();
            });

            $scope.onExpPlugClick = function(){
                if($scope.VerbVis == 'flex'){
                    fsm.onhideplugin();
                }
                else{
                    fsm.onshowplugin();
                }
                utils.displayHeights("####  onExpPlugClick  ###");
                utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                var colHgt = utils.getAvailableSiteColumnHeights( $scope.MasterSiteVis, status['website']);

                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                $scope.bodyColHeight = colHgt;

                $scope.$broadcast('CollapseVerbageEvent', { 'website' : status['website'],
                                                             'verbage' : status['plugin']});

                setTimeout(function(){
                    $scope.$apply(function(){
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status['website']);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.displayHeights("####  onExpPlugClick after timeout  ###");
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);

                        // This stuff has to be inside the callback after the timeout event
                        var centerCol = document.getElementById('idCenterCol');
                        var mapWrap = document.getElementById('map_wrapper');
                        var centerWidth = centerCol.clientWidth;
                        var flexWidth = utils.toFixedOne(centerWidth * 0.6, 0);
                        mapWrap.style.width = flexWidth;
                        mapWrap.clientWidth = flexWidth;

                        utils.setElementWidth('map_wrapper', flexWidth, 'px');
                        console.log("we just set the map wrapper width to the center col width of " + flexWidth);

                        if(status['website'] == 'flex'){
                            // utils.setElementHeight('idSiteTopRow', utils.getTopRowHeight());
                            // utils.setElementHeight('idLeftCol', colHgt - colHeightAdjustment);
                            // utils.setElementHeight('idRightCol', colHgt - colHeightAdjustment);
                            // utils.setElementHeight('idFooter', utils.getFooterHeight());
                        }
                        console.log("onExpPlugClick adjustments - colHgt : " + colHgt);

                        // $scope.$broadcast('CollapseVerbageEvent', { 'website' : status['website'],
                        //                                              'verbage' : status['plugin']});
                        });
                    },1000);

            };

            $scope.$on('CollapseSummaryEvent', function(event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
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

            $scope.$on('CollapseSummaryCompletionEvent', function(event, args){
                if(AgoNewWindowConfig.getHideWebSiteOnStartup() == true){
                    AgoNewWindowConfig.setHideWebSiteOnStartup(false);
                    $scope.onExpSiteClick();
                }
            });

            $scope.$on('windowResized', function() {
                // utils.recalculateTopRow($scope.SiteVis);
                utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status['website']);
                utils.displayHeights("####  windowResized Event  ###");
                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;

                setTimeout(function(){
                    $scope.$apply(function(){
                        // utils.recalculateTopRow($scope.SiteVis);
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

            $scope.siteCollapser = function(tf){
                $scope.hideWebSiteOnStartup = tf;
                // $scope.onExpSiteClick();
            };
            selfMethods["siteCollapser"] = $scope.siteCollapser;

            function adjustHeights(scope, invalidateMapPane){
                /* From flexbox.js plunker  */
                var colHgt = utils.getAvailableSiteColumnHeights(scope.MasterSiteVis, status['website']);
                scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;

                setTimeout(function(){
                    $scope.$apply(function(){
                        $scope.bodyColHeight = colHgt;
                        // $scope.bodyColHeight = colHgt;
                        // utils.setElementHeight('idBody', colHgt - 20);
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status['website']);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        if(status['website'] == 'flex'){
                            // utils.setElementHeight('idSiteTopRow', utils.getTopRowHeight());
                            // utils.setElementHeight('idLeftCol', colHgt - colHeightAdjustment);
                            // utils.setElementHeight('idRightCol', colHgt - colHeightAdjustment);
                        }
                        console.log("adjustHeights colHgt : " + colHgt);
                        if(invalidateMapPane && invalidateMapPane == true){
                            console.log("NNNOOOWWW invalidateMapPane with CollapseSummaryCompletionEvent");
                            $scope.$broadcast('CollapseSummaryCompletionEvent');
                            }
                            // if(AgoNewWindowConfig.getHideWebSiteOnStartup() == true){
                                // $scope.onExpSiteClick();
                            // }
                        });
                    },1000);
            }
        };

        function hideWebsite(){
            console.log("hideWebsite");

            selfMethods["siteCollapser"](true);
        }

        function init(App) {
            console.log('SPACtrl init');
            App.controller('SPACtrl', ['$scope', SPACtrl]);
            return SPACtrl;
        }


        return { start: init, hideWebsite : hideWebsite };

    });

}).call(this);
