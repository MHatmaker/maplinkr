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
                  template: '<div id="linkerDirectiveId"> \
                  <input style="color: black; font-size: 0.7em; position: absolute; right:80px; top: 155px; width: 50px; height: 20px; \
                  z-index: 10" value="Show Linker" > \
                  </input> \
                  <img style="position: absolute; right:20px; top: 150px; width: 30px; height: 30px; z-index: 10" ng-click="linkerClicked()" src="../stylesheets/images/Expand.png"> \
                  </div>',
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

       