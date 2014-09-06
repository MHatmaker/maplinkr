

(function() {
    "use strict";

    console.log('StompSetup setup');
    define([
        'angular',
        'lib/MapHosterArcGIS'
    ], function(angular, MapHosterArcGIS) {
        console.log('StompSetupCtrl define');  

        function StompSetupCtrl($scope, $modal){
            console.log("in StompSetupCtrl");
            $scope.privateChannelMashover = 'private-channel-mashover';
            selfdict.scope = $scope;
        
            var selfdict = {};
            selfdict.scope = null;
            selfdict.mph = null;
            selfdict.callbackFunction = null;
            $scope.showDialog = false;
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

            $scope.onAcceptDestination = function(){
                console.log("onAcceptDestination " + $scope.data.privateChannelMashover);
                $scope.PusherClien($scope.data.privateChannelMashover, selfdict.callbackFunction);
            };

            $scope.PusherClient = function(mapholder, channel, cbfn)
            {
                console.log("PusherClient");
                this.mapHolder = mapholder;
                var self = this;
                self.callbackfunction = cbfn;
                if(channel[0] == '/')
                {
                    var chlength = channel.length;
                    var channelsub = channel.substring(1);
                    channelsub = channelsub.substring(0, chlength-2);
                    channel = channelsub;
                }
                this.CHANNEL = channel; //'/' + channel + '/';
                console.log("with channel " + this.CHANNEL);
                
                var pusher = new Pusher('5c6bad75dc0dd1cec1a6');
                pusher.connection.bind('state_change', function(state) {
                    if( state.current === 'connected' ) {
                        // alert("Yipee! We've connected!");
                        console.log("Yipee! We've connected!");
                        }
                    else {
                        alert("Oh-Oh, connection failed");
                        }
                    });
                var channelBind = pusher.subscribe(this.CHANNEL);
                channelBind.bind('client-MapXtntEvent', function(frame) 
                 {  // Executed when a messge is received
                     console.log('frame is',frame);
                     self.mapHolder.retrievedBounds(frame);
                     console.log("back from boundsRetriever");
                 }
                );
                
                channel.bind('pusher:subscription_error', function(statusCode) {
                    alert('Problem subscribing to "private-channel": ' + statusCode);
                });
                channel.bind('pusher:subscription_succeeded', function() {
                    console.log('Successfully subscribed to "private-channel"');
                });
                            
                self.mapHolder.setPusherClient(pusher, self.CHANNEL);
                if(self.callbackfunction){
                    self.callbackfunction(self.CHANNEL);
                }
            };
            
            $scope.pusherChannelSelectorDialog = function(onAcceptChannelName)
            {
               /*  require(["dijit/Dialog", "dijit/form/Button"]);
                dojo.byId('idDialogButtonAcceptChannel').onclick  = onAcceptChannelName;
                dojo.byId('channelName').onkeypress = function(e) {
                        if(e.which == 13) {
                            StompChannelerDialog.hide();
                            onAcceptChannelName();
                        }
                    };

                var p = dijit.byId('StompChannelerDialog'); */
                // var dlg = document.getElementById('StompChannelerModal');
                // dlg.modal({show:true});
                // var dlg = angular.element('#StompChannelerModal');
                var dlg = $('#StompChannelerModal');
                dlg.modal({show:true})
            };
            
            $scope.hitEnter = function(evt){
                if(angular.equals(evt.keyCode,13) && !(angular.equals($scope.name,null) || angular.equals($scope.name,''))){
                    $scope.save();
                }
            }; // end hitEnter
            
            $scope.setupPusherClientX = function(mapholder, cbfn)
            {
                var dlg = document.getElementById('StompChannelerDialog');
                self.scope = angular.element(dlg).scope();
                self.scope.pusherChannelSelectorDialog(function() {
                                console.log('You selected a channel name');
                                var channelTextBox = dojo.byId('channelName');
                                console.debug(channelTextBox.value);
                                channel = (channelTextBox.value);
                                PusherClient(mapholder, channel, cbfn);
                            });
            };
            selfdict.setupPusherClient = $scope.setupPusherClient;
          
        }  
        
        StompSetupCtrl.prototype.setupPusherClient = function(mapholder, cbfn, $scope)
        {
            selfdict.mph = mapholder;{
            selfdict.callbackFunction = cbfn;
            console.log("toggleShow from " + $scope.showDialog);
            $scope.safeApply(function(){
                $scope.showDialog = ! $scope.showDialog;
            });
            console.log("toggleShow after apply " + $scope.showDialog);
            
            self.scope.pusherChannelSelectorDialog(function() {
                            console.log('You selected a channel name');
                            console.debug(self.scope.privateChannelMashover);
                            PusherClient(mapholder, self.scope.privateChannelMashover, cbfn);
                        }); 
        };
        
        function init(App) {
            console.log('StompSetup init');
            App.controller('StompSetupCtrl',  ['$scope', '$modal', StompSetupCtrl]);
            
            App.directive("modalShow", function () {
                var tpl = ' \
                  <div class="modal-dialog", style="width: 100%;"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                        <h3>Create a Pusher Channel ID :</h3> \
                      </div> \
                      <div class="modal-body"> \
                        <input type="text" name="input" ng-model="data.privateChannelMashover"> \
                        <div>selected: {{data.privateChannelMashover}}</div> \
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
                            scope.$watch("modalPdata", function (newValue, oldValue) {
                                if( ! angular.isUndefinedOrNull(newValue))
                                  localScope.$parent.data = newValue;
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("data.privateChannelMashover", function (newValue, oldValue) {
                                if( ! angular.isUndefinedOrNull(newValue))
                                  localScope.$parent.data.privateChannelMashover = newValue;
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
            
            // StompSetupCtrl.self.scope = StompSetupCtrl.$scope;
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return StompSetupCtrl;
        }
        
        return { start: init, setupPusherClient : StompSetupCtrl.prototype.setupPusherClient };

    });

}).call(this);
