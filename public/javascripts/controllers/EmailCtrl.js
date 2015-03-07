

(function() {
    "use strict";

    console.log('EmailCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig'], function(angular, AgoNewWindowConfig) {
        console.log('EmailCtrl define');
        var context = {};

        function EmailCtrl($scope) {
            context.fullUrl = AgoNewWindowConfig.gethref();
            var channel = AgoNewWindowConfig.masherChannel();
            context.fullUrl += "&channel=" + channel;
            $scope.urlText = context.fullUrl;
            resizeTextArea();

            function resizeTextArea() {
                var textarea = document.getElementById('UrlCopyFieldID');
                textarea.style.height = (textarea.scrollHeight) + 'px';
            };

            $scope.fetchUrl = function(){
                context.fullUrl = AgoNewWindowConfig.gethref();
                // context.urlText = $scope.urlText;
                var channel = AgoNewWindowConfig.masherChannel();
                context.fullUrl += "?channel=" + channel;
                $scope.urlText = context.fullUrl;
                resizeTextArea();
                var docEl = document.getElementById("UrlCopyFieldID");
                console.debug(docEl);
                var urlEl = angular.element(docEl);
                console.debug(urlEl);
                urlEl[0].select();
                console.log("fetchUrl : " + context.urlText);
                console.log("url : " + context.fullUrl);
                var labelDiv = angular.element(document.getElementById("UrlInstructions"));
                labelDiv.css({"display" : "inline-block"});

            }
            $scope.$watch("status.isCopyMapLinkOpen", function (newValue, oldValue) {
                context.fullUrl = AgoNewWindowConfig.gethref();
                var channel = AgoNewWindowConfig.masherChannel();
                context.fullUrl += "?channel=" + channel;
                $scope.urlText = context.fullUrl;
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

}).call(this);
