enyo.kind({
	name: "blanc.MainLarge",
	classes: "main",
	handlers: {
		onFileOpen: "openFile"
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
			name: "content",
			kind: "blanc.Content",
			fit: true
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
	dialogHidden: function(){	
		var p = this.$.dialog.processWhenHidden;
		this.$.dialog.destroy();
		p && this.showNewItemDialog(p);
	},
	toggleLeftMenu: function(e) {
		this.$.leftPanel.toggle(e);
	},
	toggleRightMenu: function(e) {
		this.$.rightPanel.toggle(e);
	},
	closeMenu: function(e) {
		if (this.$.leftPanel.isOpen()) {
			this.$.leftPanel.close(e);
		}
		if (this.$.rightPanel.isOpen()) {
			this.$.rightPanel.close(e);
		}
	},
	openFile: function(e, t) {
		this.$.dialog && this.$.dialog.hide();
		this.$.content.showFile(t.docid, 1);
	},
	fileSelected: function(e, t) {
		var n = this;
		return this.closeMenu(function() {
			n.$.content.showFile(t.docId, 0)
		}), true
	}
})