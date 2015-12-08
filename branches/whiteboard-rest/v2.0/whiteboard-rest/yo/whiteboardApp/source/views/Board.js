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
		onClearStateChanged: "",
		onThumbnailUpdated: "",
		onDrawAction: ""
	},
	// ...........................
	// PRIVATE PROPERTIES
	elements: null,
	thumbnailUpdateTimer: null,
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
	boardAction: function(board) {
		var el = board.element;
		switch (board.action) {
			case bjse.api.conference.Action.CREATE:
			case bjse.api.conference.Action.CLONE:
				blanc.Session.getDrawEngine().createElement(el.properties, el.type, el.properties.orderNo, false, true);
				break;
			case bjse.api.conference.Action.UPDATE:
				blanc.Session.getDrawEngine().updateElement(el.properties, el.type);
				break;
			case bjse.api.conference.Action.REMOVE:
				blanc.Session.getDrawEngine().removeElement(el.properties.uuid, false, true);
				break;
			case bjse.api.conference.Action.TOFRONT:
				blanc.Session.getDrawEngine().bringFrontElement(el.properties.uuid, el.properties.orderNo, false, true);
				break;
			case bjse.api.conference.Action.TOBACK:
				blanc.Session.getDrawEngine().bringBackElement(el.properties.uuid, el.properties.orderNo, false, true);
				break;
			case bjse.api.conference.Action.CLEAR:
				blanc.Session.getDrawEngine().clearWhiteboard();
				break;
		}
	},
	raiseAction: function(event){
        this.doDrawAction({
            sendAction: event,
            pageId: this.page.id,
            assetId: this.page.assetId
        });
        // find better way to commit to the storage
        //this.saveElements();
	},
	didAppear: function() {
		if (!blanc.Session.isDrawingEnabled()) {
			var drawOptions = { isBroadcastable: true},
				that = this;
			drawOptions.onUndoRedoChanged = enyo.bind(this, function(obj) {
				that.doUndoRedoStateChanged(obj);
			})
			drawOptions.onClearPaper = enyo.bind(this, function(obj) {
				that.doClearStateChanged(obj);
			});
			drawOptions.onSend = enyo.bind(this, function(obj){
				this.raiseAction(obj)
			})
			blanc.Session.setDrawEngine(drawOptions);
		}
		this.visible = true;
		blanc.Session.getDrawEngine().setPaper(this.paper);
		this.restoreElements();
		blanc.Session.isDrawing() && blanc.Session.getDrawEngine().createTracker();
		this.setOffset();
	},
	restoreElements: function(els, broadcast) {
		if(!els){
			els = this.elements;
		}
		if (els) {
			blanc.Session.getDrawEngine().restorePaper(els, broadcast);
			this.elements = null;
		}
	},
	saveElements: function(event){
		if (this.paper.isDirty) {
			var that = this;
			this.triggerThumbnailUpdate();
			blanc.Session.getPersistenceManager().storeElements(blanc.Session.getDrawEngine().wbElementsToArrayElements(this.paper.wbElements), this.page.id, function() {
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
	},
	triggerThumbnailUpdate: function() {
		if (!this.page.previewId) {
			var that = this;
			this.thumbnailUpdateTimer && clearTimeout(this.thumbnailUpdateTimer)
			this.thumbnailUpdateTimer = setTimeout(function() {
                that.updateThumbnail()
            }, 300)
		}
	},
	updateThumbnail: function() {
		var persist = blanc.Session.getPersistenceManager(),
			rawSvgData = CryptoJS.enc.Utf8.parse(this.paper.toSVG()),
			imgData = "data:image/svg+xml;base64," + CryptoJS.enc.Base64.stringify(rawSvgData),
			that = this,
			success = function(pg, img) {
				persist.storeBlob(pg.assetId, pg.thumbId, img, function() {
					that.doThumbnailUpdated({
						id: pg.id,
						docId: pg.assetId,
						pageNo: pg.pageNo,
						data: img
					})
				}, function() {
					logError("Failed to store svg image");
				})

			};
		this.page.thumbId ? success(this.page, imgData) : (this.page.thumbId = bjse.util.randomUUID(), persist.updatePage(this.page, function(pg) {
			success(pg, imgData);
		}, function(err) {
			logError("Unable to update page due to " + err);
		}));
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