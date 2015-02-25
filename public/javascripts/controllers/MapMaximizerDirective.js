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
                  template: '<div id="mapmaximizerDirectiveId"> \
                      <input class="lnkmaxcontrol_label" style=" top: 65px;" value="{{$scope.$parent.data.ExpandSite}}" > \
                      </input> \
                      <img class="lnkmaxcontrol_symbol" style="top: 65px;" \
                      src="../stylesheets/images/{{$scope.$parent.data.webSiteVisible}}.png"> \
                      </div>',
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

       