
(function() {
    "use strict";

    console.log('AppController setup');
    define([
        'angular',
        'controllers/MasherCtrl',
        'controllers/TabsCtrl',
        'controllers/PositionViewCtrl',
        'controllers/MapCtrl',
        'controllers/VerbageCtrl',
        'controllers/SPACtrl',
        'controllers/SearcherCtrlGrp',
        'controllers/SearcherCtrlMap',
        'controllers/StompSetupCtrl'
        ], 
    function(angular, MasherCtrl, TabsCtrl, PositionViewCtrl, MapCtrl, VerbageCtrl, SPACtrl,
            SearcherCtrlGrp, SearcherCtrlMap, StompSetupCtrl) {
        console.log('AppController define');

        function AppController($scope) {}
            
        function init(App) {
            console.log('AppController init');
            MasherCtrl.start(App);
            TabsCtrl.start(App);
            PositionViewCtrl.start(App);
            MapCtrl.start(App);
            SPACtrl.start(App);
            VerbageCtrl.start(App);
            SearcherCtrlGrp.start(App);
            SearcherCtrlMap.start(App);
            StompSetupCtrl.start(App);
            return AppController;
        }

        return { start: init };

    });

}).call(this);