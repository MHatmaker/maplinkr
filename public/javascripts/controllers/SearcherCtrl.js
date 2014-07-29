
(function() {
    "use strict";

    console.log('SearcherCtrl setup');
    define([
        'angular'
    ], function(angular) {
        console.log('SearcherCtrl define');
        
        function SearcherCtrl($scope) {
            $scope.findGrpDisabled = true;
            $scope.searchTermGrp = "Chicago";
            $scope.searchTermMap = "Chicago Crime";
            $scope.signInOutGrp = "Sign In";
            $scope.signInOutMap = "Sign In";
            
            // find groups based on input keyword
            $scope.findArcGISGroup = function() {
              var keyword = $scope.searchTermGrp; //dojo.byId('groupFinder').value;
              var params = {
                q:  keyword,
                num:20  //find 40 items - max is 100
               };
               portalForSearch.queryGroups(params).then(function (data) {
                showGroupResults(data);
               });
            }
            
            $scope.findArcGISGroupMaps = function() {
              utils.showLoading()
              var keyword = $scope.searchTermMap; //dojo.byId('mapFinder').value;
              var params = {
                q: ' type:"Web Map" -type:"Web Mapping Application" ' + keyword,
                num: 20
              };
              portal.queryItems(params).then(function (data) {
                    showMapResults(data);
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
                        showMapResults(data);
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
                    findArcGISGroup();   // update results
                }, function (error) { //error so reset sign in link
                    $scope.signInOutGrp = "Sign In";
                    $scope.signInOutMap = "Sign In";
                });
              } else {
                portalForSearch.signOut().then(function (portalInfo) {
                    $scope.signInOutGrp = "Sign In";
                    $scope.signInOutMap = "Sign In";
                    findArcGISGroup();
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
                  findArcGISGroupMaps();   // update results
                }, function (error) {  //error so reset sign in link
                    $scope.signInOutGrp = "Sign In";
                    $scope.signInOutMap = "Sign In";
                });
              } else {
                portal.signOut().then(function (portalInfo) {
                    $scope.signInOutGrp = "Sign In";
                    $scope.signInOutMap = "Sign In";
                    findArcGISGroupMaps();
                });
              }
            }
            
            //display a list of groups that match the input user name
            $scope.showGroupResults = function(response) {
                //clear any existing results
                var data = [];

                
                    // gridGroupLocal.on("dgrid-select", function(event){
                        // Report the item from the selected row to the console.
                if (response.total > 0) {
                    //create the grid
                    var localData = data;
                    
                    $scope.gridGrpOptions = { 
                        data: 'localData',
                        rowHeight: '50',
                        columnDefs: [
                            {field:'thumbnail',
                             displayName:'Group Icon',
                             cellTemplate: 'ImageTemplate.html'},
                            {field:'title',
                             displayName:'Group'},
                            {field:'snippet',
                             displayName:'Description',
                             cellTemplate: 'cellTemplate.html'},
                            {field: 'id',
                             displayName: 'Group ID'}
                        ]
                    };
                        // console.log("Row selected: ", event.rows[0].data.title);
                        // console.log("Row selected: ", event.rows[0].data.id);
                    // });
              } else {
                dojo.byId('groupResults').innerHTML = '<h2>Group Results</h2><p>No groups were found. If the group is not public use the sign-in link to sign in and find private groups.</p>';
              }
            }
            
            function showMapResults(response) {
                utils.hideLoading();
                //clear any existing results
                var data = [];
                if (response.total > 0) {
                    //create the grid
                    var localData = data;
                    
                    $scope.gridMapOptions = { 
                        data: 'localData',
                        rowHeight: '50',
                        columnDefs: [
                            {field:'snippet',
                             displayName:'Description'},
                            {field:'title',
                             displayName:'Map Title'},
                            {field:'url',
                             displayName:'Map Url'},
                            {field:'thumbnail',
                             displayName:'Map Thumbnail Url',
                             cellTemplate: 'ImageTemplate.html'},
                            {field:'id',
                             displayName:'ID'},
                            {field: 'owner',
                             displayName: 'Map Owner'}
                        ]
                    };
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