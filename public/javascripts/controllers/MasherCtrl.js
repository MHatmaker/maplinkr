/*global define */
/*global $uibModal */
/*global $uibModalInstance */
/*global $modalInstance */
/*jslint es5: true */

(function () {
    "use strict";
    var isFirstViewing = true;

    console.log('MasherCtrl setup');
    define(['angular', 'lib/MLConfig', 'controllers/WebSiteDescriptionCtrl', 'lib/utils'], function (angular,  MLConfig, WebSiteDescriptionCtrl, utils) {
        console.log('MasherCtrl define');
        var selfMethods = {},
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


        function MasherCtrl($scope, $location, $window, $route, $templateCache, $uibModal) {  //$route, $routeParams, $window) {
            console.debug('MasherCtrl - initialize collapsed bool');

            var startupView = MLConfig.getStartupView();
            $scope.MasterSiteVis = startupView.websiteDisplayMode ? "inline" : 'none';
            $scope.isSummaryCollapsed = !startupView.summaryShowing;
            $scope.showPopupBlockerDialog = false;
            $scope.data = {
                'ExpandSumText': startupView.summaryShowing === true ? "Collapse" : "Expand",
                'isSummaryCollapsed': !startupView.summaryShowing,
                'blockedUrl': 'place holder',
                'completeUrl': 'completeslashdoturl',
                'nextWindowName': 'InitialWindowName',
                'popupDimensions': 'popdimensions',
                selfdict : {
                    mapType : "",
                    imgSrc : "",
                    description : ""
                }
            };

            $scope.catchClick = function () {
                // alert("Caught in MasherCtrl");
                $scope.showPopupBlockerDialog = true;
                $('#PopupBlockerDialog').modal311('show');
            };

            $scope.ok = function () {
                $scope.showPopupBlockerDialog = false;
                window.open($scope.data.completeUrl, $scope.data.nextWindowName,
                    $scope.data.popupDimensions);
            };

            $scope.cancel = function () {
                $scope.showPopupBlockerDialog = false;
            };
            $scope.expBtnHeight = 1.4;  //utils.getButtonHeight(1.2); //'ExpandSumImgId');

            $scope.currentTab = null;
            console.log("init with isSummaryCollapsed = " + $scope.isSummaryCollapsed);
            $scope.showDescriptionDialog = false;

            $scope.$on('$viewContentLoaded', function () {
                // alert("$viewContentLoaded");
                if (isFirstViewing === false) {
                    if (startupView.summaryShowing === true) {
                        $scope.summaryCollapser();
                    }
                } else {
                    isFirstViewing = false;
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
                $scope.$broadcast('CollapseSummaryEvent', {'mastersitevis' : $scope.MasterSiteVis, 'websitevis' : 'unknown'});
                // $scope.isSummaryCollapsed = !$scope.isSummaryCollapsed;
                console.log("MasherCtrl isSummaryCollapsed after broadcast " + $scope.data.isSummaryCollapsed);
                $scope.safeApply(function (){
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

            $scope.showMeTheMapClicked = function () {
                console.log("currentTab - url reset to " + $scope.currentTab.url);
                MLConfig.setMapHost($scope.currentTab.maptype);
                console.debug($location);

                // $scope.summaryCollapser({'startValue' : false});
                $location.path($scope.currentTab.url, true);
                $location.replace();
                // $route.reload();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.describeTheWebsiteClicked = function () {
                console.log("Describe the website for currentTab " + $scope.currentTab.title);

                $scope.data.selfdict.mapType = $scope.currentTab.maptype; //slice(1);
                $scope.data.selfdict.imgSrc = $scope.currentTab.imgSrc;
                $scope.data.selfdict.description = descriptions[$scope.currentTab.maptype];

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
                                return $scope.data.selfdict;
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

            function handlePopupBlocked(completeUrl, nextWindowName, dimensions) {
                console.log('in function handlePopupBlocked');
                alert('in function handlePopupBlocked');
                $scope.showPopupBlockerDialog = true;
                $scope.data.completeUrl = completeUrl;
                $scope.data.nextWindowName = nextWindowName;
                $scope.data.popupDimensions = dimensions;
                $('#PopupBlockerDialog').modal311('show');
            }

            $scope.onNewMapPosition = function (pos) {
                var pos2prt = String.format('onNewMapPosition handler - framework {0}, referrer {1}, at x {2}, y {3}, zoom {4}',
                    pos.maphost, pos.referrerId, pos.lon, pos.lat, pos.zoom),

                    baseUrl = MLConfig.getbaseurl(),
                    completeUrl = baseUrl + pos.maphost + pos.search,
                    nextWindowName = MLConfig.getNextWindowName(),
                    wnd = null;
                console.log(pos2prt);
                console.log("search url :");
                console.log(pos.search);
                console.log('completeUrl');
                console.debug(completeUrl);
                console.log("userId = " + MLConfig.getUserId() + " referrerId = " + MLConfig.getReferrerId() + " pos.referrerId = " + pos.referrerId);
                console.log("is Initial User ? " + MLConfig.getInitialUserStatus());
                console.log("Open new window with name " + nextWindowName);
                $scope.data.blockedUrl = completeUrl;

                // if (pos.referrerId !== MLConfig.getUserId()) {
                if (pos.referrerName !== MLConfig.getUserName()) {
                    completeUrl += "&userName=" + MLConfig.getUserName();
                    wnd = window.open(completeUrl, nextWindowName,
                        MLConfig.getSmallFormDimensions());
                    if (!wnd || wnd === 'undefined') {
                        handlePopupBlocked(completeUrl, nextWindowName,
                            MLConfig.getSmallFormDimensions());
                    }
                    console.log("after call to window.open with initial user status true");
                } else {
                    console.log("userId and referrerId match : do not open window");
                }

            };
            selfMethods.onNewMapPosition = $scope.onNewMapPosition;
        }

        function init(App) {
            console.log('MasherCtrl init');
            App.controller('MasherCtrl', ['$scope', '$location', '$window', '$route', '$templateCache', '$uibModal', MasherCtrl]);

            var $inj = angular.injector(['app']),
                evtSvc = $inj.get('StompEventHandlerService');

            evtSvc.addEvent('client-NewMapPosition', this.onNewMapPosition);

            // App.directive('modalshowpopupblockdlg', function () {
            //     return {
            //         templateUrl : '/Templates/ModalDialogPopupBlocked',
            //
            //         restrict: 'E',
            //         transclude: true,
            //         replace: true,
            //         scope: {
            //             modalVisible: "="
            //         },
            //         link: function postLink(scope, element, attrs) {
            //             // scope.title = attrs.title;
            //             //Hide or show the modal
            //             scope.showModal = function (visible, elem) {
            //                 if (!elem) {
            //                     elem = element;
            //                 }
            //                 if (visible) {
            //                     $(elem).modal311("show");
            //                 } else {
            //                     $(elem).modal311("hide");
            //                 }
            //             };
            //
            //             if (!attrs.modalVisible) {
            //                 //The attribute isn't defined, show the modal by default
            //                 scope.showModal(true);
            //
            //             } else {
            //                 scope.$watch(attrs.visible, function (value) {
            //                     if (value === true) {
            //                         $(element).modal311('show');
            //                     } else {
            //                         $(element).modal311('hide');
            //                     }
            //                 });
            //                 scope.$watch('scope.$parent.showPopupBlockerDialog', function (newValue, oldValue) {
            //                     console.log("scope.$watch newValue : " + newValue);
            //                     console.log("scope.$watch 'scope.$parent.showPopupBlockerDialog' : " + scope.$parent.showPopupBlockerDialog);
            //                     // scope.showModal(newValue);
            //                     //attrs.modalVisible = false;
            //                 });
            //
            //                 //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
            //                 $(element).on('hidden.bs.modal', function () {
            //                     scope.$apply(function () {
            //                         scope.$parent[attrs.visible] = false;
            //                     });
            //                 });
            //                 $(element).on('hidden.bs.modal', function () {
            //                     scope.$apply(function () {
            //                         scope.$parent[attrs.visible] = true;
            //                     });
            //                 });
            //                 $(element).on('loaded.bs.modal', function () {
            //                     alert('Modal is successfully loaded!');
            //                 });
            //             }
            //         }
            //     };
            // });

            return MasherCtrl;
        }
        function startMapSystem() {
            var startupView = MLConfig.getStartupView();
            console.log("startMapSystem");
            isFirstViewing = false;

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
