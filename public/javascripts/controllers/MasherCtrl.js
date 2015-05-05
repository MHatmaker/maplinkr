/*global define */

(function () {
    "use strict";
    var isFirstViewing = true;

    console.log('MasherCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig', 'controllers/WebSiteDescriptionCtrl', 'lib/utils'], function (angular,  AgoNewWindowConfig, WebSiteDescriptionCtrl, utils) {
        console.log('MasherCtrl define');
        var selfMethods = {},
            descriptions = {
                'leaflet': 'A selection of coffee shops that were retrieved from a query to a geographic information lookup service, using open source maps and data, displayed on a Leaflet Map.  Alternatively, this could be the web site for a single organization where one of the web site pages contains a Leaflet map of its multiple locations.',
                'google' : 'A selection of restaurants that were retrieved from a query to a geographic information lookup service, such as Google, displayed on a Google Map using an Open Street Map base layer.  Alternatively, this could be the web site for a single organization where one of the web site pages contains a Google map of its multiple locations.',
                'arcgis' : 'A typical Web Map from the ArcGIS Online user contributed database.  The intially displayed map is chosen to provide a working environment for this demo.'
            };

        function MasherCtrl($scope, $location, $route, $routeParams, $window) {
            console.debug('MasherCtrl - initialize collapsed bool');

            var startupView = AgoNewWindowConfig.getStartupView();
            $scope.ExpandSum = startupView.summary === true ? "Collapse" : "Expand";
            $scope.MasterSiteVis = startupView.Website ? "inline" : 'none';
            $scope.isCollapsed = !startupView.summary;
            $scope.showPopupBlockerDialog = false;
            $scope.data = {
                'blockedUrl': 'place holder',
                'completeUrl': 'completeslashdoturl',
                'nextWindowName': 'InitialWindowName',
                'popupDimensions': 'popdimensions'
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
            console.log("init with isCollapsed = " + $scope.isCollapsed);
            $scope.showDescriptionDialog = false;

            $scope.$on('$viewContentLoaded', function () {
                if (isFirstViewing === false) {
                    if (startupView.summary === true) {
                        $scope.summmaryCollapser();
                    }
                } else {
                    isFirstViewing = false;
                }
            });

            $scope.summmaryCollapser = function () {
                $scope.MasterSiteVis = $scope.ExpandSum === "Expand" ? "inline" : "none";
                $scope.ExpandSum = $scope.ExpandSum === "Expand" ? "Collapse" : "Expand";

                console.log("MasherCtrl isCollapsed before broadcast " + $scope.isCollapsed);
                $scope.$broadcast('CollapseSummaryEvent', {'mastersitevis' : $scope.MasterSiteVis});
                $scope.isCollapsed = !$scope.isCollapsed;
                console.log("MasherCtrl isCollapsed after broadcast " + $scope.isCollapsed);
            };
            selfMethods.summmaryCollapser = $scope.summmaryCollapser;


            console.debug(selfMethods);

            $scope.windowResized = function () {
                $scope.$broadcast('windowResized');
            };
            selfMethods.windowResized = $scope.windowResized;

            $scope.showMeTheMapClicked = function () {
                console.log("currentTab - url reset to " + $scope.currentTab.url);
                console.debug($location);
                $location.path($scope.currentTab.url);
                // $scope.summmaryCollapser();
            };

            $scope.describeTheWebsiteClicked = function () {
                console.log("Describe the website for currentTab " + $scope.currentTab.title);
                WebSiteDescriptionCtrl.setDescription(descriptions[$scope.currentTab.maptype], $scope.currentTab.imgSrc);
                $scope.showDescriptionDialog = true;
                // $scope.$broadcast('ShowWebSiteDescriptionModalEvent');
            };

            $scope.$on('WebSiteDescriptionEvent', function () {
                console.log("WebSiteDescriptionEvent received, currentTab - url reset to " + $scope.currentTab.url);
                console.debug($location);
                // var showElem = document.getElementById('showMeTheMap'),
                //     showElemA = angular.element(showElem),
                //     showElem0 = showElemA[0];

                //showElem0.click();
                $scope.catchClick();  // for testing dialog without an actual popup block event

            });

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

                    baseUrl = AgoNewWindowConfig.getbaseurl(),
                    completeUrl = baseUrl + pos.maphost + pos.search,
                    nextWindowName = AgoNewWindowConfig.getNextWindowName(),
                    wnd = null;
                console.log(pos2prt);
                console.log("search url :");
                console.log(pos.search);
                console.log('completeUrl');
                console.debug(completeUrl);
                console.log("userId = " + AgoNewWindowConfig.getUserId() + " referrerId = " + AgoNewWindowConfig.getReferrerId() + " pos.referrerId = " + pos.referrerId);
                console.log("is Initial User ? " + AgoNewWindowConfig.getInitialUserStatus());
                console.log("Open new window with name " + nextWindowName);
                $scope.data.blockedUrl = completeUrl;

                if (pos.referrerId !== AgoNewWindowConfig.getUserId()) {
                    wnd = window.open(completeUrl, nextWindowName,
                        AgoNewWindowConfig.getSmallFormDimensions());
                    if (!wnd || wnd === 'undefined') {
                        handlePopupBlocked(completeUrl, nextWindowName,
                            AgoNewWindowConfig.getSmallFormDimensions());
                    }
                    console.log("after call to window.open with initial user status true");
                } else {
                    console.log("userId and referrerId match : do not open window");
                }

            };
            selfMethods.onNewMapPosition = $scope.onNewMapPosition;
        }

        // MasherCtrl.prototype.windowResized = function () {
        //     selfMethods.windowResized();
        // }

        function init(App) {
            console.log('MasherCtrl init');
            App.controller('MasherCtrl', ['$scope', '$location', MasherCtrl]);

            //calling tellAngular on resize event
            window.onresize = selfMethods.windowResized;  // MasherCtrl.prototype.windowResized;

            var $inj = angular.injector(['app']),
                evtSvc = $inj.get('StompEventHandlerService');

            evtSvc.addEvent('client-NewMapPosition', this.onNewMapPosition);

            App.directive('modalshowpopupblockdlg', function () {
                return {
                    templateUrl : '/Templates/ModalDialogPopupBlocked',

                    restrict: 'E',
                    transclude: true,
                    replace: true,
                    scope: {
                        modalVisible: "="
                    },
                    link: function postLink(scope, element, attrs) {
                        // scope.title = attrs.title;
                        //Hide or show the modal
                        scope.showModal = function (visible, elem) {
                            if (!elem) {
                                elem = element;
                            }
                            if (visible) {
                                $(elem).modal311("show");
                            } else {
                                $(elem).modal311("hide");
                            }
                        };

                        if (!attrs.modalVisible) {
                            //The attribute isn't defined, show the modal by default
                            scope.showModal(true);

                        } else {
                            scope.$watch(attrs.visible, function (value) {
                                if (value === true) {
                                    $(element).modal311('show');
                                } else {
                                    $(element).modal311('hide');
                                }
                            });
                            scope.$watch('scope.$parent.showPopupBlockerDialog', function (newValue, oldValue) {
                                console.log("scope.$watch newValue : " + newValue);
                                console.log("scope.$watch 'scope.$parent.showPopupBlockerDialog' : " + scope.$parent.showPopupBlockerDialog);
                                // scope.showModal(newValue);
                                //attrs.modalVisible = false;
                            });

                            //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                            $(element).on('hidden.bs.modal', function () {
                                scope.$apply(function () {
                                    scope.$parent[attrs.visible] = false;
                                });
                            });
                            $(element).on('hidden.bs.modal', function () {
                                scope.$apply(function () {
                                    scope.$parent[attrs.visible] = true;
                                });
                            });
                            $(element).on('loaded.bs.modal', function () {
                                alert('Modal is successfully loaded!');
                            });
                        }
                    }
                };
            });

            return MasherCtrl;
        }
        function startMapSystem() {
            var startupView = AgoNewWindowConfig.getStartupView();
            console.log("startMapSystem");
            isFirstViewing = false;

            if (startupView.summary === true) {
                selfMethods.summmaryCollapser();
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
