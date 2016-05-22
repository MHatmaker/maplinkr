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
            console.debug(App);
            var ctrl = App.controller('LeftColCtrl',  ['$scope', LeftColCtrl]);
            console.debug(ctrl);

            return LeftColCtrl;
        }

        return { start: init};
    });

}());
