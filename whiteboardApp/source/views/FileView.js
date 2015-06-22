enyo.kind({
	name: "blanc.FileView",
	kind: "FittableRows",
	// ...........................
	// PUBLIC PROPERTIES
	pageno: 0,
	docid: null,
	// ...........................
	// PROTECTED PROPERTIES
	doc: null,

	handlers: {
		onUpdatePage: "updatePage"
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
		name: "content",
		draggable: false,
		components: [{}, {

		}, {
			name: "filegallery",
			kind: "blanc.FileGallery"
		}]
	}],
	// ...........................
	// PROTECTED METHODS
	create: function(){
		this.inherited(arguments);
		var persist = blanc.Session.getPersistenceManager(),
			that = this;
		persist.getDocumentById(this.docid, function(doc){
			that.doc = doc;
			that.$.title.setContent(doc.title);
			that.$.filegallery.set("doc", that.doc);
			that.displayFile();
		}, function(err){
			logError(err);
		})
	},
	displayFile: function(){
		if(!this.pageno)
			this.pageno = 1;
		this.$.filegallery.init(this.pageno);
		this.$.content.setIndex(2);
	},
	// ...........................
	// PUBLIC METHODS
	showPage: function(pageno){
		this.$.filegallery.showPage(pageno);
	}
})