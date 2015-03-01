
(function() {
    "use strict";

    console.log('SearcherCtrlGrp setup');
    define([
        'angular' //,
        // 'CurrentWebMapIdService'  //,
        // 'ngGrid'
    ], function(angular) {
        console.log('SearcherCtrlGrp define');
        
        function SearcherCtrlGrp($scope) {
            $scope.findGrpDisabled = false;
            $scope.searchTermGrp = "Chicago Crime";
            
            $scope.isGrpAccPanelOpen = false;
            $scope.signInOutGrp = "Sign In";
            
            $scope.grpGriddata = [];
                // {"id" : "ca8219b99d9442a8b21cd61e71ee48b8","title" : "Somewhere in Chicago", "snippet" : "foo", "thumbnail" : "foo.jpg"},
                // {"id" : "0ba4d84db84e4564b936ec548ea91575","title" : "2013 Midwest Tornado Outbreak", "snippet" : "bar", "thumbnail" : "bar.jpg"}
                // ];  
                
            var self = this;
            self.scope = $scope;
          /*   
            var layoutPlugin = new ngGridLayoutPlugin();
            
            $scope.updateLayout = function(){
              layoutPlugin.updateGridLayout();
            };
             */
            $scope.selectedItm = "Nada";
            $scope.selectionChanged = function(rowItem,event){ 
                console.debug(rowItem.entity);
                console.debug(rowItem.entity.title   + '/' + rowItem.entity.thumbnail);
                $scope.findMapsForGroup(rowItem.entity.id);
            };
            
            
            $scope.imgUrlBase = 'http://www.arcgis.com/sharing/rest/community/groups/';
            
            $scope.imgTmplt = 
                '<img ng-src="{{imgUrlBase}}{{row.getProperty(\'id\')}}/info/{{row.getProperty(col.field)}}" width="50" height="50" />';
            
            $scope.gridGrpOptions = { 
                data: 'grpGriddata',
                // enablePaging: true,
                rowHeight: '50' ,
                // plugins: [layoutPlugin],
                multiSelect: false,
                afterSelectionChange:  $scope.selectionChanged,
                columnDefs: [ 
                    {field:'thumbnail',
                     width: '50px',
                     displayName:'Img',
                     cellTemplate: $scope.imgTmplt},
                    {field:'title',
                     width: '124px',
                     displayName: 'Group'},
                    {field: 'snippet',
                     width: '124px',
                     displayName: 'Description'},
                    {field: 'id',
                     visible: false,
                     displayName: '#'}
                ] 
            };
            
            var portal = null;
               // find groups based on input keyword
            $scope.findArcGISGroup = function() {
              console.log('findArcGISGroup');
              var keyword = $scope.searchTermGrp;
              var params = {
                q:  keyword,
                num:20  //find 40 items - max is 100
               };
               portalForSearch.queryGroups(params).then(function (data) {
                $scope.showGroupResults(data);
               });
            };
                   
            $scope.calculateInstructionHeight = function(){
                var label = angular.element(document.getElementById("grpSearchLabel"));
                var instructions = document.getElementById("grpSrchInstId");
                
                var instructionsHgt = instructions.offsetHeight;
                // console.log("instructionsHgt " + instructionsHgt);
                var srcTerm = angular.element(document.getElementById("groupFinder")); 
                var hgt = label[0].offsetHeight + instructionsHgt + srcTerm[0].offsetHeight;
                // console.log("Instructions height : " + hgt);
                return hgt;
            }
            
            $scope.calculateHeights = function(){              
                var vrbg = angular.element(document.getElementById("Verbage"));
                var accHead = angular.element(document.getElementById("AccdianNews"));
                var srchWrap = angular.element(document.getElementById("searchToolWrapperGroup"));
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
                var height = +($scope.grpGriddata.length * rowHeight + headerHeight);
                if (height > availableHgt) {
                    height = availableHgt;
                }
                if (height < 120){
                    height = 120;
                }
                return height;
            };
            
            $scope.getGridStyleGroup = function () {
                var height = $scope.calculateHeights() - 8;
                var heightStr = String(height) + "px";
                // console.log("heightStr - getGridStyleGroup : " + heightStr);
                return {
                    height: heightStr
                };
            };
            
            $scope.getGridStyleWrapper = function () {
                var height = $scope.calculateHeights();
                var heightStr = String(height) + "px";
                // console.log("heightStr - getGridStyleWrapper : " + heightStr);
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
            
            $scope.showGroupResults = function(response) {
                //clear any existing results
                console.log('$scope.showGroupResults');
                
                if (response.total > 0) {
                    var grddata = response.results;
                    //create the grid
                    $scope.grpGriddata = response.results;
                    // $scope.gridGrpOptions.data = response.results;
                    console.debug($scope.grpGriddata);
                    $scope.redrawGrid();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    $scope.redrawGrid();
              } else {
                dojo.byId('groupResults').innerHTML = '<h2>Group Results</h2><p>No groups were found. If the group is not public use the sign-in link to sign in and find private groups.</p>';
              }
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
            
            $scope.findMapsForGroup = function(gId)
            {
              console.log("findMapsForGroup : " + gId);
              var params = {
                 q:  'id : ' +  gId,
                 num:20  //find 40 items - max is 100
                };
                
                portalForSearch.queryGroups(params).then(function(groups){
                //get group title and thumbnail url 
                if (groups.results.length > 0) {
                  console.log("group 0 results:");
                  var group = groups.results[0];
                  console.debug(group);
                  
                  //Retrieve the web maps and applications from the group and display 
                  var params = {
                    q: ' type:"Web Map" -type:"Web Mapping Application"',
                    num: 10
                  };
                  group.queryItems(params).then(function (data) {
                        $scope.showMapResults(data);
                    });
                }
              });
            };
            
            // gets private groups as well
            $scope.signInFromGroupTab = function() {
              console.log("signInFromGroupTab");
              self.portal = portalForSearch;

              if ($scope.signInOutGrp.indexOf('In') !== -1) {
                portalForSearch.signIn().then(function (loggedInUser) {
                    $scope.$emit('SignInOutEmitEvent', true); //out
                    $scope.findArcGISGroup(portalForSearch);   // update results
                }, function (error) { //error so reset sign in link
                    $scope.$emit('SignInOutEmitEvent', true); //in
                });
              } else {
                portalForSearch.signOut().then(function (portalInfo) {
                    $scope.$emit('SignInOutEmitEvent', false); //in
                    findArcGISGroup(portalForSearch);
                });
              }
            };
            
            $scope.$on('SignInOutBroadcastEvent', function(event, isSignedIn) {
                if(isSignedIn){
                    $scope.signInOutGrp = "Sign Out";
                }else{
                    $scope.signInOutGrp = "Sign In";
                }
            });
            
            
            //display a list of groups that match the input user name
            
            $scope.showMapResults = function(response) {
                // utils.hideLoading();
                //clear any existing results
                console.log("showMapResults");
                $scope.$emit('OpenMapPaneEvent', { 'respData' : response });
            };
        }  
        
        function init(App) {
            console.log('SearcherCtrlGrp init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            App.controller('SearcherCtrlGrp',  ['$scope', SearcherCtrlGrp]);
            // SearcherCtrlGrp.CurrentWebMapIdService= CurrentWebMapIdService;
            return SearcherCtrlGrp;
        }
        
        return { start: init };

    });

}).call(this);