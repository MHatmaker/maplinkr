
var utils = (function()
{
    var hgtComponents = {
        "totalHgt" : null,
        "idMasterSite" : null,
        "idMasterSiteExpander": null,
        "idMasterSiteSummary" : null,
        "idNavigator" : null,
        "idSiteTopRow" : null,
        "idFooter" : null,
    };
    
    var prevTotalHgt = 0;

    function showHeights(prev, now){
        var prevStr = "Previous total height : " + prev;
        var nowStr = " New total height : " + now;
        //alert(prevStr + nowStr);
    }

    function showRelativeHeights(totTot, tot, elem){
        var totTotStr = "grand total height : " + totTot;
        var totStr = " total height : " + tot;
        var elemStr = " element height : " + elem;
        //alert(totTotStr + totStr + elemStr);
    }
    
    function getDocHeight() {
    // return Math.max(
        // document.body.scrollHeight, document.documentElement.scrollHeight,
        // document.body.offsetHeight, document.documentElement.offsetHeight,
        // document.body.clientHeight, document.documentElement.clientHeight
    // );
    return window.innerHeight - 30;
    }

    function getButtonHeight(){
        var btnHeight = getElemHeight("idExpButtonSum");
        return btnHeight * 0.6;
    }
      
    function getElemHeight(itm){
        var elem = document.getElementById(itm);
        var elemHeight = elem.clientHeight;
        return elemHeight;
    }
    
    function calculateComponentHeights(sumvis, sitevis){
        var totalHgt = 0;
        var masterSiteHgt = 0;
        var hgt = 0;
        hgtComponents.idMasterSite =  masterSiteHgt = getDocHeight();
        hgtComponents.idMasterSiteExpander =  hgt = getElemHeight("idMasterSiteExpander"); totalHgt += hgt;
        hgtComponents.idMasterSiteSummary =  hgt = getElemHeight("idMasterSiteSummary"); totalHgt += hgt;
        hgtComponents.idNavigator =  hgt = getElemHeight("idNavigator");  totalHgt += hgt;
        hgtComponents.idSiteTopRow =  hgt = getElemHeight("idSiteTopRow"); totalHgt += hgt;
        hgtComponents.idFooter =  hgt = getElemHeight("idFooter");  totalHgt += hgt;
        hgtComponents.totalHgt = totalHgt;
        console.log(masterSiteHgt);
    }
  
  
  function getComponentHeights(sumVis, siteVis){
    var totalHgt = 0;
    if(sumVis == "inline"){
      if(siteVis == 'flex'){
        totalHgt = hgtComponents.totalHgt;
        showRelativeHeights(totalHgt, getDocHeight(), hgtComponents.idMasterSiteSummary);
      }
      else{
        totalHgt = hgtComponents.totalHgt - hgtComponents.idSiteTopRow - hgtComponents.idFooter;
        showRelativeHeights(totalHgt, getDocHeight(), hgtComponents.idMasterSiteSummary);
      }
    }
    else{  // sumVis == "none"
      if(siteVis == 'flex'){
        totalHgt = hgtComponents.totalHgt - hgtComponents.idMasterSiteSummary;
        showRelativeHeights(totalHgt, getDocHeight(), hgtComponents.idMasterSiteSummary);
      }
      else{
        totalHgt = hgtComponents.idMasterSiteExpander + hgtComponents.idNavigator;
        showRelativeHeights(totalHgt, getDocHeight(), hgtComponents.idMasterSiteSummary);
      }
    }
    if($scope.NavigatorVis == "none"){
        totalHgt -= hgtComponents.idNavigator;
    }
    
    return totalHgt;
  }
  
  function getAvailableSiteColumnHeights(sumVis, siteVis){
    var totalHgt = 0;
    var colHgt = 0;
    if( sumVis == "inline"){
      if(siteVis == 'flex'){
        var colHgtB = getDocHeight() - hgtComponents.totalHgt;
        colHgt = colHgtB
        showRelativeHeights(colHgt, getDocHeight(), hgtComponents.idMasterSiteSummary);
      }
      else{ // siteVis == "none"
        var colHgtBB = getDocHeight() -  hgtComponents.idMasterSiteExpander
          - hgtComponents.idMasterSiteSummary - hgtComponents.idNavigator;
        colHgt = colHgtBB;
        showRelativeHeights(colHgt, getDocHeight(), hgtComponents.idMasterSiteSummary);
      }
    }
    else{ // sumVis == "none"
      if(siteVis == 'flex'){
        var colHgtA = getDocHeight() - hgtComponents.idMasterSiteExpander - hgtComponents.idNavigator - 
          hgtComponents.idSiteTopRow - hgtComponents.idFooter;
        colHgt = colHgtA;
        showRelativeHeights(colHgt, getDocHeight(), hgtComponents.idMasterSiteSummary);
      }
      else{ // siteVis == "none"
        var colHgtAA = getDocHeight() - hgtComponents.idMasterSiteExpander - hgtComponents.idNavigator;
        colHgt = colHgtAA;
        showRelativeHeights(colHgt, getDocHeight(), hgtComponents.idMasterSiteSummary);
      }
    }
    if($scope.NavigatorVis == "none"){
        colHgt += hgtComponents.idNavigator;
    }
    return colHgt;
  }
  
    var toFixedTwo = function (x, y, precision) 
    {
		var fixed = {
			lon : toFixedOne(x, precision),
			lat : toFixedOne(y, precision)
		}
		return fixed;
    };
	
    toFixedOne = function (value, precision) 
    {
        var precision = precision || 0,
            neg = value < 0,
            power = Math.pow(10, precision),
            value = Math.round(value * power),
            integral = String((neg ? Math.ceil : Math.floor)(value / power)),
            fraction = String((neg ? -value : value) % power),
            padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
		sign = neg ? "-" : "";
		if(integral[0] == '-')
			sign = "";

        return sign + (precision ? integral + '.' +  padding + fraction : integral);
    };
    showLoading = function () 
    {
        console.log("show loading");
        esri.show(loading);
        
    };

    hideLoading = function (error) 
    {
        console.log("hide loading");
        esri.hide(loading);
    };
    
	return {
		toFixed : toFixedTwo,
        toFixedOne: toFixedOne,
        showLoading : showLoading,
        hideLoading : hideLoading
	}
})();