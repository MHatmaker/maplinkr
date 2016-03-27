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
        'lib/utils'
    ], function (angular, StartupArcGIS, MapHosterArcGIS, utils) {
        console.log('SearcherCtrlMap define');
        var scopeDict = {},
            portalForSearch = null;
            // heightCalculations = {'wrapHeight' : 200, 'gridHeight' : 180, 'instructionsHeight' : 0};

        function SearcherCtrlMap($scope, $rootScope) {
            var self = this,
                selectedWebMapId = "Nada ID",
                selectedWebMapTitle = "Nada Title",
                pos;

            $scope.findMapDisabled = false;
            $scope.searchTermMap = "Chicago Crime";

            $scope.isMapAccPanelOpen = false;
            $scope.signInOutMap = "Sign In";
            scopeDict.rootScope = $rootScope;

            self.scope = $scope;

            $scope.destWindow = 'cancelMashOp';
            $scope.selectedItm = "Nada";
            $scope.destSelections = ["Same Window", "New Tab", "New Pop-up Window"];

            $scope.mapSelectionChanged = function (rowItem, event) {
                console.debug(rowItem.entity);
                console.debug(rowItem.entity.title);
                // previousSelectedWebMapId = selectedWebMapId;
                selectedWebMapId = rowItem.entity.id;
                selectedWebMapTitle = rowItem.entity.title;
                $scope.openWindowSelectionDialog(
                    {
                        'id' : rowItem.entity.id,
                        'title' : rowItem.entity.title,
                        'snippet' : rowItem.entity.snippet,
                        'icon' : rowItem.entity.thumbnail,
                        'mapType' : MapHosterArcGIS,
                        'destSelections' : $scope.destSelections
                    }
                );
            };

            $scope.onDestinationWindowSelected = function (args) {
                var destWnd = args.dstWnd,
                    $inj = angular.injector(['app']),
                    serv = $inj.get('CurrentMapTypeService'),
                    selMph = serv.getSelectedMapType();
                console.log("onAcceptDestination " + destWnd);
-               selMph.removeEventListeners();


                console.log("onDestinationWindowSelected " + destWnd);
                StartupArcGIS.replaceWebMap(selectedWebMapId,  destWnd, selectedWebMapTitle, selMph);
            };

            $scope.mapGriddata = [];

                // {"id" : "ca8219b99d9442a8b21cd61e71ee48b8","title" : "Somewhere in Chicago", "snippet" : "foo", "thumbnail" : "thumbnail/foo.jpg"},
                // {"id" : "0ba4d84db84e4564b936ec548ea91575","title" : "2013 Midwest Tornado Outbreak", "snippet" : "bar", "thumbnail" : "thumbnail/bar.jpg"}
                // ];
            $scope.imgWebMapTmplt = '<img ng-src="{{row.getProperty(col.field)}}" width="50" height="50" />';

            $scope.gridMapOptions = {
                data: 'mapGriddata',
                rowHeight: '50',
                afterSelectionChange:  $scope.mapSelectionChanged,
                multiSelect: false,
                displayFooter: true,
                enableColumnResize : true,

                columnDefs: [
                    {
                        field : 'thumbnail',
                        width : '50px',
                        displayName : 'Img',
                        resizable : false,
                        cellTemplate : $scope.imgWebMapTmplt
                    },
                    {
                        field : 'snippet',
                        width : '40%',
                        displayName : 'Description'
                    },
                    {
                        field : 'title',
                        width : '40%',
                        displayName : 'Map Title'
                    },
                    {
                        field : 'id',
                        visible : false,
                        width : '0',
                        displayName : 'ID'
                    }
                ]

            };

            console.log("window width " + window.innerWidth);

            pos = $scope.gridMapOptions.columnDefs.map(function (e) { return e.field; }).indexOf('snippet');
            if (window.innerWidth > 500) {
                $scope.gridMapOptions.columnDefs[pos].visible = true;
            } else {
                $scope.gridMapOptions.columnDefs[pos].visible = false;
            }

            $scope.calculateInstructionHeight = function () {
                var label = angular.element(document.getElementById("mapSearchLabel")),
                    instructions = document.getElementById("mapSrchInstId"),

                    instructionsHgt = instructions.offsetHeight,
                    // console.log("instructionsHgt " + instructionsHgt);
                    srcTerm = angular.element(document.getElementById("mapFinder")),
                    hgt = label[0].offsetHeight + instructionsHgt + srcTerm[0].offsetHeight;
                // console.log("Instructions height : " + hgt);
                return hgt;
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
                    height = +($scope.mapGriddata.length * rowHeight + headerHeight);

                if (height > availableHgt) {
                    height = availableHgt;
                }
                return height;
            };

            $scope.getGridStyleMap = function () {
                var height = $scope.calculateHeights() - 8,
                    heightStr = String(height) + "px";
                return {
                    height: heightStr
                };
            };

            $scope.getGridStyleWrapper = function () {
                var height = $scope.calculateHeights(),
                    heightStr = String(height) + "px";
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

            $scope.showMapResults = function (response) {
                var mpdata = [];
                // utils.hideLoading();
                //clear any existing results
                console.log("showMapResults");
                console.debug(response);
                console.log("response.total " + response.total);
                if (response.total > 0) {
                    console.log("found array with length " + response.total);
                    mpdata = [];

                    mpdata = dojo.map(response.results, function (map) {
                        return {
                            'snippet': map.snippet,
                            'title': map.title,
                            'url': map.itemUrl,
                            'thumbnail': map.thumbnailUrl || '',
                            'id': map.id,
                            'owner': map.owner
                        };
                    });


                    // $scope.calculateHeights();
                    //create the grid
                    $scope.mapGriddata = [];
                    $scope.mapGriddata = $scope.mapGriddata.concat(mpdata);
                    // $scope.redrawGrid();
                    // $scope.updateLayout();
                    if (!$scope.$$phase) {
                        $scope.$apply(function () {
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
                utils.hideLoading();
            };

            // $scope.openWindowSelectionDialog = function (modal311, selectedWebMapId, selectedMapTitle) {
            $scope.openWindowSelectionDialog = function (info) {

                $scope.showDestDialog($scope.onDestinationWindowSelected, info);
                // scopeDict.rootScope.$broadcast('ShowWindowSelectorModalEvent', info);
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
