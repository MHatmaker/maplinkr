
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>


(function() {
    "use strict";

    console.log('VerbageCtrl setup');
    define(['angular'], function(angular) {
        console.log('VerbageCtrl define');
        
        function VerbageCtrl($scope) {
            console.debug('VerbageCtrl - initialize collapsed bool');
            // alert('VerbageCtrl - initialize some tabs');
            $scope.isVerbageCollapsed = false;
            $scope.VrbgWdth = '30%';
            console.log("init with isVerbageCollapsed = " + $scope.isVerbageCollapsed);
            // $scope.isGroupSearchOpen = false;
            // $scope.isMapSearchOpen = false;
            $scope.oneAtATime = true;
            
            
            $scope.$on('CollapseVerbageEvent', function() {
                $scope.VrbgWdth = $scope.VrbgWdth == '30%' ? '0%' : '30%';
                $scope.isVerbageCollapsed = ! $scope.isVerbageCollapsed;
            });
            $scope.$on('SignInOutEmitEvent', function(event, args) {
                $scope.$broadcast('SignInOutBroadcastEvent', args);
            });
            $scope.$on('OpenMapPaneEvent', function(event, args) {
                $scope.status.isGroupSearchOpen = ! $scope.status.isGroupSearchOpen;
                $scope.status.isMapSearchOpen = ! $scope.status.isMapSearchOpen;
                $scope.$broadcast('OpenMapPaneCommand', args );  // ? args.respData);
            });
            $scope.status = {
                isNewsOpen: false,
                isInstructionsOpen: false,
                    isSameWindowPaneOpen: false,
                    isNewTabPaneOpen: false,
                    isNewWindowPaneOpen: false,
                isGroupSearchOpen: false,
                isMapSearchOpen: false,
                isCopyMapLinkOpen: false,
                isSetChannelOpen: false,
            };
        };
        
        function init(App) {
            console.log('VerbageCtrl init');
            App.controller('VerbageCtrl', ['$scope', VerbageCtrl]);
            return VerbageCtrl;
        }
    

        return { start: init };

    });

}).call(this);