bjse.api.HttpClient = function(t){
	this.session = t;
};
bjse.api.HttpClient.prototype.send = function(){

}
bjse.api.HttpClient.prototype.get = function(url, data, success, error){
	$.ajax({
		url: url,
		type: "GET",
		contentType: "application/json",
		data: JSON.stringify(data),
		dataType: "json",
		success: success,
		error: error
	})
}
bjse.api.HttpClient.prototype.post = function(url, data, success, error){
	$.ajax({
		url: url,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify(data),
		dataType: "json",
		success: success,
		error: error
	})
}
bjse.api.HttpClient.prototype.put = function(url, data, success, error){
	$.ajax({
		url: url,
		type: "PUT",
		contentType: "application/json",
		data: JSON.stringify(data),
		dataType: "json",
		success: success,
		error: error
	})
}
bjse.api.HttpClient.prototype.del = function(url, data, success, error){
	$.ajax({
		url: url,
		type: "DELETE",
		contentType: "application/json",
		data: JSON.stringify(data),
		dataType: "json",
		success: success,
		error: error
	})
}