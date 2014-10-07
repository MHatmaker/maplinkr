

(function() {
    "use strict";

    console.log('EmailCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig'], function(angular, AgoNewWindowConfig) {
        console.log('EmailCtrl define');
        var context = {};
        
        function EmailCtrl($scope) {
            context.fullUrl = AgoNewWindowConfig.gethref();
            $scope.urlText = context.fullUrl;
        
            $scope.fetchUrl = function(){
                context.fullUrl = AgoNewWindowConfig.gethref();
                // context.urlText = $scope.urlText;
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
                
            }
        }
        
        
        function init(App) {
            console.log('EmailCtrl init');
            App.controller('EmailCtrl', ['$scope', EmailCtrl]);
            return EmailCtrl;
        }
    

        return { start: init };

    });

}).call(this);

        