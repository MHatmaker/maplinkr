/*global define */

(function () {
    "use strict";

    console.log('LocateSelfCtrl setup');
    define([
        'angular',
        'lib/utils'
    ], function (angular, utils) {
        console.log('LocateSelfCtrl define');
        var
            map = null,
            goooogle = null;

        function LocateSelfCtrl($scope) {
            console.log("in LocateSelfCtrl");

            $scope.geoLocate = function () {
                var infoWindow = new goooogle.maps.InfoWindow({map: map});

                function formatCoords (pos) {
                    var fixed = utils.toFixed(pos.lng, pos.lat, 5),
                        formatted  = '<div style="color: blue;">' + fixed.lon + ', ' + fixed.lat + '</div>';
                    return formatted;
                }

                function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                    infoWindow.setPosition(pos);
                    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        infoWindow.setPosition(pos);
                        infoWindow.setContent(formatCoords(pos));
                        map.setCenter(pos);
                        map.setZoom(14);
                    },
                        function () {
                            handleLocationError(true, infoWindow, map.getCenter());
                        });
                } else {
                  // Browser doesn't support Geolocation
                    handleLocationError(false, infoWindow, map.getCenter());
                }

            };
        }

        function setMap(googl, mp) {
            goooogle = googl;
            map = mp;
        }

        function init(App) {
            console.log('LocateSelfCtrl init');

            App.controller('LocateSelfCtrl',  ['$scope', LocateSelfCtrl]);

            return LocateSelfCtrl;
        }

        return {
            start: init,
            setMap : setMap
        };


    });

}());
