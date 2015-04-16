

(function() {
    "use strict";

    console.log('EmailCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig'], function(angular, AgoNewWindowConfig) {
        console.log('EmailCtrl define');

        function EmailCtrl($scope) {
            // context.fullUrl = assembleUrl(); // AgoNewWindowConfig.gethref();
            // var channel = AgoNewWindowConfig.masherChannel();
            // context.fullUrl += "&channel=" + channel;
            // $scope.urlText = ""; //context.fullUrl;
            var context = {
                'fullUrl' : ''
            };

            $scope.urlContext = {
                'urlText' : ''
            };

            //resizeTextArea();

            function resizeTextArea() {
                var textarea = document.getElementById('UrlCopyFieldID');
                // var anElem = angular.element(textarea);
                // anElem.scope().$apply();
                // textarea.innerHTML = context.fullUrl;
                // textarea.innerText = $scope.urlContext.fullUrl;
                // textarea.value = $scope.urlContext.fullUrl;
                // textarea.value = context.fullUrl;
                /*
                setTimeout(function(){
                    // $scope.safeApply(function(){

                    $scope.$apply(function(){
                        $scope.urlContext.urlText = context.fullUrl;
                        textarea.style.height = (textarea.scrollHeight) + 'px';
                    });
                }, 1000);
                */
                // $scope.urlContext.urlText = context.fullUrl;
                textarea.style.height = (textarea.scrollHeight) + 'px';
            };

            function assembleUrl(){
                console.log("gethref : ");
                console.log(AgoNewWindowConfig.gethref());
                var updtUrl = AgoNewWindowConfig.gethref() +  AgoNewWindowConfig.getUpdatedRawUrl();
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
                context.fullUrl = assembleUrl(); // AgoNewWindowConfig.gethref();
                $scope.urlContext.urlText = context.fullUrl;
                console.log("in fetchUrl - check $scope.urlContext.urlText");
                console.log($scope.urlContext.urlText);
                /*
                var contextScope = $scope;
                $scope.safeApply(function(){
                    //contextScope.urlText = context.fullUrl;
                    resizeTextArea();
                });
                setTimeout(function(){
                    //contextScope.urlText = context.fullUrl;
                    resizeTextArea();
                }, 1000);
                */
                resizeTextArea();
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

                // var contextScope = $scope;
                /*
                $scope.safeApply(function(){
                    // contextScope.urlText = context.fullUrl;
                    resizeTextArea();
                });
                */
                /*
                contextScope.urlContext.urlText = context.fullUrl;
                // $scope.$digest();
                */
                // setTimeout(function(){
                    contextScope.safeApply(function(){
                        // contextScope.urlContext.urlText = context.fullUrl.substr(0);
                        console.log("SETTIMEOUT CALLBACK with text " + contextScope.urlContext.urlText );
                        resizeTextArea();
                    });
                // }, 1000);


                // resizeTextArea();
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
