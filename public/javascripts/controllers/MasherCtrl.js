/*global define */
/*global $uibModal */
/*global $uibModalInstance */
/*global Event */
/*global $modalInstance */
/*jslint es5: true */

(function () {
    "use strict";
    var isStartingFromMasterSiteView = true;

    console.log('MasherCtrl setup');
    define(['angular',
        'lib/MLConfig',
        'controllers/WebSiteDescriptionCtrl',
        'lib/utils',
        'controllers/PopupBlockerCtrl'],
        function (angular,  MLConfig, WebSiteDescriptionCtrl, utils, PopupBlockerCtrl) {
            console.log('MasherCtrl define');
            var selfMethods = {},
                AGOReplacement = false,
                descriptions = {
                    'leaflet': 'A selection of coffee shops that were retrieved from a query to a geographic information \
                        lookup service, using open source maps and data, displayed on a Leaflet Map.  Alternatively, \
                        this could be the web site for a single organization where one of the web site pages contains \
                        a Leaflet map of its multiple locations.',
                    'google' : 'A selection of restaurants that were retrieved from a query to a geographic information \
                        lookup service, such as Google, displayed on a Google Map using an Open Street Map base layer.  \
                        Alternatively, this could be the web site for a single organization where one of the web site pages \
                        contains a Google map of its multiple locations.',
                    'arcgis' : 'A typical Web Map from the ArcGIS Online user contributed database.  The intially \
                        displayed map is chosen to provide a working environment for this demo.'
                };


            function MasherCtrl($scope, $location, $window, $route, $templateCache, $uibModal,
                PusherEventHandlerService, CurrentMapTypeService) {
                console.debug('MasherCtrl - initialize collapsed bool');

                var startupView = MLConfig.getStartupView();
                $scope.MasterSiteVis = startupView.websiteDisplayMode ? "inline" : 'none';
                $scope.isSummaryCollapsed = !startupView.summaryShowing;

                $scope.data = {
                    'ExpandSumText': startupView.summaryShowing === true ? "Collapse" : "Expand",
                    'ExpandFeaturesText': "Expand Features Display",
                    'isSummaryCollapsed': !startupView.summaryShowing,
                    "isSlidePaused": false,
                    "slideShowStatusText": "Slide Show Playing",
                    "isVideoPaused": false,
                    "videoStatusText": "Video Playing",
                    'completeUrl': 'completeslashdoturl',
                    'nextWindowName': 'InitialWindowName',
                    mapdetailsdict : {
                        mapType : "",
                        imgSrc : "",
                        description : ""
                    }
                };
                $scope.expBtnHeight = 1.4;  //utils.getButtonHeight(1.2); //'ExpandSumImgId');

                $scope.currentMapSystem = CurrentMapTypeService.getCurrentMapConfiguration();
                $scope.previousMapType = $scope.currentMapSystem.maptype;
                console.log("init with isSummaryCollapsed = " + $scope.isSummaryCollapsed);
                $scope.showDescriptionDialog = false;

                $scope.$on('$viewContentLoaded', function () {
                    // alert("$viewContentLoaded");
                    if (isStartingFromMasterSiteView === false) {
                        if (startupView.summaryShowing === true) {
                            $scope.summaryCollapser();
                        }
                    } else {
                        isStartingFromMasterSiteView = false;
                    }
                });

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

                $scope.summaryCollapser = function (sumCollapsed) {
                    // $scope.MasterSiteVis = $scope.ExpandSumText === "Expand" ? "inline" : "none";
                    var previouState = $scope.data.isSummaryCollapsed;

                    if (sumCollapsed && sumCollapsed.startValue === false) {
                        $scope.data.isSummaryCollapsed = false;
                    }
                    if ($scope.data.isSummaryCollapsed === true) {
                        $scope.data.isSummaryCollapsed = false;
                        $scope.data.ExpandSumText = "Collapse";
                    } else {
                        $scope.data.isSummaryCollapsed = true;
                        $scope.data.ExpandSumText = "Expand";
                    }
                    console.log("MasherCtrl isSummaryCollapsed before broadcast " + $scope.data.isSummaryCollapsed);
                    // $scope.$broadcast('CollapseSummaryEvent', {'mastersitevis' : $scope.MasterSiteVis, 'websitevis' : 'unknown'});
                    // $scope.isSummaryCollapsed = !$scope.isSummaryCollapsed;
                    // console.log("MasherCtrl isSummaryCollapsed after broadcast " + $scope.data.isSummaryCollapsed);
                    console.log("Force a resize in summaryCollapser");
                    window.resizeBy(0, 0);
                    window.dispatchEvent(new Event('resize'));

                    $scope.safeApply(function () {
                        console.log("preliminary collapse event $apply");
                    });
                    if (previouState === false && $scope.data.isSummaryCollapsed) {
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.$broadcast('CollapseSummaryCompletionEvent',
                                    {'mastersitevis' : $scope.MasterSiteVis, 'websitevis' : 'unknown'});
                            });
                        }, 500);
                    }
                };
                selfMethods.summaryCollapser = $scope.summaryCollapser;

                $scope.featuresCollapser = function () {
                    $scope.summaryCollapser();
                    if ($scope.data.isSummaryCollapsed === true) {
                        $scope.data.ExpandFeaturesText = "Minimize Features Display";
                    } else {
                        $scope.data.ExpandFeaturesText = "Expand Features Display";
                    }

                    $scope.safeApply(function () {
                        console.log("preliminary features collapse event $apply");
                    });
                };

                $scope.pauseSlide = function () {
                    $scope.data.isSlidePaused = $scope.data.isSlidePaused === true ? false : true;
                    $scope.data.slideShowStatusText = $scope.data.isSlidePaused ? "Slide Show Paused" : "Slide Show Playing";
                    $scope.$broadcast("SlidePauseEvent");
                };

                $scope.pauseVideo = function () {
                    $scope.data.isVideoPaused = $scope.data.isVideoPaused === true ? false : true;
                    $scope.data.videoStatusText = $scope.data.isVideoPaused ? "Video Paused" : "Video Playing";
                    $scope.$broadcast("VideoPauseEvent", {'playpauseStatus' : $scope.data.isVideoPaused});
                };

                $scope.showMeTheMapClicked = function () {
                    $scope.previousMapType = $scope.currentMapSystem.maptype;
                    $scope.currentMapSystem = CurrentMapTypeService.getCurrentMapConfiguration();
                    console.log("MasherCtrl.showMeTheMapClicked");
                    console.log("previousMapType : " + $scope.previousMapType);
                    console.log("currentMapSystem - url reset to " + $scope.currentMapSystem.url);

                    $location.path($scope.currentMapSystem.url, true);
                    $location.replace();
                    if ($scope.currentMapSystem.maptype !== $scope.previousMapType || AGOReplacement === true) {
                        $route.reload();
                        AGOReplacement = false;
                    }
                    // $route.reload();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.describeTheWebsiteClicked = function () {
                    console.log("Describe the website for currentMapSystem " + $scope.currentMapSystem.title);

                    $scope.data.mapdetailsdict.mapType = $scope.currentMapSystem.maptype;
                    $scope.data.mapdetailsdict.imgSrc = $scope.currentMapSystem.imgSrc;
                    $scope.data.mapdetailsdict.description = descriptions[$scope.currentMapSystem.maptype];

                    var tmplt = ' \
                        <div class="modal-content"> \
                          <div class="modal-header"> \
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" \
                                ng-click="cancel()">&times;</button> \
                            <h4>This sample Web Site powered by <img src="{{data.image}}">  {{data.mapType}} is showing us :</h3> \
                          </div> \
                          <div class="modal-body"> \
                            <p style="border-style:solid; padding: 5px"> \
                                {{data.description}} \
                            </p> \
                            <p> \
                                Clicking on a location icon pops up available, relevant information at that address. \
                            </p> \
                          </div> \
                          <div class="modal-footer"> \
                            <button type="button" class="btn btn-primary" ng-click="accept()">Accept</button> \
                            <button type="button" class="btn btn-primary" ng-click="cancel()">Cancel</button> \
                          </div> \
                        </div><!-- /.modal-content --> \
                    ',

                        modalInstance = $uibModal.open({
                            template : tmplt,
                            controller : 'WebSiteDescriptionCtrl',
                            size : 'sm',
                            backdrop : 'false',
                            resolve : {
                                data: function () {
                                    return $scope.data.mapdetailsdict;
                                }
                            }
                        });

                    modalInstance.result.then(function (selectedItem) {
                        $scope.selected = selectedItem;
                        $scope.showMeTheMapClicked();
                    }, function () {
                        console.log('Modal dismissed at: ' + new Date());
                    });

                };

                CurrentMapTypeService.addScope($scope);
                $scope.$on('ForceMapSystemEvent', function (evt, args) {
                    $scope.currentMapSystem = args.whichsystem;
                    $location.path(args.newpath);
                });
                $scope.$on('ForceAGOEvent', function (evt, args) {
                    $scope.previousMapType = $scope.currentMapSystem.maptype;
                    $scope.currentMapSystem = args.whichsystem;
                    AGOReplacement = true;
                });
                $scope.$on('SwitchedMapSystemEvent', function (evt, args) {
                    console.log("SwitchedMapSystemEvent");
                    console.log("From " + $scope.previousMapType + " to " + args.whichsystem.maptype);
                    if (AGOReplacement === true) {
                        $scope.previousMapType = "prevAGORep";
                    } else {
                        $scope.previousMapType = $scope.currentMapSystem.maptype;
                    }

                    $scope.currentMapSystem = args.whichsystem;
                });

                $scope.onNewMapPosition = function (pos) {
                    var pos2prt = String.format('onNewMapPosition handler - framework {0}, referrer {1}, at x {2}, y {3}, zoom {4}',
                        pos.maphost, pos.referrerId, pos.lon, pos.lat, pos.zoom),

                        baseUrl = MLConfig.getbaseurl(),
                        completeUrl = baseUrl + pos.maphost + pos.search,
                        nextWindowName = MLConfig.getNextWindowName(),
                        $inj,
                        modalInstance,
                        popresult = null;
                    console.log(pos2prt);
                    console.log("search url :");
                    console.log(pos.search);
                    console.log('completeUrl');
                    console.debug(completeUrl);
                    console.log("userId = " + MLConfig.getUserId() + " referrerId = " + MLConfig.getReferrerId() + " pos.referrerId = " + pos.referrerId);
                    console.log("is Initial User ? " + MLConfig.getInitialUserStatus());
                    console.log("Open new window with name " + nextWindowName);

                    // if (pos.referrerId !== MLConfig.getUserId()) {
                    if (pos.referrerName !== MLConfig.getUserName()) {
                        completeUrl += "&userName=" + MLConfig.getUserName();
                        popresult = window.open(completeUrl, nextWindowName, MLConfig.getSmallFormDimensions());
                        if (!popresult || popresult === 'undefined') {
                            $inj = angular.element(document.body).injector();
                            $uibModal = $inj.get('$uibModal');

                            modalInstance = $uibModal.open({

                                templateUrl : '/templates/ModalDialogPopupBlocked',   // .jade will be appended
                                controller : 'PopupBlockerCtrl',
                                backdrop : 'false',

                                resolve: {
                                    data : function () {
                                        return {'urlToUnblock': MLConfig.gethost()};
                                    }
                                }
                            });

                            modalInstance.result.then(function (msg) {
                                console.log("return from showing PopupBlockerDialog dialog");
                            });
                        }
                        console.log("after call to window.open with initial user status true");
                    } else {
                        console.log("userId and referrerId match : do not open window");
                    }

                };

                PusherEventHandlerService.addEvent('client-NewMapPosition', $scope.onNewMapPosition);

                selfMethods.onNewMapPosition = $scope.onNewMapPosition;
            }

            function init(App) {
                console.log('MasherCtrl init');
                App.controller('MasherCtrl',
                    ['$scope', '$location', '$window', '$route', '$templateCache', '$uibModal',
                        'PusherEventHandlerService', 'CurrentMapTypeService', MasherCtrl]);

                return MasherCtrl;
            }

            function startMapSystem() {
                var startupView = MLConfig.getStartupView();
                console.log("startMapSystem");
                // Starting in  a new popup window or new tab
                // Need to prepare for immediate summaryCollapser when content loaded
                isStartingFromMasterSiteView = false;

                if (startupView.summaryShowing === true) {

                    setTimeout(function () {
                        console.log("MasherCtrl startMapSystem - call summaryCollapser");
                        selfMethods.summaryCollapser({'startValue' : false});
                    }, 500);
                }
            }

            function onNewMapPosition(pos) {
                console.log("onNewMapPosition");

                selfMethods.onNewMapPosition(pos);
            }

            return { start: init, startMapSystem: startMapSystem, onNewMapPosition : onNewMapPosition };

        });
}());
// }()).call(this);
