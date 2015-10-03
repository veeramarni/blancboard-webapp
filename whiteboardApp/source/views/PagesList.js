enyo.kind({
	name: "blanc.PagesList",
	kind: "FittableRows",
	fit: true,
	docId: null,
	_pages: [],
	events: {
		onPageSelected: ""
	},
	handlers: {
		onUpdatePage: "updatePage",
		onThumbnailUpdated: "updateThumbnail",
		onPageCreated: "pageCreated"
	},
	components: [{
		name: "titlebar",
		kind: "blanc.Toolbar",
		components: [{
			fit: true,
			classes: "toolbar-title",
			tag: "span",
			content: $L("Pages")
		}]
	}],
	create: function() {
		this.inherited(arguments);
	},
	init: function() {
		!this.$.thumbs && this.docId && this.populateGrid();
	},
	populateGrid: function() {
		var that = this;
		this.createComponent({
			kind: "enyo.DataGridList",
			fit: true,
			name: "thumbs",
			minWidth: 100,
			minHeight: 100,
			components: [{
				kind: blanc.pageThumbs
			}]
		}, {
			owner: this
		});
		var cnt = 0,
			success = function(pg) {
				that.$.thumbs.set("collection", new enyo.Collection(that._pages));
				that.$.thumbs.render();
			},
			persist = blanc.Session.getPersistenceManager();
		persist.getPagesForDocument(this.docId, function(pgs) {
				var len = pgs.length;
				for (var cnt = 0, i = 0; i < pgs.length; i++) {
					var pg = pgs[i],
						complete = function(img) {
							var newPg = pgs[cnt];
							newPg.thumbUrl = img;
							that._pages.push(newPg);
							len === ++cnt && success();
						};
					pg.thumbId ? persist.getBlob(pg.thumbId, function(img) {
						complete(img);
					}, function() {
						complete(img)
					}) : complete("../../assets/placeholder.png")
				}
			},
			function() {
				logError("failed to get pages for document id:" + docId);
			})

	},
	pageCreated: function() {
		this.$.thumbs && this.$.thumbs.destroy();
	},
	updatePage: function(sender, event) {
		if (this.docId != event.docId) {
			this.docId = event.docId;
			this._pages = [];
			this.$.thumbs && this.$.thumbs.destroy();
		}
	},
	updateThumbnail: function(sender, event) {
		var comp = this.$.thumbs && this.$.thumbs.childForIndex(event.pageNo - 1);
		comp && comp.set("source", event.data);
	}

})

enyo.kind({
	name: "blanc.pageThumbs",
	kind: "enyo.GridListImageItem",
	imageSizing: "cover",
	useSubCaption: false,
	centered: false,
	bindings: [{
		from: "model.pageNo",
		to: "caption"
	}, {
		from: "model.id",
		to: "pageId"
	}, {
		from: "model.thumbUrl",
		to: "source"
	}],
	handlers: {
		ontap: "tapped"
	},
	events: {
		onPageSelected: ""
	},
	tapped : function(sender, event){
		this.selected = true;
		this.doPageSelected({pageId : this.pageId, pageNo : this.caption})
	}
})