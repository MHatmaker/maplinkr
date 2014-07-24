
var utils = (function()
{
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