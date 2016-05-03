
/*global define */

(function () {
    "use strict";

    console.log('AppController setup');
    define([
        'angular',
        'controllers/MasherCtrl',
        'controllers/TabsCtrl',
        'controllers/SPACtrl',
        'controllers/TopRowCtrl',
        'controllers/LeftColCtrl',
        'controllers/MapColCtrl',
        'controllers/RightColCtrl',
        'controllers/PositionViewCtrl',
        'controllers/MapCtrl',
        'controllers/MapLinkrPluginCtrl',
        'controllers/VerbageCtrl',
        'controllers/WebSiteDescriptionCtrl',
        'controllers/SearcherCtrlGrp',
        'controllers/SearcherCtrlMap',
        'controllers/StompSetupCtrl',
        'controllers/PusherCtrl',
        'controllers/DestWndSetupCtrl',
        'controllers/TransmitNewUrlCtrl',
        'controllers/EmailCtrl',
        'controllers/GoogleSearchDirective',
        'lib/GeoCoder',
        'javascripts/lib/AgoNewWindowConfig'
    ],
        function (angular, MasherCtrl, TabsCtrl, SPACtrl, TopRowCtrl, LeftColCtrl, MapColCtrl, RightColCtrl,
            PositionViewCtrl, MapCtrl, MapLinkrPluginCtrl, VerbageCtrl, WebSiteDescriptionCtrl,
            SearcherCtrlGrp, SearcherCtrlMap, StompSetupCtrl, PusherCtrl, DestWndSetupCtrl, TransmitNewUrlCtrl, EmailCtrl, GoogleSearchDirective, GeoCoder, AgoNewWindowConfig) {
            console.log('AppController define');

            function AppController($scope) {
                console.log("AppController empty block");
            }

            function getUserName($http, opts) {
                $http({method: 'GET', url: '/username'}).
                    success(function (data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available.
                        console.log('AppController getUserName: ', data.name);
                        // AgoNewWindowConfig.setUserId(data.id );
                        if (opts.uname) {
                            AgoNewWindowConfig.setUserName(data.name);
                        }
                        // alert('got user name ' + data.name);
                        if (opts.uid) {
                            AgoNewWindowConfig.setUserId(data.id);
                        }
                        if (opts.refId === -99) {
                            AgoNewWindowConfig.setReferrerId(data.id);
                        }
                    }).
                    error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        console.log('Oops and error', data);
                        alert('Oops' + data.name);
                    });
            }
/*
            function getUserId($http) {
                $http({method: 'GET', url: '/userid'}).
                    success(function (data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available.
                        console.log('userid: ', data.id);
                        AgoNewWindowConfig.setUserId(data.id);
                        var refId = AgoNewWindowConfig.getReferrerId();
                        if (refId === -99) {
                            AgoNewWindowConfig.setReferrerId(data.id);
                        }
                    }).
                    error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        console.log('Oops and error', data);
                        alert('Oops' + data.name);
                    });
            }
*/
            function init(App, portalForSearch) {
                console.log('AppController init');
                var $inj = angular.injector(['app']),
                    $http = $inj.get('$http'),
                    referrerId = AgoNewWindowConfig.getReferrerId(),
                    urlUserName;

                console.log("Check if referrerId is -99");
                if (referrerId === -99) {
                    getUserName($http, {uname : true, uid : true, refId : referrerId === -99});
                } else {
                    urlUserName = AgoNewWindowConfig.getUserNameFromUrl();
                    // AgoNewWindowConfig.getReferrerIdFromUrl();
                    if (urlUserName) {
                        getUserName($http, {uname : false, uid : true, refId : referrerId === -99});
                    } else {
                        getUserName($http, {uname : true, uid : true, refId : referrerId === -99});
                    }

                }
                WebSiteDescriptionCtrl.start(App);
                MasherCtrl.start(App);
                TabsCtrl.start(App);
                SPACtrl.start(App);
                TopRowCtrl.start(App);
                LeftColCtrl.start(App);
                MapColCtrl.start(App);
                RightColCtrl.start(App);
                PositionViewCtrl.start(App);
                MapLinkrPluginCtrl.start(App);
                // MapCtrl.start(App);

                VerbageCtrl.start(App);
                SearcherCtrlGrp.start(App, portalForSearch);
                SearcherCtrlMap.start(App, portalForSearch);
                if (StompSetupCtrl.isInitialized() === false) {
                    StompSetupCtrl.start(App);
                    PusherCtrl.start(App);
                }
                if (DestWndSetupCtrl.isInitialized() === false) {
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

}());
// }).call(this);
