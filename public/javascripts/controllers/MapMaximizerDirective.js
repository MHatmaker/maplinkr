(function() {
    "use strict";

    console.log('MapMaximizerDirective setup');
    define([
        'angular'
    ], function(angular) {
        console.log('MapMaximizerDirective define'); 
        
        function init(App) {
            console.log('MapMaximizerDirective init');
            App.directive('mapmaximizer', function ($compile){
                return {
                  restrict: 'E',
                  template: '<img id="mapmaximizerDirectiveId" class="mapMaximizer"  style="position: relative;left: 300px;top: 330px; width: 30px; height: 30px; z-index: 10"  ng-click="mapmaximizerClicked()" src="../stylesheets/images/Expand.png">',
                  replace: true,
                  link: function(scope, element) {
                    scope.add = function(){
                      console.log("MapMaximizerDirective ----  adding:");
                      console.debug(element);
                      element.after($compile('<mapmaximizer></mapmaximizer>')(scope));
                    }
                    scope.mapmaximizerClicked = function(){
                        scope.$emit('mapMaximizerEvent');
                    }
                  }
                }
              });
        }

        return { start: init };

    });

}).call(this);

       