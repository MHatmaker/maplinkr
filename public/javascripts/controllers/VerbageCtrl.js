
// <<<<<<<<<<<<<<<<<   http://plnkr.co/edit/V5alqOODGmnLbKiK2YY7?p=preview  >>>>>>>>>>>>>>>>>>
/*global define */


(function () {
    "use strict";

    console.log('VerbageCtrl setup');
    define(['angular',
        'controllers/PusherCtrl'
        ], function (angular) {
        console.log('VerbageCtrl define');

        function VerbageCtrl($scope, $uibModal) {
            console.debug('VerbageCtrl - initialize collapsed bool');
            // alert('VerbageCtrl - initialize some tabs');
            $scope.VerbVis = "none";
            console.log("init with isVerbageCollapsed = " + $scope.isVerbageCollapsed);
            // $scope.isGroupSearchOpen = false;
            // $scope.isMapSearchOpen = false;
            $scope.oneAtATime = true;


            $scope.$on('CollapseVerbageEvent', function (event, args) {
                $scope.VerbVis = args.verbage;
            });
            $scope.$on('SignInOutEmitEvent', function (event, args) {
                $scope.$broadcast('SignInOutBroadcastEvent', args);
            });
            $scope.$on('OpenMapPaneEvent', function (event, args) {
                $scope.status.isGroupSearchOpen = !$scope.status.isGroupSearchOpen;
                $scope.status.isMapSearchOpen = !$scope.status.isMapSearchOpen;
                $scope.$broadcast('OpenMapPaneCommand', args);  // ? args.respData);
            });
            $scope.status = {
                isNewsOpen: false,
                isInstructionsOpen: false,
                isSameWindowPaneOpen: false,
                isNewTabPaneOpen: false,
                isNewWindowPaneOpen: false,
                isGroupSearchOpen: false,
                isMapSearchOpen: false,
                isSharingInstructionsOpen: false,
                isCopyMapLinkOpen: false,
                isSetChannelOpen: false,
                isUrlTransmitterOpen: false,
                isPositionViewCtrlOpen: false
            };

            $scope.showPusherSetupDialog = function () {
                console.log("showPusherSetupDialog from VerbageCtrl");

                $scope.data.selfdict.mapType = $scope.currentTab.maptype; //.slice(1);
                $scope.data.selfdict.imgSrc = $scope.currentTab.imgSrc;

                var tmplt = ' \
                  <div class="modal-dialog", style="width: 100%;"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                      </div> \
                      <div class="modal-body"> \
                        <h3>Create a Pusher Channel ID :</h3> \
                        <input type="text" name="input" ng-model="data.privateChannelMashover", ng-init="data.privateChannelMashover"> \
                        <div>channel name : {{$parent.data.privateChannelMashover}}</div> \
                        <h3>Enter a User Name :</h3> \
                        <input type="text" name="input" ng-model="data.userName", ng-init="data.userName"> \
                        <div style="color: #17244D; margin-top: 10px;">USER NAME : {{data.userName}}</div> \
                      <div class="modal-footer"> \
                        <button type="button" class="btn btn-primary" ng-click="accept()">Accept</button> \
                        <button type="button" class="btn btn-primary" ng-click="cancel()">Cancel</button> \
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

                }, function () {
                    console.log('Pusher Modal dismissed at: ' + new Date());
                });

            };
        }

        function init(App) {
            console.log('VerbageCtrl init');
            App.controller('VerbageCtrl', ['$scope', '$uibModal', VerbageCtrl]);
            return VerbageCtrl;
        }


        return { start: init };

    });

}());
