enyo.kind({
	name: "blanc.Board",
	kind: "enyo.Control",
	visibile: false,
	attributes: {
		width: 1024,
		height: 768
	},
	//tag: "svg",

	// ...........................
	// PUBLIC PROPERTIES
	paper: null,
	page: null,
	scale: 1,

	// ...........................
	// PROTECTED METHODS
	rendered: function(){
		this.inherited(arguments);
		if(this.hasNode()){
			this.generateRaphael();
		}
	},
	generateRaphael: function(){
		this.paper = Raphael(this.hasNode().id, this.getAttribute("width"), this.getAttribute("height"));
	},

	// ...........................
	// PUBLIC METHODS
	performAction: function(e){
		// switch(e.type) {
		// 	case Configuration.classTypes.freeLine:

		// }
	},
	resize: function(width, hegith){
		var svg = this.paper.size;
	}
	

})