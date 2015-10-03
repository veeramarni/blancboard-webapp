//depreciated
enyo.kind({
	name: "blanc.PageGrid",
	kind: "enyo.Scroller",
	strategyKind: "TouchScrollStrategy",
	classes: "toc",
	fit: true,
	docId: null,
	_pages: [],
	events: {
		onThumbTap: ""
	},
	handlers: {
		onUpdatePage: "updatePage",
		onThumbnailUpdated: "updateThumbnail",
		onPageCreated: "pageCreated"
	},
	init: function() {
		!this.$.thumbs && this.docId && this.populateGrid();
	},
	populateGrid: function() {
		this.createComponent({
			kind: "enyo.DataGridList",
			name: "thumbs",
			onSetupItem: "setupItem",
			itemMinWidth: 106,
			itemSpacing: 2
		}, {
			owner: this
		});
		var that = this,
			cnt = 0,
			success = function(totalpages) {
				cnt++;
				cnt == totalpages && that.$.thumbs.render();
			},
			persist = blanc.Session.getPersistenceManager();
		persist.getPagesForDocument(this.docId, function(pgs) {
			this._pages = pgs;
			that.$.thumbs.render();
			for(var i=0; i < pgs.length; i++){
				that.addThumbnail(pgs[i], function(){
					success(pgs.length)
				})
			}
		}, function() {
			logError("failed to get pages for document id:" + docId);
		})

	},
	setupItem: function(sender, event) {
		var item = this._data[event.index];
		this.addThumbnail(item)
	},
	addThumbnail: function(pg, completion) {
		var that = this,
			persist = blanc.Session.getPersistenceManager(),
			thumbImg = that.$.thumbs.createComponent({
				name: pg.id,
				pageNo: pg.pageNo,
				kind: "enyo.GridListImageItem",
				source: "../../assets/placeholder.png",
				selected: true
			}, {
				owner: that
			});
		pg.thumbId ? persist.getBlob(pg.thumbId, function(img) {
			thumbImg.setSource(img);
			completion();
		}, function() {
			completion()
		}) : completion()
	},
	pageCreated: function() {
		this.$.thumbs && this.$.thumbs.destroy();
	},
	updatePage: function(sender, event) {
		this.docId != event.docId && (this.docId = event.docId, this.$.thumbs && this.$.thumbs.destroy());
	},
	updateThumbnail: function(sender, event) {
		var comp = this.$[event.id];
		comp && comp.setSrc(event.data);
	}
})