
angular.isUndefinedOrNull = function(val) {
    return angular.isUndefined(val) || val === null 
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
            $scope.destSelections = ["Same Window", "New Tab", "New Window"];
            $scope.data = {
                dstSel : $scope.destSelections[0].slice(0),
                prevDstSel :$scope.destSelections[0].slice(0),
                whichDismiss : "Cancel",
                dlg2show : "SelectWndDlg"
            };
             
            $scope.preserveState = function(){
                $scope.data.prevDstSel = $scope.data.dstSel.slice(0);
                console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.dstSel);
            };

            $scope.restoreState = function(){
                console.log("restore " + $scope.data.dstSel + " from " + $scope.data.prevDstSel);
                $scope.data.dstSel = $scope.data.prevDstSel.slice(0);
            };

            var self = this;
            self.scope = $scope;
            
            $scope.destWindow = 'cancelMashOp';
            $scope.selectedItm = "Nada";
            var selectedWebMapId = "Nada ID";
            var selectedWebMapTitle = "Nada Title";
            
            $scope.mapSelectionChanged = function(rowItem,event){ 
                console.debug(rowItem.entity);
                console.debug(rowItem.entity.title);
                // previousSelectedWebMapId = selectedWebMapId;
                selectedWebMapId = rowItem.entity.id;
                selectedWebMapTitle = rowItem.entity.title;
                $scope.openWindowSelectionDialog(rowItem.entity.id, rowItem.entity.title);
            }

            $scope.onAcceptDestination = function(){
                console.log("onAcceptDestination " + $scope.data.dstSel);
                StartupArcGIS.replaceWebMap(selectedWebMapId,  $scope.data.dstSel, selectedWebMapTitle);
            };
            
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
            };
        }  
        
        function init(App) {
            console.log('SearcherCtrlMap init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            App.controller('SearcherCtrlMap',  ['$scope', SearcherCtrlMap]);
            
            App.directive("modalShow", function () {
                var tpl = ' \
                  <div class="modal-dialog"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                        <h3>Open a new map in :</h3> \
                      </div> \
                      <div class="modal-body"> \
                        <div class="btn-group btn-group-vertical"> \
                              <span data-ng-repeat="dest in $parent.destSelections"> \
                                  <input name="destSelected", type="radio", value="{{dest}}", ng-model="$parent.data.dstSel"/> \
                                    {{dest}} \
                                  <br/> \
                              </span> \
                        </div> \
                        <div>selected: {{data.dstSel}}</div> \
                      </div> \
                      <div class="modal-footer"> \
                        <button type="button" class="btn btn-primary" ng-click="$parent.data.whichDismiss = \'Accept\'" data-dismiss="modal">Accept</button> \
                        <button type="button" class="btn btn-primary" ng-click="$parent.data.whichDismiss = \'Cancel\'; restoreState()" data-dismiss="modal">Cancel</button> \
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
                                scope.$parent.showDialog = newValue;
                                console.log("watch modalVisiblescope.$parent data  : ");
                                console.debug(scope.$parent.data);
                                scope.$parent.preserveState();
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("modalMdata", function (newValue, oldValue) {
                                if( ! angular.isUndefinedOrNull(newValue))
                                  localScope.$parent.data = newValue;
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });
                            
                            scope.$watch('scope.$parent.showDialog', function (newValue, oldValue) {
                                console.log("scope.$watch newValue : " + newValue);
                                console.log("scope.$watch 'scope.$parent.showDialog' : " + scope.$parent.showDialog);
                                scope.showModal(newValue);
                                //attrs.modalVisible = false;
                            });
                            

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
            
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return SearcherCtrlMap;
        }
        
        return { start: init };

    });

}).call(this);
