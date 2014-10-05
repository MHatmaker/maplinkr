

(function() {
    "use strict";

    console.log('EmailCtrl setup');
    define(['angular', 'lib/AgoNewWindowConfig'], function(angular, AgoNewWindowConfig) {
        console.log('EmailCtrl define');
        var context = {};
        
        function EmailCtrl($scope, $http) {
            $scope.emailtext = 'me@example.com';
            context.http = $http;
        
            $scope.acceptAddress = function(){
                context.fullUrl = AgoNewWindowConfig.gethref() + "arcgis/" + AgoNewWindowConfig.getUrl();
                context.emailtext = $scope.emailtext;
                console.log("acceptAddress : " + context.emailtext);
                console.log("url : " + context.fullUrl);
                
                context.http.post('/contact', {
                    name: "Mashover User",
                    email: context.emailtext,
                    message: context.fullUrl
                }).success(function(data, status, headers, config) {
                    if(data.success){
                        console.log("email success");
                    }else {
                        console.log("email failure");
                    }
                });
            }
        }
        
        
        function init(App) {
            console.log('EmailCtrl init');
            App.controller('EmailCtrl', ['$scope', '$http', EmailCtrl]);
            return EmailCtrl;
        }
    

        return { start: init };

    });

}).call(this);

        