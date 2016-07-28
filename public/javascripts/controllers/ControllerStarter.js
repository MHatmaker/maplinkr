
/*global define */

(function () {
    "use strict";

    console.log('ControllerStarter setup');
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
        'controllers/MapLinkrMgrCtrl',
        'controllers/WebSiteDescriptionCtrl',
        'controllers/SearcherCtrlGrp',
        'controllers/SearcherCtrlMap',
        'controllers/PusherSetupCtrl',
        'controllers/PusherCtrl',
        'controllers/DestWndSetupCtrl',
        'controllers/TransmitNewUrlCtrl',
        'controllers/ShareCtrl',
        'controllers/PopupBlockerCtrl',
        'controllers/CarouselCtrl',
        // 'controllers/GoogleSearchDirective',
        'lib/GeoCoder',
        'javascripts/lib/MLConfig'
    ],
        function (angular, MasherCtrl, TabsCtrl, SPACtrl, TopRowCtrl, LeftColCtrl, MapColCtrl, RightColCtrl,
            PositionViewCtrl, MapCtrl, MapLinkrPluginCtrl, MapLinkrMgrCtrl, WebSiteDescriptionCtrl,
            SearcherCtrlGrp, SearcherCtrlMap, PusherSetupCtrl, PusherCtrl, DestWndSetupCtrl,
            TransmitNewUrlCtrl, ShareCtrl, PopupBlockerCtrl, CarouselCtrl, GeoCoder, MLConfig) {
            console.log('ControllerStarter define');

            function ControllerStarter($scope) {
                console.log("ControllerStarter empty block");
            }

            function getUserName($http, opts) {
                $http({method: 'GET', url: '/username'}).
                    success(function (data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available.
                        console.log('ControllerStarter getUserName: ', data.name);
                        // MLConfig.setUserId(data.id );
                        if (opts.uname) {
                            MLConfig.setUserName(data.name);
                        }
                        // alert('got user name ' + data.name);
                        if (opts.uid) {
                            MLConfig.setUserId(data.id);
                        }
                        if (opts.refId === -99) {
                            MLConfig.setReferrerId(data.id);
                        }
                    }).
                    error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        console.log('Oops and error', data);
                        alert('Oops' + data.name);
                    });
            }

            function init(App, portalForSearch) {
                console.log('ControllerStarter init');
                var $inj = angular.injector(['app']),
                    $http = $inj.get('$http'),
                    referrerId = MLConfig.getReferrerId(),
                    urlUserName;

                console.log("Check if referrerId is -99");
                if (referrerId === -99) {
                    getUserName($http, {uname : true, uid : true, refId : referrerId === -99});
                } else {
                    urlUserName = MLConfig.getUserNameFromUrl();
                    // MLConfig.getReferrerIdFromUrl();
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
                MapLinkrMgrCtrl.start(App);
                // MapCtrl.start(App);

                SearcherCtrlGrp.start(App, portalForSearch);
                SearcherCtrlMap.start(App, portalForSearch);
                if (PusherSetupCtrl.isInitialized() === false) {
                    PusherSetupCtrl.start(App);
                    PusherCtrl.start(App);
                }
                if (DestWndSetupCtrl.isInitialized() === false) {
                    DestWndSetupCtrl.start(App);
                }
                TransmitNewUrlCtrl.start(App);
                ShareCtrl.start(App);
                PopupBlockerCtrl.start(App);
                CarouselCtrl.start(App);
                // GoogleSearchDirective.start(App);
                // LinkerDisplayDirective.start(App);

                MapCtrl.start(App);
                GeoCoder.start(App, $http);


                return ControllerStarter;
            }

            return { start: init };

        });

}());
// }).call(this);
