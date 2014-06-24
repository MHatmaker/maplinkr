
    //display a list of groups that match the input user name
    function showGroupResults(response) {
      //clear any existing results
      var data = [];
      if (gridGroup) {
        gridGroup.refresh();
      }
      if (response.total > 0) {
        //create an array of attributes for each group - we'll display these in a dojo dgrid
        data = dojo.map(response.results, function (group) {
          return {
            'snippet': group.snippet,
            'title': group.title,
            'url': group.url,
            'thumbnail': group.thumbnailUrl || '',
            'id': group.id,
            'owner': group.owner
          }
        });
		require(["dojo/_base/declare", "dgrid/Grid", "dgrid/Keyboard", "dgrid/Selection", "dojo/domReady!"],
		function(declare, Grid, Keyboard, Selection){
			//create the grid
			var localData = data;
			var CustomGrid = declare([ Grid, Keyboard, Selection ]);
			// gridGroup = new dgrid.Grid({
			var gridGroupLocal = new CustomGrid({
			  columns: {
				thumbnail: 'Group Icon',
				title: 'Group',
				snippet: 'Description',
				id: 'Group ID'
			  },
			  renderRow: renderTableLocal,
			  selectionMode: "single", // for Selection; only select a single row at a time
			  cellNavigation: false, // for Keyboard; allow only row-level keyboard navigation
			  //this function renders the table in a non-grid looking view
			  showHeader: false
			}, "gridGroup");
			gridGroupLocal.renderArray(localData);
			// gridGroupLocal.on("dgrid-select", function(event){
				// Report the item from the selected row to the console.
				// console.log("Row selected: ", event.rows[0].data.title);
				// console.log("Row selected: ", event.rows[0].data.id);
			// });
			gridGroupLocal.on(".dgrid-row:click", function(event){
				var row = gridGroupLocal.row(event);
				console.log("Row clicked:", row.data.id);
				// alert("Row clicked: " + row.data.id);
				var container = dijit.byId("Accdian");
				selectedGroupId = row.data.id;
                var gridPaneMap = dijit.byId('MapSearcherPane');
				container.selectChild(gridPaneMap, true); 
			});
			function renderTableLocal(d)
			{
				return renderTable(d, null);
			}
		});
      } else {
        dojo.byId('groupResults').innerHTML = '<h2>Group Results</h2><p>No groups were found. If the group is not public use the sign-in link to sign in and find private groups.</p>';
      }
    }

      // var template = '<div class="thumbnail"><img src="${0}" width="50" height="50"
	  // onClick='thumbnailClicked()'<div><div>class="title" >${1}<span> <i> (${2} ) </i></span><div class="summary">${3} </div><div class="group=id">${4}</div>';
	  // var template = '<div class="thumbnail"><img src="${0}" width="50" height="50"/></div><a 	target="_blank" class="title" href=${1}>${2}</a><span> <i> (${3} ) </i></span><div class="summary">${4} </div><div class="group=id">${5}</div>';
	  
	function thumbnailClicked(e)
	{
		alert("thumbnail clicked");
	}
    function renderTable(obj, options) {
      // var template = '<div class="thumbnail"><img src="${0}" width="50" height="50" onClick="thumbnailClicked()"/></div><div class="title" >${1}<span> <i> (${2} ) </i></span></div><div class="summary">${3} </div>';
      var template = '<div class="thumbnail"><img src="${0}" width="50" height="50" /></div><div class="title" >${1}<span> <i> (${2} ) </i></span></div><div class="summary">${3} </div>';
      var summary = obj.snippet || '';
      var url = portalUrl + '/home/group.html?groupid=id:' + obj.id;
      var thumbnail = obj.thumbnail || '';
      return div = dojo.create("div",{
        innerHTML : dojo.string.substitute(template,[thumbnail,obj.title,obj.owner,summary])
      });
    }

    // find groups based on input keyword
    function findArcGISGroup() {
      var keyword = dojo.byId('groupFinder').value;
      var params = {
        q:  keyword,
        num:20  //find 40 items - max is 100
       };
       portal.queryGroups(params).then(function (data) {
        showGroupResults(data);
       });
    }

    // gets private groups as well
    function signInFromGroupTab() {
      console.log("signInFromGroupTab");
      var signInLinkMap = dojo.byId('signInMap');
      var signInLinkGrp = dojo.byId('signInGroup');

      if (signInLinkGrp.value.indexOf('In') !== -1) {
        portal.signIn().then(function (loggedInUser) {
          signInLinkMap.value = "Sign Out";
          signInLinkGrp.value = "Sign Out";
          findArcGISGroup();   // update results
        }, function (error) {
          signInLinkMap.value = 'Sign In';   //error so reset sign in link
          signInLinkGrp.value = 'Sign In';   //error so reset sign in link
        });
      } else {
        portal.signOut().then(function (portalInfo) {
          signInLinkMap.value = "Sign In";
          signInLinkGrp.value = "Sign In";
          findArcGISGroup();
        });
      }
    }

    dojo.ready(function () {
      // esri.config.defaults.io.proxyUrl = '../proxy/proxy.ashx';
      esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";

	  // var baseUrl = location.pathname.replace(/\/[^/]+$/, "/../../../js/");
	  // dojoConfig.packages = [
					// { name: "dgrid", location: baseUrl + "dgrid" },
					// { name: "xstyle", location: baseUrl + "xstyle" },
					// { name: "put-selector", location: baseUrl + "put-selector" }];

      //create the portal
      portal = new esri.arcgis.Portal(portalUrl);
      dojo.connect(portal,'onLoad',function(loaded){
        //enable the sign-in and find buttons when the portal loads
		var gfs = dojo.byId('groupFinderSubmit');
        dojo.byId('groupFinderSubmit').disabled = false;
		var siG = dojo.byId('signInGroup');
        dojo.byId('signInGroup').disabled =false;
      });

      //search when enter key is pressed
      dojo.connect(dojo.byId("groupFinder"), "onkeyup", function (e) {
        if (e.keyCode === 13) {
          findArcGISGroup();
        }
      });
    });