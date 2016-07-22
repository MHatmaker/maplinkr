/*global define */

(function () {
    "use strict";

    console.log('LeftColCtrl setup');
    define([
        'angular'
    ], function (angular) {
        console.log('LeftColCtrl define');

        function LeftColCtrl($scope) {
            console.log("in LeftColCtrl");

            $scope.data = {
                expanded : true
            };
        }

        function init(App) {
            console.log('LeftColCtrl init');

            App.controller('LeftColCtrl',  ['$scope', LeftColCtrl]);

            return LeftColCtrl;
        }

        return { start: init};
    });

}());
