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
	ANY: "ANY",
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
	this.type = AssetType.ANY;
	this.title = "";
	this.tags = "";
	this.notes = "";
	this.mimeType = "";
	this.contentLength = 0;
	this.fileName = "";
	this.fileSize = "";
	this.fileExtension = "";
	this.timeCreated = null;
	this.timeUpdated = null;
	this.state = bjse.api.assets.LifecycleState.ANY;
	this.thumbUrl = "";
	this.contentUrl = "";
	this.contentId = "";
	this.previewUrl = "";
	this.ownerId = "";
	this.shared = false;
	this.currentPageNo = 1;
	bjse.util.mixin(this, asset);
};
bjse.api.assets.UploadRequest = function(file) {
	this.fileSize = file.fileSize;
	this.mimeType = file.mimeType;
	this.fileName = file.fileName;
	this.fileType = AssetType.FILE;
	bjse.util.mixin(this, file);
}
bjse.api.assets.UploadInfo = function(info) {
	this.callbackUrl = "";
	this.uploadUrl = "";
	this.param = [];
	this.header = [];
	bjse.util.mixin(this, info);
};
var MAX_FILE_SIZE = 104857600;
var IMAGE_FILE_TYPES = {
	"image/jpeg": "jpg",
	"image/jpg": "jpg",
	"image/bmp": "bmp",
	"image/png": "png",
	"image/svg+xml": "svg"
};
var BLANC_MIME_TYPE = "application/blanc-note";
var DOCUMENT_FILE_TYPES = {
	BLANC_MIME_TYPE: "svg",
	"application/msword": "doc",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
	"application/msword": "dot",
	"application/vnd.ms-excel": "xls",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
	"application/vnd.oasis.opendocument.text": "odt",
	"application/vnd.oasis.opendocument.spreadsheet": "ods",
	"application/rtf": "rtf",
	"application/wordperfect": "wpd",
	"text/plain": "txt",
	"application/vnd.sun.xml.calc": "sxc",
	"applicaton/vnd.sun.xml.impress": "sxi",
	"application/vnd.sun.xml.writer": "sxw",
	"text/csv": "csv",
	"text/tab-separated-values": "tsv",
	"application/vnd.oasis.opendocument.presentation": "odp",
	"application/vnd.ms-powerpoint": "ppt",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
	"applicaton/vnd.oasis.opendocument.graphics": "odg",
	"application/pdf": "pdf"
};
bjse.api.assets.uploadproperties = function(props) {
	this.url = "http://test.blancboard.com.s3.amazonaws.com";
	this.headers = null,
		this.maxFileSize = MAX_FILE_SIZE;
	this.acceptFileTypes = Object.keys($.extend(DOCUMENT_FILE_TYPES, IMAGE_FILE_TYPES)).join(',');
	this.imageFileTypes = Object.keys(IMAGE_FILE_TYPES).join(',');
	this.thumbnailWidth = 100;
	this.thumbnailHeight = 100;
	this.clickable = true;
	this.dictDefaultMessage = null;
	this.autoUpload = true;
	this.onstart = function() {};
	this.onprogress = function() {};
	this.onsuccess = function() {};
	this.onerror = function() {};
	this.oncancel = function() {};
	bjse.util.mixin(this, props);
}
bjse.api.assets.uploadproperties.prototype.validate = function(asset) {
	if (!(this.acceptFileTypes.test(asset.type) || this.acceptFileTypes
			.test(asset.name))) {
		// error out
		return new bjse.api.errors.error({
			errorHeader: "Invalid File Error ",
			errorMessage: "Invalid File or File not supported"
		})
	}
	if (this.imageFileTypes && (this.imageFileTypes.test(asset.type) || this.imageFileTypes
			.test(asset.name))) {
		asset.type = bjse.api.assets.AssetType.IMAGE;
	} else {
		asset.type = bjse.api.assets.AssetType.ANY;
	}
	if (this.maxFileSize && asset.size > this.maxFileSize) {
		return new bjse.api.errors.error({
			errorHeader: "File Size Error ",
			errorMessage: "File size is more than " + this.maxFileSize / 1048576 + " MB"
		});
	}
	return null
};
bjse.api.assets.AssetManager = function(session) {
	this.session = session;
};
bjse.api.assets.AssetManager.prototype.createAsset = function(data, success, error) {
	var url = bjse.util.format("{$apiurl}/assets", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().postAuth(url, data, function(assetApi) {
		var asset = new bjse.api.assets.Asset(assetApi);
		success(asset);
	}, error)
};
bjse.api.assets.AssetManager.prototype.deleteAsset = function(assetId, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/{$assetId}", {
		apiurl: this.session.runtime.serverUrl,
		assetId: assetId
	});
	this.session.getHttpClient().delAuth(url, "", success, error);
};
bjse.api.assets.AssetManager.prototype.updateAsset = function(assetId, data, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/{$assetId}", {
		apiurl: this.session.runtime.serverUrl,
		assetId: assetId
	});
	this.session.getHttpClient().postAuth(url, data, function(assetApi) {
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
			for (var i = 0; i < response.assets.length; i++) {
				assets.push(response.assets[i])
			}
		} else {
			assets.push(response.assets);
		}
		success(assets, response.timestamp);
	}, error)
}
bjse.api.assets.AssetManager.prototype.getAsset = function(assetId, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/{$assetId}", {
		apiurl: this.session.runtime.serverUrl,
		assetId: assetId
	});
	this.session.getHttpClient().getAuth(url, assetId, function(assetApi) {
		var asset = new bjse.api.assets.Asset(assetApi);
		success(asset);
	}, error)
};
bjse.api.assets.AssetManager.prototype.loadPages = function(assetId, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/pages/{$assetId}", {
		apiurl: this.session.runtime.serverUrl,
		assetId: assetId
	});
	this.session.getHttpClient().getAuth(url, assetId, function(pagesApi) {
		var pages = [];
		for(var i=0; i < pagesApi.length; i++){
			pages.push(pagesApi[i])
		}
		success(pages);
	}, error)
};
bjse.api.assets.AssetManager.prototype.getPreUploadInfo = function(fileData, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/preuploadInfo/{$contentId}", {
		apiurl: this.session.runtime.serverUrl,
		contentId: bjse.util.randomUUID()
	});
	this.session.getHttpClient().postAuth(url, fileData, function(t) {
		success(t);
	}, error)
};
bjse.api.assets.AssetManager.prototype.getPostUploadInfo = function(asset, success, error) {
	var url = bjse.util.format("{$apiurl}/assets/s3/{$contentId}", {
		apiurl: this.session.runtime.serverUrl,
		contentId: asset.contentId
	});
	this.session.getHttpClient().postAuth(url, asset, function(t) {
		success(t);
	}, error)
};

