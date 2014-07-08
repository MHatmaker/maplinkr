
(function() {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'angular',
        'esri/map',
        'dijit/Dialog'
    ], function(angular, Map) {
        console.log('MapCtrl define');

        function mapConfigs() {
            return {
                basemap: 'streets',
                center: [-118.1704035141802,34.03597014510993],
                zoom: 15
            };
        }

        function mapGen(elem) {
            return new Map(elem, mapConfigs());
        }
        

        function MapCtrl($scope, $routeParams) {
            console.log("MapCtrl initializing");
            $scope.map = mapGen('map_canvas');
            $scope.MapWdth = 70;
            console.debug($scope.map);
            
            var tmpltName = $routeParams.id;
            console.log(tmpltName);
            /* 
            $http.get('/partials/' + tmpltName)
                .then(function(results){
                    //Success;
                    console.log("Success: " + results.status);
                    console.log($routeParams.id);
                    $scope.doc = results.data;
                    console.debug($scope.doc);
                }, function(results){
                    //error
                    console.log("Error: " + results.data + "; "
                                          + results.status);
                })
                 */
                 
            $scope.$on('CollapseVerbageEvent', function() {
                $scope.MapWdth = $scope.MapWdth == 100 ? 70 : 100;
            });
        }
        
        function init(App) {
            console.log('MapCtrl init');
            App.controller('MapCtrl', ['$scope', '$routeParams', MapCtrl]);
            return MapCtrl;
        }

        return { start: init };

    });

}).call(this);