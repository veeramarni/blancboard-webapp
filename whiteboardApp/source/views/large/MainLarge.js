enyo.kind({
	name: "blanc.MainLarge",
	classes: "main",
	handlers: {
		onFileOpen: "openFile",
		onFileSelected: "fileSelected",
		onPageSelected: "pageSelected",
		onSettingsSaved: "closeMenu"
	},
	components: [{
		style: "width: 100%; height: 100%; position: relative;",
		components: [{
			name: "leftPanel",
			kind: "blanc.LeftPanel",
			onOpened: "panelOpened",
			onClosed: "panelClosed"
		}, {
			name: "rightPanel",
			kind: "blanc.RightPanel",
			onOpened: "panelOpened",
			onClosed: "panelClosed"
		}, {
			name: "FittableRows",
			classes: "enyo-fit",
			name: "container",
			components: [{
				name: "content",
				kind: "blanc.Content",
				fit: true
			}]
		}]
	}],
	destroy: function() {
		this.$.dialog && this.$.dialog.hide();
		this.inherited(arguments);
	},
	showNewItemDialog: function(e) {
		var dia = this.$.dialog;
		if (dia) {
			dia.processWhenHidden = e;
			dia.hide();
		} else {
			var comp = this.createComponent({
				name: "dialog",
				kind: "blanc.NewItemDialog",
				onHide: "dialogHidden"
			}, {
				owner: this
			});
			comp.show();
		}
		return true;
	},
	dialogHidden: function() {
		var p = this.$.dialog.processWhenHidden;
		this.$.dialog.destroy();
		p && this.showNewItemDialog(p);
	},
	toggleLeftMenu: function(menuName) {
		this.$.leftPanel.toggle(menuName);
	},
	toggleRightMenu: function(menuName) {
		this.$.rightPanel.toggle(menuName);
	},
	closeMenu: function(menuName) {
		if (this.$.leftPanel.isOpen()) {
			this.$.leftPanel.close(menuName);
		}
		if (this.$.rightPanel.isOpen()) {
			this.$.rightPanel.close(menuName);
		}
	},
	openFile: function(sender, event) {
		this.$.dialog && this.$.dialog.hide();
		this.$.content.showFile(event.docId, 1);
	},
	fileSelected: function(sender, event) {
		var that = this;
		this.closeMenu(function() {
			that.$.content.showFile(event.docId, event.pageNo ? event.pageNo : 0)
		});
		return true
	},
	pageSelected: function(sender, event){
		var that = this;
		this.closeMenu(function(){
			that.$.content.showPage(event.pageNo);
		})
		
	},
	fileRemovedClicked: function(sender, event) {

	}
})