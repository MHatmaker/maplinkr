/*global define */
/*global $uibModal */
/*global $uibModalInstance */
/*global Event */
/*global $modalInstance */
/*jslint es5: true */

(function () {
    "use strict";

    console.log('CarouselCtrl setup');
    define(['angular', 'lib/MLConfig', 'lib/utils', 'lib/enquire'], function (angular, MLConfig, utils, enquire) {
        console.log('CarouselCtrl define');

        function CarouselCtrl($scope) {
            console.debug('CarouselCtrl - initialize collapsed bool');
            $scope.SlideInterval = 5000;
            $scope.noWrapSlides = false;
            $scope.videoHeight = '400px';
            $scope.slides = [];
            $scope.videos = [];

            var url = MLConfig.gethref() + "/stylesheets/images/",
                i;

            $scope.addSlide = function (i) {
                var newWidth = i;
                $scope.slides.push({
                    image: url + "imagefromtext" + newWidth + '.png',
                    pause: "hover",
                    id: i
                });
            };

            for (i = 0; i < 5; i++) {
                $scope.addSlide(i);
            }
            $scope.active = 0;

            $scope.addVideo = function (i, nm) {
                $scope.videos.push({
                    vfile: url + nm,
                    id: i
                });
            };
            for (i = 5; i < 6; i++) {
                $scope.addVideo(i, '3DUnzoomed.mp4');
            }

            setTimeout(function () {
                $scope.$apply();
                var vdo = document.getElementById('vdo');
                vdo.pause();
            }, 1000);

            $scope.$on("SlidePlayPauseEvent", function () {
                $scope.SlideInterval = $scope.SlideInterval === 5000 ? -1 : 5000;
            });

            $scope.$on("VideoPlayPauseEvent", function (evt, args) {
                var vdo = document.getElementById('vdo');
                console.log("VideoPlayPauseEvent");
                console.debug(args);
                if (args.videoPlayPauseStatus === false) {
                    vdo.play();
                    $scope.SlideInterval = -1;
                } else {
                    if (vdo) {
                        vdo.pause();
                    }
                }
            });

            $scope.$watch('active', function (index) {
                if (angular.isNumber(index) && index === 5) {
                    console.log("active slide is now 5");
                    $scope.$parent.disableSlideShowControl(true);
                    $scope.$parent.hideVideoPlayPauseControl(false);
                    $scope.SlideInterval = -1;
                } else {
                    // $scope.$parent.disableSlideShowControl(false);
                    $scope.$parent.hideVideoPlayPauseControl(true);
                    $scope.SlideInterval = 5000;
                }
            });

            enquire
                // smartphones portrait and landscape
                .register("screen and (min-device-width : 320px) and (max-device-width : 480px)", function () {
                    console.log("smartphone dual handler matched");
                    $scope.videoHeight = '380px';
                })
                // iphone 4 landscape
                .register("screen and (min-device-width : 320px) and (max-device-width : 480px) and (orientation : landscape) and (-webkit-min-device-pixel-ratio : 2)", function () {
                    console.log("iphone 4 landscape handler matched");
                    $scope.videoHeight = '200px';
                })
                // iphone 4 portrait
                .register("screen and (min-device-width : 320px) and (max-device-width : 480px) and (orientation : portrait) and (-webkit-min-device-pixel-ratio : 2)", function () {
                    console.log("iphone 4 portrait handler matched");
                    $scope.videoHeight = '220px';
                })
                // iphone 5 landscape
                .register("screen and (min-device-width : 320px) and (max-device-width : 568px) and (orientation : landscape) and (-webkit-min-device-pixel-ratio : 2)", function () {
                    console.log("iphone 5 landsape handler matched");
                    $scope.videoHeight = '200px';
                })
                // iphone 5 portrait
                .register("screen and (min-device-width : 320px) and (max-device-width : 568px) and (orientation : portrait) and (-webkit-min-device-pixel-ratio : 2)", function () {
                    console.log("iphone 5 portrait handler matched");
                    $scope.videoHeight = '190px';
                })
                // iphone 6 landscape
                .register("screen and (min-device-width : 375px) and (max-device-width : 667px) and (orientation : landscape) and (-webkit-min-device-pixel-ratio : 2)", function () {
                    console.log("iphone 6 landsape handler matched");
                    $scope.videoHeight = '250px';
                })
                // iphone 6 portrait`
                .register("screen and (min-device-width : 375px) and (max-device-width : 667px) and (orientation : portrait) and (-webkit-min-device-pixel-ratio : 2)", function () {
                    console.log("iphone 6 portrait handler matched");
                    $scope.videoHeight = '190px';
                });

        }

        function init(App) {
            console.log('CarouselCtrl init');
            App.controller('CarouselCtrl', ['$scope', CarouselCtrl]);
        }
        return {start: init};

    });
}());
