
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
        'controllers/WebSiteDescriptionCtrl',
        'controllers/SPACtrl',
        'controllers/SearcherCtrlGrp',
        'controllers/SearcherCtrlMap',
        'controllers/StompSetupCtrl',
        'controllers/DestWndSetupCtrl',
        'controllers/TransmitNewUrlCtrl',
        'controllers/EmailCtrl',
        'lib/GeoCoder'
        ], 
    function(angular, MasherCtrl, TabsCtrl, PositionViewCtrl, MapCtrl, VerbageCtrl, WebSiteDescriptionCtrl, SPACtrl,
            SearcherCtrlGrp, SearcherCtrlMap, StompSetupCtrl, DestWndSetupCtrl, TransmitNewUrlCtrl, EmailCtrl, GeoCoder) {
        console.log('AppController define');

        function AppController($scope) {}
            
        function init(App) {
            console.log('AppController init');
            WebSiteDescriptionCtrl.start(App);
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
            if(DestWndSetupCtrl.isInitialized() == false){
                DestWndSetupCtrl.start(App);
            }
            TransmitNewUrlCtrl.start(App);
            EmailCtrl.start(App);
            var $inj = angular.injector(['app']);
            var $http = $inj.get('$http');
            GeoCoder.start(App, $http);
            return AppController;
        }

        return { start: init };

    });

}).call(this);