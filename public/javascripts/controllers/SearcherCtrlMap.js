


// var ModalInstanceCtrl = function ($scope, $modalInstance, selected) {
var ModalInstanceCtrl = function ($scope, $modalInstance) {

  $scope.selected = {
    // item: selected || "cancelMashOp"
    item: "cancelMashOp"
  };
  
  $scope.sameWindow = function () {
    $scope.selected.item = $scope.destWindow = "sameWindowOp";
    console.log('ModalInstanceCtrl callback : ' + $scope.destWindow);
    $modalInstance.close($scope.selected.item);
  };
  
  $scope.newWindow = function () {
    $scope.selected.item = $scope.destWindow = "newWindowOp";
    console.log('ModalInstanceCtrl callback : ' + $scope.destWindow);
    $modalInstance.close($scope.selected.item);
  };
  
  $scope.newTab = function () {
    $scope.selected.item = $scope.destWindow = "newTabOp";
    console.log('ModalInstanceCtrl callback : ' + $scope.destWindow);
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancelMash = function () {
    $scope.selected.item = $scope.destWindow = "cancelMashOp";
    $modalInstance.dismiss('cancelMashOp');
  };
};

(function() {
    "use strict";

    console.log('SearcherCtrlMap setup');
    define([
        'angular',
        'lib/StartupArcGIS'
    ], function(angular, StartupArcGIS) {
        console.log('SearcherCtrlMap define');
        
        // function SearcherCtrlMap($scope, $modal311) {
        function SearcherCtrlMap($scope) {
            // console.log("debug $modal");
            // console.debug($modal311);
            $scope.findMapDisabled = false;
            $scope.searchTermMap = "Chicago Crime";
            
            $scope.isMapAccPanelOpen = false;
            $scope.signInOutMap = "Sign In";
            $scope.showDialog = false;
            
            var self = this;
            self.scope = $scope;
         /*    
            var layoutPlugin = new ngGridLayoutPlugin();
            
            $scope.updateLayout = function(){
              layoutPlugin.updateGridLayout();
            }; */
            
            $scope.destWindow = 'cancelMashOp';
            $scope.selectedItm = "Nada";
            
            // var scopeMp = $('#MapSearcherPane').scope();
            $scope.mapSelectionChanged = function(rowItem,event){ 
                console.debug(rowItem.entity);
                console.debug(rowItem.entity.title);
                // previousSelectedWebMapId = selectedWebMapId;
                var selectedWebMapId = rowItem.entity.id;
                // $scope.openWindowSelectionDialog(modal311, rowItem.entity.id, rowItem.entity.title);
                $scope.openWindowSelectionDialog(rowItem.entity.id, rowItem.entity.title);
                // $scope.showDialog = true;
                // if($scope.destWindow != "cancelMashOp"){
                    // StartupArcGIS.replaceWebMap(selectedWebMapId, $scope.destWindow, rowItem.entity.title);
                // }
            }
            $scope.mapGriddata = [
                {"id" : "ca8219b99d9442a8b21cd61e71ee48b8","title" : "Somewhere in Chicago", "snippet" : "foo", "thumbnail" : "thumbnail/foo.jpg"},
                {"id" : "0ba4d84db84e4564b936ec548ea91575","title" : "2013 Midwest Tornado Outbreak", "snippet" : "bar", "thumbnail" : "thumbnail/bar.jpg"}
                ];
            $scope.imgWebMapTmplt = '<img ng-src="{{row.getProperty(col.field)}}" width="50" height="50" />';
                
            $scope.gridMapOptions = { 
                data: 'mapGriddata',
                rowHeight: '50',
                afterSelectionChange:  $scope.mapSelectionChanged,
                multiSelect: false,
                
                columnDefs: [
                    {field:'thumbnail',
                     width: '50px',
                     displayName:'Img',
                     cellTemplate: $scope.imgWebMapTmplt},
                    {field:'snippet',
                     width: '120px',
                     displayName:'Description'},
                    {field:'title',
                     width: '120x',
                     displayName:'Map Title'},
                    {field:'id',
                     visible: false,
                     displayName:'ID'}
                ]
                 
            };
            
            
            var portal = null;
            
            
            $scope.getGridStyleMap = function () {                
                var vrbg = angular.element(document.getElementById("verbagePan"));
                var accHead = angular.element(document.getElementById("AccdianNews"));
                // var srchWrap = angular.element(document.getElementById("searchToolWrapperGroup"));
                var srchWrap = angular.element(document.getElementById("searchToolWrapperMap"));
                var marginborder = (1 + 1) * 2;
                var accinnermarginborder = (1 + 9) * 2;
                var availableHgt = vrbg[0].offsetHeight - srchWrap[0].offsetHeight - accinnermarginborder -
                                    4 * (accHead[0].offsetHeight + marginborder);
                var rowHeight = 50;
                var headerHeight = 34;
                var height = +($scope.mapGriddata.length * rowHeight + headerHeight);
                if (height > availableHgt) {
                    height = availableHgt;
                }
                return {
                    height: height + "px"
                };
            };
            
                                       
            $scope.redrawGrid = function () {
                window.setTimeout(function () {
                    $(window).resize();
                    $(window).resize();
                }, 250);
            };
            
            $scope.findArcGISGroupMaps = function(portal, searchTermMap) {
              utils.showLoading();
              var keyword = searchTermMap; //dojo.byId('mapFinder').value;
              var params = {
                q: ' type:"Web Map" -type:"Web Mapping Application" ' + keyword,
                num: 20
              };
              portal.queryItems(params).then(function (data) {
                    $scope.showMapResults(data);
                });
            };
            
            
            // gets private groups as well
            $scope.signInFromMapTab = function() {
              console.log("signInFromMapTab");
              self.portal = portalForSearch;

              if ($scope.signInOutMap.indexOf('In') !== -1) {
                portal.signIn().then(function (loggedInUser) {
                    $scope.$emit('SignInOutEmitEvent'); //out
                  findArcGISGroupMaps(portal, $scope.searchTermMap);   // update results
                }, function (error) {  //error so reset sign in link
                    $scope.$emit('SignInOutEmitEvent'); //in
                });
              } else {
                portal.signOut().then(function (portalInfo) {
                    $scope.$emit('SignInOutEmitEvent'); //in
                    findArcGISGroupMaps(portal, $scope.searchTermMap);
                });
              }
            };
            
            $scope.$on('SignInOutBroadcastEvent', function(event, isSignedIn) {
                if(isSignedIn){
                    $scope.signInOutMap = "Sign Out";
                }else{
                    $scope.signInOutMap = "Sign In";
                }
            });
            
            $scope.$on('OpenMapPaneCommand', function(event, args) {
                $scope.showMapResults(args.respData);
            });
            
            //display a list of groups that match the input user name
            
            $scope.showMapResults = function(response) {
                // utils.hideLoading();
                //clear any existing results
                console.log("showMapResults");
                console.debug(response);
                console.log("response.total " + response.total);
                if (response.total > 0) {
                    console.log("found array with length " + response.total);
                    var i = response.total;
                    var mpdata = [];
                    mpdata = dojo.map(response.results, function (map) {
                      return {
                        'snippet': map.snippet,
                        'title': map.title,
                        'url': map.itemUrl,
                        'thumbnail': map.thumbnailUrl || '',
                        'id': map.id,
                        'owner': map.owner
                      }
                    });
                    //create the grid
                    $scope.mapGriddata = [];
                    $scope.mapGriddata = $scope.mapGriddata.concat(mpdata);
                    $scope.redrawGrid();
                    // $scope.updateLayout();
                    if (!$scope.$$phase) {
                        $scope.$apply(function(){
                                $scope.mapGriddata = mpdata;
                            });
                    }
                    
                 }
            };
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
                
            // $scope.openWindowSelectionDialog = function (modal311, selectedWebMapId, selectedMapTitle) {
            $scope.openWindowSelectionDialog = function (selectedWebMapId, selectedMapTitle) {
              
                console.log("toggleShow from " + $scope.showDialog);
                // $scope.showDialog = ! $scope.showDialog;
                console.log("toggleShow to " + $scope.showDialog);
                $scope.safeApply(function(){
                    $scope.showDialog = ! $scope.showDialog;
                });
                console.log("toggleShow after apply " + $scope.showDialog);
              
              /* 
                var dlg = document.getElementById('DestSelectDlgId');
                self.scope = angular.element(dlg).scope();
                // dlg.modal({show:true})
                self.scope = angular.element(dlg).scope();
                var modalInstance = $modal.open({
                  show : true,
                  // templateUrl: 'DestSelectModalDlg.html',
                  templateUrl: dlg,
                  controller: 'ModalInstanceCtrl',
                      resolve: {
                        selected: function() {
                          return $scope.selected;
                        }
                      }
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.destWindow = $scope.selected = selectedItem;
                    if($scope.destWindow != "cancelMashOp"){
                        StartupArcGIS.replaceWebMap(selectedWebMapId, $scope.destWindow, selectedMapTitle);
                    }
                }, function () {
                    $scope.showDialog = false;
                    console.log('Modal dismissed at: ' + new Date());
                });
               */
            };
        }  
        
        function init(App) {
            console.log('SearcherCtrlMap init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            App.controller('SearcherCtrlMap',  ['$scope', SearcherCtrlMap]);
            // App.controller('SearcherCtrlMap',  ['$scope', 'modal311', SearcherCtrlMap]);
            // App.controller('ModalInstanceCtrl',  ['$scope', 'selected', ModalInstanceCtrl]);
            App.controller('ModalInstanceCtrl',  ['$scope',  ModalInstanceCtrl]);
            
            
            App.directive("modalShow", function () {
                var tpl = ' \
                      <div class="modal-content"> \
                        <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button> \
                          <h3> Select Destination Window</h3> \
                        </div> \
                        <div class="modal-body"> \
                          <ul> \
                            <li class="acc li">Open a new web map replacing map in this window</li> \
                            <li class="acc li">Open a new web map in a new tab</li> \
                            <li class="acc li">Open a new web map in a new window</li> \
                          </ul> \
                        </div> \
                        <div class="modal-footer"> \
                          <div class="btn-group" style="margin: 9px 0;"> \
                          <button class="btn btn-primary" data-dismiss="modal" style="width:25%;" ng-click="sameWindow()" value="Same Window">Same Window</button>  \
                          <button class="btn btn-default" style="width:25%;" ng-click="newTab()" value="New Tab">New Tab</button> \
                          <button class="btn btn-primary" style="width:25%;" ng-click="newWindow()" value="New Window">New Window</button>  \
                          <button class="btn btn-warning" style="width:25%;" ng-click="cancelMash()" value="Cancel">Cancel</button></div> \
                        </div> \
                      </div> \
                    </div> \
                ';
                return {
                    restrict: "A",
                    template : tpl,
                    scope: {
                        modalVisible: "="
                    },
                    link: function (scope, element, attrs) {

                        //Hide or show the modal
                        scope.showModal = function (visible, elem) {
                            if (!elem){
                                elem = element;
                                /* 
                                if(! elem.modal311){
                                    // var elemById = document.getElementById('#DestSelectDlgId');
                                    elem = angular.element.find('.modal311')[0];
                                    // elem = angular.element(elemById);
                                }
                                 */
                            }
                            // var elm0 = element.get(0);

                            // try{
                                if (visible){
                                    var dlgelm = $(elem);
                                    // dlgelm.modal({show: true});  
                                    dlgelm.modal311("show");
                                    // dlgelm.show();
                                    // document.getElementById('DestSelectDlgId').style.display = 'block';
                                    // $(elem).removeClass('hide');
                                    // $(elem).css('display', 'block !important');
                                    console.log("called jquery show()");
                                }                                    
                                else{
                                    var dlgelm = $(elem);
                                    // dlgelm.modal({show: false});
                                    dlgelm.modal311("hide");
                                    // dlgelm.hide();
                                    document.getElementById('DestSelectDlgId').style.display = 'none';
                                    console.log("called jquery show()");
                                }                           
                            // }
                            // catch(e){
                                // console.debug("modal exception");
                            // }
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
                                scope.showModal(newValue, attrs.$$element);
                                // scope.$parent.showDialog = newValue;
                            });
                           /*  
                            scope.$watch('scope.$parent.showDialog', function (newValue, oldValue) {
                                console.log("scope.$watch newValue : " + newValue);
                                console.log("scope.$watch 'scope.$parent.showDialog' : " + scope.$parent.showDialog);
                                scope.showModal(newValue, attrs.$$element);
                                //attrs.modalVisible = false;
                            });
 */

                        }
                            //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                            //element.bind("hide.bs.modal", function () {
                            $('#DestSelectDlgId').on('hidden.bs.modal', function () {
                                scope.modalVisible = scope.$parent.showDialog = false;
                                console.log("hide event called")
                                scope.$parent.selectedItm =  "what?";
                                if (!scope.$$phase && !scope.$root.$$phase){
                                    scope.$apply();
                                    //scope.$parent.toggleShow();
                                }
                            });
                    }

                };
            });
            
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return SearcherCtrlMap;
        }
        
        return { start: init };

    });

}).call(this);
