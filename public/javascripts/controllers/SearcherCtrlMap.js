
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
        var heightCalculations = {};
        heightCalculations = {'wrapHeight' : 200, 'gridHeight' : 180, 'instructionsHeight' : 0};
        var scopeDict = {};
        
        // function SearcherCtrlMap($scope, $modal311) {
        function SearcherCtrlMap($scope, $rootScope) {
            // console.log("debug $modal");
            // console.debug($modal311);
            $scope.findMapDisabled = false;
            $scope.searchTermMap = "Chicago Crime";
            
            $scope.isMapAccPanelOpen = false;
            $scope.signInOutMap = "Sign In";
            scopeDict['rootScope'] = $rootScope;
            
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
            
            $scope.$on('DestinationSelectorEvent', function(event, args) {
                var destWnd = args.destWnd;
                console.log("onAcceptDestination " + destWnd);
                StartupArcGIS.replaceWebMap(selectedWebMapId,  destWnd, selectedWebMapTitle);
            });
                        
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
                displayFooter: true,
                enableColumnResize : true,
                
                columnDefs: [
                    {field:'thumbnail',
                     width: '50px',
                     displayName:'Img',
                     resizable: false,
                     cellTemplate: $scope.imgWebMapTmplt},
                    {field:'snippet',
                     width: '40%',
                     displayName:'Description'},
                    {field:'title',
                     width: '40%',
                     displayName:'Map Title'},
                    {field:'id',
                     visible: false,
                     width : '0',
                     displayName:'ID'}
                ]
                 
            };
            
            
            var portal = null;
            
            $scope.calculateInstructionHeight = function(){
                var label = angular.element(document.getElementById("mapSearchLabel"));
                var instructions = document.getElementById("mapSrchInstId");
                
                var instructionsHgt = instructions.offsetHeight;
                // console.log("instructionsHgt " + instructionsHgt);
                var srcTerm = angular.element(document.getElementById("mapFinder")); 
                var hgt = label[0].offsetHeight + instructionsHgt + srcTerm[0].offsetHeight;
                // console.log("Instructions height : " + hgt);
                return hgt;
            }
            
            $scope.calculateHeights = function(){              
                var vrbg = angular.element(document.getElementById("verbagePan"));
                var accHead = angular.element(document.getElementById("AccdianNews"));;
                var srchWrap = angular.element(document.getElementById("searchToolWrapperMap"));
                var marginborder = (1 + 1) * 2;
                var accinnermarginborder = (1 + 9) * 2;
                var instructionsHgt =  $scope.calculateInstructionHeight();
                var acc0 = accHead[0];
                var acc0Hgt = acc0.offsetHeight;
                // console.log("vrbg : " + vrbg[0].offsetHeight + " instructionsHgt " + instructionsHgt + " accHead " +  4 * (accHead[0].offsetHeight));
                var gridTopHgt = 30 + 20; // ngTopPanel + ngViewPort
                var availableHgt = vrbg[0].offsetHeight -  accinnermarginborder - gridTopHgt - instructionsHgt -
                                    4 * (accHead[0].offsetHeight + marginborder);
                // console.log("availableHgt" + availableHgt);
                var rowHeight = 50;
                var headerHeight = 34;
                var height = +($scope.mapGriddata.length * rowHeight + headerHeight);
                if (height > availableHgt) {
                    height = availableHgt;
                }
                return height;
            }
            
            $scope.getGridStyleMap = function () {
                var height = $scope.calculateHeights() - 20;
                var heightStr = String(height) + "px";
                return {
                    height: heightStr
                };
            };
            
            $scope.getGridStyleWrapper = function () { 
                var height = $scope.calculateHeights();
                var heightStr = String(height) + "px";
                return {
                    height: heightStr
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
                    // $scope.calculateHeights();
                    //create the grid
                    $scope.mapGriddata = [];
                    $scope.mapGriddata = $scope.mapGriddata.concat(mpdata);
                    // $scope.redrawGrid();
                    // $scope.updateLayout();
                    if (!$scope.$$phase) {
                        $scope.$apply(function(){
                                $scope.mapGriddata = mpdata;
                            });
                    }
                    // $scope.getGridStyleMap();
                    // $scope.getGridStyleWrapper();
                    // if (!$scope.$$phase) {
                        // $scope.$apply(function(){
                                // $scope.mapGriddata = mpdata;
                            // });
                    // }
                    $scope.redrawGrid();
                    
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
              
                console.log("in openWindowSelectionDialog - fire ShowWindowSelectorModalEvent");
                // console.log("toggleShow from " + $scope.showDialog);
                // $scope.safeApply(function(){
                    // $scope.showDialog = ! $scope.showDialog;
                scopeDict.rootScope.$broadcast('ShowWindowSelectorModalEvent');
                // });
                // console.log("toggleShow after apply " + $scope.showDialog);
            };
        }  
        
        function init(App) {
            console.log('SearcherCtrlMap init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            App.controller('SearcherCtrlMap',  ['$scope', '$rootScope', SearcherCtrlMap]);
            
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return SearcherCtrlMap;
        }
        
        return { start: init };

    });

}).call(this);
