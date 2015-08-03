bjse.api.Ajax = (function() {
	var _post = function(url, data, success, error, headers) {
		var endError = function(res) {
			error(res.responseJSON);
		};
		$.ajax({
			url: url,
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(data),
			dataType: "json",
			headers: headers,
			success: success,
			error: endError
		})
	};
	return {
		get: function(url, data, success, error, headers) {
			var endError = function(res) {
				error(res.responseJSON);
			};
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: JSON.stringify(data),
				dataType: "json",
				headers: headers,
				success: success,
				error: endError
			})
		},
		post: function(url, data, success, error, headers) {
			_post(url, data, success, error, headers);
		},
		put: function(url, data, success, error, headers) {
			var endError = function(res) {
				error(res.responseJSON);
			};
			$.ajax({
				url: url,
				type: "PUT",
				contentType: "application/json",
				data: JSON.stringify(data),
				dataType: "json",
				headers: headers,
				success: success,
				error: endError
			})
		},
		del: function(url, data, success, error, headers) {
			var endError = function(res) {
				error(res.responseJSON);
			};
			$.ajax({
				url: url,
				type: "DELETE",
				contentType: "application/json",
				data: JSON.stringify(data),
				dataType: "json",
				headers: headers,
				success: success,
				error: endError
			})
		},
		login: function(url, data, success, error, headers) {
			_post(url, data, function(response) {
				bjse.api.Cookie.set('authToken', response.oauth2AccessToken.access_token);
				success(response);
			}, error, headers)
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