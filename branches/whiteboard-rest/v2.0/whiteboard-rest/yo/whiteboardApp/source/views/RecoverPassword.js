enyo.kind({
	name: "blanc.RecoverPassword",
	kind: "blanc.SigninPanel",
	events: {
		onCancelClicked: "",
		onErrorAlert: ""
	},
	components: [{
		classes: "row",
		components: [{
			tag: "h1",
			content: $L("Recover Password"),
			classes: "col-sm-offset-1 col-sm-10"
		}]
	}, {
		classes: "row",
		components: [{
			name: "fields",
			kind: "blanc.FormFields",
			classes: "col-sm-offset-1 col-sm-5",
			components: [{
				name: "email",
				kind: "blanc.InputGroup",
				type: "email",
				onkeydown: "onEnter",
				placeholder: $L("Enter email"),
				label: $L("Email address")
			}, {
				name: "submitButton",
				kind: "blanc.Button",
				classes: "btn btn-primary",
				content: $L("Submit"),
				ontap: "submitClicked"
			}, {
				name: "cancelButton",
				kind: "enyo.Button",
				classes: "btn btn-default",
				content: $L("Cancel"),
				onclick: "doCancelClicked"
			}]
		}]
	}],
	submitClicked: function(){
		if(this.$.fields.validate()){
			this.$.cancelButton.hide();
			var that = this,
				email = this.$.email.getValue();
			blanc.Session.getUserDirectory().recoverPassword( email , function(){
				that.$.submitButton.reset();
				that.$.cancelButton.show();
				var comp = that.createComponent({
					kind: "blanc.Alert",
					onHide: "showSignin"
				}, {
					owner: that.owner
				});
				comp.render();
				comp.showMessage($L("Recover Password"), $L("If we have this email in the database, you will be receiving a message with instructions on how to reset the password."))
			}, function(err){
				that.$.submitButton.reset();
				that.$.cancelButton.show();
				that.doErrorAlert(err);
			})
		} else {
			this.$.submitButton.reset();
		}
	},
	reset: function(){
		this.$.fields.reset();
	},
	onEnter: function(sender, event){
		if(event.keyCode === 13){
			this.$.submitButton.clicked();
			this.submitClicked();
			return true;
		}
		return false;
	}
})