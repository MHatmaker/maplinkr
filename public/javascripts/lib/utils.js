/*global define */
/*global getComputedStyle*/
/*global esri*/
/*global loading*/

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

(function () {
    "use strict";
    // alert("utils created");
    define([],

        function () {

            var hgtComponents = {
                    "windowHeight" : null,
                    "totalComponentHeight" : null,
                    "idMasterSite" : null,
                    "idMasterSiteControlRow": null,
                    "idMasterSiteSummary" : null,
                    "idLinkrButtonRow" : null,
                    "idSiteTopRow" : null
                };

            function showHeights(prev, now) {
                var prevStr = "Previous total height : " + prev,
                    nowStr = " New total height : " + now;
                console.log("showHeights : " + prevStr + nowStr);
            }

            function showRelativeHeights(totTot, tot, elem) {
                console.log("showRelativeHeights : grand total height {0} total height {1} element height {2}".
                    format(totTot, tot, elem));
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
                return document.documentElement.offsetHeight; //window.innerHeight;
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

            function getElemHeight(itm) {
                var elem = document.getElementById(itm),
                    elemHeight = elem.clientHeight;
                return elemHeight;
            }

            function setElementHeight(itm, hgt, units) {
                var elem, hstr;
                // var elem = utils.getElemById(itm)[0];
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
                // var elem = utils.getElemById(itm)[0];
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

            function getMasterSiteHeight() {
                hgtComponents.idMasterSiteControlRow = getElemHeight("idMasterSiteControlRow");
                return hgtComponents.idMasterSite - hgtComponents.idMasterSiteControlRow;
            }

            function calculateComponentHeights(sumvis, sitevis) {
                var totalComponentHeight = 0;
                hgtComponents.windowHeight = screen.height;
                hgtComponents.idMasterSite = getDocHeight(); // - 30;
                totalComponentHeight += hgtComponents.idMasterSiteControlRow = getElemHeight("idMasterSiteControlRow");
                totalComponentHeight += hgtComponents.idMasterSiteSummary = getElemHeight("idMasterSiteSummary");
                totalComponentHeight += hgtComponents.idSiteTopRow = getElemHeight('idSiteTopRow');
                totalComponentHeight += hgtComponents.idLinkrButtonRow = getElemHeight('idLinkrButtonRow');
                // hgtComponents.idLinkrButtonRow = getElemHeight('idLinkrButtonRow');
                hgtComponents.totalComponentHeight = totalComponentHeight;
                console.log("calculateComponentHeights : sitevis, " + sitevis);
                console.log("calculateComponentHeights : master site height, " + hgtComponents.idMasterSite);
                console.log("calculateComponentHeights : top row height, " + hgtComponents.idSiteTopRow);
                console.log("calculateComponentHeights : linker button row height, " + hgtComponents.idLinkrButtonRow);
                // displayHeights("####calculateComponentHeights###");
            }

            function getAvailableSiteColumnHeights(sumVis, siteVis) {
                var colHgt = 0;
                if (sumVis === "inline") {
                    if (siteVis === 'none') {
                        colHgt = hgtComponents.idMasterSite -  hgtComponents.idMasterSiteControlRow
                            - hgtComponents.idMasterSiteSummary;
                    } else {
                        colHgt = hgtComponents.idMasterSite - hgtComponents.totalComponentHeight;
                    }
                } else { // sumVis == "none"
                    if (siteVis === 'none') {
                        colHgt = hgtComponents.idMasterSite - hgtComponents.idMasterSiteControlRow;
                    } else { // siteVis == "flex, etc."
                        colHgt = hgtComponents.idMasterSite - hgtComponents.idMasterSiteControlRow
                            - hgtComponents.idSiteTopRow;
                    }
                }
                colHgt -= hgtComponents.idLinkrButtonRow;
                showRelativeHeights(colHgt, hgtComponents.idMasterSite, hgtComponents.idMasterSiteSummary);
                displayHeights("####getAvailableSiteColumnHeights###");
                return colHgt;
            }

            function getElemById(id) {
                return angular.element(document.getElementById(id));
            }

            function updateMapContainerHeight(scope) {
                var height = getDocHeight(), //document.body.clientHeight,
                    width = document.body.clientWidth,
                    centerCol = getElemById("idCenterCol"),
                    mapCon = getElemById("idMapContainerRow"),
                    mapWrap = getElemById("map_wrapper"),
                    mapCanvas = getElemById("map_canvas"),
                    rightCol = getElemById("idRightColOuter"),
                    mapCanRoot = getElemById("map_canvas_root"),
                    hstr = "",
                    mlctrlRow = getElemById("idLinkrButtonRow"),
                    centerColHgt = 0,
                    centercolhstr = "",
                    topRow = getElemById('idSiteTopRow'),
                    topRowDisplayMode = topRow[0].style.display,
                    mq;

                console.log("topRowDisplayMode : {0}".format(topRowDisplayMode));
                // scope.safeApply();
                mq = window.matchMedia('@media all and (max-width: 700px)');
                if(mq.matches  || width < 700) {
                    // the width of browser is more then 700px
                    console.log("Media might be phone");
                    console.log(height);
                    height = height - getElemHeight('idMasterSiteControlRow') - getElemHeight('idLinkrButtonRow');
                    console.log(height);
                } else {
                    // the width of browser is less then 700px
                    console.log("Media might be wide browser");
                    height = height
                        - getElemHeight('idMasterSiteControlRow')
                        - getElemHeight('idMasterSiteSummary')
                        - getElemHeight('idSiteTopRow')
                        - getElemHeight('idLinkrButtonRow');
                    console.log(" document.body.client : width " + width + ", height " + height);
                    console.log("map container height");
                    console.debug(mapCon);
                }
                // if (topRowDisplayMode === 'none') {
                //     height -= getElemHeight('idLinkrButtonRow');
                // }

                hstr = String.format("{0}px", toFixedOne(height)); // * 0.7));

                centerColHgt = height + getElemHeight('idLinkrButtonRow');
                centercolhstr = String.format("{0}px", toFixedOne(centerColHgt));
                console.log("centerColHgt : {0}, mapConHgt : {1}".format(centercolhstr, hstr));
                scope.centerColHgt = centerColHgt;
                scope.mapConRowHgt = height;
                scope.mapWrapHgt = height;
                // scope.safeApply();
                /*
                mq = window.matchMedia('@media all and (max-width: 700px)');
                if (mq.matches) {
                    // the width of browser is more then 700px
                    rightCol.css({"top": 0});
                } else {
                    // the width of browser is less then 700px
                    rightCol.css({"top": hstr});
                }
                */
            };


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
                getElemById : getElemById,
                displayHeights : displayHeights,
                calculateComponentHeights : calculateComponentHeights,
    //            getComponentHeights : getComponentHeights,
                getAvailableSiteColumnHeights : getAvailableSiteColumnHeights,
                updateMapContainerHeight : updateMapContainerHeight,
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
                getRandomInt : getRandomInt
            };
        });
}());
// }).call(this);
