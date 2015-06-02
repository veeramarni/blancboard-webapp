enyo.kind({
	name: "blanc.Content",
	classes: "content",
	handlers: {
	//	onRestoreView: "restoreView",
	//	onDisplayPage: "displayPage",
	//	onDisplayWidget: "displayWidget",
		onClearContent: "clearView"
	},
	components: [{
		kind: "Panels",
		classes: "content-pane",
		name: "panels",
		draggable: false,
		components: [{}]
	}],
	getPanels: function(){
		return this.$.panels.getPanels();
	},
	addPanel: function(e){
		var comp = this.$.panels.createComponent(e, {
			owner: this
		});
		comp.render();
		this.reflow();
		return comp;
	},
	clearView: function(){
		var panels = this.getPanels();
		if(panels && panels.length > 0){
			var panel = panels[0];
			panel.destroy();
		}
	},
	showView: function(panelName, kind, pn){
		var panel = null,
			panels = this.getPanels();
		if(panels && panels.length > 0){
			if(panel = panels[0], panel.getName() == panelName){
				return panel;
			}
			panel.distroy();
			panel = null;
		}
		return panel || (pn || (pn={}), pn.name=panelName, pn.kind=kind,panel = this.addPanel(pn)),panel;
	}
})