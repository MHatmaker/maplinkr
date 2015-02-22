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
                  template: '<img id="linkerDirectiveId" class="mapLinker"  style="position: absolute;left:300px;top: 150px; width: 30px; height 30px;" src="../stylesheets/images/Expand.png">',
                  replace: true,
                  link: function(scope, element) {
                    scope.add = function(){
                      console.log("LinkerDisplayDirective ----  adding:");
                      console.debug(element);
                      element.after($compile('<linkerdisplayer></linkerdisplayer>')(scope));
                    }
                    scope.$on('displayLinkerClickEvent', function(event, args){
                        alert('searchClickEvent in LinkerDisplayDirective');
                        console.log('searchClickEvent in LinkerDisplayDirective ' + args);
                        // $scope.$apply(function () {
                            // $scope.current = args;
                        });
                  }
                }
              });
        }

        return { start: init };

    });

}).call(this);

       