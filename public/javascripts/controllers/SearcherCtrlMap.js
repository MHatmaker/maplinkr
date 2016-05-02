/*global define */
/*global dojo */

angular.isUndefinedOrNull = function (val) {
    "use strict";
    return angular.isUndefined(val) || val === null;
};

(function () {
    "use strict";

    console.log('SearcherCtrlMap setup');
    define([
        'angular',
        'lib/StartupArcGIS',
        'lib/MapHosterArcGIS',
        'lib/utils',
        'lib/AgoNewWindowConfig',
        'lib/StompSetupCtrl'
    ], function (angular, StartupArcGIS, MapHosterArcGIS, utils, AgoNewWindowConfig, StompSetupCtrl) {
        console.log('SearcherCtrlMap define');
        var scopeDict = {},
            portalForSearch = null;
            // heightCalculations = {'wrapHeight' : 200, 'gridHeight' : 180, 'instructionsHeight' : 0};

        function SearcherCtrlMap($scope, $rootScope) {
            var self = this,
                selectedWebMapId = "Nada ID",
                selectedWebMapTitle = "Nada Title",
                onAcceptDestination,
                pos;

            $scope.findMapDisabled = false;
            $scope.searchTermMap = "Chicago Crime";

            $scope.isMapAccPanelOpen = false;
            $scope.signInOutMap = "Sign In";
            scopeDict.rootScope = $rootScope;

            self.scope = $scope;

            $scope.destWindow = 'cancelMashOp';
            $scope.selectedItm = "Nada";

            onAcceptDestination = function (destWnd) {
                var
                    $inj = angular.injector(['app']),
                    serv = $inj.get('CurrentMapTypeService'),
                    selMph = serv.getSelectedMapType();
                console.log("onAcceptDestination " + destWnd);
                selMph.removeEventListeners();

                console.log("onAcceptDestination " + destWnd);
                StartupArcGIS.replaceWebMap(selectedWebMapId,  destWnd, selectedWebMapTitle, selMph);
            };

            $scope.onDestinationWindowSelected = function (args) {
                var destWnd = args.dstWnd,
                    $inj = angular.injector(['app']),
                    serv = $inj.get('CurrentMapTypeService'),
                    selMph = serv.getSelectedMapType();
                console.log("onAcceptDestination " + destWnd);
                selMph.removeEventListeners();


                console.log("onDestinationWindowSelected " + destWnd);
                StartupArcGIS.replaceWebMap(selectedWebMapId,  destWnd, selectedWebMapTitle, selMph);
            };

            $scope.imgWebMapTmplt = '<img ng-src="{{row.getProperty(col.name)}}" width="50" height="50"/>';
            // $scope.imgWebMapTmplt = '<img ng-src="{{imgUrlBase}}{{row.getProperty(\'id\')}}/info/{{row.getProperty(col.field)}}" width="50" height="50" />';

            $scope.gridOptions = {
                // data: 'gridData',
                rowHeight: 50,
                // afterSelectionChange:  $scope.mapSelectionChanged,
                // multiSelect: false,
                // displayFooter: true,
                // enableColumnResize : true,
                expandableRowTemplate : '<div ui-grid="row.entity.subGridOptions" style="height: 100px; width: 100%;"></div>',


                expandableRowHeight: 95,

                //subGridVariable will be available in subGrid scope
                expandableRowScope: {
                    subGridVariable: 'subGridScopeVariable'
                },
                columnDefs: [
                    // {
                    //     name : 'thumbnail',
                    //     displayName : 'Img',
                    //     resizable : false,
                    //     width : 60,
                    //     cellTemplate : '<img ng-src="{{row.getProperty(col.name)}}" width="50" height="50"/>'
                    // },
                    {
                        field : 'title',
                        name : 'title',
                        displayName : 'Map Title'
                    },
                    {
                        field : 'owner',
                        name : 'owner',
                        displayName : 'The Owner'
                    }

                ]
            };

            function transformResponse(results) {
                var trnsf = [],
                rsp,
                i,
                mp,
                mpsub,
                colDefs = [
                    {
                        field : 'snippet',
                        name : 'snippet',
                        displayName : 'Description'
                    },
                    {
                        field : 'url',
                        name : 'url'
                    },
                    {
                        field : 'id',
                        name : 'id',
                        visible : false,
                        displayName : 'ID'
                    },
                    {
                        field : 'owner',
                        name : 'owner'
                    }
                ];


                for (i = 0; i < 4; i++) {
                    rsp = results[i];
                    mp = {};
                    mp.title = rsp.title;
                    mp.owner = rsp.owner;

                    mp.subGridOptions = {};
                    mp.subGridOptions.columnDefs = colDefs;
                    mp.subGridOptions.data = [];
                    mpsub = {};
                    mpsub.snippet = rsp.snippet;
                    mpsub.url = rsp.itemUrl;
                    mpsub.id =rsp.id;
                    mpsub.owner = rsp.owner;
                    mp.subGridOptions.data.push(mpsub);

                    trnsf.push(mp);
                }
                return trnsf;
            }

            $scope.showMapResults = function (response) {
                var mpdata = [],
                    rsp,
                    i,
                    mp = {},
                    mpsub;
                // utils.hideLoading();
                //clear any existing results
                console.log("showMapResults");
                console.debug(response);
                console.log("response.total " + response.total);
                if (!$scope.$$phase) {
                    $scope.$apply(function () {
                        console.log("showMapResults $apply before loading grid");
                    });
                }

                if (response.total > 0) {
                    console.log("found array with length " + response.total);
                    mpdata = transformResponse(response.results);

                    $scope.gridOptions.data = mpdata;

                    setTimeout(function () {
                        if (!$scope.$$phase) {
                            $scope.$apply(function(){
                                    $scope.gridOptions.data = mpdata;
                                });
                            }
                    });

                    // $scope.redrawGrid();

                }
                utils.hideLoading();
            };

            $scope.gridOptions.onRegisterApi = function (gridApi) {
                $scope.gridApi = gridApi;
/*
                gridApi.expandable.on.rowExpandedStateChanged($scope, function (row) {
                    if (row.isExpanded) {

                        $scope.expandableRowTemplate = '<div ui-grid="row.entity.subGridOptions" style="height: 100px; width: 100%;"></div>';
                        row.entity.subGridOptions = {
                            columnDefs : [
                                {
                                    field : 'snippet',
                                    name : 'snippet',
                                    displayName : 'Description'
                                },
                                {
                                    field : 'url',
                                    name : 'url'
                                },
                                {
                                    field : 'id',
                                    name : 'id',
                                    visible : false,
                                    displayName : 'ID'
                                },
                                {
                                    field : 'owner',
                                    name : 'owner'
                                }
                            ]
                        }

                        setTimeout(function () {
                            row.entity.subGridOptions.data = [];
                            row.entity.subGridOptions.data = row.entity.subGridOptions.data.concat(row.entity.subData);
                            // $scope.safeApply();
                        }, 500);
                    }
                });
*/
            };

            console.log("window width " + window.innerWidth);

            // pos = $scope.gridMapOptions.columnDefs.map(function (e) { return e.field; }).indexOf('snippet');
            // if (window.innerWidth > 500) {
            //     $scope.gridMapOptions.columnDefs[pos].visible = true;
            // } else {
            //     $scope.gridMapOptions.columnDefs[pos].visible = false;
            // }

            setTimeout(function () {
                 $scope.gridApi.grid.handleWindowResize();
                 $scope.safeApply();
             }, 1000);

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

            $scope.redrawGrid = function () {
                window.setTimeout(function () {
                    $(window).resize();
                    $(window).resize();
                }, 250);
            };

            $scope.findArcGISGroupMaps = function (portal, searchTermMap) {
                utils.showLoading();
                var mf = document.getElementById('mapFinder'),
                    mfa = angular.element(mf),
                    keyword,
                    params = {};
                mfa.scope().safeApply();
                keyword = mf.value; // searchTermMap; //dojo.byId('mapFinder').value;
                params = {
                    q: ' type:"Web Map" -type:"Web Mapping Application" ' + keyword,
                    num: 20
                };
                portalForSearch.queryItems(params).then(function (data) {
                    $scope.showMapResults(data);
                });
            };


            // gets private groups as well
            $scope.signInFromMapTab = function () {
                console.log("signInFromMapTab");
                // self.portal = portalForSearch;

                if ($scope.signInOutMap.indexOf('In') !== -1) {
                    portalForSearch.signIn().then(function (loggedInUser) {
                        $scope.$emit('SignInOutEmitEvent'); //out
                        $scope.findArcGISGroupMaps(portalForSearch, $scope.searchTermMap);   // update results
                    }, function (error) {  //error so reset sign in link
                        $scope.$emit('SignInOutEmitEvent'); //in
                    });
                } else {
                    portalForSearch.signOut().then(function (portalInfo) {
                        $scope.$emit('SignInOutEmitEvent'); //in
                        $scope.findArcGISGroupMaps(portalForSearch, $scope.searchTermMap);
                    });
                }
            };

            $scope.$on('SignInOutBroadcastEvent', function (event, isSignedIn) {
                if (isSignedIn) {
                    $scope.signInOutMap = "Sign Out";
                } else {
                    $scope.signInOutMap = "Sign In";
                }
            });

            $scope.$on('OpenMapPaneCommand', function (event, args) {
                $scope.showMapResults(args.respData);
            });

            //display a list of groups that match the input user name


            // $scope.openWindowSelectionDialog = function (modal311, selectedWebMapId, selectedMapTitle) {
            $scope.openWindowSelectionDialog = function (info) {

                var $inj = angular.injector(['app']),
                    gmQSvc = $inj.get('GoogleQueryService'),
                    scope = gmQSvc.getQueryDestinationDialogScope('arcgis'),
                    serv = $inj.get('CurrentMapTypeService'),
                    selMph = serv.getSelectedMapType();
                selMph.removeEventListeners();

                scope.showDestDialog(
                    onAcceptDestination,
                    scope,
                    {
                        'id' : info.id,
                        'title' : info.title,
                        'snippet' : info.snippet,
                        'icon' : info.icon,
                        'mapType' : info.mapType
                    }
                );
                // $scope.showDestDialog($scope.onDestinationWindowSelected, info);
                /*
                $scope.showDestDialog(function (args) {
                    var destWnd = args.dstWnd,
                        $inj = angular.injector(['app']),
                        serv = $inj.get('CurrentMapTypeService'),
                        selMph = serv.getSelectedMapType();
                    console.log("onAcceptDestination " + destWnd);
                    selMph.removeEventListeners();

                    console.log("onDestinationWindowSelected " + destWnd);
                    StartupArcGIS.replaceWebMap(selectedWebMapId,  destWnd, selectedWebMapTitle, selMph);
                },
                    info);
                // scopeDict.rootScope.$broadcast('ShowWindowSelectorModalEvent', info);
                */
            };
        }

        function init(App, portal) {
            console.log('SearcherCtrlMap init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            App.controller('SearcherCtrlMap',  ['$scope', '$rootScope', SearcherCtrlMap]);

            // SearcherCtrlMap.CurrentWebMapIdService= CurrentWebMapIdService;
            // selfDict.portal = portalForSearch;
            portalForSearch = portal;
            return SearcherCtrlMap;
        }

        return { start: init };

    });
}());
