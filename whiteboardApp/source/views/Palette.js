enyo.kind({
	name: "blanc.PaletteCell",
	kind: "enyo.Control",
	tag: "canvas",
	classes: "palette-cell",
	published: {
		ratio: 1
	},
	attributes: {},
	create: function(){
		this.inherited(arguments);
		this.setRatio(window.devicePixelRaio || 1);
		this.attributes.width = 80 * this.getRatio();
		this.attributes.height = 80 * this.getRatio();
	},
	getContext: function(){
		if(!this.context){
			var e = this.hasNode();
			e.getContext && (this.context = e.getContext("2d"));
		}
		return this.context;
	}
});

enyo.kind({
	name: "blanc.ColorCell",
	kind: "blanc.PaletteCell",
	rendered: function(){
		this.inherited(arguments);
		var con = this.getContext();
		con.arc(40 * this.getRatio(), 40 * this.getRatio(), 30 * this.getRatio(), 0, 2 * Math.PI);
		con.fillStyle = "#" + this.color;
		con.fill();
	}
});

enyo.kind({
	name: "blanc.LineCell",
	kind: "blanc.PaletteCell",
	rendered: function(){
		this.inherited(arguments);
		
	}
})