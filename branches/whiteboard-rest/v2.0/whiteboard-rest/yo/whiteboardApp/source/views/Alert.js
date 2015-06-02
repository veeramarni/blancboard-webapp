enyo.kind({
	name: "blanc.Alert",
	kind: "blanc.Popup",
	floating: true,
	centered: true,
	modal: true,
	scrim: true,
	components: [{
		classes: "modal-dialog",
		components: [{
			classes: "modal-content",
			components: [{
				classes: "modal-header",
				components: [{
					kind: "enyo.Button",
					classes: "close",
					allowHtml: true,
					content: "&times",
					onclick: "closeClicked"
				},{
					name: "title",
					tag: "h4",
					classes: "modal-title",
					content: $L("Error")
				}]
			}, {
				classes: "modal-body",
				components: [{
					name: "message",
					tag: "p",
					content: ""
				}]
			}]
		}]
	}],
	showMessage: function(title, content, html){
		this.$.title.setContent(title);
		this.$.message.setAllowHtml(html ? true: false);
		this.$.message.setContent(content);
		this.show();
	},
	closeClicked: function(){
		this.hide();
		return true;
	}
})