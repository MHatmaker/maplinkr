
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
                shrinkgrowtext : "Expand Map",
                topRowShowing : 'block',
                leftColShowing : 'block',
                mapColShowing : 'block',
                rightColShowing : 'block',
                mapColDef : 'col-xs-10 col-sm-6 col-md-4,'
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

            function setDisplayStyles(tf) {
                var dsp = tf ? 'block' : 'none';

                $scope.data.expanded = tf;
                $scope.webSiteVisible = $scope.data.webSiteVisible = tf ? "Expand" : "Collapse";
                $scope.leftColShowing = $scope.topRowShowing = $scope.rightColShowing = dsp;
                $scope.data.leftColShowing = $scope.data.topRowShowing = $scope.data.rightColShowing = dsp;
                $scope.data.mapColDef = tf ? "col-xs-12 col-sm-6 col-md-4" : "col-xs-12";
                $scope.data.shrinkgrowtext = tf ? "Expand Map" : "Shrink Map";
                $scope.data.ExpandSite = $scope.ExpandSite = tf ? "Max Map" : "Min Map";
            }
            if (startupView.website === true) {
                $scope.hideWebSiteOnStartup = false;
                setDisplayStyles(true);
            } else {
                $scope.hideWebSiteOnStartup = true;
                $scope.data.mapColShowing = 'none';
                setDisplayStyles(false);
            }

            $scope.$on('mapMaximizerEvent', function (event, data) {
                $scope.onExpandMapClicked();
            });

            // from ModelessTest project

            $scope.onExpandMapClicked = function () {
                console.log("onExpandMapClicked");
                if ($scope.data.expanded === true) {
                    setDisplayStyles(false);
                } else {
                    setDisplayStyles(true);
                }
            };
            $scope.onExpandClicked = function () {
                if ($scope.data.expanded === true) {
                    setDisplayStyles(false);
                    $scope.data.mapColShowing = 'block';
                } else {
                    setDisplayStyles(true);
                    $scope.data.mapColShowing = 'none';
                }
            };
            // $scope.$on('displayLinkerEvent', function (event, data) {
            //     var visibility = 'whatever';
            //     if (data && data.visibility) {
            //        visibility = data.visibility;
            //     }
            //     $scope.onExpPlugClick(visibility);
            // });

            $scope.windowResized = function () {
                var height = document.body.clientHeight,
                    width = document.body.clientWidth,
                    mapWrp = angular.element(document.getElementById("map_wrapper")),
                    rightCol = angular.element(document.getElementById("idRightColOuter")),
                    hstr = "",
                    mq;

                console.log(" document.body.client : width " + width + ", height " + height);
                console.log("map_wrapper height");
                console.debug(mapWrp);
                hstr = String.format("{0}px", utils.toFixedOne(height * 0.7));
                console.log(hstr);
                mapWrp.css({"height": hstr});
                mq = window.matchMedia('@media all and (max-width: 600px)');
                if (mq.matches) {
                    // the width of browser is more then 700px
                    rightCol.css({"top": 0});
                } else {
                    // the width of browser is less then 700px
                    rightCol.css({"top": hstr});
                }

            };
            selfMethods.windowResized = $scope.windowResized;
            window.addEventListener('resize', $scope.windowResized);
            $scope.siteCollapser = function (tf) {
                $scope.hideWebSiteOnStartup = tf;
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
