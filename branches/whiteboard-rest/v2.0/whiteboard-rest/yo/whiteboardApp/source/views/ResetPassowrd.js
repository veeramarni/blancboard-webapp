enyo.kind({
	name: "blanc.ResetPassword",
	events: {
		onCancelClicked: "",
		onErrorAlert:""
	},
	components: [{
		classes: "row",
		components: [{
			tag: "h1",
			content: $L("Reset Password"),
			classes: "col-sm-offset-1 col-sm-10"
		}]
	}, {
		classes: "row",
		components: [{
			name: "fields",
			kind: "blanc.FormFields",
			classes: "col-sm-offset-1 col-sm-5",
			components: [{
				name: "password",
				kind: "blanc.InputGroup",
				type: "password",
				placeholder: $L("Enter a new password"),
				label: $L("Password")
			}, {
				name: "verify",
				kind: "blanc.InputGroup",
				type: "password",
				placeholder: $L("Enter the password again"),
				label: $L("Re-enter password")
			}, {
				name: "submitButton",
				kind: "blanc.Button",
				type: "submit",
				classes: "btn btn-primary",
				content: $L("Cancel"),
				ontap: "doCancelClicked"
			}]
		}, {
			classes: "col-sm-5 text-right col-xs-12",
			components: [{}]
		}]
	}],
	reset: function(){
		this.$.fields.reset();
	}
})