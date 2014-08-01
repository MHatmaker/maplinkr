
(function() {
    "use strict";

    console.log('SearcherCtrl setup');
    define([
        'angular' //,
        // 'ngGrid'
    ], function(angular) {
        console.log('SearcherCtrl define');
        
        function SearcherCtrl($scope) {
            $scope.findGrpDisabled = false;
            $scope.searchTermGrp = "Chicago";
            $scope.searchTermMap = "Chicago Crime";
            $scope.signInOutGrp = "Sign In";
            $scope.signInOutMap = "Sign In";
            $scope.data = [
                {"id" : "ca8219b99d9442a8b21cd61e71ee48b8","title" : "Somewhere in Chicago"},
                {"id" : "0ba4d84db84e4564b936ec548ea91575","title" : "2013 Midwest Tornado Outbreak"}
                ];
            $scope.mapGriddata = [];
            $scope.gridMapOptions = { 
                data: 'mapGriddata',
                rowHeight: '50',
                columnDefs: [
                    {field:'snippet',
                     displayName:'Description'},
                    {field:'title',
                     displayName:'Map Title'}/*  ,
                                    {field:'url',
                                     displayName:'Map Url'},
                                    {field:'thumbnail',
                                     displayName:'Map Thumbnail Url',
                                     cellTemplate: 'ImageTemplate.html'},
                                    {field:'id',
                                     displayName:'ID'},
                                    {field: 'owner',
                                     displayName: 'Map Owner'} */
                ]
            };
            var self = this;
            self.scope = $scope;
            
            $scope.gridGrpOptions = { 
                data: 'data',
                // enablePaging: true,
                rowHeight: '50',
                columnDefs: [
                /* 
                    {field:'thumbnail',
                     displayName:'Group Icon',
                     cellTemplate: 'ImageTemplate.html'},
                      */
                    {field:'title',
                     width: 80,
                     displayName:'Group'},
                     /* 
                    {field:'snippet',
                     displayName:'Description',
                     cellTemplate: 'cellTemplate.html'},
                      */
                    {field: 'id',
                     width: 80,
                     displayName: 'Group ID'}
                ]
            };
               // find groups based on input keyword
            $scope.findArcGISGroup = function(portalForSearch) {
              console.log('findArcGISGroup');
              var keyword = $scope.searchTermGrp;
              var params = {
                q:  keyword,
                num:20  //find 40 items - max is 100
               };
               portalForSearch.queryGroups(params).then(function (data) {
                $scope.showGroupResults(data);
               });
            }
            
            $scope.showGroupResults = function(response) {
                //clear any existing results
                console.log('$scope.showGroupResults');
                
                    // gridGroupLocal.on("dgrid-select", function(event){
                        // Report the item from the selected row to the console.
                if (response.total > 0) {
                    var grddata = response.results;
                    //create the grid
                    $scope.data = response.results;
                    // $scope.gridGrpOptions.data = response.results;
                    console.debug($scope.data);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    // gridGrpOptions.data = data;
                        // console.log("Row selected: ", event.rows[0].data.title);
                        // console.log("Row selected: ", event.rows[0].data.id);
                    // });
              } else {
                dojo.byId('groupResults').innerHTML = '<h2>Group Results</h2><p>No groups were found. If the group is not public use the sign-in link to sign in and find private groups.</p>';
              }
            }
            
            $scope.findArcGISGroupMaps = function(portal, searchTermMap) {
              utils.showLoading()
              var keyword = searchTermMap; //dojo.byId('mapFinder').value;
              var params = {
                q: ' type:"Web Map" -type:"Web Mapping Application" ' + keyword,
                num: 20
              };
              portal.queryItems(params).then(function (data) {
                    $scope.showMapResults(data);
                });
            }
            
            $scope.findMapsForGroup = function(gId)
            {
              var params = {
                 q:  'id : ' +  gId,
                 num:20  //find 40 items - max is 100
                };
                portal.queryGroups(params).then(function(groups){
                //get group title and thumbnail url 
                if (groups.results.length > 0) {
                  group = groups.results[0];
                  
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
            }
            
            // gets private groups as well
            $scope.signInFromGroupTab = function() {
              console.log("signInFromGroupTab");

              if ($scope.signInOutGrp.indexOf('In') !== -1) {
                portalForSearch.signIn().then(function (loggedInUser) {
                    $scope.signInOutGrp = "Sign Out";
                    $scope.signInOutMap = "Sign Out";
                    $scope.findArcGISGroup(portalForSearch);   // update results
                }, function (error) { //error so reset sign in link
                    $scope.signInOutGrp = "Sign In";
                    $scope.signInOutMap = "Sign In";
                });
              } else {
                portalForSearch.signOut().then(function (portalInfo) {
                    $scope.signInOutGrp = "Sign In";
                    $scope.signInOutMap = "Sign In";
                    findArcGISGroup(portalForSearch);
                });
              }
            }
            
            // gets private groups as well
            $scope.signInFromMapTab = function() {
              console.log("signInFromMapTab");

              if (signInOutMap.indexOf('In') !== -1) {
                portal.signIn().then(function (loggedInUser) {
                    $scope.signInOutGrp = "Sign Out";
                    $scope.signInOutMap = "Sign Out";
                  findArcGISGroupMaps(portal, $scope.searchTermMap);   // update results
                }, function (error) {  //error so reset sign in link
                    $scope.signInOutGrp = "Sign In";
                    $scope.signInOutMap = "Sign In";
                });
              } else {
                portal.signOut().then(function (portalInfo) {
                    $scope.signInOutGrp = "Sign In";
                    $scope.signInOutMap = "Sign In";
                    findArcGISGroupMaps(portal, $scope.searchTermMap);
                });
              }
            }
            
            //display a list of groups that match the input user name
            
            $scope.showMapResults = function(response) {
                utils.hideLoading();
                //clear any existing results
                if (response.total > 0) {
                    //create the grid
                    $scope.mapGriddata = response.results;
                    // $scope.gridGrpOptions.data = response.results;
                    console.debug($scope.mapGriddata);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    
                 }
            }
        }  
        
        function init(App) {
            console.log('SearcherCtrl init');
            App.controller('SearcherCtrl', ['$scope', SearcherCtrl]);
            return SearcherCtrl;
        }
        
        return { start: init };

    });

}).call(this);