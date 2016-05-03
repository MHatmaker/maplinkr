/*global require*/
/*global define*/

(function () {
    "use strict";
    console.log("ready to require stuff in WindowStarter");
    require(["lib/utils", 'angular']);

    define([
        'angular',
        'lib/utils',
        'lib/AgoNewWindowConfig'
    ], function (angular, utils, AgoNewWindowConfig) {

        var
            setupNewDisplay = function (channel, userName, wndIndex, destWnd, curmph, newSelectedWebMapId) {

                var
                    wndName = newSelectedWebMapId + wndIndex,
                    // tmpWndName = '',
                    baseUrl,
                    displayBnds,

                    url = "?id=" + wndName + curmph.getGlobalsForUrl() +
                    "&channel=" + channel + "&userName=" + userName +
                    "&maphost=GoogleMap" + "&referrerId=" + AgoNewWindowConfig.getUserId(),
                    gmQuery = AgoNewWindowConfig.getQuery();
                if (gmQuery !== '') {
                    url += "&gmquery=" + gmQuery;
                    displayBnds = AgoNewWindowConfig.getBoundsForUrl();
                    url += displayBnds;
                }
                console.log("open new Google window with URI " + url);
                console.log("using channel " + channel + "with userName " + userName);
                AgoNewWindowConfig.setUrl(url);
                AgoNewWindowConfig.setUserName(userName);
                if (destWnd === "New Pop-up Window") {
                    baseUrl = AgoNewWindowConfig.getbaseurl();
                    /*tmpWndName = */
                    window.open(baseUrl + "/google/" + url,  wndName, AgoNewWindowConfig.getSmallFormDimensions());
                    // popups.push(tmpWndName);
                } else {
                    if (destWnd === "New Tab") {
                        baseUrl = AgoNewWindowConfig.getbaseurl();
                        window.open(baseUrl + "google/" + url, '_blank');
                        window.focus();
                    }
                }
            },

            openNewDisplay = function (channel, userName, destWnd, curmph, newSelectedWebMapId) {
                // wndIndex += 1;
                var $inj = angular.injector(['app']),
                    $http = $inj.get('$http');

                $http({method: 'GET', url: '/wndseqno'}).
                    success(function (data, status, headers, config) {
                        setupNewDisplay(channel, userName, data.wndNameSeqNo, destWnd, curmph, newSelectedWebMapId);
                    }).
                    error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        console.log('Oops and error', data);
                        alert('Oops getting next window sequence number ' + data.wndseqno);
                    });
            };

        function init() {
            return {openNewDisplay : openNewDisplay};
        }
        return {
            start: init,
            openNewDisplay : openNewDisplay,
            setupNewDisplay : setupNewDisplay
        };
    });

}());
