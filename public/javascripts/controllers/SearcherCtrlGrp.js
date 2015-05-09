/*global define */

(function () {
    "use strict";

    console.log('SearcherCtrlGrp setup');
    define([
        'angular',
        'lib/utils'
    ], function (angular, utils) {
        console.log('SearcherCtrlGrp define');
        var selfDict = {'portal': null},
            portalForSearch = null;

        function SearcherCtrlGrp($scope) {
            $scope.findGrpDisabled = false;
            $scope.searchTermGrp = "Chicago Crime";

            $scope.isGrpAccPanelOpen = false;
            $scope.signInOutGrp = "Sign In";

            $scope.grpGriddata = [];

            var self = this;
            self.scope = $scope;
            // var portalForSearch = selfDict.portal;
            // $scope.portalForSearch = selfDict.portal;
          /*
            var layoutPlugin = new ngGridLayoutPlugin();

            $scope.updateLayout = function () {
              layoutPlugin.updateGridLayout();
            };
             */
            $scope.selectedItm = "Nada";
            $scope.selectionChanged = function (rowItem, event) {
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
                rowHeight: '50',
                // plugins: [layoutPlugin],
                multiSelect: false,
                afterSelectionChange:  $scope.selectionChanged,
                columnDefs: [
                    {
                        field: 'thumbnail',
                        width: '50px',
                        displayName: 'Img',
                        cellTemplate: $scope.imgTmplt
                    },
                    {
                        field: 'title',
                        width: '124px',
                        displayName: 'Group'
                    },
                    {
                        field: 'snippet',
                        width: '124px',
                        displayName: 'Description'
                    },
                    {
                        field: 'id',
                        visible: false,
                        displayName: '#'
                    }
                ]
            };

            // portal = null;
               // find groups based on input keyword
            $scope.findArcGISGroup = function () {
                console.log('findArcGISGroup');
                var keyword = $scope.searchTermGrp,
                    params = {
                        q:  keyword,
                        num: 20  //find 40 items - max is 100
                    };
                portalForSearch.queryGroups(params).then(function (data) {
                    $scope.showGroupResults(data);
                });
            };

            $scope.calculateInstructionHeight = function () {
                var label = angular.element(document.getElementById("grpSearchLabel")),
                    instructions = document.getElementById("grpSrchInstId"),

                    instructionsHgt = instructions.offsetHeight,
                    // console.log("instructionsHgt " + instructionsHgt);
                    srcTerm = angular.element(document.getElementById("groupFinder")),
                    hgt = label[0].offsetHeight + instructionsHgt + srcTerm[0].offsetHeight;
                // console.log("Instructions height : " + hgt);
                return hgt;
            };

            $scope.calculateHeights = function () {
                var vrbg = angular.element(document.getElementById("Verbage")),
                    accHead = angular.element(document.getElementById("AccdianNews")),
                    marginborder = (1 + 1) * 2,
                    accinnermarginborder = (1 + 9) * 2,
                    instructionsHgt =  $scope.calculateInstructionHeight(),
                // console.log("vrbg : " + vrbg[0].offsetHeight + " instructionsHgt " + instructionsHgt + " accHead " +  4 * (accHead[0].offsetHeight));
                    gridTopHgt = 30 + 20, // ngTopPanel + ngViewPort
                    availableHgt = vrbg[0].offsetHeight -  accinnermarginborder - gridTopHgt - instructionsHgt -
                                    4 * (accHead[0].offsetHeight + marginborder),
                // console.log("availableHgt" + availableHgt);
                    rowHeight = 50,
                    headerHeight = 34,
                    height = +($scope.grpGriddata.length * rowHeight + headerHeight);
                if (height > availableHgt) {
                    height = availableHgt;
                }
                if (height < 120) {
                    height = 120;
                }
                return height;
            };

            $scope.getGridStyleGroup = function () {
                var height = $scope.calculateHeights() - 8,
                    heightStr = String(height) + "px";
                // console.log("heightStr - getGridStyleGroup : " + heightStr);
                return {
                    height: heightStr
                };
            };

            $scope.getGridStyleWrapper = function () {
                var height = $scope.calculateHeights(),
                    heightStr = String(height) + "px";
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

            $scope.showGroupResults = function (response) {
                //clear any existing results
                console.log('$scope.showGroupResults');

                if (response.total > 0) {
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
                    document.getElementById('groupResults').innerHTML = '<h2>Group Results</h2><p>No groups were found. If the group is not public use the sign-in link to sign in and find private groups.</p>';
                }
            };

            $scope.findArcGISGroupMaps = function (portal, searchTermMap) {
                utils.showLoading();
                var keyword = searchTermMap, //dojo.byId('mapFinder').value;
                    params = {
                        q: ' type:"Web Map" -type:"Web Mapping Application" ' + keyword,
                        num: 20
                    };
                portal.queryItems(params).then(function (data) {
                    $scope.showMapResults(data);
                });
            };

            $scope.findMapsForGroup = function (gId) {
                var group = null,
                    params = {
                        q: 'id : ' +  gId,
                        num: 20  //find 40 items - max is 100
                    };


                console.log("findMapsForGroup : " + gId);
                utils.showLoading();

                portalForSearch.queryGroups(params).then(function (groups) {
                //get group title and thumbnail url
                    if (groups.results.length > 0) {
                        group = groups.results[0];
                        //Retrieve the web maps and applications from the group and display

                        params = {
                            q: ' type:"Web Map" -type:"Web Mapping Application"',
                            num: 10
                        };
                        console.log("group 0 results:");
                        group.queryItems(params).then(function (data) {
                            $scope.showMapResults(data);
                        });
                    }
                });
            };

            // gets private groups as well
            $scope.signInFromGroupTab = function () {
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
                        $scope.findArcGISGroup(portalForSearch);
                    });
                }
            };

            $scope.$on('SignInOutBroadcastEvent', function (event, isSignedIn) {
                if (isSignedIn) {
                    $scope.signInOutGrp = "Sign Out";
                } else {
                    $scope.signInOutGrp = "Sign In";
                }
            });


            //display a list of groups that match the input user name

            $scope.showMapResults = function (response) {
                utils.hideLoading();
                //clear any existing results
                console.log("showMapResults");
                $scope.$emit('OpenMapPaneEvent', { 'respData' : response });
            };
            selfDict.setPortal = function (portal) {
                portalForSearch = portal;
            };
        }

        function init(App, portal) {
            console.log('SearcherCtrlGrp init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            App.controller('SearcherCtrlGrp',  ['$scope', SearcherCtrlGrp]);
            // SearcherCtrlGrp.CurrentWebMapIdService= CurrentWebMapIdService;
            // selfDict.portal = portalForSearch;
            portalForSearch = portal;
            return SearcherCtrlGrp;
        }

        return { start: init };

    });
}());
// }).call(this);
