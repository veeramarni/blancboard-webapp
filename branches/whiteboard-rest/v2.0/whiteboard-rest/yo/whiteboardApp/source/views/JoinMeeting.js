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
			name: "title",
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

	},
	joinClicked: function(){

	}, 
	googleSigninClicked: function(){
		
	}
})