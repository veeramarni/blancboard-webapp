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
	rendered: function() {
		this.inherited(arguments);
		var name = localStorage.getItem("blanc_join_name");
		name && this.$.name.setValue(name);
		var email = localStorage.getItem("blanc_join_email");
		email && this.$.email.setValue(email);
	},
	getParams: function() {
		var names = [];
		this.$.name.getValue() ? (localStorage.setItem("blanc_join_name", this.$.name.getValue()), names = blanc.util.splitName(this.$.name.getValue())) : names.length > 1 && (names[0] = "", names[1] = $L("Anonymous"));
		this.$.email.getValue() ? localStorage.setItem("blanc_join_email", this.$.email.getValue()) : localStorage.removeItem("blanc_join_email");
		return {
			email: this.$.email.getValue(),
			firstName: names[0],
			lastName: names[1]
		}
	},
	onEnter: function() {

	}
})