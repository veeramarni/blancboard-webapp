enyo.kind({
	name: "blanc.InvitationDialog",
	kind: "enyo.Popup",
	classes: "popup-dialog invitation-dialog",
	floating: true,
	centered: true,
	modal: true,
	scrim: true,
	events: {
		onErrorAlert: ""
	},
	components: [{
		name: "container",
		kind: "FittableRows",
		classes: "enyo-fit",
		components: [{
			kind: "enyo.Button",
			classes: "close pull-right",
			style: "padding:5px 10px;margin:0;",
			allowHtml: true,
			content: "&times",
			onclick: "hide"
		}, {
			classes: "dialog-title",
			content: $L("Send Invitation")
		}, {
			fit: true,
			style: "padding-top: 120px;",
			classes: "form-horizontal",
			components: [{
				name: "addressGroup",
				classes: "form-group",
				components: [{
					tag: "label",
					classes: "col-sm-3 control-label",
					content: $L("To")
				}, {
					classes: "col-sm-8",
					components: [{
						name: "addressBar",
						kind: "blanc.AddressBar",
						onfocus: "resetAddress"
					}]
				}, {
					name: "addressHelp",
					tag: "p",
					showing: false,
					classes: "help-block col-sm-offset-3 col-sm-8",
					content: $L("An email address is required")
				}]
			}, {
				name: "messageGroup",
				classes: "form-group",
				components: [{
					tag: "label",
					classes: "col-sm-3 control-label",
					content: $L("Message")
				}, {
					classes: "col-sm-8",
					components: [{
						name: "message",
						onfocus: "resetMessage",
						kind: "enyo.TextArea",
						classes: "form-control enyo-selectable",
						placeholder: $L("Enter invitation message")
					}]
				}, {
					name: "messageHelp",
					tag: "p",
					showing: false,
					classes: "help-block col-sm-offset-3 col-sm-8",
					content: $L("A message is required")
				}]
			}]
		}, {
			classes: "dialog-form-footer",
			layoutKind: "FittableColumnsLayout",
			components: [{
				fit: true,
				classes: "dialog-footer-cell"
			}, {
				classes: "dialog-footer-cell",
				components: [{
					kind: "enyo.Button",
					classes: "btn btn-default",
					content: $L("Cancel"),
					ontap: "hide"
				}, {
					name: "submitButton",
					kind: "blanc.Button",
					classes: "btn btn-primary",
					content: $L("Send"),
					ontap: "submitButtonClicked"
				}]
			}]
		}]
	}],
	rendered: function(){
		this.inherited(arguments);
	},
	initMessage: function(roomName){
		var url = enyo.macroize("{$serverUrl}/{roomName}", {
			serverUrl: blanc.Session.getServerUrl(),
			roomName: roomName
		}),
		message = enyo.macroize($L("Use this link to join the meeting: {ur}"), {
			url: url
		});
		this.$.message.serValue(message);
	},
	submitButtonClicked: function(){
		var emails = this.$.addressBar.getEmails();
		if(!emails || emails.length < 1){
			this.$.addressHelp.setShowing(true);
			this.$.submitButton.reset();
			this.$.addressGroup.addClass("has-error");
			return void 0;
		}
		for(var e in emails){
			if(!blanc.util.isValidEmail(emails[e])){
				this.doErrorAlert({
					message: enyo.macroize($L("'{$email}' is not a valid email address."), {
						email: emails[e]
					})
				});
				return void 0;
			}
		}
		var msg = this.$.message.getValue();
		if(!msg){
			this.$.messageGroup.addClass("has-error");
			this.$.submitButton.reset();
			this.$.messageHelp.setShowing(true);
			return void 0;
		}
		var emailList = emails.join(";"),
		that = this;
		blanc.Session.getConferenceManager().sendInvitation({
			emails: emailList,
			message: msg
		}, function(){
			that.$.submitButton.reset();
			that.hide();
		}, function(){
			that.$.submitButton.reset();
			that.doErrorAlert({
				message: $L("Operation failed. Please check your network connection and try again.")
			})
		})
	},
	resetMessage: function(){
		this.$.messageGroup.addRemoveClass("has-success", false);
		this.$.messageGroup.addRemoveClass("has-error", false);
		this.$.messageGroup.addRemoveClass("has-warning", false);
		this.$.messagHelp.setShowing(false);
	},
	resetAddress: function(){
		this.$.addressGroup.addRemoveClass("has-success", false);
		this.$.addressGroup.addRemoveClass("has-error", false);
		this.$.addressGroup.addRemoveClass("has-warning", false);
		this.$.addressHelp.setShowing(false);
	}
})