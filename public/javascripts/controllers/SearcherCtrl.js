
(function() {
    "use strict";

    console.log('SearcherCtrl setup');
    define([
        'angular'
    ], function(angular) {
        console.log('SearcherCtrl define');
        
        function SearcherCtrl($scope) {
            $scope.findGrpDisabled = true;
            $scope.searchTerm = "Chicago";
            
            // find groups based on input keyword
            $scope.findArcGISGroup = function() {
              var keyword = dojo.byId('groupFinder').value;
              var params = {
                q:  keyword,
                num:20  //find 40 items - max is 100
               };
               portalForSearch.queryGroups(params).then(function (data) {
                showGroupResults(data);
               });
            }
            
            // gets private groups as well
            $scope.signInFromGroupTab = function() {
              console.log("signInFromGroupTab");
              var signInLinkMap = dojo.byId('signInMap');
              var signInLinkGrp = dojo.byId('signInGroup');

              if (signInLinkGrp.value.indexOf('In') !== -1) {
                portalForSearch.signIn().then(function (loggedInUser) {
                  signInLinkMap.value = "Sign Out";
                  signInLinkGrp.value = "Sign Out";
                  findArcGISGroup();   // update results
                }, function (error) {
                  signInLinkMap.value = 'Sign In';   //error so reset sign in link
                  signInLinkGrp.value = 'Sign In';   //error so reset sign in link
                });
              } else {
                portalForSearch.signOut().then(function (portalInfo) {
                  signInLinkMap.value = "Sign In";
                  signInLinkGrp.value = "Sign In";
                  findArcGISGroup();
                });
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