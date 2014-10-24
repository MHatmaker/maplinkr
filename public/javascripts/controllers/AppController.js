
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
        'controllers/StompSetupCtrl',
        'controllers/EmailCtrl',
        'lib/GeoCoder'
        ], 
    function(angular, MasherCtrl, TabsCtrl, PositionViewCtrl, MapCtrl, VerbageCtrl, SPACtrl,
            SearcherCtrlGrp, SearcherCtrlMap, StompSetupCtrl, EmailCtrl, GeoCoder) {
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
            if(StompSetupCtrl.isInitialized() == false){
                StompSetupCtrl.start(App);
            }
            EmailCtrl.start(App);
            var $inj = angular.injector(['app']);
            var $http = $inj.get('$http');
            GeoCoder.start(App, $http);
            return AppController;
        }

        return { start: init };

    });

}).call(this);