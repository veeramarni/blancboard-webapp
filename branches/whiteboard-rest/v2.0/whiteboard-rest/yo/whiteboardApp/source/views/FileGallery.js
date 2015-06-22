enyo.kind({
	name: "blanc.FileGallery",
	kind: "FittableRows",
	fit: true,
	events: {
		onPageChanged: "",
		onPageCreated: ""
	},
	handlers: {
		onNextClicked: "next",
		onPrevClicked: "prev",
		onUndoClicked: "undo",
		onClearClicked: "clear",
		onBoardAction: "boardAction",
		onPerformAction: "performAction",

	},
	// ...........................
	// PUBLIC PROPERTIES
	doc: null,

	components: [{
		fit: true,
		classes: "gallery-container",
		components: [{
			name: "carousel",
			kind: "blanc.PageCarousel",
			classes: "gallery-carousel"
		}]
	}, {
		kind: "Signals",
		onkeydown: "keyDown"
	}],

	// ...........................
	// PUBLIC METHODS
	init: function(pageno) {
		var that = this,
			persist = blanc.Session.getPersistenceManager();
		persist.getPagesForDocument(this.doc.id, function(pages) {
			var i = pageno ? pageno : 1;
			that.$.carousel.set("docId", that.doc.id);
			that.$.carousel.set("pages", pages);
			that.$.carousel.setIndex(i - 1);
			that.$.carousel.render();
		}, function() {
			logError("Failed to get the document with id :" + doc.id);
		})
	},
	showPage: function(pageno) {
		this.$.carousel.jumpTo(pageno - 1);
	},
	prev: function() {
		this.$.carousel.previous();
	},
	next: function() {
		this.$.carousel.next();
	},
	clear: function() {
		var page = this.$.carousel.getPageView();
		page && page.clear();
	},
	undo: function() {
		var page = this.$.carousel.getPageView();
		page && page.undo();
	},
	performAction: function(e, t) {
		var page = this.$.carousel.getPageView();
		page && (page.performAction(t.action), this.boardAction(e, t))
	},
	boardAction: function(e, t) {

	},
	getCurrentPageNo: function() {
		return this.$.carousel.getIndex() + 1;
	}


})