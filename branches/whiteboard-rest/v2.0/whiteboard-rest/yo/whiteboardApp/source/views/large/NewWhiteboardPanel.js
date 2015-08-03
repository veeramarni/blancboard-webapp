enyo.kind({
	name: "blanc.NewWhiteboardPanel",
	kind: "FittableRows",
	events: {
		onFileCreated: "",
		onFileOpen: "",
		onCloseClicked: ""
	},
	components: [{
		content: $L("New Whiteboard"),
		classes: "dialog-title"
	}, {
		fit: true,
		components: [{
			classes: "form-horizontal",
			style: "margin-top: 160px;",
			components: [{
				name: "formGroup",
				classes: "form-group",
				components: [{
					classes: "col-sm-3 control-label",
					content: $L("Name"),
					tag: "label"
				}, {
					classes: "col-sm-8",
					components: [{
						kind: "enyo.Input",
						name: "wbName",
						onkeydown: "onEnter",
						classes: "form-control",
						placeholder: $L("Enter the whiteboard name")
					}, {
						name: "errorSuggestion",
						tag: "p",
						showing: false,
						classes: "col-sm-offset-3 col-sm-8",
						content: $L("A whiteboard name is required")
					}]
				}]
			}]
		}]

	}, {
		classes: "dialog-form-footer",
		layoutKind: "FittableColumnsLayout",
		components: [{
			fit: true,
			classes: "dialog-footer-cell",
		}, {
			classes: "dialog-footer-cell",
			components: [{
				name: "cancel",
				content: $L("Cancel"),
				kind: "enyo.Button",
				ontap: "doCloseClicked",
				classes: "btn btn-default"
			}, {
				name: "submit",
				content: $L("Submit"),
				kind: "blanc.Button",
				ontap: "submitBtnClicked",
				classes: "btn btn-primary"
			}]

		}]

	}],
	init: function(){},
	reset: function() {
		this.$.formGroup.addRemoveClass("has-success", false);
		this.$.formGroup.addRemoveClass("has-error", false);
		this.$.formGroup.addRemoveClass("has-warning", false);
		this.$.errorSuggestion.setShowing(false);
	},
	submitBtnClicked: function() {
		
		var name = this.$.wbName.getValue();
		if (!name) {
			this.$.errorSuggestion.setShowing(true);
			this.$.formGroup.addClass("has-error");
			this.$.submit.reset();
			return void 0
		}
		var that = this;
		blanc.Session.getPersistenceManager().createWhiteboard(name, function(e) {
			that.$.submit.reset();
			that.doFileCreated({
				docid: e.id
			});
			that.doFileOpen({
				docid: e.id
			});
		}, function(e) {
			that.$.submit.reset();
			console.log(e);
		});

	},
	onEnter: function(e, t) {
		if (t.keyCode === 13) {
			this.$.submit.clicked();
			this.submitBtnClicked();
			return true;
		}
		return false;
	}
})