enyo.kind({
	name: "blanc.Tabs",
	tag: "ul",
	classes: "nav nav-tabs",
	handlers: {
		onTabClicked: "tabClicked"
	},
	tabClicked: function(e){

	}
});
enyo.kind({
	name: "blanc.Tab",
	tag: "li",
	published: {
		label: "",
		active: false
	},
	events: {
		onTabClicked: ""
	},
	handlers: {
		ontap: "doTabClicked"
	},
	components: [{
		name: "label",
		tag: "a",
		content: ""
	}],
	rendered: function(){
		this.inherited(arguments);
		this.$.label.setContent(this.label);
		this.addRemoveClass("active", this.active);
	},
	activeChanged: function(){
		this.addRemoveClass("active", this.active);
	}

})