enyo.kind({
	name: "blanc.FileView",
	kind: "FittableRows",
	// ...........................
	// PUBLIC PROPERTIES
	pageNo: 0,
	docId: null,
	// ...........................
	// PROTECTED PROPERTIES
	doc: null,

	handlers: {
		onUpdatePage: "updatePage",
	},
	components: [{
		layoutKind: "FittableColumnsLayout",
		classes: "file-header",
		components: [{
			classes: "file-title",
			name: "title",
			content: "",
			style: "float:left;"
		}, {
			style: "float:right;",
			name: "pageOfPages",
			content: ""
		}]
	}, {
		fit: true,
		kind: "Panels",
		classes: "file-content",
		name: "contentholder",
		draggable: false,
		components: [{}, {
			name: "download",
			kind: "blanc.FileDownload",
			onDownloaded: "displayFile"
		}, {
			name: "filegallery",
			kind: "blanc.FileGallery"
		}]
	}],
	// ...........................
	// PROTECTED METHODS
	create: function() {
		this.inherited(arguments);
		var persist = blanc.Session.getPersistenceManager(),
			that = this;
		persist.getDocumentById(this.docId, function(doc) {
			that.doc = doc;
			that.$.title.setContent(doc.title || doc.fileName);
			that.$.download.set("doc", that.doc);
			that.$.filegallery.set("doc", that.doc);
			that.doc.cached ? that.displayFile() : that.downloadFile();
		}, function(err) {
			logError(err);
		})
	},
	displayFile: function() {
		if (!this.pageNo || this.pageNo < 1)
			this.pageNo = this.doc.currentPageNo || 1;
		this.$.filegallery.init(this.pageNo);
		this.$.contentholder.setIndex(2);
	},
	updatePage: function(sender, event){
		this.$.pageOfPages.setContent(event.pageNo + "/" + event.npages);
	},
	downloadFile: function(){
		this.$.contentholder.setIndex(1);
		this.$.download.download();
	},
	// ...........................
	// PUBLIC METHODS
	showPage: function(pageNo) {
		this.$.filegallery.showPage(pageNo);
	},
	saveCurrentPageNo: function() {
		if (this.doc && this.doc.cached) {
			var pgno = this.$.filegallery.getCurrentPageNo();
			if (pgno > 0)
				blanc.Session.getPersistenceManager().updateCurrentPageNo(this.doc.id, pgno);
		}
	}
})