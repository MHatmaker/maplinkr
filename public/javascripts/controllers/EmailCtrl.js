

(function() {
    "use strict";

    console.log('EmailCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig'], function(angular, AgoNewWindowConfig) {
        console.log('EmailCtrl define');
        var context = {};

        function EmailCtrl($scope) {
            context.fullUrl = assembleUrl(); // AgoNewWindowConfig.gethref();
            // var channel = AgoNewWindowConfig.masherChannel();
            // context.fullUrl += "&channel=" + channel;
            $scope.urlText = context.fullUrl;
            resizeTextArea();

            function resizeTextArea() {
                var textarea = document.getElementById('UrlCopyFieldID');
                textarea.style.height = (textarea.scrollHeight) + 'px';
            };

            function assembleUrl(){
                var updtUrl = AgoNewWindowConfig.getUpdatedUrl();
                return updtUrl;
            }

            $scope.fetchUrl = function(){
                context.fullUrl = assembleUrl(); // AgoNewWindowConfig.gethref();
                $scope.urlText = context.fullUrl;
                var contextScope = $scope;
                $scope.safeApply(function(){
                    //contextScope.urlText = context.fullUrl;
                    resizeTextArea();
                });
                setTimeout(function(){
                    //contextScope.urlText = context.fullUrl;
                    resizeTextArea();
                }, 1000);

                // resizeTextArea();
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

            $scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                  if(phase == '$apply' || phase == '$digest') {
                      if(fn && (typeof(fn) === 'function')) {
                          fn();
                      }
                  } else {
                    this.$apply(fn);
                }
            };

            $scope.$watch("status.isCopyMapLinkOpen", function (newValue, oldValue) {
                context.fullUrl = assembleUrl(); // AgoNewWindowConfig.gethref();
                $scope.urlText = context.fullUrl;
                var contextScope = $scope;
                $scope.safeApply(function(){
                    // contextScope.urlText = context.fullUrl;
                    resizeTextArea();
                });
                setTimeout(function(){
                    // contextScope.urlText = context.fullUrl;
                    resizeTextArea();
                }, 1000);
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
