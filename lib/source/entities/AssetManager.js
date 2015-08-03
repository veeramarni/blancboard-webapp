bjse.api.assets = {};
var LifecycleState = {
	ANY: "ANY",
	CREATED: "CREATED",
	STARTED: "STARTED",
	INPROGRESS: "INPROGRESS",
	READY: "READY",
	ERROR: "ERROR",
	DELETED: "DELETED"
}
bjse.api.assets.LifecycleState = LifecycleState;
var Scope = {
	ALL: "ALL",
	UPLOADED: "UPLOADED",
	SHARED: "SHARED"
}
bjse.api.assets.Scope = Scope;
var AssetType = {
	FILE: "FILE",
    VIDEO: "VIDEO",
    AUDIO: "AUDIO", 
    IMAGE: "IMAGE", 
    WIDGET: "WIDGET", 
    BOARD: "BOARD"
}
bjse.api.assets.AssetType = AssetType;
bjse.api.assets.Asset = function(asset) {
	this.id = "";
	this.type = "";
	this.title = "";
	this.tags = "";
	this.notes = "";
	this.mimeType = "";
	this.contentLength = 0;
	this.fileName = "";
	this.fileExtension = "";
	this.timeCreated = null;
	this.timeUpdated = null;
	this.state = bjse.api.assets.LifecycleState.ANY;
	this.thumbUrl = "";
	this.contentUrl = "";
	this.previewUrl = "";
	this.ownerId = "";
	this.shared = false;
	bjse.util.mixin(this, asset);
};
bjse.api.assets.AssetManager = function(session) {
	this.session = session;
};
bjse.api.assets.AssetManager.prototype.createAsset = function(data, success, error) {
	var url = bjse.util.format("{$apiurl}/assets", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().postAuth(url, data, function(assetApi){
		var asset = new bjse.api.assets.Asset(assetApi);
		success(asset);
	}, error)
};
bjse.api.assets.AssetManager.prototype.deleteAsset = function(assetid, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/{$assetid}", {
		apiurl: this.session.runtime.serverUrl,
		assetid: assetid
	});
	this.session.getHttpClient().delAuth(url, "", success, error);
};
bjse.api.assets.AssetManager.prototype.updateAsset = function(assetid, data, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/{$assetid}", {
		apiurl: this.session.runtime.serverUrl,
		assetid: assetid
	});
	this.session.getHttpClient().postAuth(url, data, function(assetApi){
		var asset = new bjse.api.assets.Asset(assetApi);
		success(asset);
	}, error)
};
bjse.api.assets.AssetManager.prototype.getAssets = function(data, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/assets", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().postAuth(url, data, function(response) {
		var assets = [];			
		if (bjse.util.isArray(response.assets)) {
			for (var i = 0; i < response.length; i++) {
				assets.push(response.assets[i])
			}
		} else {
			assets.push(response.assets);
		}
		success(assets, response.timestamp);
	}, error)
}
bjse.api.assets.AssetManager.prototype.getAsset = function(assetid, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/{$assetid}", {
		apiurl: this.session.runtime.serverUrl,
		assetid: assetid
	});
	this.session.getHttpClient().getAuth(url, assetid, function(assetApi) {
		var asset = new bjse.api.assets.Asset(assetApi);
		success(asset);
	}, error)
};