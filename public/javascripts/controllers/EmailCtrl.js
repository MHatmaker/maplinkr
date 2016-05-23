
/*global define */

(function () {
    "use strict";

    console.log('EmailCtrl setup');
    define(['angular', 'lib/MLConfig'], function (angular, MLConfig) {
        console.log('EmailCtrl define');

        function EmailCtrl($scope) {
            var context = {
                'fullUrl' : ''
            };
            $scope.status = {
                'isCopyMapLinkOpen' : true
            }

            function resizeTextArea() {
                var textarea = document.getElementById('UrlCopyFieldID');
                textarea.value = context.fullUrl;
                textarea.style.height = (textarea.scrollHeight) + 'px';
                console.log('resizeTextArea with : ' + textarea.value);
            }

            function assembleUrl() {
                console.log("gethref : ");
                console.log(MLConfig.gethref());
                var updtUrl = MLConfig.gethref(),
                    $inj = angular.injector(['app']),
                    serv = $inj.get('CurrentMapTypeService'),
                    curmapsys = serv.getMapRestUrl(),
                    gmQuery = MLConfig.getQuery(),
                    bnds = MLConfig.getBoundsForUrl();

                if (updtUrl.indexOf('?') < 0) {
                    updtUrl +=  MLConfig.getUpdatedRawUrl();
                }
                console.log("Raw Updated url");
                console.log(updtUrl);
                updtUrl += '&maphost=' + curmapsys;
                updtUrl += '&referrerId=-99';


                if (gmQuery !== '') {
                    updtUrl += "&gmquery=" + gmQuery;
                    updtUrl += bnds;
                }

                return updtUrl;
            }

            $scope.status.isCopyMapLinkOpen = false;
            $scope.fetchUrl = function () {
                resizeTextArea();
                var docEl = document.getElementById("UrlCopyFieldID"),
                    urlEl = angular.element(docEl),
                    labelDiv = angular.element(document.getElementById("UrlInstructions"));

                urlEl[0].select();
                console.log("fetchUrl with : " + context.fullUrl);

                labelDiv.css({"display" : "inline-block"});
                $scope.status.isCopyMapLinkOpen = true;
            };

            $scope.$watch("status.isCopyMapLinkOpen", function (newValue, oldValue) {
                var labelDiv = angular.element(document.getElementById("UrlInstructions"));

                if ($scope.status.isCopyMapLinkOpen) {
                    context.fullUrl = assembleUrl();

                    console.log("watching status.isCopyMapLinkOpen");
                    console.log(context.fullUrl);
                    console.log('status.isCopyMapLinkOpen is ' + $scope.status.isCopyMapLinkOpen);
                    resizeTextArea();
                } else {
                    $scope.status.isCopyMapLinkOpen = false;
                    labelDiv.css({"display" : "none"});
                }
            });
        }


        function init(App) {
            console.log('EmailCtrl init');
            App.controller('EmailCtrl', ['$scope', EmailCtrl]);
            return EmailCtrl;
        }


        return { start: init };

    });

}());
// }()).call(this);

/*
  Plunker that manages to get textarea updated from change in the scope variable.
 http://plnkr.co/edit/YnXZQm78M9nMqd9uOURz?p=preview
*/
