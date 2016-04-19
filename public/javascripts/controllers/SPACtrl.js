
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
                expanded : false,
                shrinkgrowtext : "Expand Map"
            };

            var startupView = AgoNewWindowConfig.getStartupView(),
                curmapsys,
                $inj,
                serv;


            if (startupView.summary === true) {
                $scope.MasterSiteVis = "inline";
            } else {
                $scope.MasterSiteVis = "none";
            }

            $inj = angular.injector(['app']);
            serv = $inj.get('CurrentMapTypeService');
            curmapsys = serv.getMapRestUrl();

            $scope.curMapSys = curmapsys;
            $scope.topRowShowing = 'block';
            $scope.leftColShowing = 'block';
            $scope.mapColShowing = 'block';
            $scope.rightColShowing = 'block';
            $scope.mapColDef = "col-xs-10 col-sm-6 col-md-4";

            if (startupView.website === true) {
                $scope.hideWebSiteOnStartup = false;

                $scope.data.expanded = false;
                $scope.topRowShowing = 'block';
                $scope.leftColShowing = 'block';
                $scope.rightColShowing = 'block';
                $scope.mapColDef = "col-xs-12 col-sm-6 col-md-4";
                $scope.data.shrinkgrowtext = "Expand Map";
            } else {
                $scope.hideWebSiteOnStartup = true;

                $scope.data.expanded = true;
                $scope.topRowShowing = 'none';
                $scope.leftColShowing = 'none';
                $scope.rightColShowing = 'none';
                $scope.mapColShowing = 'none';
                $scope.mapColDef = "col-xs-12";
                $scope.data.shrinkgrowtext = "Shrink Map";
            }

            // from ModelessTest prooject

            $scope.onExpandMapClicked = function () {
                console.log("onExpandMapClicked");
                if ($scope.data.expanded === true) {
                    $scope.data.expanded = false;
                    $scope.topRowShowing = 'block';
                    $scope.leftColShowing = 'block';
                    $scope.mapColShowing = 'block';
                    $scope.rightColShowing = 'block';
                    $scope.mapColDef = "col-xs-12 col-sm-6 col-md-4";
                    $scope.data.shrinkgrowtext = "Expand Map";

                } else {
                    $scope.data.expanded = true;
                    $scope.topRowShowing = 'none';
                    $scope.leftColShowing = 'none';
                    $scope.mapColShowing = 'none';
                    $scope.rightColShowing = 'none';
                    $scope.mapColDef = "col-xs-12";
                    $scope.data.shrinkgrowtext = "Shrink Map";
                }
            };
            $scope.onExpandClicked = function () {
                if ($scope.data.expanded === true) {
                    $scope.data.expanded = false;
                    $scope.topRowShowing = 'block';
                    $scope.leftColShowing = 'block';
                    $scope.mapColShowing = 'block';
                    $scope.rightColShowing = 'block';
                    $scope.mapColDef = "col-xs-12 col-sm-6 col-md-4";
                    $scope.data.shrinkgrowtext = "Expand Map";

                } else {
                    $scope.data.expanded = true;
                    $scope.topRowShowing = 'none';
                    $scope.leftColShowing = 'none';
                    $scope.mapColShowing = 'none';
                    $scope.rightColShowing = 'none';
                    $scope.mapColDef = "col-xs-12";
                    $scope.data.shrinkgrowtext = "Shrink Map";
                }
            };

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
