/*global define */

(function () {
    "use strict";

    console.log('DestWndSetupCtrl setup');
    var areWeInitialized = false,
        selfdict = {
            isInitialized : false
        };
    define([
        'angular'
    ], function (angular) {
        console.log('DestWndSetupCtrl define');

        selfdict.isInitialized = areWeInitialized = false;

        function DestWndSetupCtrl($scope, $uibModalInstance, data) {
            console.log("in DestWndSetupCtrl");
            selfdict.scope = $scope;
            selfdict.isInitialized = areWeInitialized = false;

            // selfdict.callbackFunction = null;
            $scope.showDestDialog = false;
            $scope.choiceCallback = null;
            $scope.destSelections = ["Same Window", "New Tab", "New Pop-up Window"];
            $scope.data = {
                dstSel : $scope.destSelections[0].slice(0),
                prevDstSel : $scope.destSelections[0].slice(0),
                title : data.title,
                icon : data.icon,
                snippet : data.snippet,
                showDetail : '+'
            };

            $scope.preserveState = function () {
                console.log("preserveState");
                $scope.data.prevDstSel = $scope.data.dstSel.slice(0);
                console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.dstSel);
            };

            $scope.restoreState = function () {
                console.log("restoreState");
                console.log("restore " + $scope.data.dstSel + " from " + $scope.data.prevDstSel);
                $scope.data.dstSel = $scope.data.prevDstSel.slice(0);
            };

            $scope.accept = function () {
                console.log("onAcceptDestination " + $scope.data.dstSel);
                $uibModalInstance.close($scope.data.dstSel);
            };

            //     var callback = $scope.choiceCallback;
            //     if ($scope.choiceCallback) {
            //         $scope.choiceCallback = null;
            //         callback($scope.data.dstSel);
            //     } else {
            //         scopeDict.rootScope.$broadcast('DestinationSelectorEvent', { destWnd: $scope.data.dstSel });
            //     }

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.hitEnter = function (evt) {
                if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.name, null) || angular.equals($scope.name, ''))) {
                    $scope.save();
                }
            }; // end hitEnter
        }

        DestWndSetupCtrl.prototype.isInitialized = function () {
            return areWeInitialized;
        };


        function init(App) {
            console.log('DestWndSetupCtrl init');

            selfdict.isInitialized = areWeInitialized = true;
            App.controller('DestWndSetupCtrl',  ['$scope', '$uibModalInstance', 'data', DestWndSetupCtrl]);

            // scope.$on('ShowWindowSelectorModalEvent', function (event, args) {
            //     var title = args.title,
            //         icon = args.thumbnail,
            //         snippet = args.snippet;
            //     localScope.$parent.data.title = title;
            //     localScope.$parent.data.icon = icon;
            //     localScope.$parent.data.snippet = snippet;
            //     localScope.$parent.safeApply(function () {
            //         localScope.status.detailsOpen = localScope.status.destChoicesOpen = false;
            //     });
            //     // localScope.status.detailsOpen = localScope.status.destChoicesOpen = false;
            //     console.log('local scope.$on received title : ' + title);
            //
            //     localScope.$parent.safeApply(function () {
            //         localScope.$parent.showDestDialog = true;
            //     });
            // });

            //Check to see if the modal-visible attribute exists
            // if (!attrs.modalVisible) {
            //     //The attribute isn't defined, show the modal by default
            //     scope.showModal(true);
            // } else {
            //     //Watch for changes to the modal-visible attribute
            //     scope.$watch("modalVisible", function (newValue, oldValue) {
            //         scope.showModal(newValue);
            //         console.log("watch modalVisible  : ");
            //         console.debug(scope.$parent.data);
            //         // scope.$parent.preserveState();
            //     });
            //     //Watch for changes to the modal-mdata attribute
            //     scope.$watch("modalMdata", function (newValue, oldValue) {
            //         if (!angular.isUndefinedOrNull(newValue)) {
            //             localScope.$parent.data = newValue;
            //         }
            //         console.log("watch modalMdata scope.$parent data  : ");
            //         console.debug(localScope.$parent.data);
            //     });
            //     //Watch for changes to the modal-mdata attribute
            //     scope.$watch("data.dstSel", function (newValue, oldValue) {
            //         if (!angular.isUndefinedOrNull(newValue)) {
            //             localScope.$parent.data.dstSel = newValue;
            //         }
            //         console.log("watch modalMdata scope.$parent data  : ");
            //         console.debug(localScope.$parent.data);
            //     });
            //
            // };

            return DestWndSetupCtrl;
        }

        return {
            start: init,
            isInitialized : DestWndSetupCtrl.prototype.isInitialized
        };
    });

}());
