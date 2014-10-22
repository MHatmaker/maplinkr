
/*

//nominatim.openstreetmap.org/reverse/?lat=33.49351305030696&lon=-111.95955634117126&zoom=18&addressdetails=1&format=json

*/


(function() {
    "use strict";

    console.log('GeoCoder setup');
    define([
    ], 
    
        function() {
			var options = {
                serviceUrl: '//nominatim.openstreetmap.org/',
                geocodingQueryParams: {},
                reverseQueryParams: {}
            };
            var details = {
                callbackId = 0;
            };
        
        function jsonp(url, params, callback, context, jsonpParam) {
            var callbackId = '_l_geocoder_' + (details.callbackId++);
            params[jsonpParam || 'callback'] = callbackId;
            window[callbackId] = L.Util.bind(callback, context);
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url + L.Util.getParamString(params);
            script.id = callbackId;
            document.getElementsByTagName('head')[0].appendChild(script);
        };

		function geocode(query, cb, context) {
			jsonp(options.serviceUrl + 'search/', L.extend({
				q: query,
				limit: 5,
				format: 'json',
				addressdetails: 1
			}, this.options.geocodingQueryParams),
			function(data) {
				var results = [];
				for (var i = data.length - 1; i >= 0; i--) {
					var bbox = data[i].boundingbox;
					for (var j = 0; j < 4; j++) bbox[j] = parseFloat(bbox[j]);
					results[i] = {
						icon: data[i].icon,
						name: data[i].display_name,
						html: this.options.htmlTemplate ?
							this.options.htmlTemplate(data[i])
							: undefined,
						bbox: L.latLngBounds([bbox[0], bbox[2]], [bbox[1], bbox[3]]),
						center: L.latLng(data[i].lat, data[i].lon),
						properties: data[i]
					};
				}
				cb.call(context, results);
			}, this, 'json_callback');
		};

//nominatim.openstreetmap.org/reverse/?lat=33.49351305030696&lon=-111.95955634117126&zoom=18&addressdetails=1&format=json

		function reverse(location, scale, cb, context) {
            var zm = Math.round(Math.log(scale / 256) / Math.log(2));
            var qstr = options.serviceUrl + 'reverse/?lat=' + location.lat + '&lon=' + location.lon + '&zoom='+ zm +
                '&addressdetails=1&format=json';
			jsonp(this.options.serviceUrl + 'reverse/', L.extend({
				lat: location.lat,
				lon: location.lng,
				zoom: Math.round(Math.log(scale / 256) / Math.log(2)),
				addressdetails: 1,
				format: 'json'
			}, this.options.reverseQueryParams), function(data) {
				var result = [],
				    loc;

				if (data && data.lat && data.lon) {
					loc = L.latLng(data.lat, data.lon);
					result.push({
						name: data.display_name,
						html: this.options.htmlTemplate ?
							this.options.htmlTemplate(data)
							: undefined,
						center: loc,
						bounds: L.latLngBounds(loc, loc),
						properties: data
					});
				}

				cb.call(context, result);
			}, this, 'json_callback');
		};

        function nominatim(options) {
            return new GeoCoder.Nominatim(options);
        };
    
        
        function init(App) {
            console.log('GeoCoder init');
            App.factory('GeoCoder', [GeoCoder]);
            return GeoCoder;
        }

        return { start: init, nominatim: nominatim };

    });

}).call(this);