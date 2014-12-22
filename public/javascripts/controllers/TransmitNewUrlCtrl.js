

(function() {
    "use strict";

    console.log('TransmitNewUrlCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig'], function(angular, AgoNewWindowConfig) {
        console.log('TransmitNewUrlCtrl define');
        var context = {};
        
        function TransmitNewUrlCtrl($scope) {
            context.fullUrl = AgoNewWindowConfig.gethref();
            $scope.urlText = context.fullUrl;
        
            $scope.fetchUrl = function(){
                context.fullUrl = AgoNewWindowConfig.gethref();
                // context.urlText = $scope.urlText;
                /* 
                $scope.urlText = context.fullUrl;
                var docEl = document.getElementById("UrlCopyFieldID");
                console.debug(docEl);
                var urlEl = angular.element(docEl);
                console.debug(urlEl);
                urlEl[0].select();
                console.log("fetchUrl : " + context.urlText);
                console.log("url : " + context.fullUrl);
                var labelDiv = angular.element(document.getElementById("UrlInstructions"));
                labelDiv.css({"display" : "inline-block"});
                 */
            }
            
            $scope.publishUrl = function(){
                console.log("Publish Current URL");
                console.log(context.fullUrl);
            }
        }
        
        
        function init(App) {
            console.log('TransmitNewUrlCtrl init');
            App.controller('TransmitNewUrlCtrl', ['$scope', TransmitNewUrlCtrl]);
            return TransmitNewUrlCtrl;
        }
    

        return { start: init };

    });

}).call(this);

        