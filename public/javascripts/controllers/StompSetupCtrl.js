


var StompModalInstanceCtrl = function ($scope, $modalInstance) {

  $scope.privateChannelMashover = 'private-channel-mashover';
  
  $scope.acceptStomperChannel = function () {
    console.log('StompModalInstanceCtrl callback : ' + $scope.privateChannelMashover);
    $modalInstance.close($scope.privateChannelMashover);
  };
  
  $scope.cancelStomperChannel = function () {
    console.log('StompModalInstanceCtrl callback : ' + $scope.privateChannelMashover);
    $modalInstance.close($scope.privateChannelMashover);
  };
};

(function() {
    "use strict";

    console.log('StompSetup setup');
    define([
        'angular',
        'lib/MapHosterArcGIS'
    ], function(angular, MapHosterArcGIS) {
        console.log('StompSetupCtrl define');  
        var selfdict = {};
        selfdict.scope = null;
        
        function StompSetupCtrl($scope, $modal){
            console.log("in StompSetupCtrl");
            $scope.privateChannelMashover = 'private-channel-mashover';
            selfdict.scope = $scope;
        

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
            var dlg = document.getElementById('StompChannelerDialog');
            self.scope = angular.element(dlg).scope();
            
            self.scope.pusherChannelSelectorDialog(function() {
                            console.log('You selected a channel name');
                            console.debug(self.scope.privateChannelMashover);
                            PusherClient(mapholder, self.scope.privateChannelMashover, cbfn);
                        }); 
        };
        
        function init(App) {
            console.log('StompSetup init');
            App.controller('StompSetupCtrl',  ['$scope', '$modal', StompSetupCtrl]);
            selfdict.setupPusherClient = StompSetupCtrl.setupPusherClient;
            
            // StompSetupCtrl.self.scope = StompSetupCtrl.$scope;
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return StompSetupCtrl;
        }
        
        return { start: init, setupPusherClient : StompSetupCtrl.prototype.setupPusherClient };

    });

}).call(this);
