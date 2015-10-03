enyo.kind({
	name: "blanc.Page",
	kind: "enyo.Control",
	classes: "page-view",
	components: [{}],
	// ...........................
	// PUBLIC PROPERTIES
	page: null,

    // CONSTANTS
    PAGEWIDTH: 768,
    PAGEHEIGHT: 606,

	events: {
		onPageRendered: "",
		onPageDisplayed: ""
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
		if (pg.previewId) {
			var that = this;
			blanc.Session.getPersistenceManager().getBlob(pg.previewId, function(blob) {
				that.$.image.setSrc(blob);
			}, function(err) {
				logError("Failed to load image due to " + err);
			})
		} else {
			this.$.board && (this.$.board.addClass("sketchbook-page-image"), this.raisePageRendered());
		}
	},
	displayPage: function(pg) {
		this.destroyComponents();
		this.setPage(pg);
		var check = !pg.contentUrl || pg.contentWidth != pg.width || pg.contentHeight != pg.height,
			comp = this.createComponent({
				name: "bkg",
				classes: check ? "sketchbook-page-image" : "dimbkg",
				style: "position:absolute;"
			}, {
				owner: this
			});
		comp.render();
		if (pg.contentUrl != null) {
			var imgcomp = this.createComponent({
				kind: "enyo.Image",
				name: "image",
				showing: false,
				style: "position:absolute;",
				src: pg.contentUrl,
				onload: "imageLoaded"
			}, {
				owner: this
			});
			imgcomp.render();
		}
		var svgcomp = this.createComponent({
			kind: "blanc.Board",
			style: "position:absolute;",
			page: pg,
			persistent: false,
			name: "board"
		}, {
			owner: this
		});
		svgcomp.render();
		this.resizeView();
		if(this.page){
			var that = this;
			blanc.Session.getConference().getPage(this.page.id, function(pg){
				that.$.board && (that.$.board.restoreElements(pg.elements), this.$.board.didAppear())
			}, function(err){
				logError(err);
			});
			
		}else {
			this.$.board.didAppear();
		}
		this.doPageDisplayed({
			pageId: this.page.id
		})

	},
	raisePageRendered: function() {
		this.page && this.doPageRendered({
			pageId: this.page.id
		});
	},
	resizeView: function() {
		this.resize();
		if (this.$.board != null && this.$.image != null) {
			var node = this.hasNode();
			this.page.width = this.page.width || (logWarn("Page with id " + this.page.id + " doesn't have width defined"), this.PAGEWIDTH);
			this.page.height = 	this.page.height || (logWarn("Page with id " + this.page.id + " doesn't have height defined"), this.PAGEHEIGHT);	
			if (node) {
				var h = node.clientHeight,
					w = node.clientWidth,
					newDim = blanc.util.scaleRect(node.clientWidth, node.clientHeight, this.page.width, this.page.height);
				this.$.board.set("scale", newDim.scale);
				this.$.board.setAttribute("width", newDim.width);
				this.$.board.setAttribute("height", newDim.height);
				this.$.board.resize(newDim.width, newDim.height)
				this.$.board.setBounds(newDim);
				this.$.image.setBounds(newDim);

			}

		}
	},
	imageLoaded: function(){
		this.$.image && this.$.image.show();
	},
	undo: function() {
		this.$.board && this.$.board.undo();
	},
	clear: function() {
		this.$.board && this.$.board.clear();
	},
	boardAction: function(action){
		this.$.board && this.page.id === action.pageId && this.$.board.boardAction(action);
	}

})