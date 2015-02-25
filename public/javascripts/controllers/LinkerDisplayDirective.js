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
                  restrict: '<div id="linkerDirectiveId"> \
                      <input class="lnkmaxcontrol_label" value={{$scope.$parent.data.ExpandPlug}} > \
                      </input> \
                      <img class="lnkmaxcontrol_symbol" src="../stylesheets/images/{{$scope.$parent.data.verbageExpandCollapse}}.png"> \
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

       