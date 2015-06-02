enyo.kind({
	name: "blanc.Button",
	kind: "enyo.Button",
	handler: {
		ontap: "clicked"
	},
	clicked: function(){
		this.savedContent = this.getContent();
		this.setContent(this.loading ? this.loading : L("Please wait ..."));
		this.setAttribute("disabled", "disabled");
	},
	reset: function(){
		this.savedContent && this.setContent(this.savedContent);
		this.blur();
		this.setAttribute("disabled", null);
	}

})