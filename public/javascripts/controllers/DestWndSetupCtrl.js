

(function() {
    "use strict";

    console.log('DestWndSetupCtrl setup');
    var areWeInitialized = false;
    define([
        'angular'
    ], function(angular) {
        console.log('DestWndSetupCtrl define');  
        
        var selfdict = {};
        selfdict.isInitialized = areWeInitialized = false;
        var scopeDict = {};

        function DestWndSetupCtrl($scope, $modal){
            console.log("in DestWndSetupCtrl
            selfdict.scope = $scope
            selfdict.isInitialized = areWeInitialized = false;
        
            // selfdict.callbackFunction = null;
            $scope.showDialog = selfdict.scope.showDialog = false;
            $scope.destSelections = ["Same Window", "New Tab", "New Window"];
            $scope.data = {
                dstSel : $scope.destSelections[0].slice(0),
                prevDstSel :$scope.destSelections[0].slice(0),
                whichDismiss : "Cancel",
                dlg2show : "SelectWndDlg"
            };
                     
            $scope.preserveState = function(){
                console.log("preserveState");
                // $scope.data.whichDismiss = 'Cancel';
                $scope.data.prevDstSel = $scope.data.dstSel.slice(0);
                console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.dstSel);
            };

            $scope.restoreState = function(){
                console.log("restoreState");
                // $scope.data.whichDismiss = 'Accept';
                console.log("restore " + $scope.data.dstSel + " from " + $scope.data.prevDstSel);
                $scope.data.dstSel = $scope.data.prevDstSel.slice(0);
            };

            $scope.onAcceptChannel = function(){
                console.log("onAcceptChannel " + $scope.data.dstSel);
                selfdict.pusher = $scope.PusherClient(selfdict.eventDct, $scope.data.dstSel, 
                    selfdict.callbackFunction);
            };
            
            $scope.hitEnter = function(evt){
                if(angular.equals(evt.keyCode,13) && !(angular.equals($scope.name,null) || angular.equals($scope.name,''))){
                    $scope.save();
                }
            }; // end hitEnter
            
            $scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                  if(phase == '$apply' || phase == '$digest') {
                      if(fn && (typeof(fn) === 'function')) {
                          fn();
                      }
                  } else {
                    this.$apply(fn);
                }
            };
        }  
          
        DestWndSetupCtrl.prototype.isInitialized = function(){
            return areWeInitialized;
        }
                
            //selfdict.setupPusherClient = $scope.setupPusherClient;
        
        function init(App) {
            console.log('SearcherCtrlMap init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            
            selfdict.isInitialized = areWeInitialized = true;
            App.controller('DestWndSetupCtrl',  ['$scope', '$modal', DestWndSetupCtrl]);
            // App.controller('SearcherCtrlMap',  ['$scope', SearcherCtrlMap]);
            
            App.directive("modalShow", function () {
                var tpl = ' \
                  <div class="modal-dialog", style="width: 100%;"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                        <h3>Open a new map in :</h3> \
                      </div> \
                      <div class="modal-body"> \
                        <div class="btn-group btn-group-vertical"> \
                              <span data-ng-repeat="dest in $parent.destSelections"> \
                                  <input name="destSelected", type="radio", value="{{dest}}", ng-model="$parent.data.dstSel" ng-init="$parent.data.dstSel=\'Same Window\'"/> \
                                    {{dest}} \
                                  <br/> \
                              </span> \
                        </div> \
                        <div>selected: {{data.dstSel}}</div> \
                      </div> \
                      <div class="modal-footer"> \
                        <button type="button" class="btn btn-primary" ng-click="$parent.data.whichDismiss = \'Accept\';$parent.preserveState()" data-dismiss="modal">Accept</button> \
                        <button type="button" class="btn btn-primary" ng-click="$parent.data.whichDismiss = \'Cancel\';$parent.restoreState()" data-dismiss="modal">Cancel</button> \
                      </div> \
                    </div><!-- /.modal-content --> \
                  </div><!-- /.modal-dialog --> \
                ';
                return {
                    restrict: "A",
                    template : tpl,
                    scope: {
                        modalVisible: "=",
                        modalMdata: "="
                    },
                    link: function (scope, element, attrs) {
                        var localScope = scope;
                        //Hide or show the modal
                        scope.showModal = function (visible, elem) {
                            if (!elem)
                                elem = element;

                            if (visible)
                                $(elem).modal311("show");                     
                            else
                                $(elem).modal311("hide");
                        }

                        //Check to see if the modal-visible attribute exists
                        if (!attrs.modalVisible)
                        {

                            //The attribute isn't defined, show the modal by default
                            scope.showModal(true);

                        }
                        else
                        {

                            //Watch for changes to the modal-visible attribute
                            scope.$watch("modalVisible", function (newValue, oldValue) {
                                scope.showModal(newValue);
                                // scope.$parent.showDialog = newValue;
                                console.log("watch modalVisible  : ");
                                console.debug(scope.$parent.data);
                                // scope.$parent.preserveState();
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("modalMdata", function (newValue, oldValue) {
                                if( ! angular.isUndefinedOrNull(newValue))
                                  localScope.$parent.data = newValue;
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("data.dstSel", function (newValue, oldValue) {
                                if( ! angular.isUndefinedOrNull(newValue))
                                  localScope.$parent.data.dstSel = newValue;
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });
                           /*  
                            scope.$watch('scope.$parent.showDialog', function (newValue, oldValue) {
                                console.log("scope.$watch newValue : " + newValue);
                                console.log("scope.$watch 'scope.$parent.showDialog' : " + scope.$parent.showDialog);
                                scope.showModal(newValue);
                                //attrs.modalVisible = false;
                            });
                             */

                        }
                        //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                        $(element).on('hidden.bs.modal', function () {
                            scope.modalVisible = localScope.$parent.showDialog = false;
                            console.log("hide event called")
                            if (!scope.$$phase && !scope.$root.$$phase){
                                scope.$apply();
                            }
                            scope.$apply();
                            console.log("hidden modalMdata : ");
                            console.debug(scope.$parent.data);
                            console.log("whichDismiss : " + scope.$parent.data.whichDismiss);
                            if(scope.$parent.data.whichDismiss == "Accept"){
                                scope.$parent.onAcceptDestination();
                            }
                        });
                    }

                };
            });
            
            // DestWndSetupCtrl.self.scope = DestWndSetupCtrl.$scope;
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return DestWndSetupCtrl;
        }
        
        return { start: init,
                  isInitialized : DestWndSetupCtrl.prototype.isInitialized};

    });

}).call(this);
