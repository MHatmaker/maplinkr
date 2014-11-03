

(function() {
    "use strict";

    console.log('WebSiteDescriptionCtrl setup');
    var areWeInitialized = false;
    define([
        'angular'
    ], function(angular) {
        console.log('WebSiteDescriptionCtrl define');  
        
        var selfdict = {};
        selfdict.isInitialized = areWeInitialized = false;
        var scopeDict = {};

        function WebSiteDescriptionCtrl($scope, $modal, $rootScope){
            console.log("in WebSiteDescriptionCtrl");
            selfdict.scope = $scope;
            selfdict.isInitialized = areWeInitialized = false;
            scopeDict['rootScope'] = $rootScope;
        
            // selfdict.callbackFunction = null;
            $scope.showDescriptionDialog = false;
            $scope.data = {
                whichSite : "",
                whichDismiss : "Cancel",
                description : "Initial description",
                image : ""
            };
            $scope.$on('ShowWebSiteDescriptionModalEvent', function(){
                console.log("ShowWebSiteDescriptionModalEvent caught");
                $scope.safeApply(function(){
                    $scope.showDescriptionDialog = true;
                });
            });

            $scope.onAcceptWebSite = function(){
                console.log("onAcceptWebSite " + $scope.data.whichSite);
                $scope.$emit('WebSiteDescriptionEvent');
            };
            
            $scope.hitEnter = function(evt){
                if(angular.equals(evt.keyCode,13) && !(angular.equals($scope.name,null) || angular.equals($scope.name,''))){
                    $scope.save();
                }
            }; // end hitEnter
            
            $scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                  if(phase == '$apply' || phase == '$digest') {
                      if(fn && (typeof(fn) === 'function')) {
                          fn();
                      }
                  } else {
                    this.$apply(fn);
                }
            };
        }  
          
        WebSiteDescriptionCtrl.prototype.isInitialized = function(){
            return areWeInitialized;
        }
        
        WebSiteDescriptionCtrl.prototype.setDescription = function(description, img){
            selfdict.scope.data.description = description;
            selfdict.scope.data.image = img;
        }
        
        function init(App) {
            console.log('WebSiteDescriptionCtrl init');
            console.debug(App);
            var CurrentWebMapIdService = App.service("CurrentWebMapIdService");
            console.debug(CurrentWebMapIdService);
            
            selfdict.isInitialized = areWeInitialized = true;
            App.controller('WebSiteDescriptionCtrl',  ['$scope', '$modal', '$rootScope', WebSiteDescriptionCtrl]);
            
            App.directive("modalShowWebsitedescription", function () {
                var tpl = ' \
                  <div class="modal-dialog", style="width: 100%;"> \
                    <div class="modal-content"> \
                      <div class="modal-header"> \
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                        <h4>This sample Web Site powered by <img src="{{$parent.data.image}}">  {{$parent.data.mapType}} is showing us :</h3> \
                      </div> \
                      <div class="modal-body"> \
                        <p style="border-style:solid; border-color:#287EC7;padding: 5px"> \
                            {{$parent.data.description}} \
                        </p> \
                        <p> \
                            Clicking on a location icon pops up available, relevant information at that address. \
                        </p> \
                      </div> \
                      <div class="modal-footer"> \
                        <button type="button" class="btn btn-primary" ng-click="$parent.data.whichDismiss = \'Accept\';" data-dismiss="modal">Accept</button> \
                        <button type="button" class="btn btn-primary" ng-click="$parent.data.whichDismiss = \'Cancel\';" data-dismiss="modal">Cancel</button> \
                      </div> \
                    </div><!-- /.modal-content --> \
                  </div><!-- /.modal-dialog --> \
                ';
                return {
                    restrict: "A",
                    template : tpl,
                    scope: {
                        modalVisible: "=",
                        modalMdata: "="
                    },
                    link: function (scope, element, attrs) {
                        var localScope = scope;
                        //Hide or show the modal
                        scope.showModal = function (visible, elem) {
                            if (!elem)
                                elem = element;

                            if (visible){
                                $(elem).modal311("show"); 

                                var $inj = angular.injector(['app']);
                                var serv = $inj.get('CurrentMapTypeService');
                                var mapType= serv.getMapTypeKey();  
                                selfdict.scope.data.mapType = mapType.charAt(0).toUpperCase() + mapType.slice(1);
                            }
                            else{
                                $(elem).modal311("hide");
                            }
                        }

                        //Check to see if the modal-visible attribute exists
                        if (!attrs.modalVisible)
                        {

                            //The attribute isn't defined, show the modal by default
                            scope.showModal(true);

                        }
                        else
                        {

                            //Watch for changes to the modal-visible attribute
                            scope.$watch("modalVisible", function (newValue, oldValue) {
                                scope.showModal(newValue);
                                console.log("watch modalVisible  : ");
                                console.debug(scope.$parent.data);
                                // scope.$parent.preserveState();
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("modalMdata", function (newValue, oldValue) {
                                if( ! angular.isUndefinedOrNull(newValue))
                                  localScope.$parent.data = newValue;
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });
                            //Watch for changes to the modal-mdata attribute
                            scope.$watch("data.whichSite", function (newValue, oldValue) {
                                if( ! angular.isUndefinedOrNull(newValue))
                                  localScope.$parent.data.whichSite = newValue;
                                console.log("watch modalMdata scope.$parent data  : ");
                                console.debug(localScope.$parent.data);
                            });
                             /* 
                            scope.$watch('scope.$parent.showDescriptionDialog', function (newValue, oldValue) {
                                console.log("scope.$watch newValue : " + newValue);
                                console.log("scope.$watch 'scope.$parent.showDescriptionDialog' : " + scope.$parent.showDescriptionDialog);
                                scope.showModal(newValue);
                                //attrs.modalVisible = false;
                            });
                              */

                        }
                        scope.ok = function () {
                            console.log("clicked ok");
                            // $modalInstance.close($scope.selected.item);
                            $modalInstance.dismiss('accept');
                        };

                        scope.cancel = function () {
                            console.log("clicked ok");
                            $modalInstance.dismiss('cancel');
                        };
                        //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                        $(element).on('hidden.bs.modal', function () {
                            scope.modalVisible = localScope.$parent.showDescriptionDialog = localScope.showDescriptionDialog =false;
                            console.log("hide event called")
                            if (!scope.$$phase && !scope.$root.$$phase){
                                scope.$apply();
                            }
                            scope.$apply();
                            console.log("hidden modalMdata : ");
                            console.debug(scope.$parent.data);
                            console.log("whichDismiss : " + scope.$parent.data.whichDismiss);
                            if(scope.$parent.data.whichDismiss == "Accept"){
                                scope.$parent.onAcceptWebSite();
                            }
                        });
                    }

                };
            });
            
            return WebSiteDescriptionCtrl;
        }
        
        return { start: init,
                  isInitialized : WebSiteDescriptionCtrl.prototype.isInitialized,
                  setDescription : WebSiteDescriptionCtrl.prototype.setDescription};

    });

}).call(this);
