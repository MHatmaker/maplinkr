
(function() {
    "use strict";

    console.log('PositionViewCtrl setup');
    define(['angular', 'lib/utils'], function(angular, utils) {
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
        var keyToUpdate = 'coords';
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
              type : 'mouse coords',
              key : 'coords',
              value : 'evlng, evlat'
            }
            ];
            
            $scope.currentViewOption = $scope.viewOptions[2]; 
            $scope.positionView = "position info";
            $scope.expBtnHeight = 1.2; // utils.getButtonHeight(1.5); //'verbageExpandCollapseImgId');
            
            $scope.updateDetails = {
                'zm' : function(opt){curDetails['zm'] = opt['zm']; curDetails['scl'] = opt['scl'];},
                'cntr' : function(opt) {curDetails['cntrlng'] = opt['cntrlng']; curDetails['cntrlat'] = opt['cntrlat'];},
                'coords' : function(opt) {curDetails['evlng'] = opt['evlng']; curDetails['evlat'] = opt['evlat'];}
            };
            $scope.formatView = {
                'zm' : function(zlevel){
                    var formatted = "Zoom : " + zlevel['zm'] + " Scale : " + zlevel['scl'];
                    $scope.positionView = formatted;
                },
                'cntr' : function(cntr) {
                    var formatted  = cntr['cntrlng'] + ', ' + cntr['cntrlat'];
                    $scope.positionView = formatted;
                },
                'coords' : function(evnt) {
                    var formatted  = evnt['evlng'] + ', ' + evnt['evlat'];
                    // console.log("old : " + $scope.positionView + " new " + formatted);
                    $scope.positionView = formatted;
                }
            };
            
            function fmtView(){
                $scope.formatView[$scope.currentViewOption.key]( curDetails);
            }
           
            $scope.setPostionDisplayType = function() {
                //alert("changed " + $scope.selectedOption.value);
                // $scope.positionView = $scope.selectedOption.value;
                console.log("setPostionDisplayType : " + $scope.currentViewOption.key);
                var curKey = $scope.currentViewOption.key;
                $scope.formatView[curKey](curDetails);
            };
            
            $scope.updatePosition = function(key, val){
                // console.log("in updatePosition");
                if(key == 'zm' || key == 'cntr'){
                    $scope.updateDetails['zm'](val);
                    $scope.updateDetails['cntr'](val);
                }
                else{
                        $scope.updateDetails[key](val);
                }
                if(key = $scope.currentViewOption.key){
                    // console.log("calling $apply()");
                    $scope.safeApply( fmtView); // $scope.formatView[key](val));
                    //angular.element("mppos").scope().$apply();
                }
            };
            $scope.safeApply = function(fn) {
                var phase = this.$root ? this.$root.$$phase : 'notphase';
                  if(phase == '$apply' || phase == '$digest') {
                      if(fn && (typeof(fn) === 'function')) {
                          fn();
                      }
                  } else {
                    this.$apply(fn);
                }
            };
        
            selfMethods["updatePosition"] = $scope.updatePosition;
        
        };
          
        PositionViewCtrl.prototype.updatePosition = function (key, val){
            selfMethods["updatePosition"](key, val);
        }

        function init(App) {
            console.log('PositionViewCtrl init');
            App.controller('PositionViewCtrl', ['$scope', PositionViewCtrl]);
            return PositionViewCtrl;
        }

        return { start: init, update : PositionViewCtrl.prototype.updatePosition};

    });

}).call(this);