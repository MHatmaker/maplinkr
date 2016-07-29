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
            var url = MLConfig.gethref() + "/stylesheets/images/imagefromtext",
                captions = [
                    'first slide caption',
                    'second caption',
                    'caption for third slide',
                    'final caption'
                ],
                i;

            $scope.addSlide = function (i) {
                var newWidth = i;
                $scope.slides.push({
                    image: url + newWidth + '.png',
                    text: captions[i],
                    id: i
                });
            };

            for (i = 0; i < 4; i++) {
                $scope.addSlide(i);
            }
            $scope.active = 0;
            setTimeout(function() {
                $scope.$apply();
            }, 1000);
        }

        function init(App) {
            console.log('CarouselCtrl init');
            App.controller('CarouselCtrl', ['$scope', CarouselCtrl]);
        }
        return {start: init};

    });
}());
