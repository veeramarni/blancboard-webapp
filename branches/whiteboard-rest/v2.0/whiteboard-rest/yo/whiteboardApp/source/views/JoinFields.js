enyo.kind({
	name: "blanc.JoinFields",
	kind: "blanc.FormFields",
	events: {
		onErrorAlert: "",
		onEnterClicked: ""
	},
	components: [{
		name: "name",
		type: "displayName",
		kind: "blanc.InputGroup",
		label: $L("Name"),
		placeholder: $L("Firstname Lastname"),
		required: false
	}, {
		name: "email",
		kind: "blanc.InputGroup",
		type: "email",
		placeholder: $L("Enter email"),
		label: $L("Email address"),
		required: false
	}],
	rendered: function(){

	},
	onEnter: function(){

	}
})