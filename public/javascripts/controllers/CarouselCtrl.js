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
            $scope.active = 0;
            $scope.slides = [];
            var slides = $scope.slides,
                currIndex = 0,
                url = MLConfig.gethref() + "/stylesheets/images/imagefromtext",
                captions = [
                    'first slide caption',
                    'second caption',
                    'caption for third slide',
                    'final caption'
                ],
                i;

            $scope.addSlide = function () {
                var newWidth = slides.length;
                slides.push({
                    image: url + newWidth + '.png',
                    text: captions[currIndex],
                    id: currIndex++
                });
            };

            for (i = 0; i < 4; i++) {
                $scope.addSlide();
            }
        }

        function init(App) {
            console.log('CarouselCtrl init');
            App.controller('CarouselCtrl', ['$scope', CarouselCtrl]);
        }
        return {start: init};

    });
}());
