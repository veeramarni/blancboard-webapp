enyo.kind({
	name: "blanc.Alert",
	kind: "enyo.Popup",
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
				}, {
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
				}, {
					name: "moreInfo",
					tag: "p",
					classes: "alert-danger",
					content: ""
				}]
			}]
		}]
	}],
	showMessage: function(title, content, html, moreInfo) {
		this.resetMessage();
		this.$.title.setContent(title);
		this.$.message.setAllowHtml(html ? true : false);
		this.$.message.setContent(content);
		if (moreInfo) {
			this.$.moreInfo.setContent(moreInfo);
		} 
		this.show();
	},
	closeClicked: function() {
		this.hide();
		return true;
	},
	resetMessage: function(){
		this.$.message.setContent("");
		this.$.moreInfo.setContent("");
	}
})