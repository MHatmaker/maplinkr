(function() {
    "use strict";

    console.log('LinkerDisplayDirective setup');
    define([
        'angular'
    ], function(angular) {
        console.log('LinkerDisplayDirective define'); 
        
        function init(App) {
            console.log('LinkerDisplayDirective init');
            App.directive('linkerdisplayer', function ($compile){
                return {
                  restrict: 'E',
                  template: '<img id="linkerDirectiveId" class="mapLinker"  style="position: relative;left: 300px;top: 300px; width: 30px; height: 30px; z-index: 10"  ng-click="linkerClicked()" src="../stylesheets/images/Expand.png">',
                  replace: true,
                  link: function(scope, element) {
                    scope.add = function(){
                      console.log("LinkerDisplayDirective ----  adding:");
                      console.debug(element);
                      element.after($compile('<linkerdisplayer></linkerdisplayer>')(scope));
                    }
                    scope.linkerClicked = function(){
                        scope.$emit('displayLinkerEvent');
                    }
                  }
                }
              });
        }

        return { start: init };

    });

}).call(this);

       