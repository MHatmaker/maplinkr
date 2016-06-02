/*global define */

(function () {
    "use strict";

    console.log('DestWndSetupCtrl setup');
    var areWeInitialized = false;
    define([
        'angular'
    ], function (angular) {
        console.log('DestWndSetupCtrl define');

        areWeInitialized = false;

        function DestWndSetupCtrl($scope, $uibModalInstance, data) {
            console.log("in DestWndSetupCtrl");
            areWeInitialized = false;
            $scope.destSelections = data.destSelections;
            $scope.data = {
                dstSel : data.dstSel || $scope.destSelections[0],
                title : data.title,
                icon : data.icon,
                snippet : data.snippet,
                mapType : data.mapType
            };
            $scope.status = {
                'detailsOpen' : false,
                'destChoicesOpen' : false
            };

            $scope.accept = function () {
                console.log("DestWndSetupCtrl.accept handler - onAcceptDestination " + $scope.data.dstSel);
                $uibModalInstance.close($scope.data);
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.close = function () {
                $uibModalInstance.close();
            }

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

            areWeInitialized = true;
            App.controller('DestWndSetupCtrl',  ['$scope', '$uibModalInstance', 'data', DestWndSetupCtrl]);

            return DestWndSetupCtrl;
        }

        return {
            start: init,
            isInitialized : DestWndSetupCtrl.prototype.isInitialized
        };
    });

}());
