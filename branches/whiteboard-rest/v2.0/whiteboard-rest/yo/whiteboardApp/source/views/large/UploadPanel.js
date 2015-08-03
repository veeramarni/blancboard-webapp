enyo.kind({
	name: "blanc.UploadPanel",
	kind: "FittableRows",
	components: [{
		classes: "dialog-title",
		content: $L("Upload")
	}, {
		fit: true,
		name: "uploadBox",
		components: [{
			classes: "upload-tip",
			components: [{
				name: "uploadTip",
				classes: "upload-box",
				allowHtml: true
			}]
		}]
	}],
	create: function(){
		this.inherited(arguments);
		this.$.uploadTip.setContent($L("Drag a file from your desktop and drop in this box."));
	},
	rendered: function(){
		var that = this,
			node = this.$.uploadTip.hasNode();
		node.ondragenter = function(){
			return that.$.uploadTip.addClass("upload-box-hover"), false;
		};
		node.ondragleave = function(){
			return that.$.uploadTip.removeClass("upload-box-hover"), false;
		}
	},
	init: function(){
		this.$.uploadTip.removeClass("upload-box-hover");
	}
})