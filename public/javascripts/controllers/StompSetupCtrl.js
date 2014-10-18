

(function() {
    "use strict";

    console.log('StompSetup setup');
    var areWeInitialized = false;
    define([
        'angular'
    ], function(angular) {
        console.log('StompSetupCtrl define');  
        
        var selfdict = {};
        selfdict.isInitialized = areWeInitialized = false;
        var scopeDict = {};

        function StompSetupCtrl($scope, $modal, $rootScope){
            console.log("in StompSetupCtrl");
            $scope.privateChannelMashover = 'private-channel-mashover';
            selfdict.scope = $scope;
            selfdict.pusher = null;
            selfdict.isInitialized = areWeInitialized = false;
            scopeDict['rootScope'] = $rootScope;
        
            // selfdict.scope = null;
            // selfdict.mph = null;
            // selfdict.callbackFunction = null;
            $scope.showDialog = selfdict.scope.showDialog = false;
            $scope.data = {
                privateChannelMashover : 'private-channel-mashover',
                prevChannel : 'private-channel-mashover',
                whichDismiss : "Cancel"
            };
                     
            $scope.preserveState = function(){
                console.log("preserveState");
                // $scope.data.whichDismiss = 'Cancel';
                $scope.data.prevChannel = $scope.data.privateChannelMashover.slice(0);
                console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.privateChannelMashover);
            };

            $scope.restoreState = function(){
                console.log("restoreState");
                // $scope.data.whichDismiss = 'Accept';
                console.log("restore " + $scope.data.privateChannelMashover + " from " + $scope.data.prevDstSel);
                $scope.data.privateChannelMashover = $scope.data.prevChannel.slice(0);
            };

            $scope.onAcceptChannel = function(){
                console.log("onAcceptChannel " + $scope.data.privateChannelMashover);
                selfdict.pusher = $scope.PusherClient(selfdict.eventDct, $scope.data.privateChannelMashover, 
                    selfdict.callbackFunction);
            };
            
            $scope.displayPusherDialog = function(){
                // selfdict.scope.showModal(true);
                var $inj = angular.injector(['app']);
                var serv = $inj.get('CurrentMapTypeService');
                selfdict.mph = serv.getSelectedMapType();
                
                selfdict.eventDct = 
                        {'client-MapXtntEvent' : selfdict.mph.retrievedBounds,
                        'client-MapClickEvent' : selfdict.mph.retrievedClick
                        };
                
                selfdict.callbackFunction = null;
                scopeDict.rootScope.$broadcast('ShowChannelSelectorEvent');
                $scope.safeApply(function(){
                    selfdict.scope.showDialog = $scope.showDialog = true;
                });
            };

            $scope.PusherClient = function(eventDct, channel, cbfn)
            {
                console.log("PusherClient");
                this.eventDct = eventDct;
                var self = this;
                self.callbackfunction = cbfn;
                self.eventDct = eventDct;
                self.channel = channel;
                if(channel[0] == '/')
                {
                    var chlength = channel.length;
                    var channelsub = channel.substring(1);
                    channelsub = channelsub.substring(0, chlength-2);
                    channel = channelsub;
                }
                self.CHANNEL = channel; //'/' + channel + '/';
                console.log("with channel " + self.CHANNEL);
                
                var pusher = new Pusher('5c6bad75dc0dd1cec1a6');
                pusher.connection.bind('state_change', function(state) {
                    if( state.current === 'connected' ) {
                        // alert("Yipee! We've connected!");
                        console.log("Yipee! We've connected!");
                        }
                    else {
                        // alert("Oh-Noooo!, my Pusher connection failed");
                        console.log("Oh-Noooo!, my Pusher connection failed");
                        }
                    });
                var channelBind = pusher.subscribe(self.CHANNEL);
                /* 
                channelBind.bind('client-MapXtntEvent', function(frame) 
                 {  // Executed when a messge is received
                     console.log('frame is',frame);
                     self.eventDct.retrievedBounds(frame);
                     console.log("back from boundsRetriever");
                 }
                );
                 */
                 
                 
                channelBind.bind('client-MapXtntEvent', function(frame) 
                {
                    console.log('frame is',frame);
                    selfdict.eventDct['client-MapXtntEvent'](frame);
                    console.log("back from boundsRetriever");
                });

                channelBind.bind('client-MapClickEvent', function(frame) 
                {
                    console.log('frame is',frame);
                    selfdict.eventDct['client-MapClickEvent'](frame);
                    console.log("back from clickRetriever");
                });
                
                channelBind.bind('pusher:subscription_error', function(statusCode) {
                    //alert('Problem subscribing to "private-channel": ' + statusCode);
                    console.log('Problem subscribing to "private-channel": ' + statusCode);
                });
                channelBind.bind('pusher:subscription_succeeded', function() {
                    console.log('Successfully subscribed to "private-channel"');
                });
                          

                var $inj = angular.injector(['app']);
                var serv = $inj.get('CurrentMapTypeService');
                selfdict.mph = serv.getSelectedMapType();
                                      
                console.log("CurrentMapTypeService got mph, call setPusherClient");
                selfdict.mph.setPusherClient(pusher, self.CHANNEL);
                if(self.callbackfunction != null){
                    self.callbackfunction(self.CHANNEL);
                }
                return pusher;
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
          
        StompSetupCtrl.prototype.isInitialized = function(){
            return areWeInitialized;
        }
        
        StompSetupCtrl.prototype.setupPusherClient = function(eventDct, cbfn)
        {
            selfdict.eventDct = eventDct;
            selfdict.callbackFunction = cbfn;
            console.log("toggleShow from " + selfdict.scope.showDialog);
            scopeDict.rootScope.$broadcast('ShowChannelSelectorEvent');
            selfdict.scope.safeApply(function(){
                selfdict.scope.showDialog = ! selfdict.scope.showDialog;
            });
            console.log("toggleShow after apply " + selfdict.scope.showDialog);
            
            // selfdict.scope.PusherClient(eventDct, selfdict.scope.privateChannelMashover, cbfn);
        };
          
        
        StompSetupCtrl.prototype.createPusherClient = function(eventDct, pusherChannel, cbfn)
        {
            selfdict.eventDct = eventDct;
            selfdict.callbackFunction = cbfn;
            selfdict.pusher = selfdict.scope.PusherClient(eventDct, pusherChannel, cbfn);
            return selfdict.pusher;
        };
                
            //selfdict.setupPusherClient = $scope.setupPusherClient;
        
        function init(App) {
            console.log('StompSetup init');
            // alert("areWeInitialized ?");
            // alert(areWeInitialized);
            // if(areWeInitialized == true){
                // alert("quick bailout");
                // return;
            // }
            selfdict.isInitialized = areWeInitialized = true;
            App.controller('StompSetupCtrl',  ['$scope', '$modal', '$rootScope', StompSetupCtrl]);
            
            App.directive("modalShowPusher", function () {
                var tpl = ' \
                  <div class="modal-dialog", style="width: 100%;"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                        <h3>Create a Pusher Channel ID :</h3> \
                      </div> \
                      <div class="modal-body"> \
                        <input type="text" name="input" ng-model="data.privateChannelMashover", ng-init="data.privateChannelMashover=\'private-channel-mashover\'"> \
                        <div>channel name : {{data.privateChannelMashover}}</div> \
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
                        modalPdata: "="
                    },
                    link: function (scope, element, attrs) {
                        var localScope = scope;
                        //Hide or show the modal
                        scope.showModal = function (visible, elem) {
                            if (!elem){
                                elem = element;
                                console.log("elem is now :");
                                console.debug(elem);
                                console.log("how about $(elem)?");
                                var delem = $(elem);
                                console.debug(delem);
                            }
                            if (visible){
                                $(elem).modal311("show");                     
                            }
                            else{
                                $(elem).modal311("hide");
                            }
                        };
                        
                        scope.$on('ShowChannelSelectorEvent', function() {
                            scope.showModal(true);
                        });
                            
                        selfdict.scope.showModal = scope.showModal;

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
                            scope.$watch("modalPdata", function (newValue, oldValue) {
                                if( ! angular.isUndefinedOrNull(newValue)){
                                  localScope.$parent.data = newValue;
                                }
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("data.privateChannelMashover", function (newValue, oldValue) 
                            {
                                if( ! angular.isUndefinedOrNull(newValue)){
                                    localScope.$parent.data.privateChannelMashover = newValue;
                                }
                                // console.log("watch modalMdata scope.$parent data  : ");
                                // console.debug(localScope.$parent.data);
                            });
                            
                            scope.$watch('scope.$parent.selfdict.scope.showDialog', function (newValue, oldValue) {
                                console.log("scope.$watch newValue : " + newValue);
                                console.log("scope.$watch 'scope.$parent.showDialog' : " + scope.$parent.showDialog);
                                scope.showModal(newValue);
                                //attrs.modalVisible = false;
                            });
                            

                        }
                        //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                        $(element).on('hidden.bs.modal', function () {
                            scope.modalVisible = localScope.$parent.showDialog = false;
                            console.log("hide event called");
                            if (!scope.$$phase && !scope.$root.$$phase){
                                scope.$apply();
                            }
                            scope.$apply();
                            console.log("hidden modalMdata : ");
                            console.debug(scope.$parent.data);
                            console.log("whichDismiss : " + scope.$parent.data.whichDismiss);
                            if(scope.$parent.data.whichDismiss == "Accept"){
                                scope.$parent.onAcceptChannel();
                            }
                        });
                        
                    }

                };
            });
            
            // StompSetupCtrl.self.scope = StompSetupCtrl.$scope;
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return StompSetupCtrl;
        }
        
        return { start: init, setupPusherClient : StompSetupCtrl.prototype.setupPusherClient,
                  createPusherClient : StompSetupCtrl.prototype.createPusherClient,
                  isInitialized : StompSetupCtrl.prototype.isInitialized};

    });

}).call(this);
