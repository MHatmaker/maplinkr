
(function() {
    "use strict";

    console.log('MasherCtrl setup');
    define(['angular'], function(angular) {
        console.log('MasherCtrl define');
        
        function MasherCtrl($scope) {
            console.debug('MasherCtrl - initialize collapsed bool');
            // alert('MasherCtrl - initialize some tabs');
            $scope.isCollapsed = false;
            $scope.currentTab = null;
            console.log("init with isCollapsed = " + $scope.isCollapsed);
        };
        
        function init(App) {
            console.log('MasherCtrl init');
            App.controller('MasherCtrl', ['$scope', MasherCtrl]);
            return MasherCtrl;
        }

        return { start: init };

    });

}).call(this);