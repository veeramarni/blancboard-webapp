enyo.kind({
	name: "blanc.Board",
	kind: "enyo.Control",
	visibile: false,
	draggable: false,
	attributes: {
		width: 1024,
		height: 768
	},
	handlers: {
		ontap: "touchdown",
		ondragstart: "dragStart",
		ondragfinish: "dragFinish",
		ondrag: "dragging"
	},
	events: {
		onUndoRedoStateChanged: "",
		onClearStateChanged: ""
	},
	// ...........................
	// PRIVATE PROPERTIES
	elements: null,
	// ...........................
	// PUBLIC PROPERTIES
	paper: null,
	page: null,
	scale: 1,

	// ...........................
	// PROTECTED METHODS
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.generateRaphael();
		}
	},
	destroy: function() {
		this.saveElements();
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		var that = this;
		blanc.Session.getPersistenceManager().getElementsByPageId(this.page.id, function(e) {
			that.set("elements", e);
			that.visible && that.restoreElements();
		});
	},
	generateRaphael: function() {
		this.paper = Raphael(this.hasNode().id, this.getAttribute("width"), this.getAttribute("height"));
		this.paper.undocache = [];
		this.paper.redocache = [];
	},
	touchdown: function(sender, event) {
		if (!blanc.Session.isDrawing()) {
			return false;
		} else {
			event.preventDefault();
			return true;
		}

	},
	dragStart: function(sender, event) {
		if (!blanc.Session.isDrawing())
			return false;
		else {
			event.preventDefault();
			return true;
		}
	},
	dragFinish: function(sender, event) {
		if (!blanc.Session.isDrawing())
			return false;
		else {
			event.preventDefault();
			return true;
		}
	},
	dragging: function(sender, event) {
		if (!blanc.Session.isDrawing())
			return false;
		else {
			event.preventDefault();
			return true;
		}
	},

	// ...........................
	// PUBLIC METHODS
	setOffset: function() {
		var offset = {},
			clientoffset = this.hasNode().getBoundingClientRect();
		offset.left = clientoffset.left;
		offset.top = clientoffset.top;
		blanc.Session.getDrawEngine().setOffset(offset);
	},
	resize: function(width, height) {
		this.paper.setSize(width, height);
	},
	undo: function() {
		blanc.Session.getDrawEngine().undoAction();
	},
	redo: function() {
		blanc.Session.getDrawEngine().redoAction();
	},
	clear: function() {
		blanc.Session.getDrawEngine().clearAction();
	},
	getElements: function() {
		return blanc.Session.getDrawEngine().getAllElements();
	},
	boardAction: function(board){
		var el = board.element;
		switch(board.action){
			case BoardAction.CREATE:
			case BoardAction.CLONE:
				blanc.Session.getDrawEngine().createElement(el.properties, el.type, el.orderNo, false, true);
				break;
			case BoardAction.UPDATE:
				blanc.Session.getDrawEngine().updateElement(el.properties, el.type);
				break;
			case BoardAction.REMOVE:
				blanc.Session.getDrawEngine().removeElement(el.properties, false, true);
				break;
			case BoardAction.TOFRONT: 
				blanc.Session.getDrawEngine().bringFrontElement(el.properties.uuid, el.properties.orderNo, false, true);
				break;
			case BoardAction.TOBACK:
				blanc.Session.getDrawEngine().bringBackElement(el.properties.uuid, el.properties.orderNo, false, true);
				break;
			case BoardAction.CLEAR:
				blanc.Session.getDrawEngine().clearWhiteboard();
				break;
		}
	},
	didAppear: function() {
		if (!blanc.Session.isDrawingEnabled()) {
			var drawOptions = {},
				that = this;
			drawOptions.onUndoRedoChanged = enyo.bind(this, function(obj) {
				that.doUndoRedoStateChanged(obj);
			})
			drawOptions.onClearPaper = enyo.bind(this, function(obj) {
				that.doClearStateChanged(obj);
			});
			blanc.Session.setDrawEngine(drawOptions);
		}
		this.visible = true;
		blanc.Session.getDrawEngine().setPaper(this.paper);
		this.restoreElements();
		blanc.Session.isDrawing() && blanc.Session.getDrawEngine().createTracker();
		this.setOffset();
	},
	restoreElements: function(els) {
		els = els || this.elements;
		if (els) {
			blanc.Session.getDrawEngine().restorePaper(this.elements);
			this.elements = null;
		}
	},
	saveElements: function(sender, event) {
		if (this.paper.isDirty) {
			var that = this;
			blanc.Session.getPersistenceManager().storeElements(blanc.Session.getDrawEngine().wbElementsToArrayElements(this.paper.wbElements), this.page.id, function(){
			that.paper.isDirty = false;
			enyo.isFunction(event) && event();
			});
		} else {
			enyo.isFunction(event) && event();
		}
	},
	didDisappear: function() {
		//store the data in the browser database
		this.visible = false;
		this.saveElements();
		blanc.Session.getDrawEngine().removeTracker(this.paper);
	}

});

enyo.kind({
	name: "blanc.DrawMode",
	statics: {
		NONE: "others",
		EMPTY: "EMPTY",
		PEN: "freeLineMode",
		LINE: "straightLineMode",
		ERASER: "removeMode",
		REMOVE: "removeMode",
		FILL: "fillMode",
		ELLIPSE: "ellipseMode",
		CIRCLE: "circleMode",
		RECTANGLE: "rectangleMode",
		TEXT: "textMode",
		ICON: "iconMode",
		SELECT: "selectMode",
		MOVE: "moveMode",
		MORE: "moreMode",
		CLONE: "cloneMode",
		FRONT: "bringFrontMode",
		BACK: "bringBackMode",
		ERASER_WIDTH: 24
	}
});

enyo.kind({
	name: "blanc.Toolbox",
	kind: "enyo.Object",
	statics: {
		widths: [2, 4, 10, 20],
		colors: ["040404", "3C5980", "599ECF", "ADC74D", "C61A69", "AD94E4", "FCBA6B", "FFDB7A"]
	},
	// ...........................
	// PUBLIC PROPERTIES
	mode: null,
	color: null,
	width: null,

	// ...........................
	// PROTECTED METHODS
	constructor: function() {
		this.inherited(arguments);
		this.set("width", blanc.Toolbox.widths[1]);
		this.set("color", blanc.Toolbox.colors[1]);
		this.set("mode", blanc.DrawMode.NONE);
	},
	isToolboxActive: function() {
		return this.get("mode") != blanc.DrawMode.NONE;
	},
	// ...........................
	// OBSERVERS
	modeChanged: function(was, is) {
		var cursor = null;
		switch (this.mode) {
			case blanc.DrawMode.LINE:
				cursor = 'corsshair';
				break;
			case blanc.DrawMode.TEXT:
				cursor = 'text';
				break;
			default:
				cursor = 'default';
				break;
		}
		blanc.Session.getDrawEngine().switchToMode(this.mode, cursor);
		logInfo("Set draw mode as :" + this.mode);
	},
	colorChanged: function(was, is) {
		blanc.Session.getDrawEngine().changeProperties("stroke", "#" + this.color);
	},
	widthChanged: function(was, is) {
		blanc.Session.getDrawEngine().changeProperties("stroke-width", this.width);
	}
});