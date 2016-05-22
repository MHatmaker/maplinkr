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
                      <input > \
                      </input> \
                      <img> \
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
