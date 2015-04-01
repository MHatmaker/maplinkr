
(function() {
    "use strict";

    console.log('AppController setup');
    define([
        'angular',
        'controllers/MasherCtrl',
        'controllers/TabsCtrl',
        'controllers/SPACtrl',
        'controllers/PositionViewCtrl',
        'controllers/MapCtrl',
        'controllers/VerbageCtrl',
        'controllers/WebSiteDescriptionCtrl',
        'controllers/SearcherCtrlGrp',
        'controllers/SearcherCtrlMap',
        'controllers/StompSetupCtrl',
        'controllers/DestWndSetupCtrl',
        'controllers/TransmitNewUrlCtrl',
        'controllers/EmailCtrl',
        'controllers/GoogleSearchDirective',
        'lib/GeoCoder',
        'javascripts/lib/AgoNewWindowConfig'
        ],
    function(angular, MasherCtrl, TabsCtrl, SPACtrl, PositionViewCtrl, MapCtrl, VerbageCtrl,
            WebSiteDescriptionCtrl,
            SearcherCtrlGrp, SearcherCtrlMap, StompSetupCtrl, DestWndSetupCtrl, TransmitNewUrlCtrl, EmailCtrl, GoogleSearchDirective, GeoCoder, AgoNewWindowConfig) {
        console.log('AppController define');

        function AppController($scope) {}

        function getUserName($http){
            $http({method: 'GET', url: '/username'}).
                success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available.
                console.log('username: ', data.name );
                // AgoNewWindowConfig.setUserId(data.id );
                AgoNewWindowConfig.setUserName(data.name );
                // alert('got user name ' + data.name);
                AgoNewWindowConfig.setUserId(data.id);
                var refId = AgoNewWindowConfig.getReferrerId();
                if(refId == -99){
                    AgoNewWindowConfig.setReferrerId(data.id);
                }
            }).
            error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                console.log('Oops and error', data);
                alert('Oops' + data.name);
            });
        }

        function init(App, portalForSearch) {
            console.log('AppController init');
            var $inj = angular.injector(['app']);
            var $http = $inj.get('$http');
            getUserName($http);
            WebSiteDescriptionCtrl.start(App);
            MasherCtrl.start(App);
            TabsCtrl.start(App);
            SPACtrl.start(App);
            PositionViewCtrl.start(App);
            // MapCtrl.start(App);

            VerbageCtrl.start(App);
            SearcherCtrlGrp.start(App, portalForSearch);
            SearcherCtrlMap.start(App, portalForSearch);
            if(StompSetupCtrl.isInitialized() == false){
                StompSetupCtrl.start(App);
            }
            if(DestWndSetupCtrl.isInitialized() == false){
                DestWndSetupCtrl.start(App);
            }
            TransmitNewUrlCtrl.start(App);
            EmailCtrl.start(App);
            GoogleSearchDirective.start(App);
            // LinkerDisplayDirective.start(App);
            // MapMaximizerDirective.start(App);
            MapCtrl.start(App);
            GeoCoder.start(App, $http);


            return AppController;
        }

        return { start: init };

    });

}).call(this);
