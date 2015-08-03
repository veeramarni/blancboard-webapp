bjse.api.devices = {};
var PlatformType = {
	ANY: "ANY",
	ANDROID: "ANDROID",
	IOS: "IOS",
	WEB: "WEB"
};
bjse.api.devices.PlatformType = PlatformType;
bjse.api.devices.Device = function(settings){
	this.id = "";
	this.ownerid = "";
	this.model = "";
	this.platformVersion = "";
	this.platformType = bjse.api.devices.PlatformType.ANY;
	bjse.util.mixin(this, settings)
};
bjse.api.devices.DeviceManager = function(ses){
	this.session = ses;
};
bjse.api.devices.DeviceManager.prototype.registerDevice = function(device, success, error){
	var url = bjse.util.format("{$apiurl}/devices",{
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().postAuth(url, device, function(res){
		var dev = new bjse.api.devices.Device(res);
		success(dev);
	}, error)
};
bjse.api.devices.DeviceManager.prototype.deregisterDevice = function(deviceid, success, error){
	var url = bjse.util.format("{$apiurl}/devices/{$deviceid}", {
		apiurl: this.session.runtime.serverUrl,
		deviceid: deviceid
	});
	this.session.getHttpClient().delAuth(url, success, error);
};
bjse.api.devices.DeviceManager.prototype.getDevices = function(success, error){
	var url = bjse.util.format("{$apiurl}/devices", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().getAuth(url, function(res){
		var d = JSON.parse(res),
			devs = [];
		if(bjse.util.isArray(d.device)){
			for(var i=0; i < d.device.length; i++){
				devs.push(new bjse.api.devices.Device(d.device[i]));
			}
		} else {
			devs.push(new bjse.api.devices.Device(d.device))
		}
	}, error);
};