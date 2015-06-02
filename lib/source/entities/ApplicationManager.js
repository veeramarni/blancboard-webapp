bjse.api.apps = {};
bjse.api.apps.ApplicationManager = function(config){
	this.name = "";
	this.key = "";
	this.secret = "";
	this.websiteUrl = "";
	this.supportUrl = "";
	this.adminEmail = "";
	bjse.util.mixin(this, config);
};
bjse.api.apps.ApplicationManager.prototype.createApplication = function(data, success, error){
	var url = bjse.util.format("{$apiurl}/apps", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().post(url, data, function(res){
		var appl = new bjse.api.apps.ApplicationManager(JSON.parse(res));
		success(appl);
	}, error)
};
bjse.api.apps.ApplicationManager.prototype.deleteApplication = function(appid, success, error){
	var url = bjse.util.format("{$apiurl}/apps/{$appid}", {
		appiurl: this.session.runtime.serverUrl,
		appid: appid
	});
	this.session.getHttpClient().del(url, success, error);
};
bjse.api.apps.ApplicationManager.prototype.getApplications = function(success, error){
	var url = bjse.util.format("{$apiurl}/apps", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().get(url, function(res){
		var appData = JSON.parse(res),
			apps = [];
		if(bjse.util.isArray(appData.application)){
			for(var i=0; i < appData.length; i++){
				apps.push(new bjse.api.apps.Application(appData.application[i]));
			} 
		}else {
			apps.push(new bjse.api.apps.Application(appData.application));
		}
		success(apps);
	}, error)
}