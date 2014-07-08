
(function() {
    "use strict";

    console.log('AppController setup');
    define([
        'angular',
        'controllers/MasherCtrl',
        'controllers/TabsCtrl',
        'controllers/MapCtrl',
        'controllers/VerbageCtrl'
        ], 
    function(angular, MasherCtrl, TabsCtrl, MapCtrl, VerbageCtrl) {
        console.log('AppController define');

        function AppController($scope) {}
            
        function init(App) {
            console.log('AppController init');
            MasherCtrl.start(App);
            TabsCtrl.start(App);
            MapCtrl.start(App);
            VerbageCtrl.start(App);
            return AppController;
        }

        return { start: init };

    });

}).call(this);