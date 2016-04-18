/*global define */

(function () {
    "use strict";

    console.log('TopRowCtrl setup');
    define([
        'angular'
    ], function (angular) {
        console.log('TopRowCtrl define');

        function TopRowCtrl($scope) {
            console.log("in TopRowCtrl");

            $scope.data = {
                expanded : true
            };
        }

        function init(App) {
            console.log('TopRowCtrl init');
            console.debug(App);
            var ctrl = App.controller('TopRowCtrl',  ['$scope', TopRowCtrl]);
            console.debug(ctrl);

            return TopRowCtrl;
        }

        return { start: init};
    });

}());
