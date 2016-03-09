/*global define */

(function () {
    "use strict";

    console.log('WebSiteDescriptionCtrl setup');
    define([
        'angular'
    ], function (angular) {
        console.log('WebSiteDescriptionCtrl define');

        function WebSiteDescriptionCtrl($scope, $uibModalInstance, data) {
            console.log("in WebSiteDescriptionCtrl");

            // selfdict.callbackFunction = null;
            $scope.data = {
                whichSite : "",
                whichDismiss : "Cancel",
                description : data.description,
                image : data.imgSrc,
                mapType : data.mapType
            };

            $scope.hitEnter = function (evt) {
                if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.name, null) || angular.equals($scope.name, ''))) {
                    $scope.save();
                }
            }; // end hitEnter

            $scope.accept = function () {
                $uibModalInstance.close($scope.data);
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

        }

        function init(App) {
            console.log('WebSiteDescriptionCtrl init');
            console.debug(App);
            App.controller('WebSiteDescriptionCtrl',  ['$scope', '$uibModalInstance', 'data', WebSiteDescriptionCtrl]);

            return WebSiteDescriptionCtrl;
        }

        return { start: init};


    });

}());
