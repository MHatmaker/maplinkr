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
                .register("screen and (max-width:50em)", function () {
                    console.log("handler 1 matched");
                    $scope.videoHeight = '300px';
                })
                .register("screen and (max-width:30em)", function () {
                    console.log("handler 2 matched");
                    $scope.videoHeight = '180px';
                });

        }

        function init(App) {
            console.log('CarouselCtrl init');
            App.controller('CarouselCtrl', ['$scope', CarouselCtrl]);
        }
        return {start: init};

    });
}());
