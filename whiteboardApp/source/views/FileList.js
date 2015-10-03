enyo.kind({
	name: "blanc.FileList",
	kind: "FittableRows",
	events: {
		onFileSelected: "",
		onFileRemoveClicked: ""
	},
	handlers: {
		onFileCreated: "reload",
		onFileDeleted: "reload",
		onClearContent: "clearSelection",
		onThumbnailUpdated: "thumbnailUpdated",
		onFileDownloaded: "reload"
	},
	components: [{
		kind: "blanc.Toolbar",
		components: [{
			fit: true,
			components: [{
				name: "searchInput",
				kind: "blanc.SearchInput",
				oninput: "searchIn"
			}]
		}]
	}, {
		fit: true,
		touch: true,
		multiSelect: false,
		kind: "List",
		classes: "mm-file-list",
		onSetupItem: "setupItem",
		enableSwipe: false,
		components: [{
			name: "fileItem",
			classes: "mm-file-item",
			kind: "blanc.FileItem",
			ontap: "fileTap",
			onFileRemoved: "removeItem"
		}]
	}],
	// ...........................
	// PRIVATE PROPERTIES
	filter: "",
	files: null,
	currentDocId: null,

	init: function() {
		if (this.files) {
			this.updateSelection();
		} else {
			this.populateList();
			var that = this;
			// Synchronize with the server
			blanc.Session.getSyncManager().synchronize(function(t) {
				t && that.populateList();
			})
		}
	},
	clearSelection: function() {
		this.$.list.getSelection().clear();
		this.$.list.refresh();
	},
	populateList: function() {
		var persist = blanc.Session.getPersistenceManager(),
			that = this;
		persist.getDocuments(function(e) {
			that.files = e;
			that.$.list.setCount(that.files.length);
			that.$.list.reset();
			that.$.searchInput.reset();
		}, function(e) {
			logError(e);
		});

	},
	searchIn: function(sender, event) {
		enyo.job(this.id + ":search", this.bindSafely('filterList', sender.$.searchInput.getValue()), 300)
	},
	updateSelection: function() {
		var sel = this.$.list.getSelection().getSelected(),
			k = Object.keys(sel).length > 0,
			currentObj = blanc.Session.getCurrentSessionDetails();
		for (var i = 0, curdocId = -1; i < this.files.length; i++) {
			if (this.files[i].id == currentObj.docId) {
				curdocId = i;
				break;
			}
		}
		if (curdocId >= 0) {
			this.$.list.getSelected().select(curdocId);
			this.currentDocId = curdocId;
		} else {
			this.clearSelection();
			this.currentDocId = null;
		}
	},
	reload: function() {
		this.files = null;
		this.clearSelection();
		this.populateList();
	},
	filterList: function(filter) {
		if (filter != this.filter) {
			this.filtered = this.generateFilteredData(filter);
			this.$.list.setCount(this.filtered.length);
			this.$.list.reset();
			this.updateSelection();
			this.filter = filter;
		}
	},
	generateFilteredData: function(filter) {
		var re = new RegExp('^' + filter, 'i'),
			r = [];
		for (var i = 0, d;
			(d = this.files[i]); i++) {
			if ((d.title && d.title.match(re)) || (d.fileName && d.fileName.match(re))) {
				//	d.dbIndex = i;
				r.push(d);
			}
		}
		return r;
	},
	setupItem: function(sender, event) {
		var ind = event.index,
			data = this.filtered ? this.filtered : this.files;
		if (data && !(data.length <= ind && data[ind] != null)) {
			var file = data[ind];
			this.$.fileItem.setFileName(file.title || file.fileName);
			var imgId = "thumb_" + file.id;
			this.$.fileItem.$.image.setId(imgId);
			(file.timeUpdated || file.timeCreated) && this.$.fileItem.setDate(new Date(file.timeUpdated || file.timeCreated));
			var that = this;
			if (file.image != null || !file.thumbUrl &&
				file.mimeType != BLANC_MIME_TYPE) {
				logDebug("Setting thumb directly img [" + imgId + "] of "+ file.id + " with title name " + file.title);
				file.image != null 
							? this.$.fileItem.$.image.setSrc(file.image) : file.state == LifecycleState.ERROR 
									? (this.$.fileItem.setComment($L("Conversion error")),
										this.$.fileItem.$.image.setSrc("../../assets/placeholder.png")) : (this.$.fileItem.setComment($L("Processing ... Please wait")),
					this.$.fileItem.$.image.setSrc("../../assets/ajax-loader.gif"));
			} else {
				var persist = blanc.Session.getPersistenceManager(),
					postAction = function(blb) {
						logDebug("Setting thumb img [" + imgId + "] of "+ file.id + " with title name " + file.title);
						var el = document.getElementById(imgId);
						el && (el.src = blb);
						data[ind] && (data[ind].image = blb);

					};
				persist.getBlob(imgId, function(e) {
					postAction(e);
				}, function(event) {
					if (event.code == 404 && file.thumbUrl) {
						persist.downloadBlob(file.id, imgId, file.thumbUrl, function() {
							persist.getBlob(imgId, function(e) {
								postAction(e)
							}, function(err) {
								logError(err);
							})
						}, function(err) {
							logError(err)
						})
					} else {
						// no image found 
						var el = document.getElementById(imgId);
						el && (el.src = "../../assets/placeholder.png");
						data[ind] && (data[ind].image = "../../assets/placeholder.png");
					}
				})
			}
			this.$.fileItem.addRemoveClass("mm-first-file-item", ind == 0);
			data && this.$.fileItem.addRemoveClass("mm-last-file-item", ind == data.length - 1);
			this.$.fileItem.setSelected(sender.isSelected(ind));
			return true;
		}
	},
	fileTap: function(sender, event) {
		var file = this.files[event.index];
		file.state == LifecycleState.READY && this.doFileSelected({
			docId: file.id
		})
	},
	removeItem: function(sender, event) {
		var file = this.files[event.index];
		logDebug("File remove clicked ");
		this.doFileRemoveClicked({
			docId: file.id,
			currentView: file.id == this.currentDocId
		});
		return true;
	},
	thumbnailUpdated: function(sender, event){
		var el = document.getElementById("thumb_" + event.docId);
		if(el){
			el.src = event.data;
			for(var i =0; this.files != null && i < this.files.length; i++){
				if(this.files[i].id == event.docId){
					this.files[i].image = event.data;
					break;
				}
			}
		}
	}
})

enyo.kind({
	name: "blanc.FileItem",
	kind: "FittableColumns",
	events: {
		onFileRemoved: ""
	},

	components: [{
		name: "remove",
		kind: "enyo.Button",
		classes: "close puu-right",
		style: "padding:5px 10px;margin:0;",
		content: "&times",
		allowHtml: true,
		ontap: "removeTap"
	}, {
		name: "thumb",
		classes: "mm-file-thumb",
		components: [{
			name: "image",
			kind: "enyo.Image"
		}]
	}, {
		fit: true,
		classes: "mm-file-info",
		components: [{
			name: "title",
			classes: "mm-file-name"
		}, {
			name: "date",
			classes: "mm-file-date",
			content: "Aug 7, 2014"
		}]
	}],
	setFileName: function(title) {
		this.$.title.setContent(title);
	},
	setDate: function(dt) {
		this.$.date.setContent(DateFormat.format.date(dt, "d-MMM-yyyy h:mm a"));
	},
	setSelected: function(selected) {
		this.addRemoveClass("mm-item-selected", selected);
	},
	setComment: function(comment) {
		this.$.date.setContent(comment);
	},
	removeTap: function(sender, event) {
		this.doFileRemoved({
			index: event.index
		})
		return true;
	}
})