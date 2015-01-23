

(function() {
    "use strict";

    console.log('TransmitNewUrlCtrl setup');
    define(['lib/AgoNewWindowConfig', 'angular'], function(AgoNewWindowConfig) {
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
                AgoNewWindowConfig.showConfigDetails('TransmitNewUrlCtrl - PUBLISH');
                var updtUrl = AgoNewWindowConfig.getUpdatedUrl();
                console.log(updtUrl);
                var $inj = angular.injector(['app']);
                var serv = $inj.get('CurrentMapTypeService');
                var curmph = serv.getSelectedMapType();
                var curmapsys = serv.getMapRestUrl();
                updtUrl += '&maphost=' + curmapsys;
                var referrerId = AgoNewWindowConfig.getReferrerId();
                updtUrl += '&referrerId=' + referrerId;
                
                var nativeCenter = curmph.getCenter();
                AgoNewWindowConfig.setPosition(nativeCenter);
                                
                var newPos = AgoNewWindowConfig.getPosition();
                newPos.search = updtUrl;
                newPos.maphost = curmapsys;
                newPos.referrerId = referrerId;
                
                curmph.publishPosition(newPos);
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

        