enyo.kind({
	name: "blanc.PageCarousel",
	kind: "enyo.Panels",
	arrangerKind: "enyo.CarouselArranger",
	defaultScale: "auto",
	disableZoom: false,
	visible: null,
	// ...........................
	// PUBLIC PROPERTIES
	docId: "",
	pages: [],

	// ...........................
	// PROTECTED PROPERTIES
	pageCount: 0,

	events: {
		onPageChanged: ""
	},

	// ...........................
	// PROTECTED METHODS
	create: function() {
		this.inherited(arguments);
		this.pageCount = this.pages.length;
		if (this.pages.length > 0) {
			this.initContainers();
		}
	},
	rendered: function(){
		this.inherited(arguments);
		this.visible = null;
		this.signalApperance();
	},
	initContainers: function() {
		for (var e = 0; this.pages.length > e; e++) {
			if (!this.$["container" + e]) {
				this.createComponent({
					name: "container" + e,
					kind: "blanc.Page",
					pageno: e + 1,
					docid: this.docid
				})
			}
			this.$["container" + e].render();
		}
		for (e = this.pages.length; this.pageCount > e; e++) {
			this.$["container" + e].destroy();

		}
		this.pageCount = this.pages.length;
	},
	signalApperance: function() {
		this.visible && this.visible.didDisappear();
		this.$["container" + this.index] && this.$["container" + this.index].didAppear();
		this.visible = this.$["container" + this.index];
	},
	// ...........................
	// PUBLIC METHODS
	addPage: function() {

	},
	jumpTo: function(pageno) {
		if (this.getIndex() != pageno) {
			var t = this.getAnimate();
			this.setAnimate(false);
			this.setIndex(pageno);
			this.setAnimate(t);
			this.signaleApperance();

		}
	},
	loadNearby: function() {
		if (this.pages.length > 0) {
			this.loadPageView(this.index - 1);
			this.loadPageView(this.index);
			this.loadPageView(this.index + 1);
		}
	},
	loadPageView: function(i) {
		if (i >= 0 && this.pages.length - 1 >= i && this.$["container" + i]) {
			this.$["container" + i].loadView(this.pages[i]);
		}
	},
	next: function(){
		 !this.$.animator.isAnimating() && this.inherited(arguments);
	},
	previous: function(){
		!this.$.animator.isAnimating() && this.inherited(arguments);
	},
	resizeAllPages: function(){
		if (this.pages.length > 0 ){
			// only the three pages that are loaded in carousel
			resizePageView(this.index - 1);
			resizePageView(this.index);
			resizePageView(this.index + 1);
		}
	},
	resizePageView: function(ind){
		this.$["container" + ind].resizeView();
	},
	// ...........................
	// OBSERVERS
	indexChanged: function() {
		this.inherited(arguments);
		this.loadNearby();
		var index = this.getIndex();
		this.pages && index  >=0 && this.pages.length > index && this.doPageChanged({
			pageid : this.pages[index].id,
			pageno : index + 1,
			npages : this.pages.length
		})
	},
	pagesChanged: function() {
		this.initContainers();
	}

})