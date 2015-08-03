enyo.kind({
	name: "blanc.NewItemDialog",
	kind: "enyo.Popup",
	classes: "popup-dialog",
	floating: true,
	centered: true,
	modal: true,
	scrim: true,
	components: [{
		classes: "enyo-fit",
		name: "panels",
		kind: "Panels",
		draggable: false,
		components: [{
			style: "text-align:center;top:50%;",
			content: $L("Loading ... Please wait")
		}, {
			kind: "FittableRows",
			components: [{
				components: [{
					kind: "enyo.Button",
					classes: "close puu-right",
					style: "padding:5px 10px;margin:0;",
					allowHtml: true,
					content: "&times",
					onclick: "hide"
				}, {
					name: "tabs",
					kind: "blanc.Tabs",
					components: [{
						name: "sbTab",
						kind: "blanc.Tab",
						label: $L("New Whiteboard"),
						onTabClicked: "tabClicked",
						active: true,
						index: 0
					}, {
						name: "uploadTab",
						kind: "blanc.Tab",
						label: $L("Upload"),
						onTabClicked: "tabClicked",
						index: 1
					}]
				}]
			}, {
				fit: true,
				style: "background-color: white;",
				name: "dialogs",
				kind: "Panels",
				draggable: false,
				animate: false,
				components: [{
					name: "sbPanel",
					kind: "blanc.NewWhiteboardPanel",
					onCloseClicked: "hide"
				}, {
					name: "uploadPanel",
					kind: "blanc.UploadPanel"
				}]
			}]
		}]
	}],
	create: function(){
		this.inherited(arguments);
		if(blanc.Session.isGuest()){
			enyo.forEach(this.$.tabs.getControls(), function(e){
				e.index > 0 && e.hide();
			})
		}
	},
	rendered: function(){
		this.inherited(arguments);
		this.$.panels.setIndex(1);
		this.files && this.filesDropped(this.files);
	},
	tabClicked: function(panel){
		var pn = this.$.dialogs.getPanels()[panel.index];
		pn && (pn.init(), this.$.dialogs.setIndex(panel.index));
	},
	switchTo: function(ind){
		var index = this.$[ind];
		index && (this.$.tabs.tabClicked(index),
		this.tabClicked(index))
	},
	filesDropped: function(files){

	}

})