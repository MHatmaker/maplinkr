<<<<<<<<<<<<<< this one works >>>>>>>>>>>>>>>>>>>var app = angular.module('plunker', []);

app.controller('MainCtrl', function($scope) {
  $scope.showDialog = false;
  $scope.destSelections = ["Same Window", "New Tab", "New Window"];
  $scope.destSelected = "Same Window";
  console.log("initialized showDialog to : " + $scope.showDialog);
  
  toggleShow = function (){
    console.log("toggleShow from " + $scope.showDialog);
    $scope.showDialog = ! $scope.showDialog;
    console.log("toggleShow to " + $scope.showDialog);
    $scope.$apply();
    console.log("toggleShow after apply " + $scope.showDialog);
  };
});

app.directive("modalShow", function ($parse) {
  /*
    var tpl = ' \
        <div class="modal-dialog" id="innerDlg"> \
            <div class="modal-content"> \
              <div class="modal-header"> \
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                <h4 class="modal-title">Modal title</h4> \
              </div> \
              <div class="modal-body"> \
                <p>One fine bodddy&hellip;</p> \
                <label data-ng-repeat="dest in $parent.destSelections"> \
                    <input \
                        name="$parent.currentActivity" \
                        type="radio" \
                        value="{{dest}}" \
                        ng-model="$parent.destSelected" /> \
                        {{dest}} \
                </label> \
              </div> \
              <div class="modal-footer"> \
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> \
              </div> \
            </div><!-- /.modal-content --> \
        </div><!-- /.modal-dialog --> \
    ';
    */
    return {
        restrict: "A",
        //template : tpl,
        urlTemplate : "index.html",
        scope: {
            modalVisible: "="
        },
        link: function (scope, element, attrs) {

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
                });
                scope.$watch('scope.$parent.showDialog', function (newValue, oldValue) {
                    console.log("scope.$watch newValue : " + newValue);
                    console.log("scope.$watch 'scope.$parent.showDialog' : " + scope.$parent.showDialog);
                    scope.showModal(newValue);
                    //attrs.modalVisible = false;
                });


            }
                //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                //element.bind("hide.bs.modal", function () {
                $('#someDLg').on('hide.bs.modal', function () {
                    scope.modalVisible = scope.$parent.showDialog = false;
                    console.log("hide event called")
                    console.log("selection : " + destSelections)
                    if (!scope.$$phase && !scope.$root.$$phase){
                        scope.$apply();
                        //scope.$parent.toggleShow();
                    }
                });
        }

    };
});



var app = angular.module('plunker', []);

app.controller('MainCtrl', function($scope) {
  $scope.name = 'World';
  $scope.returnval = 'foo';
  $scope.data = {
        showDialog:false
  };
  $scope.showDialog = false;
  console.log("initialized showDialog to : " + $scope.showDialog);
  
  toggleShow = function (){
    console.log("toggleShow");
    $scope.data.showDialog = ! $scope.data.showDialog;
    $scope.showDialog = ! $scope.showDialog;
    $(phonyCB).checked = ! $(phonyCB).checked;
    $scope.$apply();
  };
});

app.directive("modalShow", function ($parse) {
    return {
        restrict: "A",
        scope: {
            modalVisible: "="
        },
        link: function (scope, element, attrs) {

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
                });
                scope.$watch('scope.$parent.showDialog', function (newValue, oldValue) {
                    scope.showModal(newValue);
                });

                //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                element.bind("hide.bs.modal", function () {
                    scope.modalVisible = false;
                    if (!scope.$$phase && !scope.$root.$$phase)
                        scope.$apply();
                });

            }
        }

    };
});






app.directive("modalShow", function () {
    return {
        restrict: "A",
        scope: {
            modalVisible: "="
        },
        link: function (scope, element, attrs) {

            //Hide or show the modal
            scope.showModal = function (visible) {
                if (visible)
                {
                    element.modal("show");
                }
                else
                {
                    element.modal("hide");
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
                });

                //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                element.bind("hide.bs.modal", function () {
                    scope.modalVisible = false;
                    if (!scope.$$phase && !scope.$root.$$phase)
                        scope.$apply();
                });

            }

        }
    };

});


//////////////////   earlier version 
var app = angular.module('plunker', []);

app.controller('MainCtrl', function($scope) {
  $scope.name = 'World';
  $scope.returnval = 'foo';
  $scope.data = {
        showDialog:false
  }
  console.log("initialized showDialog to : " + $scope.showDialog);
  
  toggleShow = function (){
    console.log("toggleShow");
    $scope.data.showDialog = ! $scope.data.showDialog;
  }
});

app.directive("modalShow", function ($parse) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {

            //Hide or show the modal
            scope.showModal = function (visible, elem) {
                if (!elem)
                    elem = element;

                if (visible)
                    $(elem).modal("show");                     
                else
                    $(elem).modal("hide");
            }

            //Watch for changes to the modal-visible attribute
            scope.$watch(attrs.modalShow, function (newValue, oldValue) {
                scope.showModal(newValue, attrs.$$element);
            });

            //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
            $(element).bind("hide.bs.modal", function () {
                $parse(attrs.modalShow).assign(scope, false);
                if (!scope.$$phase && !scope.$root.$$phase)
                    scope.$apply();
            });
        }

    };
});
