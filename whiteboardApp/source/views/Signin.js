enyo.kind({
	name: "blanc.Signin",
	events: {
		onSignupClicked: "",
		onRecoverPasswordClicked: "",
		onSignin: "",
		onErrorAlert: ""
	},
	components: [{
		classes: "row",
		components: [{
			tag: "h1",
			content: $L("Sign In"),
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
				type: "email_username",
				placeholder: $L("Enter email"),
				label: $L("Email Address or Room ID")
			}, {
				name: "password",
				kind: "blanc.InputGroup",
				label: $L("Password"),
				type: "password",
				onkeydown: "onEnter",
				placeholder: $L("Password")
			}, {
				classes: "pull-right",
				components: [{
					tag: "a",
					content: $L("Forgot password?"),
					ontap: "doRecoverPasswordClicked"
				}]
			},{
				name: "submitButton",
				kind: "blanc.Button",
				type: "submit",
				classes: "btn btn-primary",
				content: $L("Submit"),
				ontap: "signinClicked"
			}]
		}, {
			classes: "col-sm-5 text-right col-xs-12",
			components: [{
				classes: "lead",
				components: [{
					content: $L("Do not have an account?")
				}, {
					tag: "a",
					style: "display:block; margin-bottom: 40px;",
					content:$L("Sign Up"),
					ontap: "doSignupClicked"
				}, {
					name: "googleSignin",
					kind: "blanc.Button",
					content: "Sign in with Google",
					classes: "btn btn-danger",
					ontap: "googleSiginClicked"
				}]
			}]
		}]
	}],
	signinClicked: function(){
		if(this.$.fields.validate()){
			var that = this;
			blanc.Session.signin(this.$.email.getValue(), this.$.password.getValue(), function(){
				that.doSignin();
			}, function(){
				that.doErrorAlert({
					message: $L("Invalid username or password")
				});
				that.$.submitButton.reset();
			})
		} else 
			this.$.submitButton.reset();
	},
	reset: function(){
		this.$.fields.reset();
		this.$.submitButton.reset();
	},
	onEnter: function(sender, event){
		if(event.keyCode === 13){
			this.$.submitButton.clicked();
			this.signinClicked();
			return true;
		} else 
			return false;
	},
	googleSigninClicked: function(){

	}
})