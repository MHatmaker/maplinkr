
(function() {
    "use strict";

    console.log('PositionViewCtrl setup');
    define(['angular'], function(angular) {
        console.log('PositionViewCtrl define');
        var curDetails = {
            zm : 'zm',
            scl : 'scl',
            cntrlng : 'cntrlng',
            cntrlat : 'cntrlat',
            evlng : 'evlng',
            evlat : 'evlat'
        };
        var updateDetails = {
            'zm' : function(z){curDetails['zm'] = z['zm']; curDetails['scl'] = z['scl'];},
            'cntr' : function(z) {curDetails['cntrlng'] = z['cntrlng']; curDetails['cntrlat'] = z['cntrlat'];},
            'coords' : function(z) {curDetails['evlng'] = z['evlng']; curDetails['evlat'] = z['evlat'];}
        };
        var formatView = {
            'zm' : function(z){$scope.positionView = "Zoom : " + z['zm'] + " Scale : " + z['scl'];},
            'cntr' : function(z) {$scope.positionView = z['cntrlng'] + z['cntrlat'];},
            'coords' : function(z) {$scope.positionView = z['evlng'] + z['evlat'];}
        };
        var curKey = 'coords';

        function PositionViewCtrl($scope) {
            console.debug('PositionViewCtrl - initialize dropdown for position selections');
            
            $scope.viewOptions = [
            { 
              type : 'zoom level',
              key : 'zm',
              value : 'zm, scale'
            },
            { 
              type : 'map center',
              key : 'cntr',
              value : 'cntrlng, cntrlat'
            },
            { 
              type : 'mouse coordinates',
              key : 'coords',
              value : 'evlng, evlat'
            }
            ];
            
            $scope.currentViewOption = $scope.viewOptions[3]; 
           
            $scope.setPostionDisplayType = function() {
                //alert("changed " + $scope.selectedOption.value);
                $scope.mppos = $scope.selectedOption.value;
                curKey = $scope.selectedOption.key;
                formatView[curKey](curDetails);
            };
        
        };
            
        /* 
        PositionViewCtrl.prototype.selectAgo = function (){
            selfMethods["selectAgo"]();
        }
            
        PositionViewCtrl.prototype.forceAgo = function (){
            selfMethods["forceAgo"]();
        }
         */
        function updatePosition(key, val){
            updateDetails[key](val);
            if(key = $scope.currentViewOption){
                formatView[key](val);
            }
        }
        
        

        function init(App) {
            console.log('PositionViewCtrl init');
            App.controller('PositionViewCtrl', ['$scope', PositionViewCtrl]);
            return PositionViewCtrl;
        }
        // function selectAgo() {
            // console.log('selectAgo ');
            // PositionViewCtrl.prototype.selectAgo();
        // }
        // function forceAgo() {
            // console.log('forceAgo ');
            // PositionViewCtrl.prototype.forceAgo();
        // }

        return { start: init, update : updatePosition};

    });

}).call(this);