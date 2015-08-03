enyo.kind({
	name: "blanc.ConfirmDialog",
	kind: "enyo.Popup",
	classes: "confirm",
	floating: true,
	centered: true,
	modal: true,
	events: {
		onYes: "",
		onNo: ""
	},
	handlers: {
		onHide: "hidden"
	},
	// ...........................
	// PRIVATE PROPERTIES
	dismissed: false,
	// ...........................
	// PUBLIC PROPERTIES
	title: "",
	message: "",
	args: "", // to carry the event objects

	components: [{
		classes: "modal-dialog modal-sm",
		components: [{
			classes: "modal-content",
			components: [{
				name: "header",
				classes: "modal-header",
				components: [{
					kind: "enyo.Button",
					classes: "close",
					allowHtml: true,
					content: "&times",
					onclick: "noClicked"
				}, {
					name: "title",
					tag: "h4",
					classes: "modal-title",
					content: $L("Please Confirm")
				}]
			}, {
				classes: "modal-body",
				components: [{
					name: "message",
					tag: "p",
					content: ""
				}]
			},{
				classes: "modal-footer",
				components: [{
					kind: "enyo.Button",
					classes: "btn btn-primary",
					content: $L("Yes"),
					ontap: "yesClicked"
				}, {
					kind: "enyo.Button",
					classes: "btn btn-default",
					content: $L("No"),
					ontap: "noClicked"
				}]
			}]
		}]
	}],
	create: function() {
		this.inherited(arguments);
		this.$.message.setContent(this.message);
		this.title ? (this.$.title.setContent(this.title), this.$.title.setShowing(true)) :
			this.$.title.setShowing(false);
	},
	yesClicked: function() {
		this.doYes(this.args);
		this.dismissed = true;
		this.hide();
		return true;
	},
	noClicked: function() {
		this.doNo(this.args);
		this.dismissed = true;
		this.hide();
		return true;
	},
	hidden: function() {
		this.dismissed || this.doNo(this.args), this.destroy();
	}
})