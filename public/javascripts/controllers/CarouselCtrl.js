/*global define */
/*global $uibModal */
/*global $uibModalInstance */
/*global Event */
/*global $modalInstance */
/*jslint es5: true */

(function () {
    "use strict";

    console.log('CarouselCtrl setup');
    define(['angular', 'lib/MLConfig'], function (angular, MLConfig) {
        console.log('CarouselCtrl define');

        function CarouselCtrl($scope) {
            console.debug('CarouselCtrl - initialize collapsed bool');
            $scope.SlideInterval = 5000;
            $scope.noWrapSlides = false;
            $scope.slides = [];
            $scope.videos = [];
            $scope.data = {
                'ExpandFeaturesText': "Minimize Features Display"
            };
            var url = MLConfig.gethref() + "/stylesheets/images/",
                captions = [
                    'first slide caption',
                    'second caption',
                    'caption for third slide',
                    'final caption',
                    ''
                ],
                i;

            $scope.addSlide = function (i) {
                var newWidth = i;
                $scope.slides.push({
                    image: url + "imagefromtext" + newWidth + '.png',
                    text: captions[i],
                    pause: "hover",
                    id: i
                });
            };

            for (i = 0; i < 4; i++) {
                $scope.addSlide(i);
            }
            $scope.active = 0;

            $scope.addVideo = function (i, nm) {
                $scope.videos.push({
                    vfile: url + nm,
                    id: i
                });
            };
            for (i = 4; i < 5; i++) {
                $scope.addVideo(i, '3DUnzoomed.mp4');
            }

            setTimeout(function () {
                $scope.$apply();
            }, 1000);

            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof fn === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            $scope.featuresCollapser = function () {
                $scope.$parent.summaryCollapser();
                if ($scope.$parent.data.isSummaryCollapsed === true) {
                    $scope.data.ExpandFeaturesText = "Expand Features Display (pause on hover)";
                } else {
                    $scope.data.ExpandFeaturesText = "Minimize Features Display";
                }

                $scope.safeApply(function () {
                    console.log("preliminary collapse event $apply");
                });
            };
/*
            $('#idCarousel').hover(
                function () {
                    $(this).carousel('pause');
                },

                function () {
                    $(this).carousel('cycle');
                }
            );

            $('#idCarousel').mouseenter(function () {
                $(this).carousel('pause');
            })
                .mouseleave(function () {
                    $(this).carousel('next');
                });
*/
        }

        function init(App) {
            console.log('CarouselCtrl init');
            App.controller('CarouselCtrl', ['$scope', CarouselCtrl]);
        }
        return {start: init};

    });
}());
