/*global define */

(function () {
    "use strict";

    console.log('StompSetup setup');
    var areWeInitialized = false;
    define([
        'angular',
        'lib/AgoNewWindowConfig'
    ], function (angular, AgoNewWindowConfig) {
        console.log('StompSetupCtrl define');

        var selfdict = {
            'scope' : null,
            'mph' : null,
            'pusher' : null,
            'callbackFunction' : null,
            'isInitialized' : false,
            'PusherClient' : null,
            'userName' : ''
        },
            scopeDict = {};

        function StompSetupCtrl($scope, $modal, $rootScope){
            console.log("in StompSetupCtrl");
            $scope.privateChannelMashover = AgoNewWindowConfig.masherChannel();
            selfdict.scope = $scope;
            selfdict.scope.userName = selfdict.userName;
            selfdict.pusher = null;
            selfdict.isInitialized = areWeInitialized = false;
            scopeDict['rootScope'] = $rootScope;

            $scope.showDialog = selfdict.scope.showDialog = false;
            $scope.data = {
                privateChannelMashover :AgoNewWindowConfig.masherChannel(),
                prevChannel : 'mashchannel',
                userName : selfdict.userName,
                prevUserName : selfdict.userName,
                whichDismiss : "Cancel"
            };
            selfdict.userName = $scope.data.userName;

            $scope.preserveState = function(){
                console.log("preserveState");
                // $scope.data.whichDismiss = 'Cancel';
                $scope.data.prevChannel = $scope.data.privateChannelMashover.slice(0);
                console.log("preserve " + $scope.data.prevChannel + " from " + $scope.data.privateChannelMashover);
                $scope.data.prevChannel = $scope.data.userName.slice(0);
                console.log("preserve " + $scope.data.prevUserName + " from " + $scope.data.userName);
            };

            $scope.restoreState = function(){
                console.log("restoreState");
                // $scope.data.whichDismiss = 'Accept';
                console.log("restore " + $scope.data.privateChannelMashover + " from " + $scope.data.prevChannel);
                $scope.data.privateChannelMashover = $scope.data.prevChannel.slice(0);
                console.log("restore " + $scope.data.userName + " from " + $scope.data.prevChannel);
                $scope.data.userName = $scope.data.prevUserName.slice(0);
            };

            $scope.onAcceptChannel = function(){
                console.log("onAcceptChannel " + $scope.data.privateChannelMashover);
                selfdict.userName = $scope.data.userName;
                AgoNewWindowConfig.setChannel($scope.data.privateChannelMashover);
                AgoNewWindowConfig.setNameChannelAccepted(true);
                selfdict.pusher = selfdict.PusherClient(selfdict.eventDct,
                    $scope.data.privateChannelMashover,
                    $scope.data.userName,
                    selfdict.callbackFunction);
                selfdict.eventDct = selfdict.mph.getEventDictionary();
            };

            $scope.displayPusherDialog = function(){
                // selfdict.scope.showModal(true);
                var $inj = angular.injector(['app']);
                var serv = $inj.get('CurrentMapTypeService');
                selfdict.mph = serv.getSelectedMapType();

                selfdict.eventDct = selfdict.mph.getEventDictionary();

                // selfdict.eventDct =
                        // {'client-MapXtntEvent' : selfdict.mph.retrievedBounds,
                        // 'client-MapClickEvent' : selfdict.mph.retrievedClick
                        // };

                selfdict.callbackFunction = null;
                scopeDict.rootScope.$broadcast('ShowChannelSelectorEvent');
                $scope.safeApply(function(){
                    selfdict.scope.showDialog = $scope.showDialog = true;
                });
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

        StompSetupCtrl.prototype.PusherClient = function(eventDct, channel, userName, cbfn)
        {
            console.log("PusherClient");
            this.eventDct = eventDct;
            var self = this;
            self.callbackfunction = cbfn;
            self.eventDct = eventDct;
            self.channel = channel;
            self.userName = userName;
            if(channel[0] == '/')
            {
                var chlength = channel.length;
                var channelsub = channel.substring(1);
                channelsub = channelsub.substring(0, chlength-2);
                channel = channelsub;
            }

            self.CHANNEL = channel.indexOf("private-channel-") > -1 ? channel : 'private-channel-' + channel;
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

            channelBind.bind('client-NewUrlEvent', function(frame)
            {
                console.log('frame is',frame);
                selfdict.eventDct['client-NewUrlEvent'](frame);
                console.log("back from NewUrlEvent");
            });

            channelBind.bind('client-NewMapPosition', function(frame)
            {
                console.log('frame is',frame);
                var $inj = angular.injector(['app']);
                var serv = $inj.get('StompEventHandlerService');
                var handler = serv.getHandler('client-NewMapPosition');
                handler(frame);
                // selfdict.eventDct['client-NewMapPosition'](frame);
                console.log("back from NewMapPosition Event");
            });

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
                console.log('Successfully subscribed to "' + self.CHANNEL); // + 'r"');
            });


            var $inj = angular.injector(['app']);
            var serv = $inj.get('CurrentMapTypeService');
            selfdict.mph = serv.getSelectedMapType();

            var allMapTypes = serv.getMapTypes();
            var mptLength = allMapTypes.length;
            console.log("BEWARE OF SIDE EFFECTS");
            console.log("Attempt to setPusherClient for all defined map types");
            for(var i =0; i< mptLength; i++){
                if (typeof allMapTypes[i] != "undefined") {
                    console.log("set pusher client for hoster type:")
                    console.debug(allMapTypes[i]);
                    allMapTypes[i].setPusherClient(pusher, self.CHANNEL);
                    allMapTypes[i].setUserName(self.userName);
                }
            }

            console.log("CurrentMapTypeService got mph, call setPusherClient");
            selfdict.mph.setPusherClient(pusher, self.CHANNEL);
            selfdict.mph.setUserName(selfdict.userName);
            selfdict.eventDct = selfdict.mph.getEventDictionary();
            if(self.callbackfunction != null){
                self.callbackfunction(self.CHANNEL, selfdict.userName);
            }
            return pusher;
        };
        selfdict.PusherClient = StompSetupCtrl.prototype.PusherClient;

        StompSetupCtrl.prototype.setupPusherClient = function(eventDct, userName, cbfn)
        {
            selfdict.eventDct = eventDct;
            selfdict.userName = userName;
            selfdict.scope.userName = userName;
            selfdict.callbackFunction = cbfn;
            console.log("toggleShow from " + selfdict.scope.showDialog);
            scopeDict.rootScope.$broadcast('ShowChannelSelectorEvent');
            selfdict.scope.safeApply(function(){
                selfdict.scope.showDialog = ! selfdict.scope.showDialog;
            });
            console.log("toggleShow after apply " + selfdict.scope.showDialog);

            // selfdict.scope.PusherClient(eventDct, selfdict.scope.privateChannelMashover, cbfn);
        };


        StompSetupCtrl.prototype.createPusherClient = function(eventDct, pusherChannel, initName, cbfn)
        {
            console.log("StompSetupCtrl.createPusherClient");
            selfdict.eventDct = eventDct;
            selfdict.userName = initName;
            if(selfdict.scope){
                selfdict.scope.data.userName = initName;
            }
            selfdict.callbackFunction = cbfn;
            selfdict.pusher = StompSetupCtrl.prototype.PusherClient(
                eventDct, pusherChannel, initName, cbfn);
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
                console.log("setting up directive modalShowPusher");
                var tpl = ' \
                  <div class="modal-dialog", style="width: 100%;"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                      </div> \
                      <div class="modal-body"> \
                        <h3>Create a Pusher Channel ID :</h3> \
                        <input type="text" name="input" ng-model="$parent.data.privateChannelMashover", ng-init="$parent.data.privateChannelMashover"> \
                        <div>channel name : {{$parent.data.privateChannelMashover}}</div> \
                        <h3>Enter a User Name :</h3> \
                        <input type="text" name="input" ng-model="$parent.data.userName", ng-init="$parent.data.userName"> \
                        <div style="color: #17244D; margin-top: 10px;">USER NAME : {{$parent.data.userName}}</div> \
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
                                localScope.$parent.data.userName = selfdict.userName;
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

                            scope.$watch("data.userName", function (newValue, oldValue)
                            {
                                if( ! angular.isUndefinedOrNull(newValue)){
                                    localScope.$parent.data.userName = newValue;
                                }
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
