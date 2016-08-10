
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>

// var console = (window.console = window.console || {});
// var setTimeout = (window.setTimeout = window.setTimeout || {});

/*global define */
/*global Event */

(function () {
    "use strict";

    console.log('SPACtrl setup');
    define(['angular', 'lib/MLConfig', 'lib/utils', 'controllers/MapCtrl'],
        function (angular, MLConfig, utils, MapCtrl) {
            console.log('SPACtrl define');
            var selfMethods = {};

            function SPACtrl($scope, CurrentMapTypeService, SiteViewService) {
                console.log('SPACtrl - initialize collapsed bool');
                $scope.data = {
                    subsiteExpanded : false,
                    shrinkgrowtext : "Expand Map",
                    topRowShowing : 'block',
                    leftColShowing : 'block',
                    mapColShowing : 'block',
                    rightColShowing : 'block',
                    mapColDef : 'col-xs-12 col-sm-6 col-md-4,',
                    mapColPad : 'padding-left: 0.875em; padding-right: 0.875em;'
                };

                var startupView = MLConfig.getStartupView(),
                    curmapsys;

                $scope.mapConRowHgt = 0;
                $scope.centerColHgt = 0;
                $scope.mapWrapHgt = 0;
                $scope.safeApply = function (fn) {
                    var phase;
                    if (this.$root) {
                        phase = this.$root.$$phase;
                        if (phase === '$apply' || phase === '$digest') {
                            if (fn && (typeof fn === 'function')) {
                                fn();
                            }
                        } else {
                            this.$apply(fn);
                        }
                    }
                };
                $scope.windowResized = function () {
                    window.resizeBy(0, 0);
                    $scope.safeApply();
                    setTimeout(function () {
                        // utils.calculateComponentHeights($scope.MasterSiteVis, $scope.WebSiteVis);
                        utils.updateMapContainerHeight($scope);
                        utils.displayHeights("Heights window resized event (map display min/max)");
                        $scope.$apply(console.log("Timer fired on windowResized event"));
                    }, 500);
                    $scope.safeApply();
                };
                selfMethods.windowResized = $scope.windowResized;
                window.addEventListener('resize', $scope.windowResized);

                if (startupView.summaryShowing === true) {
                    $scope.MasterSiteVis = "inline";
                } else {
                    $scope.MasterSiteVis = "none";
                }

                curmapsys = CurrentMapTypeService.getMapRestUrl();

                $scope.curMapSys = curmapsys;

                $scope.setDisplayStyles = function (tf) {
                    var dsp = tf ? 'block' : 'none';

                    $scope.data.subsiteExpanded = tf;
                    $scope.webSiteVisible = ($scope.data.webSiteVisible === tf ? "Expand" : "Collapse");
                    $scope.WebSiteVis = dsp = tf ? 'inline-block' : 'none';
                    $scope.leftColShowing = $scope.topRowShowing = $scope.rightColShowing = dsp;
                    $scope.data.leftColShowing = $scope.data.topRowShowing = $scope.data.rightColShowing = dsp;
                    $scope.data.mapColDef = tf ? "col-xs-12 col-sm-6 col-md-5" : "col-xs-12";
                    $scope.data.mapColPad = tf ? "padding-left: 0; padding-right: 0" : "padding-left: 0.875em; padding-right: 0.875em";
                    $scope.data.shrinkgrowtext = tf ? "Expand Map" : "Shrink Map";
                    $scope.data.ExpandSite = tf ? "Max Map" : "Min Map";
                    SiteViewService.setSiteExpansion(tf);
                };
                if (startupView.websiteDisplayMode === true) {
                    $scope.hideWebSiteOnStartup = false;
                    $scope.setDisplayStyles(true);
                    $scope.data.mapColShowing = 'block';
                } else {
                    $scope.hideWebSiteOnStartup = true;
                    $scope.data.mapColShowing = 'block';
                    $scope.setDisplayStyles(false);
                }

                setTimeout(function () {
                    window.resizeBy(0, 0);
                    $scope.safeApply(console.log("Initiating system with Collapsed website."));
                }, 500);

                $scope.handleMapExpandShrinkEvents = function () {
                    if ($scope.data.subsiteExpanded === true) {
                        $scope.data.subsiteExpanded = false;
                        $scope.setDisplayStyles(false);
                    } else {
                        $scope.data.subsiteExpanded = true;
                        $scope.setDisplayStyles(true);
                    }

                    setTimeout(function () {
                        console.log("in handleMapExpandShrinkEvents timeout callback");
                        // This update appears to be necessary for ArcGIS maps
                        utils.updateMapContainerHeight($scope);
                        window.resizeBy(0, 0);
                        window.dispatchEvent(new Event('resize'));
                        utils.calculateComponentHeights($scope.MasterSiteVis, $scope.WebSiteVis);
                        utils.displayHeights("after handleMapExpandShrinkEvents");
                    }, 100);
                };

                $scope.onExpandMapClicked = function () {
                    console.log("onExpandMapClicked");
                    $scope.handleMapExpandShrinkEvents();
                };

                $scope.$on('mapMaximizerEvent', function (event, data) {
                    $scope.handleMapExpandShrinkEvents();
                });

            }

            function init(App) {
                console.log('SPACtrl init');
                App.controller('SPACtrl', ['$scope', 'CurrentMapTypeService', 'SiteViewService', SPACtrl]);

                return SPACtrl;
            }

            return { start: init};
        });

}());

// }).call(this);
