
(function() {
    "use strict";

    console.log('SearcherCtrlMap setup');
    define([
        'angular' //,
        // 'CurrentWebMapIdService'  //,
        // 'ngGrid'
    ], function(angular) {
        console.log('SearcherCtrlMap define');
        
        function SearcherCtrlMap($scope) {
            $scope.findMapDisabled = false;
            $scope.searchTermMap = "Chicago Crime";
            
            $scope.isMapAccPanelOpen = false;
            $scope.signInOutMap = "Sign In";
            
            var injector = angular.injector(['app', 'ng']);
          /*   if(injector.has('CurrentWebMapIdService')){
                var CurrentWebMapIdService = injector.get('CurrentWebMapIdService');
                CurrentWebMapIdService.getCurrentWebMapId('foobar');
            }  */
            $scope.mapGriddata = [
                {"id" : "ca8219b99d9442a8b21cd61e71ee48b8","title" : "Somewhere in Chicago", "snippet" : "foo", "thumbnail" : "thumbnail/foo.jpg"},
                {"id" : "0ba4d84db84e4564b936ec548ea91575","title" : "2013 Midwest Tornado Outbreak", "snippet" : "bar", "thumbnail" : "thumbnail/bar.jpg"}
                ];
            $scope.imgWebMapTmplt = '<img ng-src="{{row.getProperty(col.field)}}" width="50" height="50" />';
                
            $scope.gridMapOptions = { 
                data: 'mapGriddata',
                rowHeight: '50',
                afterSelectionChange:  $scope.mapSelectionChanged,
                
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
            var self = this;
            self.scope = $scope;
            
            var layoutPlugin = new ngGridLayoutPlugin();
            
            $scope.updateLayout = function(){
              layoutPlugin.updateGridLayout();
            };
            $scope.selectedItm = "Nada";
            
            var scopeMp = $('#MapSearcherPane').scope();
            scopeMp.mapSelectionChanged = function(rowItem,event){ 
                console.debug(rowItem.entity);
                console.debug(rowItem.entity.title);
                // previousSelectedWebMapId = selectedWebMapId;
                var selectedWebMapId = rowItem.entity.id;
                initialize(selectedWebMapId, true, rowItem.entity.title);
            }
            
            
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
                    $scope.gridMapOptions.data = [];
                    $scope.mapGriddata = mpdata;
                    console.log("show $scope.mapGriddata");
                    var scopeQ = $('#SearchMap').scope();
                    scopeQ.gridMapOptions.data = $scope.mapGriddata.concat(mpdata);
                    console.debug($scope.mapGriddata);
                    
                    // scopeQ = $('#SearchMap').scope();
                    if( scopeQ )
                    {
                        $scope.mapGriddata = mpdata;
                        scopeQ.$apply(function(){
                                scopeQ.mapGriddata = mpdata;
                            });
                    }
                    $scope.redrawGrid();
                    // $scope.updateLayout();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                var scopeQ = $('#MapSearcherPane').scope();
                scopeQ.isMapAccPanelOpen = ! scopeQ.isMapAccPanelOpen;
                    
                 }
            };
        }  
        
        function init(App) {
            console.log('SearcherCtrlMap init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            App.controller('SearcherCtrlMap',  ['$scope', SearcherCtrlMap]);
            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            return SearcherCtrlMap;
        }
        
        return { start: init };

    });

}).call(this);