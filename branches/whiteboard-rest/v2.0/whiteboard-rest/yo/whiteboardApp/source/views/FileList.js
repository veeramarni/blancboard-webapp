enyo.kind({
	name: "blanc.FileList",
	kind: "FittableRows",
	events: {
		onFileSelected: "",
		onFileRemoveClicked: ""
	},
	handlers: {
		onFileCreated: "reload",
		onFileDeleted: "reload"
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
			name: "fileitems",
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
			//get data from the server
			//..to do
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
	searchIn: function(sender, event){
		enyo.job(this.id + ":search", this.bindSafely('filterList', sender.$.searchInput.getValue()), 300)
	},
	updateSelection: function() {
		var sel = this.$.list.getSelection().getSelected(),
			k = Object.keys(sel).length > 0,
			currentObj = blanc.Session.getCurrentSessionDetails();
		for (var i = 0, curdocid = -1; i < this.files.length; i++) {
			if (this.files[i].id == currentObj.docid) {
				curdocid = i;
				break;
			}
		}
		if (curdocid >= 0) {
			this.$.list.getSelected().select(curdocid);
			this.currentDocId = curdocid;
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
			if (d.title.match(re)) {
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
			this.$.fileitems.setFileName(file.title);
			var imgid = "thumb_" + file.id;
			this.$.fileitems.$.image.setId(imgid);
			(file.timeModified || file.timeCreated) && this.$.fileitems.setDate(new Date(file.timeModified || file.timeCreated));

			var persist = blanc.Session.getPersistenceManager();
			persist.getBlob(imgid);
		}
		this.$.fileitems.addRemoveClass("mm-first-file-item", ind == 0);
		data && this.$.fileitems.addRemoveClass("mm-last-file-item", ind == data.length - 1);
		this.$.fileitems.setSelected(sender.isSelected(ind));
		return true;
	},
	fileTap: function(sender, event) {
		var file = this.files[event.index];
		this.doFileSelected({
			docid: file.id
		})
	},
	removeItem: function(sender, event) {
		var file = this.files[event.index];
		logDebug("File remove clicked " );
		this.doFileRemoveClicked({
			docid: file.id,
			currentView: file.id == this.currentDocId
		});
		return true;
	},
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
	removeTap: function(sender, event){
		this.doFileRemoved({index: event.index})
		return true;
	}
})