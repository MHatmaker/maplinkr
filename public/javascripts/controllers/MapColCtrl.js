/*global define */
/*global console */

(function () {
    "use strict";

    console.log('MapColCtrl setup');
    define([
        'angular',
        'controllers/MapLinkrMgrCtrl'
    ], function (angular, MapLinkrMgrCtrl) {
        console.log('MapColCtrl define');

        function MapColCtrl($scope) {
            console.log("in MapColCtrl");
        }

        function init(App) {
            console.log('MapColCtrl init');
            App.controller('MapColCtrl',  ['$scope', MapColCtrl]);

            return MapColCtrl;
        }

        return { start: init};
    });

// }());
}).call(this);
