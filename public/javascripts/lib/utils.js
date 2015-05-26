/*global define */
/*global getComputedStyle*/
/*global esri*/
/*global loading*/

(function () {
    "use strict";
    // alert("utils created");
    define([],

        function () {

            var alreadyCalculated = false,
                topRowHeight = 0,

                hgtComponents = {
                    "totalHgt" : null,
                    "idMasterSite" : null,
                    "idMasterSiteExpander": null,
                    "idMasterSiteSummary" : null,
                    "idSiteTopRow" : null,
                    "idFooter" : null
                };

            function showHeights(prev, now) {
                var prevStr = "Previous total height : " + prev,
                    nowStr = " New total height : " + now;
                console.log("showHeights : " + prevStr + nowStr);
            }

            function showRelativeHeights(totTot, tot, elem) {
                var totTotStr = "grand total height : " + totTot,
                    totStr = " total height : " + tot,
                    elemStr = " element height : " + elem;
                //alert(totTotStr + totStr + elemStr);
                console.log("showRelativeHeights : " + totTotStr + totStr + elemStr);
            }

            function displayHeights(purpose) {
                console.log(purpose);
                var fullString = " ",
                    counter = 0,
                    hstr,
                    key;
                for (key in hgtComponents) {
                    if (hgtComponents.hasOwnProperty(key)) {
                        counter += 1;
                        // console.log(key, hgtComponents[key]);
                        hstr = String.format("{0} : {1} ", key, hgtComponents[key]);
                        fullString += hstr;
                        if (counter % 3 === 0) {
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

            function getRootElementFontSize() {
                // Returns a number
                var fontSize = parseFloat(
                    // of the computed font-size, so in px
                    getComputedStyle(
                        // for the root <html> element
                        document.documentElement
                    ).fontSize
                );
                return fontSize;
            }

            function convertRem(value) {
                return value * getRootElementFontSize();
            }

            function getButtonHeight(m) {
                var btnHeight = convertRem(m);
                // btnHeight = btnHeight; // / 16;
                return btnHeight;
            }
            /*
            function getButtonHeight(id) {
                var btnHeight = getElemHeight(id);
                return btnHeight * 0.6;
            }
               */
            function getElemHeight(itm) {
                var elem = document.getElementById(itm),
                    elemHeight = elem.clientHeight;
                return elemHeight;
            }

            function setElementHeight(itm, hgt, units) {
                var elem, hstr;
                // var elem = angular.element(document.getElementById(itm))[0];
                if (units === undefined) {
                    units = 'px';
                }
                elem = document.getElementById(itm);
                hstr = String.format("{0}{1}", hgt, units);
                // elem.css({"height": hstr});
                elem.setAttribute("style", "height:" + hstr);
            }

            function setElementWidth(itm, wdth, units) {
                // var elem, wstr;
                // var elem = angular.element(document.getElementById(itm))[0];
                if (units === undefined) {
                    units = 'px';
                }
                // elem = document.getElementById(itm);
                // wstr = String.format("{0}{1}", wdth, units);
                // elem.css({"height": hstr});
            }

            function getElementDimension(itm, dim) {
                var elem = document.getElementById(itm),
                    ElemDim = dim === 'height' ? elem.clientHeight : elem.clientWidth;
                console.log(itm + ' ' + dim + ' is initially ' + ElemDim);
                return ElemDim;
            }

            function setElementDimension(itm, dim, value, units) {
                var elem, dimstr;
                if (units === undefined) {
                    units = 'px';
                }
                elem = document.getElementById(itm);
                dimstr = String.format("{0} : {1}{2}", dim, value, units);
                console.log("dim string : " + dimstr);
                elem.setAttribute("style", dimstr);
            }

            function setVisible(itm, flexnone) {
                var elem = document.getElementById(itm);
                elem.visible = flexnone === 'flex' ? 'visible' : 'none';
                elem.style.display = flexnone;
            }

            function recalculateTopRow(flexnone) {
                var topRow = document.getElementById("idSiteTopRow"),
                    tpr;
                console.log("initial height : " + getElemHeight("idSiteTopRow") + ", " + topRow.clientHeight);
                if (flexnone === 'none') {
                    console.log("recalculateTopRow setting to none");
                    setVisible('idSiteTopRow', 'flex');
                    topRowHeight = topRow.clientHeight;
                    console.log("set topRowHeight to interim value " + topRowHeight);
                    setVisible('idSiteTopRow', 'none');
                } else {
                    console.log("recalculateTopRow setting to flex");
                    topRowHeight = getElemHeight("idSiteTopRow");
                    setVisible('idSiteTopRow', 'none');
                    topRowHeight = topRow.scrollHeight; //getElemHeight("idSiteTopRow");
                    console.log("set topRowHeight to interim value " + topRowHeight);
                    console.log("top row while hidden has clientHeight " + topRow.clientHeight);
                    setVisible('idSiteTopRow', 'flex');
                    topRow.style.display = 'flex';
                    // setTimeout(function () {
                    console.log("???????????? in timeout for recalc");
                    tpr = document.getElementById("idSiteTopRow");
                    topRowHeight = tpr.scrollHeight; //getElemHeight("idSiteTopRow");
                    console.log("top row after reshowing has clientHeight " + tpr.clientHeight);
                    tpr.style.height = topRowHeight + "px";
                    // }, 500);
                }
                console.log("final height : " + getElemHeight("idSiteTopRow") + ", " + topRow.scrollHeight);
            }

            function getTopRowHeight() {
                console.log("top row height ||||||||||||||  " + hgtComponents.idSiteTopRow);
                return hgtComponents.idSiteTopRow;
            }

            function getFooterHeight() {
                return hgtComponents.idFooter;
            }

            function getMasterSiteHeight() {
                return hgtComponents.idMasterSite - hgtComponents.idMasterSiteExpander;
            }

            function calculateComponentHeights(sumvis, sitevis) {
                var totalHgt = 0;
                if (alreadyCalculated === false) {
                    topRowHeight = getElemHeight("idSiteTopRow");
                    alreadyCalculated = true;
                }
                // recalculateTopRow(sitevis);
                // var tpr = document.getElementById("idSiteTopRow");
                // topRowHeight = tpr.scrollHeight; //getElemHeight("idSiteTopRow");
                // currentTopRowHeight = sitevis == 'flex' ? topRowHeight : 0;
                hgtComponents.idMasterSite = getDocHeight(); // - 30;
                totalHgt += hgtComponents.idMasterSiteExpander = getElemHeight("idMasterSiteControlRow");
                totalHgt += hgtComponents.idMasterSiteSummary = getElemHeight("idMasterSiteSummary");
                totalHgt += hgtComponents.idSiteTopRow = getElemHeight('idSiteTopRow');
                totalHgt += hgtComponents.idFooter = getElemHeight("idFooter") + 10;
                hgtComponents.totalHgt = totalHgt;
                console.log("calculateComponentHeights : sitevis, " + sitevis);
                console.log("calculateComponentHeights : master site height, " + hgtComponents.idMasterSite);
                console.log("calculateComponentHeights : top row height, " + hgtComponents.idSiteTopRow);
                // displayHeights("####calculateComponentHeights###");
            }

            function getAvailableSiteColumnHeights(sumVis, siteVis) {
                var colHgt = 0;
                if (sumVis === "inline") {
                    if (siteVis === 'none') {
                        colHgt = hgtComponents.idMasterSite -  hgtComponents.idMasterSiteExpander
                            - hgtComponents.idMasterSiteSummary;
                    } else {
                        colHgt = hgtComponents.idMasterSite - hgtComponents.totalHgt;
                    }
                } else { // sumVis == "none"
                    if (siteVis === 'none') {
                        colHgt = hgtComponents.idMasterSite - hgtComponents.idMasterSiteExpander
                            - hgtComponents.idFooter;
                    } else { // siteVis == "flex, etc."
                        colHgt = hgtComponents.idMasterSite - hgtComponents.idMasterSiteExpander
                            - hgtComponents.idSiteTopRow - hgtComponents.idFooter;
                    }
                }
                showRelativeHeights(colHgt, hgtComponents.idMasterSite, hgtComponents.idMasterSiteSummary);
                // displayHeights("####getAvailableSiteColumnHeights###");
                return colHgt;
            }


            function toFixedOne(val, prec) {
                var precision = prec || 0,
                    neg = val < 0,
                    power = Math.pow(10, precision),
                    value = Math.round(val * power),
                    integral = String((neg ? Math.ceil : Math.floor)(value / power)),
                    fraction = String((neg ? -value : value) % power),
                    padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0'),
                    sign = neg ? "-" : "";

                if (integral[0] === '-') {
                    sign = "";
                }
                return sign + (precision ? integral + '.' +  padding + fraction : integral);
            }

            function toFixedTwo(x, y, precision) {
                var fixed = {
                    lon : toFixedOne(x, precision),
                    lat : toFixedOne(y, precision)
                };
                return fixed;
            }

            function showLoading() {
                console.log("show loading");
                esri.show(loading);
            }

            function hideLoading(error) {
                console.log("hide loading");
                esri.hide(loading);
            }

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
                setElementWidth : setElementWidth,
                setElementDimension : setElementDimension,
                getElementDimension : getElementDimension,
                toFixed : toFixedTwo,
                toFixedOne: toFixedOne,
                showLoading : showLoading,
                hideLoading : hideLoading,
                getRandomInt : getRandomInt,
                recalculateTopRow : recalculateTopRow
            };
        });
}());
// }).call(this);
