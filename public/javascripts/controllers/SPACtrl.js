
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>

// var console = (window.console = window.console || {});
// var setTimeout = (window.setTimeout = window.setTimeout || {});

/*global define */

(function () {
    "use strict";

    console.log('SPACtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig', 'lib/utils'], function (angular, AgoNewWindowConfig, utils) {
        console.log('SPACtrl define');
        var selfMethods = {};

        function SPACtrl($scope) {
            console.debug('SPACtrl - initialize collapsed bool');
            $scope.data = {
                subsiteExpanded : false,
                shrinkgrowtext : "Expand Map",
                topRowShowing : 'block',
                leftColShowing : 'block',
                mapColShowing : 'block',
                rightColShowing : 'block',
                mapColDef : 'col-xs-12 col-sm-6 col-md-4,'
            };

            var startupView = AgoNewWindowConfig.getStartupView(),
                curmapsys,
                $inj,
                serv;

            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof fn === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };
            $scope.windowResized = function () {
                $scope.safeApply();
                utils.getMapContainerHeight($scope);
                setTimeout(function () {
                    $scope.$apply(console.log("Timer fired"));
                }, 1000);
                $scope.safeApply();
            };
            selfMethods.windowResized = $scope.windowResized;
            window.addEventListener('resize', $scope.windowResized);

            if (startupView.summary === true) {
                $scope.MasterSiteVis = "inline";
            } else {
                $scope.MasterSiteVis = "none";
            }

            $inj = angular.injector(['app']);
            serv = $inj.get('CurrentMapTypeService');
            curmapsys = serv.getMapRestUrl();

            $scope.curMapSys = curmapsys;

            $scope.setDisplayStyles = function (tf) {
                var dsp = tf ? 'block' : 'none';

                $scope.data.subsiteExpanded = tf;
                $scope.webSiteVisible = $scope.data.webSiteVisible = tf ? "Expand" : "Collapse";
                $scope.leftColShowing = $scope.topRowShowing = $scope.rightColShowing = dsp;
                $scope.data.leftColShowing = $scope.data.topRowShowing = $scope.data.rightColShowing = dsp;
                $scope.data.mapColDef = tf ? "col-xs-12 col-sm-6 col-md-4" : "col-xs-12";
                $scope.data.shrinkgrowtext = tf ? "Expand Map" : "Shrink Map";
                $scope.data.ExpandSite = $scope.ExpandSite = tf ? "Max Map" : "Min Map";
                utils.getMapContainerHeight($scope);
            }
            if (startupView.website === true) {
                $scope.hideWebSiteOnStartup = false;
                $scope.setDisplayStyles(true);
            } else {
                $scope.hideWebSiteOnStartup = true;
                $scope.data.mapColShowing = 'none';
                $scope.setDisplayStyles(false);
            }
            $scope.safeApply();
            setTimeout(function () {
                $scope.$apply($scope.setDisplayStyles);
            }, 1000);

            // from ModelessTest project
            $scope.handleMapExpandShrinkEvents = function () {
                if ($scope.data.subsiteExpanded === true) {
                    $scope.setDisplayStyles(false);
                } else {
                    $scope.setDisplayStyles(true);
                }
                $scope.windowResized();
            }

            $scope.onExpandMapClicked = function () {
                console.log("onExpandMapClicked");
                $scope.handleMapExpandShrinkEvents();
            };

            $scope.$on('mapMaximizerEvent', function (event, data) {
                $scope.handleMapExpandShrinkEvents();
            });

            $scope.onExpandClicked = function () {
                if ($scope.data.subsiteExpanded === true) {
                    $scope.setDisplayStyles(false);
                    $scope.data.mapColShowing = 'block';
                } else {
                    $scope.setDisplayStyles(true);
                    $scope.data.mapColShowing = 'none';
                }
                $scope.windowResized();
            };
            // $scope.$on('displayLinkerEvent', function (event, data) {
            //     var visibility = 'whatever';
            //     if (data && data.visibility) {
            //        visibility = data.visibility;
            //     }
            //     $scope.onExpPlugClick(visibility);
            // });

            $scope.siteCollapser = function (tf) {
                $scope.hideWebSiteOnStartup = tf;
                utils.getMapContainerHeight($scope);
                // $scope.onExpSiteClick();
            };
            selfMethods.siteCollapser = $scope.siteCollapser;

            $scope.windowResized();
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
