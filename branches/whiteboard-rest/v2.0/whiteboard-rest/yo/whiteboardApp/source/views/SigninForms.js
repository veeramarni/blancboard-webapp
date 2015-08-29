enyo.kind({
	name: "blanc.SigninForms",
	kind: "enyo.Scroller",
	touch: true,
	horizontal: "hidden",
	classes: "enyo-fit welcome",
	components: [{
		kind: "FittableRows",
		style: "width: 100%; height: 100%;",
		components: [{
			classes: "welcome-header",
			components: [{
				classes: "logo"
			}]
		}, {
			fit: true,
			name: "panels",
			kind: "Panels",
			draggable: false,
			classes: "signin-container",
			components: [{
				name: "signin",
				kind: "blanc.Signin",
				onRecoverPasswordClicked: "recoverClicked",
				onSignupClicked: "showSignup"
			}, {
				name: "signup",
				kind: "blanc.Signup",
				onCancelClicked: "showSignin"
			}, {
				name: "recover",
				kind: "blanc.RecoverPassword",
				onCancelClicked: "showSignin"
			}, {
				name: "join",
				kind: "blanc.JoinMeeting",
				onSigninClicked: "showSignin"
			}, {
				name: "resetPassword",
				kind: "blanc.ResetPassword",
				onCancelClicked: "showSigin"
			}]
		}, {
			classes: "welcome-footer",
			content: "Copyright (c) 2015 BlancBoard"
		}]
	}],
	create: function() {
		this.inherited(arguments);
		this.showSignin();
	},
	showSignin: function() {
		this.$.signin.reset();
		this.$.panels.setIndex(0);
		return true;
	},
	showJoin: function() {
		this.$.panels.setIndex(3);
		return true;
	},
	showSignup: function() {
		this.$.signup.reset();
		this.$.panels.setIndex(1);
		return true;
	},
	recoverClicked: function() {
		this.$.recover.reset();
		this.$.panels.setIndex(2);
		return true;
	},
	showResetPassword: function() {
		this.$.resetPassword.reset();
		this.$.panels.setIndex(4);
		return true;
	}
})