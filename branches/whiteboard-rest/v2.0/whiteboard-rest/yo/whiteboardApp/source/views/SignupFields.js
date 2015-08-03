enyo.kind({
	name: "blanc.SignupFields",
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
		placeholder: $L("Firstname Lastname")
	}, {
		name: "email",
		kind: "blanc.InputGroup",
		type: "email",
		placeholder: $L("Enter email"),
		label: $L("Email address")
	}, {
		name: "password",
		kind: "blanc.PickPasswordGroup",
		label: $L("Pick a Password"),
		onkeydown: "onEnter",
		placeholder: $L("Pick a password")
	}],
	reset: function() {
		this.inherited(arguments);

	},
	getParams: function() {
		var name = blanc.util.splitName(this.$.name.getValue());
		return {
			user: {
				emailAddress: this.$.email.getValue(),
				firstName: name[0],
				lastName: name[0]
			},
			password: this.$.password.getValue(),
			invitationId: this.invitationId
		}
	},
	onEnter: function(sender, event) {
		if (event.keyCode === 13) {
			this.doEnterClicked();
			return true;
		}
		return false;
	}
})