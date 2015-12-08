enyo.kind({
	name: "blanc.JoinMeeting",
	kind: "blanc.SigninPanel",
	events: {
		onSigninClicked: "",
		onSignin: "",
		onErrorAlert: ""
	},
	components: [{
		classes: "row",
		components: [{
			name: "subTitle",
			tag: "h1",
			allowHtml: true,
			content: $L("Join Meeting"),
			classes: "col-sm-offset-1 col-sm-10"
		}]
	}, {
		classes: "row",
		components: [{
			classes: "col-sm-offset-1 col-sm-5",
			components: [{
				name: "fields",
				kind: "blanc.JoinFields"
			}, {
				name: "submitButton",
				kind: "blanc.Button",
				type: "submit",
				classes: "btn btn-primary",
				content: $L("Join Meeting"),
				ontap: "joinClicked"
			}]
		}, {
			classes: "col-sm-5 text-right col-xs-12",
			components: [{
				classes: "lead",
				components: [{
					content: $L("Existing Blancboard user?")
				}, {
					tag: "a",
					style: "display: block; margin-button: 40px;",
					content: $L("Sign In"),
					ontap: "doSigninClicked"
				}, {
					name: "googleSignin",
					kind: "blanc.Button",
					content: "Sign in with Google",
					classes: "btn btn-danger",
					ontap: "googleSigninClicked"
				}]
			}]
		}]
	}],
	rendered: function(){
		this.inherited(arguments);
		var urlParams = blanc.Session.getUrlParams();
		urlParams.joinId ? (this.joinId = urlParams.joinId, this.$.subTitle.setContent("Joining a meeting")) : logError("Invalid parameters")
	},
	joinClicked: function(){
		this.$.submitButton.clicked();
		if(this.$.fields.validate()){
			var that = this;
				fields = this.$.fields.getParams();
			blanc.Session.signinAsGuest(fields.firstName, fields.lastName, function(){
				blanc.Session.getConferenceManager().joinConference(that.joinId
					, {
					firstName: fields.firstName,
					lastName: fields.lastName,
					email: fields.email,
					password: ""
				}
				, function(){
					that.$.submitButton.reset();
					that.doSignin()
				}, function(){
					that.$.submitButton.reset();
					that.doErrorAlert({
						message: $L("We could not connect you to the conference either due to network issue or conference is not valid. Please contact with your Conference Organizer")
					})
				})
			}, function(){})
		} else 
			this.$.submitButton.reset();


	}, 
	googleSigninClicked: function(){
		
	}
})