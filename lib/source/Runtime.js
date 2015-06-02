bjse.api.Exception = function(t, e){
	this.code = t;
	this.message =e;
};
bjse.api.Runtime = function(t) {
	this.serverUrl = t;
};
bjse.api.Runtime.prototype.connect = function(){

};
bjse.api.Runtime.getApplicationToken = function(t, e){

};
bjse.api.Session = function(runtime, device, appId, secret, username, password){
	this.connected = false;
	this.runtime = runtime;
	this.appkey = appId;
	this.appsecret = secret;
	this.password = secret;
	this.username = username;
	this.password = password;


};
bjse.api.Session.prototype.getApplicationManager = function(){
	return this.appManager || (this.appManager = new bjse.api.ApplicationManager(this), this.appManager);
};
bjse.api.Session.prototype.getDeviceManager = function(){

};
bjse.api.Session.prototype.getUserDirectory = function(){
	return this.userDirectory || (this.userDirectory = new bjse.api.users.UserDirectory(this), this.userDirectory);
};
bjse.api.Session.prototype.getHttpClient = function(){
	return this.httpClient  || (this.httpClient = new bjse.api.HttpClient(this), this.httpClient);
};
bjse.api.Session.prototype.getAccountManager = function(){

};
bjse.api.Session.prototype.getUserToken = function(){

};
bjse.api.Session.prototype.disconnect = function(){

}
