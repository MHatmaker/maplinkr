
/*global define */

(function () {
    "use strict";

    console.log('EmailCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig'], function (angular, AgoNewWindowConfig) {
        console.log('EmailCtrl define');

        function EmailCtrl($scope) {
            var context = {
                'fullUrl' : ''
            };

            function resizeTextArea() {
                var textarea = document.getElementById('UrlCopyFieldID');
                textarea.value = context.fullUrl;
                textarea.style.height = (textarea.scrollHeight) + 'px';
                console.log('resizeTextArea with : ' + textarea.value);
            }

            function assembleUrl() {
                console.log("gethref : ");
                console.log(AgoNewWindowConfig.gethref());
                var updtUrl = AgoNewWindowConfig.gethref(),
                    $inj = angular.injector(['app']),
                    serv = $inj.get('CurrentMapTypeService'),
                    curmapsys = serv.getMapRestUrl(),
                    gmQuery = AgoNewWindowConfig.getQuery(),
                    bnds = AgoNewWindowConfig.getBoundsForUrl();

                if (updtUrl.indexOf('?') < 0) {
                    updtUrl +=  AgoNewWindowConfig.getUpdatedRawUrl();
                }
                console.log("Raw Updated url");
                console.log(updtUrl);
                updtUrl += '&maphost=' + curmapsys;


                if (gmQuery !== '') {
                    updtUrl += "&gmquery=" + gmQuery;
                    updtUrl += bnds;
                }

                return updtUrl;
            }

            $scope.fetchUrl = function () {
                resizeTextArea();
                var docEl = document.getElementById("UrlCopyFieldID"),
                    urlEl = angular.element(docEl),
                    labelDiv = angular.element(document.getElementById("UrlInstructions"));

                urlEl[0].select();
                console.log("fetchUrl with : " + context.fullUrl);

                labelDiv.css({"display" : "inline-block"});
            };

            $scope.$watch("status.isCopyMapLinkOpen", function (newValue, oldValue) {
                context.fullUrl = assembleUrl();

                console.log("watching status.isCopyMapLinkOpen");
                console.log(context.fullUrl);
                resizeTextArea();
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
