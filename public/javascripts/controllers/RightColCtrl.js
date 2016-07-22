/*global define */

(function () {
    "use strict";

    console.log('RightColCtrl setup');
    define([
        'angular'
    ], function (angular) {
        console.log('RightColCtrl define');

        function RightColCtrl($scope) {
            console.log("in RightColCtrl");

            $scope.data = {
                expanded : true
            };
        }

        function init(App) {
            console.log('RightColCtrl init');

            App.controller('RightColCtrl',  ['$scope', RightColCtrl]);

            return RightColCtrl;
        }

        return { start: init};
    });

}());
