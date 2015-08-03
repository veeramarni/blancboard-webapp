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
	handlers: {
		onTransitionStart: "transitionStart",
		onTransitionFinish: "transitionFinish"
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
					kind: "blanc.PageView",
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
	transitionStart: function(sender, event){
		return event.fromIndex === event.toIndex ? true : void 0
	},
	transitionFinish: function(){
		this.loadPageView(this.index - 1);
		this.loadPageView(this.index + 1);
		this.signalApperance();
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
			this.signalApperance();

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
	resizeHandler: function(){
		alert("reseize handler working from pageCarousel");
		if (this.pages.length > 0 ){
			// only the three pages that are loaded in carousel
			resizePageView(this.index - 1);
			resizePageView(this.index);
			resizePageView(this.index + 1);
		}
		this.inherited(arguments);
	},
	resizePageView: function(ind){
		this.$["container" + ind].resizeView();
	},
	// ...........................
	// OBSERVERS
	indexChanged: function() {
		this.inherited(arguments);
		this.loadNearby();
		var ind = this.getIndex();
		this.pages && ind  >=0 && this.pages.length > ind && this.doPageChanged({
			pageid : this.pages[ind].id,
			pageno : ind + 1,
			npages : this.pages.length
		})
	},
	pagesChanged: function() {
		this.initContainers();
	},
	getPageView: function() {
		return this.$["container" + this.index];
	}

})