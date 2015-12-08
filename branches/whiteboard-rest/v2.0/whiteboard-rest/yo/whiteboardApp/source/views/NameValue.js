enyo.kind({
	name: "blanc.NameValueList",
	tag: "ol",
	classes: "name-value"
});

enyo.kind({
	name: "blanc.NameValue",
	tag: "li",
// Variables
		label: "",
		value: "",
		
	components: [{
		tag: "label",
		name: "label",
		content: $L("Email")
	}, {
		tag: "span",
		name: "value",
		content: ""
	}],
	create: function(){
		this.inherited(arguments);
		this.$.label.setContent(this.label);
		this.$.value.setContent(this.value);
	},
	valueChanged: function(){
		this.$.value.setContent(this.value);
	}
})