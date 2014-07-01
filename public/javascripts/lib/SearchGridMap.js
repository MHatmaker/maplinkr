
    //display a list of Maps that match the input user name
    function showMapResults(response) {
	  utils.hideLoading();
      //clear any existing results
      var data = [];
	  var gridMap = dijit.byId("gridMap");
      if (response.total > 0) {
        //create an array of attributes for each map - we'll display these in a dojo dgrid
        data = dojo.map(response.results, function (map) {
          return {
            'snippet': map.snippet,
            'title': map.title,
            'url': map.url,
            'thumbnail': map.thumbnailUrl || '',
            'id': map.id,
            'owner': map.owner
          }
        });
		var webMapEntryStore = null;
		require(["dojo/store/Memory"],
		function(Memory){
			webMapEntryStore = new Memory({data:data, idProperty: "id"});
			if(gridMap)
				gridMap.refresh();
		});
		require(["dojo/_base/declare", "dgrid/OnDemandGrid", "dgrid/Keyboard", "dgrid/Selection", "dojo/store/Memory","dojo/domReady!"],
		function(declare, Grid, Keyboard, Selection, Memory){
			//create the grid
			removeEntries();
			var localData = webMapEntryStore;
			var CustomGrid = declare([ Grid, Keyboard, Selection, Memory ]);
			var gridMapLocal = new CustomGrid({
			  columns: {
				thumbnail: 'map Icon',
				title: 'map',
				snippet: 'Description',
				id: 'Group ID'
			  },
			  store: webMapEntryStore,
			  renderRow: renderTableLocal,
			  selectionMode: "single", // for Selection; only select a single row at a time
			  cellNavigation: false, // for Keyboard; allow only row-level keyboard navigation
			  //this function renders the table in a non-grid looking view
			  showHeader: false
			}, "gridMap");
			gridMap = gridMapLocal;
			dojo.empty(webMapEntryStore);
			gridMapLocal.renderArray(localData.data);
			gridMapLocal.on(".dgrid-row:click", function(event){
				var row = gridMapLocal.row(event);
				if(row)
				{
					console.log("Row clicked:", row.data.id);
					// alert("Row clicked: " + row.data.id);
					console.log("Update previous " + previousSelectedWebMapId + " to " + selectedWebMapId);
					previousSelectedWebMapId = selectedWebMapId;
					selectedWebMapId = row.data.id;
					initialize(selectedWebMapId, true, row.data.title);
				}
			});
			function renderTableLocal(d)
			{
				return renderMapTable(d, null);
			}
			function removeEntries()
			{
				var rows = dojo.query(".dgrid-row", dojo.byId("gridMap"));
				dojo.forEach(rows, dojo._destroyElement);
			}
		});
      } else {
        dojo.byId('gridMap').innerHTML = '<h2>Map Results</h2><p>No Maps were found. If the Map is not public use the sign-in link to sign in and find private Maps.</p>';
      }
    }

	function thumbnailClickedMap(e)
	{
		alert("thumbnail clicked");
	}
	
    function renderMapTable(obj, options) {
      var template = '<div class="thumbnail"><img src="${0}" width="50" height="50" /></div><div class="title" >${1}<span> <i> (${2} ) </i></span></div><div class="summary">${3} </div>';
      var summary = obj.snippet || '';
      var url = portalUrl + '/home/group.html?groupid=id:' + obj.id;
      var thumbnail = obj.thumbnail || '';
      return div = dojo.create("div",{
        innerHTML : dojo.string.substitute(template,[thumbnail,obj.title,obj.owner,summary])
      });
    }

    function findArcGISGroupMaps() {
      utils.showLoading()
      var keyword = dojo.byId('mapFinder').value;
	  var params = {
		q: ' type:"Web Map" -type:"Web Mapping Application" ' + keyword,
		num: 20
	  };
	  portal.queryItems(params).then(function (data) {
			showMapResults(data);
		});
    }
	
	function findMapsForGroup(gId)
	{
      var params = {
         q:  'id : ' +  gId,
         num:20  //find 40 items - max is 100
        };
        portal.queryGroups(params).then(function(groups){
        //get group title and thumbnail url 
        if (groups.results.length > 0) {
          group = groups.results[0];
          
          //Retrieve the web maps and applications from the group and display 
          var params = {
            q: ' type:"Web Map" -type:"Web Mapping Application"',
            num: 10
          };
          group.queryItems(params).then(function (data) {
				showMapResults(data);
			});
        }
      });
	}

    // gets private groups as well
    function signInFromMapTab() {
      console.log("signInFromMapTab");
      var signInLinkMap = dojo.byId('signInMap');
      var signInLinkGrp = dojo.byId('signInGroup');

      if (signInLinkMap.value.indexOf('In') !== -1) {
        portal.signIn().then(function (loggedInUser) {
          signInLinkMap.value = "Sign Out";
          signInLinkGrp.value = "Sign Out";
          findArcGISGroupMaps();   // update results
        }, function (error) {
          signInLinkMap.value = 'Sign In';   //error so reset sign in link
          signInLinkGrp.value = "Sign In";
        });
      } else {
        portal.signOut().then(function (portalInfo) {
          signInLinkMap.value = "Sign In";
          signInLinkGrp.value = "Sign In";
          findArcGISGroupMaps();
        });
      }
    }

    //dojo.ready(function () {
    
    function readyForSearchGridMap(){
      // esri.config.defaults.io.proxyUrl = '../proxy/proxy.ashx';
      esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";

      //create the portal
      var portalUrl = document.location.protocol + '//www.arcgis.com';
      portal = new esri.arcgis.Portal(portalUrl);
      dojo.connect(portal,'onLoad',function(loaded){
        //enable the sign-in and find buttons when the portal loads
		var gfs = dojo.byId('mapFinderSubmit');
        dojo.byId('mapFinderSubmit').disabled = false;
		var siM = dojo.byId('signInMap');
        dojo.byId('signInMap').disabled =false;
      });

      //search when enter key is pressed
      dojo.connect(dojo.byId("mapFinder"), "onkeyup", function (e) {
        if (e.keyCode === 13) {
          findArcGISGroupMaps();
        }
      });
		dojo.subscribe("Accdian-selectChild", function(pane){
			console.log("A new pane was selected:", pane);
			findMapsForGroup(selectedGroupId);
		});
    };