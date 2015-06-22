enyo.kind({
	name: "blanc.Page",
	kind: "enyo.Control",
	classes: "page-view",
	components: [{}],
	// ...........................
	// PUBLIC PROPERTIES
	visible: false,
	pageno: null,
	docid: null,
	page: null,

	events: {
		onPageRendered: ""
	},
	// ...........................
	// PUBLIC METHODS
	loadView: function(pg) {
		if (!this.$.image) {
			var com = this.createComponent({
				name: "image",
				kind: "enyo.Image",
				style: "position:absolute;",
				src: "../../assets/placeholder.png"
			}, {
				owner: this
			});
			com.render();
		}
		if (!this.$.board) {
			var com = this.createComponent({
				name: "board",
				kind: "blanc.Board",
				page: pg,
				persistent: true,
				style: "position:absolute;"
			}, {
				owner: this
			});
			com.render();
		}
		this.page = pg;
		this.resizeView();
		if(pg.previewid){
			var that = this;
			blanc.Session.getPersistenceManager().getBlobURL(pg.previewid, function(blob){
				that.$.image.setSrc(blob);
			}, function(err){
				logError("Failed to load image due to " + err);
			})
		}
		this.$.board && this.$.board.addClass("sketchbook-page-image");
		this.raisePageRendered();
	},
	raisePageRendered: function(){
	//	this.page && this.doPageRendered({pageid: this.page.id});
	},
	resizeView: function() {
		this.resize();
		if (this.$.board != null && this.$.image != null) {
			var node = this.hasNode();
			if (node) {
				var h = node.clientHeight,
					w = node.clientWidth,
					newDim = blanc.util.scaleRect(node.clientWidth, node.clientHeight, this.page.width, this.page.height);
				this.$.board.set("scale", newDim.scale);
				this.$.board.setAttribute("width", newDim.width);
				this.$.board.setAttribute("height", newDim.height);
				this.$.board.resize(newDim.width, newDim.height);
				this.$.board.setBounds(newDim);
				this.$.image.setBounds(newDim);

			}

		}
	},
	didAppear: function() {
	},
	didDisappear: function() {
	},

})