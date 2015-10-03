bjse.api.Ajax = (function() {
	var _endError = function(jqXHR, ajaxOptions, thrownError) {
		if(jqXHR.status != 200 && jqXHR.readyState != 4){
						if (jqXHR.status === 0) {
				return new bjse.api.errors.error({
					applicationMessage: "Check your network",
					errorHeader: "Network error"
				});
			} else {
				return jqXHR.responseJSON ? jqXHR.responseJSON : logError("Can't find the root cause of the http issue");
			}
		} else {
			logError("Http status is 200 but it was executing in the error block!");
		}

		},
		_post = function(url, data, success, error, headers) {
			var endError = function(res) {
				var err = _endError(res);
				error(err);
			};
			$.ajax({
				url: url,
				type: "POST",
				contentType: "application/json",
				data: data,
				dataType: "json",
				success: success,
				error: endError,
				headers: headers
			})
		},
		_get = function(url, data, success, error, headers) {
			var endError = function(res) {
				var err = _endError(res);
				error(err);
			};
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: data,
				dataType: "json",
				success: success,
				error: endError,
				headers: headers
			})
		};

	return {
		get: function(url, data, success, error, headers) {
			_get(url, JSON.stringify(bjse.util.pruneEmpty(data)), success, error, headers);
		},
		post: function(url, data, success, error, headers) {
			_post(url, JSON.stringify(bjse.util.pruneEmpty(data)), success, error, headers);
		},
		put: function(url, data, success, error, headers) {
			var endError = function(res) {
				var err = _endError(res);
				error(err);
			};
			$.ajax({
				url: url,
				type: "PUT",
				contentType: "application/json",
				data: JSON.stringify(bjse.util.pruneEmpty(data)),
				dataType: "json",
				headers: headers,
				success: success,
				error: endError
			})
		},
		del: function(url, data, success, error, headers) {
			var endError = function(res) {
				var err = _endError(res);
				error(err);
			};
			$.ajax({
				url: url,
				type: "DELETE",
				contentType: "application/json",
				data: JSON.stringify(bjse.util.pruneEmpty(data)),
				dataType: "json",
				headers: headers,
				success: success,
				error: endError
			})
		},
		register: function(url, data, success, error, headers) {
			_post(url, JSON.stringify(data), function(response) {
				bjse.api.Cookie.set('authToken', response.oauth2AccessToken.access_token);
				success(response);
			}, error, headers)
		},
		login: function(url, data, success, error, headers) {
			// spring requestparam cannot read data from body at the endpoint so temporarily send within url
			_post(url + "?" + $.param(data), $.param(data), function(response) {
				bjse.api.Cookie.set('authToken', response.access_token);
				success(response);
			}, error, headers)
		},
		img: function(url, success, error, responseType) {
			var xhr = new XMLHttpRequest();
			try {
				xhr.open("GET", url);
				xhr.responseType =  responseType || "blob";
				xhr.onerror = function() {
					error && error("Network error")
				};
				xhr.onload = function() {
					if (xhr.status === 200) success(xhr.response);
					else error(xhr.statusText);
				};
				xhr.send();
			} catch (err) {
				error(err.message)
			}

		}
	}
})();
bjse.api.HttpClient = function(ses) {
	this.session = ses;
};
bjse.api.HttpClient.prototype.get = function(url, data, success, error, headers) {
	bjse.api.Ajax.get(url, data, success, error, headers);
};
bjse.api.HttpClient.prototype.post = function(url, data, success, error, headers) {
	bjse.api.Ajax.post(url, data, success, error, headers);
};
bjse.api.HttpClient.prototype.put = function(url, data, success, error, headers) {
	bjse.api.Ajax.put(url, data, success, error, headers);
};
bjse.api.HttpClient.prototype.del = function(url, data, success, error, headers) {
	bjse.api.Ajax.del(url, data, success, error, headers);
};
/**
 * Get a query string var
 * @param {string}
 * @return {string}
 */
bjse.api.HttpClient.prototype.getQuery = function(name) {
	var query = window.location.search.substring(1),
		vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == name) {
			return decodeURIComponent(pair[1]);
		}
	}
};
bjse.api.HttpClient.prototype.postAuth = function(url, data, success, error) {
	var authorization = bjse.api.Cookie.get('authToken'),
		headers = {
			'Authorization': 'Bearer ' + authorization
		};
	bjse.api.Ajax.post(url, data, success, error, headers);
};
bjse.api.HttpClient.prototype.putAuth = function(url, data, success, error) {
	var authorization = bjse.api.Cookie.get('authToken'),
		headers = {
			'Authorization': 'Bearer ' + authorization
		};
	bjse.api.Ajax.put(url, data, success, error, headers);
};
bjse.api.HttpClient.prototype.getAuth = function(url, data, success, error) {
	var authorization = bjse.api.Cookie.get('authToken'),
		headers = {
			'Authorization': 'Bearer ' + authorization
		};
	bjse.api.Ajax.get(url, data, success, error, headers);
};
bjse.api.HttpClient.prototype.delAuth = function(url, data, success, error) {
	var authorization = bjse.api.Cookie.get('authToken'),
		headers = {
			'Authorization': 'Bearer ' + authorization
		};
	bjse.api.Ajax.del(url, data, success, error, headers);
};
// bjse.api.HttpClient.prototype.postClientAuth = function(url, data, success, error){
// 	var headers = {
// 	    	'Authorization' : 'Basic ' + this._clientAuth()
// 	    };
// 	bjse.api.HttpClient.post(url, data, success, error, headers);
// };
// bjse.api.HttpClient.prototype.login = function(url, data, success, error) {
// 	var headers = {
// 		'Authorization': 'Basic ' + this._clientAuth()
// 	};
// 	bjse.api.HttpClient.post(url, data, function(response) {
// 		bjse.api.Cookie.set('authToken', response.access_token);
// 		success(response);
// 	}, error, headers);
// };
bjse.api.HttpClient.prototype.logout = function() {
	bjse.api.Cookie.remove('authToken');
};