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
            console.debug(App);
            var ctrl = App.controller('RightColCtrl',  ['$scope', RightColCtrl]);
            console.debug(ctrl);

            return RightColCtrl;
        }

        return { start: init};
    });

}());
