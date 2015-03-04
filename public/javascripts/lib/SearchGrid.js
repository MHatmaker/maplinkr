
var portalForSearch;
	function thumbnailClicked(e)
	{
		alert("thumbnail clicked");
	}
    function renderTable(obj, options) {
      // var template = '<div class="thumbnail"><img src="${0}" width="50" height="50" onClick="thumbnailClicked()"/></div><div class="title" >${1}<span> <i> (${2} ) </i></span></div><div class="summary">${3} </div>';
      var template = '<div class="thumbnail"><img src="${0}" width="50" height="50" /></div><div class="title" >${1}<span> <i> (${2} ) </i></span></div><div class="summary">${3} </div>';
      var summary = obj.snippet || '';
      // var url = portalUrl + '/home/group.html?groupid=id:' + obj.id;
      var url = portalForSearch + '/home/group.html?groupid=id:' + obj.id;
      var thumbnail = obj.thumbnail || '';
      return div = dojo.create("div",{
        innerHTML : dojo.string.substitute(template,[thumbnail,obj.title,obj.owner,summary])
      });
    }

    // gets private groups as well
    function signInFromGroupTab() {
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

    //dojo.ready(function () {

    function readyForSearchGrid(portal){
      portalForSearch = portal;
      // esri.config.defaults.io.proxyUrl = '../proxy/proxy.ashx';
      esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";

	  // var baseUrl = location.pathname.replace(/\/[^/]+$/, "/../../../js/");
	  // dojoConfig.packages = [
					// { name: "dgrid", location: baseUrl + "dgrid" },
					// { name: "xstyle", location: baseUrl + "xstyle" },
					// { name: "put-selector", location: baseUrl + "put-selector" }];

      //create the portal

      dojo.connect(portalForSearch,'onLoad',function(loaded){
        //enable the sign-in and find buttons when the portal loads
		var gfs = dojo.byId('groupFinderSubmit');
        dojo.byId('groupFinderSubmit').disabled = false;
		var siG = dojo.byId('signInGroup');
        dojo.byId('signInGroup').disabled =false;
      });

      //search when enter key is pressed
     /*  dojo.connect(dojo.byId("groupFinder"), "onkeyup", function (e) {
        if (e.keyCode === 13) {
          findArcGISGroup();
        }
      }); */
    };
