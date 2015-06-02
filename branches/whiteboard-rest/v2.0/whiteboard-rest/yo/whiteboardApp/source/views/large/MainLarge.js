enyo.kind({
	name: "blanc.MainLarge",
	classes: "main",
	components: [{
		style: "width: 100%; height: 100%; position: relative;",
		components: [{
			name: "leftPanel",
			kind: "blanc.LeftPanel",
			onOpened: "panelOpened",
			onClosed: "panelClosed"
		},{
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
	destroy: function(){

	},
	toggleLeftMenu: function(e){
		this.$.leftPanel.toggle(e);
	},
	toggleRightMenu: function(e){
		this.$.rightPanel.toggle(e);
	},
	closeMenu: function(e){
		if(this.$.leftPanel.isOpen()){
			this.$.leftPanel.close(e);
		}
		if(this.$.rightPanel.isOpen()){
			this.$.rightPanel.close(e);
		}
	}
})