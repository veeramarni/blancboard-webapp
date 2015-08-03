bjse.api.Cookie = (function() {
	function _get(name) {
		var pairs = document.cookie.split(/\; /g),
			cookie = {},
			value;
		for (var i in pairs) {
			if (pairs.hasOwnProperty(i)) {
				var parts, pair = pairs[i];
				if (typeof pair != "function") {
					parts = pair.split(/\=/);
					cookie[parts[0]] = unescape(parts[1]);
				}
			}
		}
		value = cookie[name] == "undefined" ? null : cookie[name];
		return value;
	};

	/**
	 * Delete a cookie
	 * 
	 * @param {string}
	 */
	function _remove(name) {
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
	};
	/**
	 * Set a cookie
	 * 
	 * @param {string}
	 * @param {string}
	 */
	function _set(name, value, days) {
		_remove(name);
		if (days === undefined) {
			days = 2;
		}
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
		document.cookie = name + '=' + value + expires + "; path=/";
	};

	return {
		get: function(name) {
			return _get(name);
		},
		remove: function(name) {
			_remove(name);
		},
		set: function(name, value) {
			_set(name, value);
		}
	};
})();