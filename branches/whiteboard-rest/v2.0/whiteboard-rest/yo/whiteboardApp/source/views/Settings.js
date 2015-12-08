enyo.kind({
	name: "blanc.Settings",
	kind: "FittableRows",
	events: {
		onSupportRequested: "",
		onSignoutClicked: "",
		onSettingsSaved: "",
		onErrorAlert: "",
		onManageAccountClicked: ""
	},
	components: [{
		name: "titlebar",
		kind: "blanc.Toolbar",
		components: [{
			fit: true,
			classes: "toolbar-title",
			tag: "span",
			content: $L("Settings")
		}, {
			components: [{
				name: "saveButton",
				kind: "blanc.Button",
				classes: "btn btn-primary",
				content: $L("Save"),
				ontap: "saveClicked"
			}]
		}]
	}, {
		kind: "enyo.Scroller",
		touch: true,
		fit: true,
		components: [{
			name: "fields",
			classes: "fields",
			kind: "blanc.FormFields",
			components: [{
				name: "username",
				kind: "blanc.InputGroup",
				type: "roomname",
				placeholder: $L("Enter username"),
				label: $L("Room ID"),
				onkeydown: "onEnter"
			}, {
				name: "email",
				kind: "blanc.InputGroup",
				type: "email",
				placeholder: $L("Enter email"),
				label: $L("Email address"),
				onkeydown: "onEnter"
			}, {
				name: "name",
				kind: "blanc.InputGroup",
				type: "displayName",
				placeholder: $L("Firstname Lastname"),
				label: $L("Name"),
				onkeydown: "onEnter"
			}, {
				classes: "manage-account-container",
				components: [{
					tag: "a",
					showing: false,
					name: "manageAccountButton",
					classes: "manage-account-button",
					content: $L("Manage Account"),
					ontap: "doManageAccountClicked"
				}]
			}]
		}]

	}, {
		name: "toolbar",
		kind: "blanc.Toolbar",
		classes: "panel-footer-toolbar",
		components: [{
			fit: true
		}, {
			layoutKind: "FittableColumnsLayout",
			noStretch: true,
			components: [{
				kind: "enyo.Button",
				content: $L("Contact Support"),
				classes: "btn btn-info",
				ontap: "doSupportRequest"
			}, {
				kind: "enyo.Button",
				classes: "btn btn-danger",
				content: $L("Sign Out"),
				ontap: "doSignoutClicked"
			}]
		}]
	}],
	init: function() {
		this.$.username.reset();
		this.$.email.reset();
		this.$.name.reset();
		this.$.saveButton.reset();
		var that = this;
		blanc.Session.getUserInfo(function(user) {
			that.userId = user.id;
			that.$.username.setValue(user.publicId);
			that.$.email.setValue(user.emailAddress);
			that.$.name.setValue(user.firstName + " " + user.lastName);
			that.$.manageAccountButton.setShowing(user.admin);
		}, function(e) {
			logError(e);
		})
	},
	saveClicked: function() {
		if (this.$.fields.validate()) {
			var names = blanc.util.splitName(this.$.name.getValue()),
				user = {
					firstName: names[0],
					lastName: names[1],
					emailAddress: this.$.email.getValue(),
					publicId: this.$.username.getValue()
				},
				that = this;
			blanc.Session.getUserDirectory().updateUser(this.userId, user, function(updatedUser) {
				blanc.Session.getPersistenceManager().updateUser(updatedUser, function() {
					that.doSettingsSaved();
				})
			}, function(e) {
				that.$.saveButton.reset();
				that.doErrorAlert(e);
			})
		} else {
			this.$.saveButton.reset();
		}
		return true;
	},
	onEnter: function(sender, event) {
		if (event.keyCode === 13) {
			this.saveClicked();
			return true;
		}
		return false;

	}
})