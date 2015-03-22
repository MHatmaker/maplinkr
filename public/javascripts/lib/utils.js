

(function() {
    "use strict";
    // alert("utils created");
    define([],

        function() {

        var alreadyCalculated = false;
        var topRowHeight = 0;

        var hgtComponents = {
            "totalHgt" : null,
            "idMasterSite" : null,
            "idMasterSiteExpander": null,
            "idMasterSiteSummary" : null,
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

        function displayHeights(purpose){
            console.log(purpose);
            var fullString = " ";
            var counter = 0;
            for (var key in hgtComponents) {
                if (hgtComponents.hasOwnProperty(key)) {
                    counter += 1;
                    // console.log(key, hgtComponents[key]);
                    var hstr = String.format("{0} : {1} ", key, hgtComponents[key]);
                    fullString += hstr;
                    if(counter % 3 == 0){
                        console.log(fullString);
                        fullString = "";
                    }
                }
            }
            console.log(fullString);
        }

        function getDocHeight() {
        // return Math.max(
            // document.body.scrollHeight, document.documentElement.scrollHeight,
            // document.body.offsetHeight, document.documentElement.offsetHeight,
            // document.body.clientHeight, document.documentElement.clientHeight
        // );
        return window.innerHeight;
        }

        function getRootElementFontSize( ) {
            // Returns a number
            var fontSize = parseFloat(
                // of the computed font-size, so in px
                getComputedStyle(
                    // for the root <html> element
                    document.documentElement
                )
                .fontSize
            );
            return fontSize;
        }

        function convertRem(value) {
            return value * getRootElementFontSize();
        }

        function getButtonHeight(m){
            var btnHeight = convertRem(m);
            btnHeight = btnHeight; // / 16;
            return btnHeight;
        }
        /*
        function getButtonHeight(id){
            var btnHeight = getElemHeight(id);
            return btnHeight * 0.6;
        }
           */
        function getElemHeight(itm){
            var elem = document.getElementById(itm);
            var elemHeight = elem.clientHeight;
            return elemHeight;
        }

        function setElementHeight(itm, hgt, units){
            // var elem = angular.element(document.getElementById(itm))[0];
            if(typeof(units)==='undefined') units = 'px';
            var elem = document.getElementById(itm);
            var hstr = String.format("{0}{1}", hgt, units);
            // elem.css({"height": hstr});
            elem.setAttribute("style","height:" + hstr);
        }

        function setVisible(itm, flexnone){
            var elem = document.getElementById(itm);
            elem.visible = flexnone == 'flex' ? 'visible' : 'none';
        }

        function getTopRowHeight(){
            console.log("top row height ||||||||||||||  " + hgtComponents.idSiteTopRow);
            return hgtComponents.idSiteTopRow;
        }

        function getFooterHeight(){
            return hgtComponents.idFooter;
        }

        function getMasterSiteHeight(){
            return hgtComponents.idMasterSite - hgtComponents.idMasterSiteExpander;
        }

              //
            //   function getComponentHeights(sumVis, siteVis){
            //     var totalHgt = 0;
            //     if(sumVis == "inline"){
            //       if(siteVis == 'none'){
            //         totalHgt = hgtComponents.totalHgt - hgtComponents.idSiteTopRow - hgtComponents.idFooter;
            //       }
            //       else{
            //         totalHgt = hgtComponents.totalHgt;
            //       }
            //     }
            //     else{  // sumVis == "none"
            //       if(siteVis == 'none'){
            //         totalHgt = hgtComponents.idMasterSiteExpander;
            //       }
            //       else{
            //         totalHgt = hgtComponents.totalHgt - hgtComponents.idMasterSiteSummary;
            //       }
            //     }
              //
            //     return totalHgt;
            //   }

        function calculateComponentHeights(sumvis, sitevis){
            var totalHgt = 0;
            var hgt = 0;
            setVisible("idSiteTopRow", sitevis);
            var currentTopRowHeight = 0;
            if(alreadyCalculated == false){
                topRowHeight = getElemHeight("idSiteTopRow");
                alreadyCalculated = true;
            }
            currentTopRowHeight = sitevis == 'flex' ? topRowHeight : 0;
            hgtComponents.idMasterSite = getDocHeight(); // - 30;
            hgtComponents.idMasterSiteExpander =  hgt = getElemHeight("idMasterSiteControlRow"); totalHgt += hgt;
            hgtComponents.idMasterSiteSummary =  hgt = getElemHeight("idMasterSiteSummary"); totalHgt += hgt;
            hgtComponents.idSiteTopRow =  hgt = currentTopRowHeight; totalHgt += hgt;
            hgtComponents.idFooter =  hgt = getElemHeight("idFooter") + 10;  totalHgt += hgt;
            hgtComponents.totalHgt = totalHgt;
            console.log("calculateComponentHeights : sitevis, " + sitevis);
            console.log("calculateComponentHeights : master site height, " + hgtComponents.idMasterSite);
            console.log("calculateComponentHeights : top row height, " + hgtComponents.idSiteTopRow)
            // displayHeights("####calculateComponentHeights###");
        }

      function getAvailableSiteColumnHeights( sumVis, siteVis){
        var colHgt = 0;
        if( sumVis == "inline"){
          if(siteVis == 'none'){
            var colHgtBB = hgtComponents.idMasterSite -  hgtComponents.idMasterSiteExpander
              - hgtComponents.idMasterSiteSummary;
            colHgt = colHgtBB;
            }
            else{
              var colHgtB = hgtComponents.idMasterSite - hgtComponents.totalHgt;
              colHgt = colHgtB;
          }
        }
        else{ // sumVis == "none"
          if(siteVis == 'none'){
            var colHgtAA = hgtComponents.idMasterSite - hgtComponents.idMasterSiteExpander
               - hgtComponents.idFooter;
            colHgt = colHgtAA;
          }
          else{ // siteVis == "flex, etc."
            var colHgtA = hgtComponents.idMasterSite - hgtComponents.idMasterSiteExpander
               - hgtComponents.idSiteTopRow - hgtComponents.idFooter;
            colHgt = colHgtA
          }
        }
        showRelativeHeights(colHgt, hgtComponents.idMasterSite, hgtComponents.idMasterSiteSummary);
        // displayHeights("####getAvailableSiteColumnHeights###");
        return colHgt;
      }

        function toFixedTwo (x, y, precision)
        {
            var fixed = {
                lon : toFixedOne(x, precision),
                lat : toFixedOne(y, precision)
            }
            return fixed;
        };

        function toFixedOne(value, precision)
        {
            var precision = precision || 0,
                neg = value < 0,
                power = Math.pow(10, precision),
                value = Math.round(value * power),
                integral = String((neg ? Math.ceil : Math.floor)(value / power)),
                fraction = String((neg ? -value : value) % power),
                padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
            var sign = neg ? "-" : "";
            if(integral[0] == '-')
                sign = "";

            return sign + (precision ? integral + '.' +  padding + fraction : integral);
        };
        function showLoading ()
        {
            console.log("show loading");
            esri.show(loading);

        };

        function hideLoading(error)
        {
            console.log("hide loading");
            esri.hide(loading);
        };

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return {
            showHeights : showHeights,
            getDocHeight : getDocHeight,
            getButtonHeight : getButtonHeight,
            displayHeights : displayHeights,
            calculateComponentHeights : calculateComponentHeights,
//            getComponentHeights : getComponentHeights,
            getAvailableSiteColumnHeights : getAvailableSiteColumnHeights,
            getTopRowHeight : getTopRowHeight,
            getFooterHeight : getFooterHeight,
            getMasterSiteHeight : getMasterSiteHeight,
            getElemHeight : getElemHeight,
            setElementHeight : setElementHeight,
            toFixed : toFixedTwo,
            toFixedOne: toFixedOne,
            showLoading : showLoading,
            hideLoading : hideLoading,
            getRandomInt : getRandomInt
        }
    });
}).call(this);
