//...........................
// Dependencies
//  -Board.js
//...........................
enyo.kind({
	name: "blanc.Palette",
	kind: "enyo.Popup",
	classes: "palette",
	floating: true,
	centered: true,
	modal: true,
	scrim: true,

	// ...........................
	// PUBLIC PROPERTIES
	colorSelected: "",
	widthSelected: "",

	components: [{
		kind: "blanc.Grid",
		name: "cells",
		style: "width:300px;height:225px;",
		cellWidth: 75,
		cellHeight: 75,
		classes: "palette-cells",
		gridAlign: "center"
	}],

	create: function() {
		this.inherited(arguments);
		for (var i = 0; i < blanc.Toolbox.widths.length; i++) {
			var w = blanc.Toolbox.widths[i],
				wb = blanc.Session.getToolbox().get("width");
			this.$.cells.createComponent({
				kind: "blanc.WidthCell",
				width: w,
				ontap: "widthTap"
			}, {
				owner: this
			})
		}
		for (i = 0; i < blanc.Toolbox.colors.length; i++) {
			var c = blanc.Toolbox.colors[i];
			this.$.cells.createComponent({
				kind: "blanc.ColorCell",
				color: c,
				ontap: "colorTap"
			}, {
				owner: this
			})
		}
		this.$.cells.render();
	},
	show: function() {
		this.colorSelected = "";
		this.widthSelected = "";
		var cl = this.$.cells.getClientControls(),
			tool = blanc.Session.getToolbox();
		for (var i = 0; i < cl.length; i++) {
			var cell = cl[i];
			cell.kind == "blanc.WidthCell" && cell.addRemoveClass("palette-cell-selected", cell.width == tool.get("width"));
			cell.kind == "blanc.ColorCell" && cell.addRemoveClass("palette-cell-selected", cell.color == tool.get("color"));
		}
		this.inherited(arguments);
	},
	widthTap: function(sender) {
		var tool = blanc.Session.getToolbox(),
			cl = this.$.cells.getClientControls();
		for (var i = 0; i < cl.length; i++) {
			var cell = cl[i];
			if (cell.width == tool.get("width")) {
				cell.addRemoveClass("palette-cell-selected", false);
				break;
			}
		}
		sender.addRemoveClass("palette-cell-selected", true);
		tool.set("width", sender.width);
		this.widthSelected = sender.width;
		this.colorSelected && this.hide();
	},
	colorTap: function(sender) {
		var tool = blanc.Session.getToolbox(),
			cl = this.$.cells.getClientControls();
		for (var i = 0; i < cl.length; i++) {
			var cell = cl[i];
			if (cell.color == tool.get("color")) {
				cell.addRemoveClass("palette-cell-selected", false);
				break;
			}
		}
		sender.addRemoveClass("palette-cell-selected", true);
		tool.set("color", sender.color);
		this.colorSelected = sender.color;
		this.widthSelected && this.hide();
	}
});

enyo.kind({
	name: "blanc.PaletteCell",
	kind: "enyo.Control",
	tag: "canvas",
	classes: "palette-cell",

	// ...........................
	// PUBLIC PROPERTIES
	ratio: 1,

	attributes: {},
	create: function() {
		this.inherited(arguments);
		this.set("ratio", window.devicePixelRatio || 1);
		this.attributes.width = 80 * this.get("ratio");
		this.attributes.height = 80 * this.get("ratio");
	},
	getContext: function() {
		if (!this.context) {
			var e = this.hasNode();
			e.getContext && (this.context = e.getContext("2d"));
		}
		return this.context;
	}
});

enyo.kind({
	name: "blanc.ColorCell",
	kind: "blanc.PaletteCell",
	// ...........................
	// PUBLIC PROPERTIES
	color: null,

	rendered: function() {
		this.inherited(arguments);
		var con = this.getContext();
		con.arc(40 * this.get("ratio"), 40 * this.get("ratio"), 30 * this.get("ratio"), 0, 2 * Math.PI);
		con.fillStyle = "#" + this.color;
		con.fill();
	}
});

enyo.kind({
	name: "blanc.WidthCell",
	kind: "blanc.PaletteCell",
	// ...........................
	// PUBLIC PROPERTIES
	width: null,

	rendered: function() {
		this.inherited(arguments);
		var con = this.getContext();
		con.strokeStyle = "black";
		con.lineWidth = this.width * this.get("ratio");
		con.beginPath();
		con.moveTo(10 * this.get("ratio"), 40 * this.get("ratio"));
		con.lineTo(70 * this.get("ratio"), 40 * this.get("ratio"));
		con.stroke();
		con.closePath();
	}
})