bjse.api.assets.AssetManager.prototype.uploadFile = function(node, props, success, error) {
	var that = this,
		assetbuilder = {
			asset: null,
			get getAsset() {
				return this.asset;
			},
			set setAsset(asset) {
				this.asset = asset
			}
		},
		myDropzone = new Dropzone(node, {
			url: props.url,
			acceptedMimeTypes: props.acceptFileTypes,
			maxFilesize: props.maxFileSize,
			thumbnailHeight: props.thumbnailHeight,
			thumbnailWidth: props.thumbnailWidth,
			clickable: props.clickable,
			dictDefaultMessage: props.dictDefaultMessage,
			accept: function(file, done) {
				var assetReq = {
						"fileSize": file.size,
						"mimeType": file.type,
						"fileName": file.name
					},
					fileData = new bjse.api.assets.UploadRequest(assetReq);
				assetbuilder.setAsset = new bjse.api.assets.Asset(assetReq)
				that.getPreUploadInfo(fileData, function(res) {
					file.custom_status = 'read';
					file.postData = res.params;
					assetbuilder.setAsset = $.extend(assetbuilder.getAsset, {
						contentId: res.contentId,
						type: AssetType.FILE,
						fileExtension: res.fileExtension
					});
					done();
				}, function(res) {
					file.custom_status = "rejected";
					if (res.responseText) {
						res = JSON.parse(res.responseText);
					}
					if (res.message) {
						done(res.message);
					} else {
						done("error preparing the upload");
					}
				})
			}
		});
	myDropzone.on("sending", function(file, xhr, formData) {
		$.each(file.postData, function(k, v) {
			formData.append(k, v);
		})
	});
	myDropzone.on("complete", function() {
		}, function() {
	});
	myDropzone.on("error", function() {
		}, function() {
	});
	myDropzone.on("success", function() {
		assetbuilder.setAsset = $.extend(assetbuilder.getAsset, {
			state: LifecycleState.CREATED
		})
		that.getPostUploadInfo(assetbuilder.getAsset, function(res) {
			success(res);
		}, function(err) {
			error(err);
		})
	});
}
bjse.api.assets.AssetManager.prototype.getDownloadUrl = function() {

}