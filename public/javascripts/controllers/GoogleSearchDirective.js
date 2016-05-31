/*global define */

(function () {
    "use strict";

    console.log('GoogleSearchDirective setup');
    define([
        'angular'
    ], function (angular) {
        console.log('GoogleSearchDirective define');

        function init(App) {
            console.log('GoogleSearchDirective init');
            App.directive('gmsearch', function ($compile) {
                return {
                    restrict: 'E',
                    template: ' \
                        <input id="pac-input" \
                        class="gmsearchcontrols" className="controls" \
                        type="text" placeholder="Search Google Places"  \
                        style="display: block; visibility: visible; color: black; z-index: 30; width: 90%;"  \
                        ng-model="gsearch.query" \
                        ng-change="queryChanged()" auto-focus >',
                    replace: false,
                    controller: SearcherCtrlGoogle,
                    link: function (scope, element) {
                        scope.add = function () {
                            console.log("GoogleSearchDirective ----  adding:");
                            console.debug(element);
                            element.after($compile('<gmsearch style="height: 40px; display: block; visibility: visible"></gmsearch>')(scope));
                        };
                        scope.$on('searchClickEvent', function (event, args) {
                            // alert('searchClickEvent in GoogleSearchDirective');
                            console.log('searchClickEvent in GoogleSearchDirective ' + args);
                            console.log("searchClickEvent is Handled in MapCtrl in queryChanged");
                            // $scope.$apply(function () {
                                // $scope.current = args;
                        });
                    }
                };
            });
        }

        return { start: init };

    });

}());
