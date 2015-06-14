/*global define */

(function () {
    "use strict";

    console.log('DestWndSetupCtrl setup');
    var areWeInitialized = false;
    define([
        'angular'
    ], function (angular) {
        console.log('DestWndSetupCtrl define');

        var selfdict = {},
            scopeDict = {};
        selfdict.isInitialized = areWeInitialized = false;

        function DestWndSetupCtrl($scope, $modal, $rootScope) {
            console.log("in DestWndSetupCtrl");
            selfdict.scope = $scope;
            selfdict.isInitialized = areWeInitialized = false;
            scopeDict.rootScope = $rootScope;

            // selfdict.callbackFunction = null;
            $scope.showDestDialog = false;
            $scope.choiceCallback = null;
            $scope.destSelections = ["Same Window", "New Tab", "New Pop-up Window"];
            $scope.data = {
                dstSel : $scope.destSelections[0].slice(0),
                prevDstSel : $scope.destSelections[0].slice(0),
                whichDismiss : "Cancel",
                dlg2show : "SelectWndDlg",
                title : 'do we have a title?',
                icon : null,
                snippet : 'nothing in snippet',
                showDetail : '+'
            };

            $scope.preserveState = function () {
                console.log("preserveState");
                // $scope.data.whichDismiss = 'Cancel';
                $scope.data.prevDstSel = $scope.data.dstSel.slice(0);
                console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.dstSel);
            };

            $scope.restoreState = function () {
                console.log("restoreState");
                // $scope.data.whichDismiss = 'Accept';
                console.log("restore " + $scope.data.dstSel + " from " + $scope.data.prevDstSel);
                $scope.data.dstSel = $scope.data.prevDstSel.slice(0);
            };

            $scope.showDialog = function (choiceCallback) {
                $scope.choiceCallback = choiceCallback;
                $scope.showDestDialog = true;
            };

            $scope.onAcceptDestination = function () {
                console.log("onAcceptDestination " + $scope.data.dstSel);
                var callback = $scope.choiceCallback;
                if ($scope.choiceCallback) {
                    $scope.choiceCallback = null;
                    callback($scope.data.dstSel);
                } else {
                    scopeDict.rootScope.$broadcast('DestinationSelectorEvent', { destWnd: $scope.data.dstSel });
                }
            };

            $scope.hitEnter = function (evt) {
                if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.name, null) || angular.equals($scope.name, ''))) {
                    $scope.save();
                }
            }; // end hitEnter

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
        }

        DestWndSetupCtrl.prototype.isInitialized = function () {
            return areWeInitialized;
        };

        DestWndSetupCtrl.prototype.showDialog = function (choiceCallback) {
            $scope.$scope.choiceCallback = choiceCallback;
            scope.showDialog($scope.choiceCallback);
        }

        function init(App) {
            console.log('DestWndSetupCtrl init');

            selfdict.isInitialized = areWeInitialized = true;
            App.controller('DestWndSetupCtrl',  ['$scope', '$modal', '$rootScope', DestWndSetupCtrl]);

            App.directive("modalShowDest", function () {
                console.log("setting up directive modalShowDest");
                return {
                    restrict: "A",   /* why doesn't "E" work? */
                     /*
                    It will check the cache for inlined templates and if one is not found
                    it will make an xhr to the url to fetch the template.
                    The url with "/" prefix is relative to the domain, without the "/" prefix
                    it will be relative to the main ("index.html") page or
                    base url (if you use location in the html5 mode).
                    */

                    templateUrl : '/templates/DestSelectDlgGen',   // .jade will be appended
                    // template : '<ng-include src="getContentUrl()"/>',
                    replace : true,
                    transclude: true,
                    scope: {
                        modalVisible: "=",
                        modalMdata: "="
                    },

                    controller: function ($scope) {
                        console.log("setting up directive modalShowDest controller");
                        $scope.getContentUrl = function () {
                            console.log("find file modalShowDest html");
                            return '/templates/DestSelectDlgGen.html';
                        };

                        $scope.status = {
                            'detailsOpen' : false,
                            'destChoicesOpen' : false
                        };
                        /*
                        $scope.onShowDetailsClick = function () {
                            $scope.status.detailsOpen = !$scope.status.detailsOpen;
                            if ($scope.status.detailsOpen && $scope.status.destChoicesOpen) {
                                $scope.status.destChoicesOpen = false;
                            }
                            // $scope.status.destChoicesOpen = !$scope.status.destChoicesOpen;
                        }

                        $scope.onDestChoiceClick = function () {
                            $scope.status.destChoicesOpen = !$scope.status.destChoicesOpen;
                            if ($scope.status.destChoicesOpen && $scope.status.detailsOpen) {
                                $scope.status.detailsOpen = false;
                            }
                            // $scope.status.detailsOpen = !$scope.status.detailsOpen;
                        }
                        */
                    },

                    link: function (scope, element, attrs) {
                        var localScope = scope;
                        //Hide or show the modal
                        scope.showModal = function (visible, elem) {
                            if (!elem) {
                                elem = element;
                            }
                            scope.status.detailsOpen = scope.status.destChoicesOpen = false;
                            scope.$parent.safeApply(function () {
                                scope.status.detailsOpen = scope.status.destChoicesOpen = false;
                            });
                            if (visible) {
                                $(elem).modal311("show");
                            } else {
                                $(elem).modal311("hide");
                            }
                        };

                        scope.$on('ShowWindowSelectorModalEvent', function (event, args) {
                            var title = args.title,
                                icon = args.thumbnail,
                                snippet = args.snippet;
                            localScope.$parent.data.title = title;
                            localScope.$parent.data.icon = icon;
                            localScope.$parent.data.snippet = snippet;
                            localScope.$parent.safeApply(function () {
                                localScope.status.detailsOpen = localScope.status.destChoicesOpen = false;
                            });
                            // localScope.status.detailsOpen = localScope.status.destChoicesOpen = false;
                            console.log('local scope.$on received title : ' + title);

                            localScope.$parent.safeApply(function () {
                                localScope.$parent.showDestDialog = true;
                            });
                        });

                        //Check to see if the modal-visible attribute exists
                        if (!attrs.modalVisible) {
                            //The attribute isn't defined, show the modal by default
                            scope.showModal(true);
                        } else {
                            //Watch for changes to the modal-visible attribute
                            scope.$watch("modalVisible", function (newValue, oldValue) {
                                scope.showModal(newValue);
                                console.log("watch modalVisible  : ");
                                console.debug(scope.$parent.data);
                                // scope.$parent.preserveState();
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("modalMdata", function (newValue, oldValue) {
                                if (!angular.isUndefinedOrNull(newValue)) {
                                    localScope.$parent.data = newValue;
                                }
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("data.dstSel", function (newValue, oldValue) {
                                if (!angular.isUndefinedOrNull(newValue)) {
                                    localScope.$parent.data.dstSel = newValue;
                                }
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });

                            scope.$watch('scope.$parent.showDestDialog', function (newValue, oldValue) {
                                console.log("scope.$watch newValue : " + newValue);
                                console.log("scope.$watch 'scope.$parent.showDestDialog' : " + scope.$parent.showDestDialog);
                                scope.showModal(newValue);
                                //attrs.modalVisible = false;
                            });


                        }
                        //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                        $(element).on('hidden.bs.modal', function () {
                            scope.modalVisible = localScope.$parent.showDestDialog = localScope.showDestDialog =false;
                            scope.status.detailsOpen = scope.status.destChoicesOpen = false;
                            console.log("hide event called");
                            if (!scope.$$phase && !scope.$root.$$phase) {
                                scope.$apply();
                            }
                            scope.$apply();
                            console.log("hidden modalMdata : ");
                            console.debug(scope.$parent.data);
                            console.log("whichDismiss : " + scope.$parent.data.whichDismiss);
                            if (scope.$parent.data.whichDismiss === "Accept") {
                                scope.$parent.onAcceptDestination();
                            }
                        });
                    }

                };
            });

            return DestWndSetupCtrl;
        }

        return {
            start: init,
            showDialog : DestWndSetupCtrl.prototype.showDialog,
            isInitialized : DestWndSetupCtrl.prototype.isInitialized
        };

    });
}());
