
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>

// var console = (window.console = window.console || {});
// var setTimeout = (window.setTimeout = window.setTimeout || {});

/*global define */

(function () {
    "use strict";

    console.log('SPACtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig', 'lib/fsm', 'lib/utils'], function (angular, AgoNewWindowConfig, finstatmach, utils) {
        console.log('SPACtrl define');
        var selfMethods = {};

        function SPACtrl($scope) {
            console.debug('SPACtrl - initialize collapsed bool');
            $scope.data = {
                verbageExpandCollapse : "Expand",
                webSiteVisible : "Expand",
                ExpandSite : 'Max Map',
                ExpandPlug : 'Show Linker'
            };
            var status = {
                'website' : "flex",
                'plugin' : "none"
            },
                innerTableAdjustment = 0, //20;
                colHeightAdjustment = 0,
                startupView = AgoNewWindowConfig.getStartupView(),
                fsm = null;


            if (startupView.summary === true) {
                $scope.MasterSiteVis = "inline";
            } else {
                $scope.MasterSiteVis = "none";
            }

            if (startupView.website === true) {
                $scope.webSiteVisible = "Expand";
                $scope.data.webSiteVisible = "Expand";
                $scope.SiteVis = "flex";
                status.website = "flex";
                $scope.ExpandSite = "Max Map";
                $scope.data.ExpandSite = "Max Map";
                $scope.hideWebSiteOnStartup = true;
            } else {
                $scope.webSiteVisible = "Collapse";
                $scope.data.webSiteVisible = "Collapse";
                $scope.SiteVis = "none";
                status.website = "none";
                $scope.ExpandSite = "Min Map";
                $scope.data.ExpandSite = "Min Map";
                $scope.hideWebSiteOnStartup = true;
                setTimeout(function () {
                    $scope.$apply(function () {
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status.website);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        $scope.bodyColHeight = colHgt;
                    }, 1000);

                    $scope.$broadcast('minmaxDirtyEvent');

                });
            }
            $scope.verbageExpandCollapse = "Expand";

            $scope.ExpandPlug = "Show Linker";
            $scope.VerbVis = "none";

            $scope.webSiteWidth = "inherit";

            function printStatus(msg) {
                var msgstr = String.format("{0}... site ? : {1}, plugin ? : {2}",
                         msg, status.website, status.plugin);
                console.log(msgstr);
                msgstr = String.format("verbage {0}, website {1}",
                    status.plugin === 'flex' ? '70%' : '0%',
                    status.website === 'flex' ? 'true' : 'false');
                console.log(msgstr);
            }

            $scope.data.verbageExpandCollapse = $scope.verbageExpandCollapse =  status.plugin === 'flex' ? "Collapse" : "Expand";

            function onShowPlugin(e, from, to, msg) {
                status.plugin = $scope.VerbVis = "flex";
                $scope.data.ExpandPlug = $scope.ExpandPlug = "Hide Linker";
                $scope.data.verbageExpandCollapse = $scope.verbageExpandCollapse = "Collapse";

                printStatus('Show Plug-in!');
            }

            function adjustHeights(scope, invalidateMapPane) {
                /* From flexbox.js plunker  */
                var outerColHgt = utils.getAvailableSiteColumnHeights(scope.MasterSiteVis, status.website);
                scope.innerTblHeight = outerColHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;

                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.bodyColHeight = outerColHgt;
                        // $scope.bodyColHeight = colHgt;
                        // utils.setElementHeight('idBody', colHgt - 20);
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status.website);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        console.log("adjustHeights colHgt : " + colHgt);
                        if (invalidateMapPane && invalidateMapPane === true) {
                            console.log("NNNOOOWWW invalidateMapPane with CollapseSummaryCompletionEvent");
                            $scope.$broadcast('CollapseSummaryCompletionEvent');
                        }
                    });
                }, 1000);
            }

            function onHidePlugin(e, from, to, msg) {
                status.plugin = $scope.VerbVis = "none";
                $scope.data.ExpandPlug = $scope.ExpandPlug = "Show Linker";
                $scope.data.verbageExpandCollapse = $scope.verbageExpandCollapse  = "Expand";
                printStatus('Hide Plug-in!');
            }

            function onShowWebSite(e, from, to, msg) {
                status.website = $scope.SiteVis = "flex";
                $scope.webSiteWidth = "inherit";
                $scope.data.ExpandSite = $scope.ExpandSite = "Max Map";
                $scope.data.webSiteVisible = $scope.webSiteVisible = "Expand";
                printStatus('Show Web Site!');
            }

            function onHideWebSite(e, from, to, msg) {
                status.website = $scope.SiteVis = "none";
                $scope.webSiteWidth = "100%";
                $scope.data.ExpandSite = $scope.ExpandSite = "Min Map";
                $scope.data.webSiteVisible = $scope.webSiteVisible = "Collapse";
                printStatus('Hide Web Site!');
            }

            fsm = finstatmach.create({
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
            });

            $scope.$on('mapMaximizerEvent', function (event, data) {
                $scope.onExpSiteClick();
            });

            $scope.onExpSiteClick = function () {
                console.log("status.website before " + status.website);
                if (status.website === 'flex') {
                    fsm.onhidewebsite();
                } else {
                    fsm.onshowwebsite();
                }
                console.log("status.website after  " + status.website);

                utils.displayHeights("####  onExpSiteClick  ###");

                setTimeout(function () {
                    $scope.$apply(function () {
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status.website);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        $scope.bodyColHeight = colHgt;
                        console.log(status.website === 'flex' ?
                                "expanding website........." : "hiding website.........");
                        console.log("onExpSiteClick adjustments - colHgt : " + colHgt);
                    });
                    $scope.$broadcast('WebSiteVisibilityEvent', { 'website' : status.website,
                                                           'verbage' : status.plugin});
                }, 1000);
            };

            $scope.$on('displayLinkerEvent', function (event, data) {
                $scope.onExpPlugClick();
            });

            $scope.onExpPlugClick = function () {
                if ($scope.VerbVis === 'flex') {
                    fsm.onhideplugin();
                } else {
                    fsm.onshowplugin();
                }
                utils.displayHeights("####  onExpPlugClick  ###");
                utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                var outerColHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status.website);

                $scope.innerTblHeight = outerColHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                $scope.bodyColHeight = outerColHgt;

                $scope.$broadcast('CollapseVerbageEvent', { 'website' : status.website,
                                                             'verbage' : status.plugin});

                setTimeout(function () {
                    $scope.$apply(function () {
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status.website);
                        $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;
                        utils.displayHeights("####  onExpPlugClick after timeout  ###");
                        utils.setElementHeight('idCenterCol', colHgt - colHeightAdjustment);
                        utils.setElementHeight('map_wrapper', colHgt - colHeightAdjustment);
                        console.log("onExpPlugClick adjustments - colHgt : " + colHgt);
                    });
                }, 1000);
            };

            $scope.$on('CollapseSummaryEvent', function (event, args) {
                $scope.MasterSiteVis = args.mastersitevis;
                console.log("on CollapseSummaryEvent, call adjustHeights");
                var innerScope = $scope;
                setTimeout(function () {
                    innerScope.$apply(function () {
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        utils.displayHeights("####  CollapseSummaryEvent  ###");
                        adjustHeights($scope, true);
                    });
                }, 1000);

            });

            $scope.$on('CollapseSummaryCompletionEvent', function (event, args) {
                if (AgoNewWindowConfig.getHideWebSiteOnStartup() === true) {
                    AgoNewWindowConfig.setHideWebSiteOnStartup(false);
                    $scope.onExpSiteClick();
                }
            });

            $scope.$on('windowResized', function () {
                // utils.recalculateTopRow($scope.SiteVis);
                utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                var colHgt = utils.getAvailableSiteColumnHeights($scope.MasterSiteVis, status.website);
                utils.displayHeights("####  windowResized Event  ###");
                $scope.innerTblHeight = colHgt + utils.getTopRowHeight() + utils.getFooterHeight() - innerTableAdjustment;

                setTimeout(function () {
                    $scope.$apply(function () {
                        // utils.recalculateTopRow($scope.SiteVis);
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.SiteVis);
                        adjustHeights($scope);
                        // utils.setElementHeight('idMasherCtrl', utils.getMasterSiteHeight());
                    });
                }, 1000);

                console.log("windowResized method in SPACtrl.js");

                // utils.calculateComponentHeights($scope.MasterSiteVis, status.website);
                // utils.setElementHeight('idMasherCtrl', utils.getMasterSiteHeight());
                // utils.setElementHeight('idMasterSite', 90, '%');
                // adjustHeights($scope);
            });

            $scope.siteCollapser = function (tf) {
                $scope.hideWebSiteOnStartup = tf;
                // $scope.onExpSiteClick();
            };
            selfMethods.siteCollapser = $scope.siteCollapser;

        }

        function hideWebsite() {
            console.log("hideWebsite");

            selfMethods.siteCollapser(true);
        }

        function init(App) {
            console.log('SPACtrl init');
            App.controller('SPACtrl', ['$scope', SPACtrl]);
            return SPACtrl;
        }

        return { start: init, hideWebsite : hideWebsite };
    });

}());

// }).call(this);
