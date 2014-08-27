var app = angular.module('plunker', []);

app.controller('MainCtrl', function($scope) {
  $scope.showDialog = false;
  $scope.destSelections = ["Same Window", "New Tab", "New Window"];
  $scope.destSelected =  $scope.destSelections[0];
  $scope.data = {
    dstSel : $scope.destSelected
  };
  $scope.mData = {
    dstSel : $scope.destSelected
  };
  console.log("initialized showDialog to : " + $scope.showDialog);
  console.log("initialized selection to : " + $scope.destSelected);
  console.log("initialized dstSel to : " + $scope.data.dstSel);
  
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
                    console.log("scope.$parent destinations= : " + scope.$parent.destSelections);
                    console.log("scope.$parent data dstSel= : " + scope.$parent.mData.dstSel);
                });
                //Watch for changes to the modal-mdata attribute
                scope.$watch("modalMdata", function (newValue, oldValue) {
                    scope.$parent.data.dstSel = newValue;
                    console.log("scope.$parent data dstSel= : " + scope.$parent.mData.dstSel);
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
                //element.bind("hide.bs.modal", function () {
                $('#someDLg').on('hidden.bs.modal', function () {
                    scope.modalVisible = localScope.$parent.showDialog = false;
                    console.log("hide event called")
                    console.log("selection : " + localScope.$parent.destSelected);
                    if (!scope.$$phase && !scope.$root.$$phase){
                        scope.$apply();
                        //scope.$parent.toggleShow();
                    scope.$apply();
                    console.log("selection : " + localScope.$parent.destSelected);
                    console.log("dstSel : " + localScope.modalMdata);
                    console.debug(localScope.modalMdata);
                    //console.log("dstSel : " + localScope.$parent.data.dstSel);
                    }
                });
        }

    };
});

