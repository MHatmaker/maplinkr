

(function() {
    "use strict";

    console.log('EmailCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig'], function(angular, AgoNewWindowConfig) {
        console.log('EmailCtrl define');

        function EmailCtrl($scope) {
            var context = {
                'fullUrl' : ''
            };

            $scope.urlContext = {
                'urlText' : ''
            };


            function resizeTextArea() {
                var textarea = document.getElementById('UrlCopyFieldID');
                textarea.style.height = (textarea.scrollHeight) + 'px';
            };

            function assembleUrl(){
                console.log("gethref : ");
                console.log(AgoNewWindowConfig.gethref());
                var updtUrl = AgoNewWindowConfig.gethref();
                if(updtUrl.indexOf('?') < 0){
                    updtUrl +=  AgoNewWindowConfig.getUpdatedRawUrl();
                }
                console.log("Raw Updated url");
                console.log(updtUrl);
                var $inj = angular.injector(['app']);
                var serv = $inj.get('CurrentMapTypeService');
                var curmph = serv.getSelectedMapType();
                var curmapsys = serv.getMapRestUrl();
                updtUrl += '&maphost=' + curmapsys;

                var gmQuery = AgoNewWindowConfig.getQuery();
                if(gmQuery != ''){
                    updtUrl += "&gmquery=" + gmQuery;
                    var bnds = AgoNewWindowConfig.getBoundsForUrl();
                    updtUrl += bnds;
                }

                return updtUrl;
            }

            $scope.fetchUrl = function(){
                // resizeTextArea();
                var docEl = document.getElementById("UrlCopyFieldID");
                console.debug(docEl);
                var urlEl = angular.element(docEl);
                console.debug(urlEl);
                urlEl[0].select();
                console.log("fetchUrl found context.urlText : " + $scope.urlContext.urlText);
                console.log("url : " + context.fullUrl);
                console.log("url : " + $scope.urlContext.urlText);
                var labelDiv = angular.element(document.getElementById("UrlInstructions"));
                labelDiv.css({"display" : "inline-block"});
            }

            var contextScope = $scope; //.$parent;

            $scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                  if(phase == '$apply' || phase == '$digest') {
                      if(fn && (typeof(fn) === 'function')) {
                          console.log('typeof is function');
                          fn();
                      }
                  } else {
                      console.log('out of phase and digest');
                      this.$apply(fn);
                      contextScope.$apply(fn);
                }
            };

            $scope.$watch("status.isCopyMapLinkOpen", function (newValue, oldValue) {
                context.fullUrl = assembleUrl();
                contextScope.urlContext.urlText = context.fullUrl.substr(0);
                console.log("watching $scope.urlContext.urlText");
                console.log($scope.urlContext.urlText);
                console.log(contextScope.urlContext.urlText);

                contextScope.safeApply(function(){
                    console.log("SAFEAPPLY CALLBACK with text " + contextScope.urlContext.urlText );
                    // resizeTextArea();
                });
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
