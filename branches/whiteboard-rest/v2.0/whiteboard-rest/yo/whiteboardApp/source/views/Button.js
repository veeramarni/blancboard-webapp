enyo.kind({
	name: "blanc.Button",
	kind: "enyo.Button",
	handlers: {
		ontap: "clicked"
	},
	// ...........................
	// PUBLIC PROPERTIES

	// ...........................
	// PROTECTED PROPERTIES
	savedContent: null,
	// ...........................
	// COMPUTED PROPERTIES

	// ...........................
	// PUBLIC METHODS
	clicked: function(){
		this.savedContent = this.getContent();
		this.setContent(this.loading ? this.loading : $L("Please wait ..."));
		this.setAttribute("disabled", "disabled");
	},
	reset: function(){
		this.savedContent && this.setContent(this.savedContent);
		this.blur();
		this.setAttribute("disabled", null);
	}
	// ...........................
	// PROTECTED METHODS

	// ...........................
	// OBSERVERS



})