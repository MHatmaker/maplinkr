>>>>>>>>>>>>>>>>>>  plunker >>>>>>>>>>>>>>  http://plnkr.co/edit/VnMUgAo1xZKPpKvtmqVJangular.isUndefinedOrNull = function(val) {
    return angular.isUndefined(val) || val === null 
}

var app = angular.module('plunker', []);

app.controller('MainCtrl', function($scope) {
  $scope.showDialog = false;
  $scope.destSelections = ["Same Window", "New Tab", "New Window"];
  $scope.data = {
    dstSel : $scope.destSelections[0].slice(0),
    prevDstSel :$scope.destSelections[0].slice(0),
    whichDismiss : "Cancel",
    dlg2show : "SelectWndDlg"
  };
  console.log("initialized showDialog to : " + $scope.showDialog);
  console.log("initialized dstSel to : " + $scope.data.dstSel);
  
  $scope.preserveState = function(){
    $scope.data.prevDstSel = $scope.data.dstSel.slice(0);
    console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.dstSel);
  };
  
  $scope.restoreState = function(){
    console.log("restore " + $scope.data.dstSel + " from " + $scope.data.prevDstSel);
    $scope.data.dstSel = $scope.data.prevDstSel.slice(0);
  };
  
  toggleShow = function (){
    console.log("toggleShow from " + $scope.showDialog);
    $scope.showDialog = ! $scope.showDialog;
    console.log("toggleShow to " + $scope.showDialog);
    $scope.$apply();
    console.log("toggleShow after apply " + $scope.showDialog);
  };
});

app.directive("modalShow", function ($parse) {
    return {
        restrict: "A",
        urlTemplate : "index.html",
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

                if (visible)
                    $(elem).modal("show");                     
                else
                    $(elem).modal("hide");
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
                    scope.$parent.showDialog = newValue;
                    console.log("watch modalVisiblescope.$parent data  : ");
                    console.debug(scope.$parent.data);
                    scope.$parent.preserveState();
                });
                //Watch for changes to the modal-mdata attribute
                scope.$watch("modalMdata", function (newValue, oldValue) {
                    if( ! angular.isUndefinedOrNull(newValue))
                      localScope.$parent.data = newValue;
                    console.log("watch modalMdata scope.$parent data  : ");
                    console.debug(localScope.$parent.data);
                });
                /*
                scope.$watch('scope.$parent.showDialog', function (newValue, oldValue) {
                    console.log("scope.$watch newValue : " + newValue);
                    console.log("scope.$watch 'scope.$parent.showDialog' : " + scope.$parent.showDialog);
                    scope.showModal(newValue);
                    //attrs.modalVisible = false;
                });
                */

            }
            //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
            $(element).on('hidden.bs.modal', function () {
                scope.modalVisible = localScope.$parent.showDialog = false;
                console.log("hide event called")
                if (!scope.$$phase && !scope.$root.$$phase){
                    scope.$apply();
                }
                scope.$apply();
                console.log("hidden modalMdata : ");
                console.debug(scope.$parent.data);
                console.log("whichDismiss : " + scope.$parent.whichDismiss);
                //if(scope.$parent.whichDismiss == "Cancel"){
                //  scope.$parent.restoreState();
                //console.debug(scope.$parent.data);
                //}
            });
        }

    };
});

