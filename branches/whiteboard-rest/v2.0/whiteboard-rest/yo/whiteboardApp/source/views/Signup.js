enyo.kind({
	name: "blanc.Signup",
	events: {
		onCancelClicked: "",
		onErrorAlert: "",
		onSignin: ""
	},
	components: [{
		classes: "row",
		components: [{
			name: "title",
			tag: "h1",
			content: $L("Sign Up"),
			classes: "col-sm-offset-1 col-sm-10"
		}]
	}, {
		classes: "row",
		components: [{
			classes: "col-sm-offset-1 col-sm-5",
			components: [{
				name: "fields",
				kind: "blanc.SignupFields",
				onEnterClicked: "signupClicked"
			}, {
				name: "submitButton",
				kind: "blanc.Button",
				type: "submit",
				content:$L("Sign Up"),
				classes: "btn btn-primary",
				ontap: "signupClicked"
			}, {
				name: "cancelButton",
				kind: "blanc.Button",
				type: "submit",
				content: $L("Cancel"),
				classes: "btn btn-default",
				ontap: "doCancelClicked"
			}]
		}, {
			classes: "col-sm-5 text-right col-xs-12",
			components: [{}]

		}]
	}],
	signupClicked: function(){
		if(this.$.fields.validate()){
			var that = this;
			this.$.cancelButton.hide();
			var params = this.$.fields.getParams(),
				err = enyo.bind(this, function(e){
					this.$.submitButton.reset();
					this.$.cancelButton.show();
					that.doErrorAlert(e);
				});
			blanc.Session.register(params, function(){
				blanc.Session.signin(params.user.emailAddress, params.password, function(){
					that.doSignin();
				}, err)
			}, err )
		} else {
			this.$.submitButton.reset();
			bjse.api.Analytics.trackEvent(bjse.api.Analytics.EventType.PROFILE, bjse.api.Analytics.EventType.REGISTER);
		}
	},
	reset: function(){
		this.$.fields.reset();
		this.$.submitButton.reset();
		this.$.cancelButton.show();
	}
})