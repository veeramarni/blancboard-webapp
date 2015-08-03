bjse.api.Exception = function(code, message) {
	this.code = code;
	this.message = message;
};
bjse.api.Runtime = function(serverUrl) {
	this.serverUrl = serverUrl;
};
bjse.api.Runtime.prototype.connect = function(username, password, appid, secret, device, success, error) {
	var session = new bjse.api.Session(this, device, appid, secret, username);
	session.getUserDirectory().getUser(username, function(user) {
		session.user = user;
		session.username = user.id;
		session.getDeviceManager().registerDevice(device, function(result) {
			session.device = result;
			session.connected = true;
			success(session);
		}, error)
	}, error);
};
bjse.api.Runtime.prototype.register = function(params, appid, secret, success, error) {
	var url = bjse.util.format("{$apiurl}/users", {
			apiurl: this.serverUrl
		}),
		headers = {
			'Authorization': 'Basic ' + bjse.api.Runtime.getApplicationToken(appid, secret)
		};
	bjse.api.Ajax.login(url, params, function(response) {
		var user = new bjse.api.users.User(response.apiUser);
		success(user);
	}, error, headers);
};
bjse.api.Runtime.prototype.connectAsGuest = function(device, appId, secret, success) {
	var session = new mc.api.Session(this, device, appId, secret);
	success(session);
};
bjse.api.Runtime.getApplicationToken = function(appkey, appsecret) {
	return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(appkey + ':' + appsecret));
};
bjse.api.Session = function(runtime, device, appId, secret, username) {
	this.connected = false;
	this.runtime = runtime;
	this.appkey = appId;
	this.appsecret = secret;
	this.device = device;
	this.username = username;
};
bjse.api.Session.prototype.getApplicationManager = function() {
	return this.appManager || (this.appManager = new bjse.api.ApplicationManager(this), this.appManager);
};
bjse.api.Session.prototype.getDeviceManager = function() {
	return this.deviceManager || (this.deviceManager = new bjse.api.devices.DeviceManager(this), this.deviceManager);
};
bjse.api.Session.prototype.getUserDirectory = function() {
	return this.userDirectory || (this.userDirectory = new bjse.api.users.UserDirectory(this), this.userDirectory);
};
bjse.api.Session.prototype.getHttpClient = function() {
	return this.httpClient || (this.httpClient = new bjse.api.HttpClient(this), this.httpClient);
};
bjse.api.Session.prototype.getConferenceManager = function() {
	return this.conferenceManager || (this.conferenceManager = new bjse.api.conference.ConferenceManager(this), this.conferenceManager);
};
bjse.api.Session.prototype.getAssetManager = function(){
	return this.assetManager || (this.assetManager = new bjse.api.assets.AssetManager(this), this.assetManager);
};
bjse.api.Session.prototype.getAccountManager = function() {
	return this.accountManager || (this.accountManager = new bjse.api.accounts.AccountManager(this), this.accountManager);
};
bjse.api.Session.prototype.getUserToken = function() {

};
bjse.api.Session.prototype.isGuest = function() {
	return !this.username || !this.password
};
bjse.api.Session.prototype.disconnect = function(success, error) {
	if (this.isGuest()) {
		this.connected = false;
		success && success();
	} else {
		var that = this;
		this.getDeviceManager().deregisterDevice(this.device.id, function() {
			that.connected = false;
			success && success();
		}, error)
	}
};