
(function() {
    "use strict";

    console.log('PositionViewCtrl setup');
    define(['angular'], function(angular) {
        console.log('PositionViewCtrl define');
        
        var selfMethods = {};
        
        var curDetails = {
            zm : 'zm',
            scl : 'scl',
            cntrlng : 'cntrlng',
            cntrlat : 'cntrlat',
            evlng : 'evlng',
            evlat : 'evlat'
        };
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
            
            $scope.currentViewOption = $scope.viewOptions[2]; 
            
            $scope.updateDetails = {
                'zm' : function(z){curDetails['zm'] = z['zm']; curDetails['scl'] = z['scl'];},
                'cntr' : function(z) {curDetails['cntrlng'] = z['cntrlng']; curDetails['cntrlat'] = z['cntrlat'];},
                'coords' : function(z) {curDetails['evlng'] = z['evlng']; curDetails['evlat'] = z['evlat'];}
            };
            $scope.formatView = {
                'zm' : function(z){
                    var formatted = "Zoom : " + z['zm'] + " Scale : " + z['scl'];
                    $scope.positionView = formatted;
                },
                'cntr' : function(z) {
                    var formatted  = z['cntrlng'] + ', ' + z['cntrlat'];
                    $scope.positionView = formatted;
                },
                'coords' : function(z) {
                    var formatted  = z['evlng'] + ', ' + z['evlat'];
                    $scope.positionView = formatted;
                }
            };
            var curKey = 'coords';

           
            $scope.setPostionDisplayType = function() {
                //alert("changed " + $scope.selectedOption.value);
                // $scope.positionView = $scope.selectedOption.value;
                curKey = $scope.currentViewOption.key;
                $scope.formatView[curKey](curDetails);
            };
            
            $scope.updatePosition = function(key, val){
                var k = key; //.slice(0);
                if(k == 'zm' || k == 'cntr'){
                    $scope.updateDetails['zm'](val);
                    $scope.updateDetails['cntr'](val);
                }
                else{
                    $scope.updateDetails[k](val);
                }
                if(k = $scope.currentViewOption.key){
                    $scope.formatView[k](val);
                }
            };
        
            selfMethods["updatePosition"] = $scope.updatePosition;
        
        };
            
        /* 
        PositionViewCtrl.prototype.selectAgo = function (){
            selfMethods["selectAgo"]();
        }
            
        PositionViewCtrl.prototype.forceAgo = function (){
            selfMethods["forceAgo"]();
        }
         */
          
        PositionViewCtrl.prototype.updatePosition = function (key, val){
            selfMethods["updatePosition"](key, val);
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

        return { start: init, update : PositionViewCtrl.prototype.updatePosition};

    });

}).call(this);