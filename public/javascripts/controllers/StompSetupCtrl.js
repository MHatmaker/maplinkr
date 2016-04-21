/*global define */
/*global Pusher */
/*jslint es5: true */

(function () {
    "use strict";

    console.log('StompSetup setup');
    var areWeInitialized = false,
        areWeInstantiated = false;
    define([
        'angular',
        'lib/AgoNewWindowConfig',
        'controllers/PusherCtrl'
    ], function (angular, AgoNewWindowConfig, pusherCtrl) {
        console.log('StompSetupCtrl define');

        var selfdict = {
            'scope' : null,
            'mph' : null,
            'pusher' : null,
            'callbackFunction' : null,
            'isInitialized' : false,
            'PusherClient' : null,
            'userName' : '',
            'isInstantiated' : false
        },
            $inj,
            serv,
            allMapTypes,
            mptLength;

        function StompSetupCtrl($scope, $uibModal) {
            console.log("in StompSetupCtrl");
            selfdict.isInstantiated = areWeInitialized = true;
            $scope.privateChannelMashover = AgoNewWindowConfig.masherChannel();
            selfdict.scope = $scope;
            selfdict.scope.userName = selfdict.userName;
            selfdict.pusher = null;
            selfdict.isInitialized = areWeInitialized = false;


            $scope.showDialog = selfdict.scope.showDialog = false;
            $scope.data = {
                privateChannelMashover : AgoNewWindowConfig.masherChannel(),
                prevChannel : 'mashchannel',
                userName : selfdict.userName,
                prevUserName : selfdict.userName,
                whichDismiss : "Cancel"
            };
            selfdict.userName = $scope.data.userName;

            $scope.preserveState = function () {
                console.log("preserveState");
                // $scope.data.whichDismiss = 'Cancel';
                $scope.data.prevChannel = $scope.data.privateChannelMashover;
                console.log("preserve " + $scope.data.prevChannel + " from " + $scope.data.privateChannelMashover);
                $scope.data.prevChannel = $scope.data.userName;
                console.log("preserve " + $scope.data.prevUserName + " from " + $scope.data.userName);
            };

            $scope.restoreState = function () {
                console.log("restoreState");
                // $scope.data.whichDismiss = 'Accept';
                console.log("restore " + $scope.data.privateChannelMashover + " from " + $scope.data.prevChannel);
                $scope.data.privateChannelMashover = $scope.data.prevChannel;
                console.log("restore " + $scope.data.userName + " from " + $scope.data.prevChannel);
                $scope.data.userName = $scope.data.prevUserName;
            };

            $scope.onAcceptChannel = function () {
                console.log("onAcceptChannel " + $scope.data.privateChannelMashover);
                selfdict.userName = $scope.data.userName;
                self.CHANNEL = $scope.data.privateChannelMashover;
                AgoNewWindowConfig.setChannel($scope.data.privateChannelMashover);
                AgoNewWindowConfig.setNameChannelAccepted(true);
                selfdict.pusher = selfdict.PusherClient(selfdict.eventDct,
                    $scope.data.privateChannelMashover,
                    $scope.data.userName,
                    selfdict.callbackFunction);
                selfdict.eventDct = selfdict.mph.getEventDictionary();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.displayPusherDialog = function () {
                // selfdict.scope.showModal(true);
                console.log("displayPusherDialog");
                var tmplt = ' \
                  <div class="modal-dialog", style="width: 100%;"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                          <button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="cancel()">&times;</button> \
                          <h4>Sharing Setup</h4> \
                      </div> \
                      <div class="modal-body"> \
                        <h4>Create a Pusher Channel ID :</h4> \
                        <input type="text" name="input" ng-model="data.privateChannelMashover" ng-init="data.privateChannelMashover" style="width: 100%"> \
                        <div>channel name : {{data.privateChannelMashover}}</div> \
                        <h4>Enter a User Name :</h4> \
                        <input type="text" name="input" ng-model="data.userName", ng-init="data.userName" style="width: 100%"> \
                        <div style="color: #17244D; margin-top: 10px;">USER NAME : {{data.userName}}</div> \
                      <div class="modal-footer"> \
                        <button type="button" class="btn btn-primary" ng-click="accept()">Accept</button> \
                        <button type="button" class="btn btn-secondary" ng-click="cancel()">Cancel</button> \
                      </div> \
                    </div><!-- /.modal-content --> \
                  </div><!-- /.modal-dialog --> \
                ',
                    modalInstance = $uibModal.open({
                        template : tmplt,
                        controller : 'PusherCtrl',
                        size : 'sm',
                        backdrop : 'false',
//                        appendTo : hostElement,
                        resolve : {
                            data: function () {
                                return $scope.data;
                            }
                        }
                    });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                    selfdict.scope.data.userName = selectedItem.userName;
                    selfdict.scope.data.privateChannelMashover = selectedItem.privateChannelMashover;
                    selfdict.scope.onAcceptChannel();
                }, function () {
                    console.log('Pusher Modal dismissed at: ' + new Date());
                });

                $inj = angular.injector(['app']);
                serv = $inj.get('CurrentMapTypeService');
                selfdict.mph = serv.getSelectedMapType();

                selfdict.eventDct = selfdict.mph.getEventDictionary();

            };

            $scope.hitEnter = function (evt) {
                if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.name, null) || angular.equals($scope.name, ''))) {
                    $scope.save();
                }
            }; // end hitEnter

            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof fn === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };
        }

        StompSetupCtrl.prototype.isInitialized = function () {
            return areWeInitialized;
        };

        StompSetupCtrl.prototype.isInstantiated = function () {
            return areWeInstantiated;
        };

        StompSetupCtrl.prototype.PusherClient = function (eventDct, channel, userName, cbfn) {
            var pusher,
                channelBind,
                self = this,
                handler,
                i,
                chlength = channel.length,
                channelsub = channel.substring(1),
                maptypekey,
                maptypeobj;
            console.log("PusherClient");
            this.eventDct = eventDct;

            self.callbackfunction = cbfn;
            self.eventDct = eventDct;
            self.channel = channel;
            self.userName = userName;
            if (channel[0] === '/') {
                chlength = channel.length;
                channelsub = channel.substring(1);
                channelsub = channelsub.substring(0, chlength - 2);
                channel = channelsub;
            }

            self.CHANNEL = channel.indexOf("private-channel-") > -1 ? channel : 'private-channel-' + channel;
            console.log("with channel " + self.CHANNEL);

            pusher = new Pusher('5c6bad75dc0dd1cec1a6');
            pusher.connection.bind('state_change', function (state) {
                if (state.current === 'connected') {
                    // alert("Yipee! We've connected!");
                    console.log("Yipee! We've connected!");
                } else {
                    // alert("Oh-Noooo!, my Pusher connection failed");
                    console.log("Oh-Noooo!, my Pusher connection failed");
                }
            });
            channelBind = pusher.subscribe(self.CHANNEL);

            /*
            channelBind.bind('client-MapXtntEvent', function (frame)
             {  // Executed when a messge is received
                 console.log('frame is',frame);
                 self.eventDct.retrievedBounds(frame);
                 console.log("back from boundsRetriever");
             }
            );
             */

            channelBind.bind('client-NewUrlEvent', function (frame) {
                console.log('frame is', frame);
                selfdict.eventDct['client-NewUrlEvent'](frame);
                console.log("back from NewUrlEvent");
            });

            channelBind.bind('client-NewMapPosition', function (frame) {
                console.log('frame is', frame);
                $inj = angular.injector(['app']);
                serv = $inj.get('StompEventHandlerService');
                handler = serv.getHandler('client-NewMapPosition');
                handler(frame);
                // selfdict.eventDct['client-NewMapPosition'](frame);
                console.log("back from NewMapPosition Event");
            });

            channelBind.bind('client-MapXtntEvent', function (frame) {
                console.log('frame is', frame);
                selfdict.eventDct['client-MapXtntEvent'](frame);
                console.log("back from boundsRetriever");
            });

            channelBind.bind('client-MapClickEvent', function (frame) {
                console.log('frame is', frame);
                selfdict.eventDct['client-MapClickEvent'](frame);
                console.log("back from clickRetriever");
            });

            channelBind.bind('pusher:subscription_error', function (statusCode) {
                //alert('Problem subscribing to "private-channel": ' + statusCode);
                console.log('Problem subscribing to "private-channel": ' + statusCode);
            });
            channelBind.bind('pusher:subscription_succeeded', function () {
                console.log('Successfully subscribed to "' + self.CHANNEL); // + 'r"');
            });


            $inj = angular.injector(['app']);
            serv = $inj.get('CurrentMapTypeService');
            selfdict.mph = serv.getSelectedMapType();

            allMapTypes = serv.getMapTypes();
            mptLength = allMapTypes.length;

            console.log("BEWARE OF SIDE EFFECTS");
            console.log("Attempt to setPusherClient for all defined map types");
            for (i = 0; i < mptLength; i++) {
                maptypekey = allMapTypes[i].type;
                maptypeobj = allMapTypes[i].mph;
                console.log("set pusher client for hoster type: " + maptypekey);
                if (maptypeobj && maptypeobj !== "undefined") {
                    maptypeobj.setPusherClient(pusher, self.CHANNEL);
                    maptypeobj.setUserName(self.userName);
                }
            }

            console.log("CurrentMapTypeService got mph, call setPusherClient");
            selfdict.mph.setPusherClient(pusher, self.CHANNEL);
            selfdict.mph.setUserName(selfdict.userName);
            selfdict.eventDct = selfdict.mph.getEventDictionary();
            if (self.callbackfunction !== null) {
                self.callbackfunction(self.CHANNEL, selfdict.userName);
            }
            return pusher;
        };
        selfdict.PusherClient = StompSetupCtrl.prototype.PusherClient;

        StompSetupCtrl.prototype.setupPusherClient = function (eventDct, userName, scope, cbfn) {
            selfdict.eventDct = eventDct;
            selfdict.userName = userName;
            selfdict.scope = scope;
            selfdict.scope.userName = userName;
            selfdict.callbackFunction = cbfn;
            selfdict.scope.displayPusherDialog();
        };


        StompSetupCtrl.prototype.createPusherClient = function (eventDct, pusherChannel, initName, cbfn) {
            console.log("StompSetupCtrl.createPusherClient");
            selfdict.eventDct = eventDct;
            selfdict.userName = initName;
            if (selfdict.scope) {
                selfdict.scope.data.userName = initName;
            }
            selfdict.callbackFunction = cbfn;
            selfdict.pusher = StompSetupCtrl.prototype.PusherClient(eventDct, pusherChannel, initName, cbfn);
            return selfdict.pusher;
        };

            //selfdict.setupPusherClient = $scope.setupPusherClient;

        function init(App) {
            console.log('StompSetup init');
            // alert("areWeInitialized ?");
            // alert(areWeInitialized);
            // if (areWeInitialized == true) {
                // alert("quick bailout");
                // return;
            // }
            selfdict.isInitialized = areWeInitialized = true;
            App.controller('StompSetupCtrl',  ['$scope', '$uibModal', StompSetupCtrl]);

            // StompSetupCtrl.self.scope = StompSetupCtrl.$scope;
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return StompSetupCtrl;
        }

        return { start: init, setupPusherClient : StompSetupCtrl.prototype.setupPusherClient,
                  createPusherClient : StompSetupCtrl.prototype.createPusherClient,
                  isInitialized : StompSetupCtrl.prototype.isInitialized,
                  isInstantiated : StompSetupCtrl.prototype.isInstantiated};

    });

}());

// }).call(this);
