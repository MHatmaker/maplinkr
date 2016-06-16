/*global define */

(function () {
    "use strict";

    console.log('SearcherCtrlGrp setup');
    define([
        'angular',
        'lib/utils'
    ], function (angular, utils) {
        console.log('SearcherCtrlGrp define');
        var selfDict = {'portal': null,
            'signInOutGrp' : "Sign In",
            'findGrpDisabled' : false},
            portalForSearch = null;

        function SearcherCtrlGrp($scope, $rootScope, LinkrService) {
            $scope.findGrpDisabled = selfDict.findGrpDisabled;
            $scope.searchTermGrp = "RHUser";

            $scope.isGrpAccPanelOpen = false;
            $scope.signInOutGrp = selfDict.signInOutGrp;

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
            $scope.selectGroup = function (rowItem) {
                console.debug(rowItem.entity);
                console.debug(rowItem.entity.title   + '/' + rowItem.entity.thumbnail);
                $scope.findMapsForGroup(rowItem.entity.id);
            };


            $scope.imgUrlBase = 'http://www.arcgis.com/sharing/rest/community/groups/';

            $scope.gridGrpOptions = {
                // enablePaging: true,
                rowHeight: '50',

                expandableRowTemplate : '<div ui-grid="row.entity.subGridOptions" style="height: 100px; width: 100%;"></div>',

                expandableRowHeight: 95,

                //subGridVariable will be available in subGrid scope
                expandableRowScope: {
                    subGridVariable: 'subGridScopeVariable'
                },

                columnDefs: [
                    {
                        name: 'thumbnail',
                        field: 'thumbnail',
                        width: 60,
                        displayName: 'Img',
                        resizable: false,
                        cellTemplate: "<img width=\"50px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src>"
                    },
                    {
                        name : ' ',
                        cellTemplate : '<div><button ng-click="grid.appScope.selectGroup(row)">Select</button></div>',
                        width : 60
                    },
                    {
                        field: 'title',
                        name: 'title',
                        displayName: 'Group'
                    },
                    {
                        field : 'url',
                        name : 'url',
                        visible : false
                    },
                    {
                        field: 'snippet',
                        name: 'snippet',
                        visible: false
                    },
                    {
                        field: 'id',
                        name: 'id',
                        visible: false,
                        displayName: 'ID'
                    }
                ]
            };

            // find groups based on input keyword
            $scope.findArcGISGroup = function () {
                utils.showLoading();
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

            function transformResponse(results) {
                var trnsf = [],
                    rsp,
                    i,
                    grp,
                    grpsub,
                    limit = 20,
                    colDefs = [
                        {
                            field : 'snippet',
                            name : 'snippet',
                            displayName : 'Description'
    //                        cellTemplate : '<div style="word-wrap: normal" title="{{row.getProperty(col.field)}}">{{row.getProperty(col.field)}}</div>',
                        },
                        {
                            field : 'owner',
                            name : 'owner',
                            visible : false
                        }
                    ];

                if (results.length < limit) {
                    limit = results.length;
                }
                for (i = 0; i < limit; i++) {
                    rsp = results[i];
                    grp = {};
                    grp.title = rsp.title;
                    grp.owner = rsp.owner;
                    grp.thumbnail = rsp.thumbnailUrl;
                    grp.url = rsp.url;
                    grp.id = rsp.id;
                    grp.snippet = rsp.snippet;

                    grp.subGridOptions = {};
                    grp.subGridOptions.columnDefs = colDefs;
                    grp.subGridOptions.data = [];
                    grpsub = {};
                    grpsub.snippet = rsp.snippet;
                    // grpsub.id =rsp.id;
                    grpsub.owner = rsp.owner;
                    grp.subGridOptions.data.push(grpsub);

                    trnsf.push(grp);
                }
                return trnsf;
            }

            $scope.showGroupResults = function (response) {
                var grpdata = [];
                console.log('$scope.showGroupResults');
                console.debug(response);
                console.log("response.total " + response.total);

                if (response.total > 0) {
                    console.log("found array with length " + response.total);
                    grpdata = transformResponse(response.results);

                    setTimeout(function () {
                        $scope.safeApply(console.log("showGroupResults $apply before loading grid"));
                    }, 500);

                    $scope.gridGrpOptions.data = grpdata;

                } else {
                    document.getElementById('grpGridId').innerHTML = '<h2>Group Results</h2><p>No groups were found. \
                        If the group is not public use the sign-in link to sign in and find private groups.</p>';
                }
                utils.hideLoading();
            };

            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof fn === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            $scope.gridGrpOptions.onRegisterApi = function (gridApi) {
                $scope.gridApi = gridApi;
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
                        // LinkrService.hideLinkr();
                    utils.setVisible('idMapLinkrPlugin', 'none');   // need to work on $uibModalInstance / $uibModalStack
                    // LinkrService.hideLinkr();
                    portalForSearch.signIn().then(function (loggedInUser) {
                        // $scope.$emit('SignInOutEmitEvent', true); //
                        LinkrService.showLinkr();
                        selfDict.findGrpDisabled = true;
                        $scope.findGrpDisabled = selfDict.findGrpDisabled;
                        selfDict.signInOutGrp = "Sign Out";
                        $scope.signInOutGrp = selfDict.signInOutGrp;
                        $scope.isSignedIn = selfDict.isSignedIn;
                        // $scope.safeApply();
                        $scope.findArcGISGroup(portalForSearch);   // update results
                    }, function (error) { //error so reset sign in link
                        // $scope.$emit('SignInOutEmitEvent', true); //in
                        console.log("Error returned from AGO signin");
                    });
                } else {
                    portalForSearch.signOut().then(function (portalInfo) {
                        // $scope.$emit('SignInOutEmitEvent', false); //in
                        $scope.findArcGISGroup(portalForSearch);
                    });
                }
            };

            $scope.signOut = function(isSignedIn) {
                if (isSignedIn) {
                    $scope.signInOutGrp = "Sign Out";
                } else {
                    $scope.signInOutGrp = "Sign In";
                }
            }

            // $scope.$on('SignInOutBroadcastEvent', function (event, isSignedIn) {
            //     if (isSignedIn) {
            //         $scope.signInOutGrp = "Sign Out";
            //     } else {
            //         $scope.signInOutGrp = "Sign In";
            //     }
            // });


            //display a list of groups that match the input user name

            $scope.showMapResults = function (response) {
                utils.hideLoading();
                //clear any existing results
                console.log("showMapResults");
                $rootScope.$emit('OpenMapPaneCommand', { 'respData' : response });
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
            App.controller('SearcherCtrlGrp',  ['$scope', '$rootScope', 'LinkrService', SearcherCtrlGrp]);
            // SearcherCtrlGrp.CurrentWebMapIdService= CurrentWebMapIdService;
            // selfDict.portal = portalForSearch;
            portalForSearch = portal;
            return SearcherCtrlGrp;
        }

        return { start: init };

    });
}());
// }).call(this);
