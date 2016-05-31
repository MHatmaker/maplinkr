(function() {
    "use strict";

    define([
    ], function() {

        function SearcherCtrlGoogle($scope, $timeout) {
            $scope.isGoogle = true;
        }
        
        $scope.queryChanged = function () {
            MLConfig.setQuery($scope.gsearch.query);
        };

        function init(App) {
            App.controller('SearcherCtrlGoogle', ['$scope', SearcherCtrlGoogle]);
            return SearcherCtrlGoogle;
        }

        return { start: init };

    });

}).call(this);
