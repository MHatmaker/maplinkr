/*global define */
/*global $uibModal */
/*global $uibModalInstance */
/*global Event */
/*global $modalInstance */
/*jslint es5: true */

(function () {
    "use strict";

    console.log('CarouselCtrl setup');
    define(['angular', 'lib/MLConfig', 'lib/utils'], function (angular, MLConfig, utils) {
        console.log('CarouselCtrl define');

        function CarouselCtrl($scope) {
            console.debug('CarouselCtrl - initialize collapsed bool');
            $scope.SlideInterval = 5000;
            $scope.noWrapSlides = false;
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
            }, 1000);

            $scope.$on("SlidePauseEvent", function () {
                $scope.SlideInterval = $scope.SlideInterval === 5000 ? -1 : 5000
            });

            $scope.$on("VideoPauseEvent", function (evt, args) {
                var vdo = document.getElementById('vdo');
                console.log("VideoPauseEvent");
                console.debug(args);
                if (args.playpauseStatus) {
                    vdo.play();
                } else {
                    vdo.pause();
                }
            });
        }

        function init(App) {
            console.log('CarouselCtrl init');
            App.controller('CarouselCtrl', ['$scope', CarouselCtrl]);
        }
        return {start: init};

    });
}());
