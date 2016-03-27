
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

            $scope.destSelections = ["Same Window", "New Tab", "New Pop-up Window"];
            $scope.selected = "Same Window";
            $scope.data = {
                dstSel : $scope.destSelections[0].slice(0),
                prevDstSel : $scope.destSelections[0].slice(0),
                title : 'map has no title',
                icon : null,
                snippet : 'nothing in snippet',
                mapType : $scope.currentTab.maptype,
                imgSrc : $scope.currentTab.imgSrc,
                dstSel : $scope.destSelections[0].slice(0),
                destSelections : $scope.destSelections,
                query : "no query yet"
            };

            $scope.preserveState = function () {
                console.log("preserveState");

                $scope.data.prevDstSel = $scope.data.dstSel.slice(0);
                console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.dstSel);
            };

            $scope.restoreState = function () {
                console.log("restoreState");

                console.log("restore " + $scope.data.dstSel + " from " + $scope.data.prevDstSel);
                $scope.data.dstSel = $scope.data.prevDstSel.slice(0);
            };
            $scope.updateState = function (selectedDestination) {
                console.log("updateState");
                $scope.selected = selectedDestination;
                $scope.data.dstSel = $scope.data.prevDstSel = selectedDestination;
            }

            $scope.showDestDialog = function (callback, details) {
                console.log("showDestDialog for currentTab " + $scope.currentTab.title);
                $scope.preserveState();
//                var hostElement = $document.find('mashbox').eq(0);
                // $scope.$broadcast('ShowWebSiteDescriptionModalEvent');

                $scope.data.title = details.title;
                $scope.data.icon = details.icon;
                $scope.data.mapType = details.mapType;
                $scope.data.snippet = details.snippet;
                $scope.data.callback = callback;

                var modalInstance = $uibModal.open({
                    templateUrl : '/templates/DestSelectDlgGen',   // .jade will be appended
                    controller : 'DestWndSetupCtrl',
                    // size : 'sm',
                    backdrop : 'false',
//                        appendTo : hostElement,
                    resolve : {
                        data: function () {
                            return $scope.data;
                        }
                    }
                });

                modalInstance.result.then(function (selectedDestination) {
                    $scope.updateState(selectedDestination);
                    // $scope.showMeTheMapClicked();
                    $scope.data.callback(
                        {dstWnd : selectedDestination, selMph : $scope.data.mapType});
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                    $scope.restoreState();
                });

            };

            $scope.showPusherSetupDialog = function () {
                console.log("showPusherSetupDialog from VerbageCtrl");

                $scope.data.mapType = $scope.currentTab.maptype;
                $scope.data.imgSrc = $scope.currentTab.imgSrc;

                var tmplt = ' \
                  <div class="modal-dialog", style="width: 100%;"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                      </div> \
                      <div class="modal-body"> \
                        <h3>Create a Pusher Channel ID :</h3> \
                        <input type="text" name="input" ng-model="data.privateChannelMashover", ng-init="data.privateChannelMashover"> \
                        <div>channel name : {{data.privateChannelMashover}}</div> \
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
