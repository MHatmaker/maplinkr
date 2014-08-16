

(function() {
    "use strict";

    console.log('StompSetup setup');
    define([
        'angular',
        'lib/MapHosterArcGIS'
    ], function(angular, MapHosterArcGIS) {
        console.log('SearcherCtrlMap define');  
        
        function StompSetupCtrl($scope, $modal){
            $scope.privateChannelMashover = 'private-channel-mashover';
        
        }
        
        function setupPusherClient(mapholder, cbfn)
        {
            $scope.pusherChannelSelectorDialog(function() {
                            console.log('You selected a channel name');
                            var channelTextBox = dojo.byId('channelName');
                            console.debug(channelTextBox.value);
                            channel = (channelTextBox.value);
                            PusherClient(mapholder, channel, cbfn);
                        });
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
            var channel = pusher.subscribe(this.CHANNEL);
            channel.bind('client-MapXtntEvent', function(frame) 
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
            if(self.callbackfunction)
                self.callbackfunction(self.CHANNEL);
        }
        
        $scope.pusherChannelSelectorDialog = function(onAcceptChannelName)
        {
            require(["dijit/Dialog", "dijit/form/Button"]);
            dojo.byId('idDialogButtonAcceptChannel').onclick  = onAcceptChannelName;
            dojo.byId('channelName').onkeypress = function(e) {
                    if(e.which == 13) {
                        StompChannelerDialog.hide();
                        onAcceptChannelName();
                    }
                };

            var p = dijit.byId('StompChannelerDialog');
            StompChannelerDialog.show();
        }
        
        $scope.hitEnter = function(evt){
            if(angular.equals(evt.keyCode,13) && !(angular.equals($scope.name,null) || angular.equals($scope.name,'')))
                    $scope.save();
        }; // end hitEnter
          
        }  
        
        function init(App) {
            console.log('StompSetup init');
            App.controller('StompSetupCtrl',  ['$scope', '$modal', StompSetupCtrl]);
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return StompSetupCtrl;
        }
        
        return { start: init, setupPusherClient : setupPusherClient };

    });

}).call(this);
