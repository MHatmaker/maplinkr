/*global define */
/*global console */

(function () {
    "use strict";

    console.log('MapColCtrl setup');
    define([
        'angular',
        'controllers/MapLinkrPluginCtrl'
    ], function (angular, MapLinkrPluginCtrl) {
        console.log('MapColCtrl define');

        function MapColCtrl($scope, $uibModal) {
            console.log("in MapColCtrl");

            $scope.mldata = {
                'news' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'using' : {
                    'isCollapsed' : true,
                    'destchoices' : {
                        'Same Window' : {
                            'choice' : 'Same Window',
                            'details' : {
                                'isCollapsed' : true,
                                'text' : 'The newly selected map replaces the current map in the map viewer to the left.'
                            }
                        },

                        'New Tab' : {
                            'choice' : 'New Tab',
                            'details' : {
                                'isCollapsed' : true,
                                'text' : 'The newly selected map opens in a new tab in the current browser. \
                                       Switch to the tab and drag the tab to the desktop, which displays \
                                        the tab\'s contents in a completely new browser instance. \
                                          This is a fully functional web browser.'
                            }
                        },

                        'New Window' : {
                            'choice' : 'New Window',
                            'details' : {
                                'isCollapsed' : true,
                                'text' : 'The newly selected map is opened in a map viewer in a \
                                    new popup  window.  Although this is not a full-featured new \
                                    web browser instance, it provides complete functionality as \
                                     a synchronized map viewer.  If  popups are turned off, \
                                     use sequence described under the \'New Tab\' option above.'
                            }
                        },

                    }

                },
                'groups' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },

                'maps' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'shareinst' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'copyurl' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'setchannel' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'publishurl' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'positionview' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'callback' : null,
                'isOpen' : false,
                'mapLinkrBtnText' : 'Show MapLinkr'
            };
/*
                itmCollapsed = [
                    {
                        'itm' : 'news',
                        'collapsed' : true
                    }
                    {
                        'itm' : 'using',
                        'collapsed' : true
                    }
                ]
            }
*/
            $scope.onMapLinkrClicked = function () {
                console.log("onMapLinkrClicked");

                $scope.mldata.isOpen = true;
                $scope.mldata.mapLinkrBtnText = "Hide MapLinkr";
                console.debug($scope.mldata);

                var modalInstance = $uibModal.open({
                    // template : tmplt,
                    templateUrl : '/templates/MapLinkrPlugin',   // .jade will be appended
                    controller : 'MapLinkrPluginCtrl',
                    backdrop : 'false',

                    resolve : {
                        data: function () {
                            return $scope.mldata;
                        }
                    }
                });

                modalInstance.result.then(function (msg) {
                    console.log("return from showing MapLinkr`dialog");
                    console.log(msg);
                    $scope.mldata.mapLinkrBtnText = "Show MapLinkr";
                    $scope.mldata.isOpen = false;
                }, function () {
                    console.log('MapLinkr Modal dismissed at: ' + new Date());
                    $scope.mldata.mapLinkrBtnText = "Show MapLinkr";
                    $scope.mldata.isOpen = false;
                });
            };

            $scope.mldata.callback = function () {
                return $scope.mldata;
            };
        }

        function init(App) {
            console.log('MapColCtrl init');
            console.debug(App);
            var ctrl = App.controller('MapColCtrl',  ['$scope', '$uibModal', MapColCtrl]);
            console.debug(ctrl);

            return MapColCtrl;
        }

        return { start: init};
    });

}());
