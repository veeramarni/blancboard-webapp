enyo.kind({
	name: "blanc.Content",
	classes: "content",
	handlers: {
		onRestoreView: "restoreView",
		onDisplayPage: "displayPage",
		onFileOpen: "showFile",
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
	// ...........................
	// PUBLIC METHODS
	showFile: function(docid, pageno, n) {
		var pn = this.getPanels();
		if (pn && pn.length > 0) {
			var o = pn[0];
			if (o.getName() === "fileView" && o.docid === docid && !n) {
				return o.showPage(pageno);
			}
			o instanceof blanc.FileView && o.saveCurrentPageNo(), o.destroy();
		}
		this.addPanel({
			name: "fileView",
			kind: "blanc.FileView",
			docid: docid,
			pageno: pageno
		})
	},
	restoreView: function(sender, event){
		var that = this,
			pgid = event.pageid;
		if(pgid){
			var per = blanc.Session.getPersistenceManager();
			if(blanc.Session.isConferenceActive()){

			} else {
				per.getPageById(pgid, function(pg){
					that.showFile(pg.assetid, pg.pageNo);
				}, function(){})
			}
		}
	},

	// Following code for panels
	getPanels: function() {
		return this.$.panels.getPanels();
	},
	addPanel: function(e) {
		var comp = this.$.panels.createComponent(e, {
			owner: this
		});
		comp.render();
		this.reflow();
		return comp;
	},
	clearView: function() {
		var panels = this.getPanels();
		if (panels && panels.length > 0) {
			var panel = panels[0];
			panel.destroy();
		}
	},
	showView: function(panelName, kind, pn) {
		var panel = null,
			panels = this.getPanels();
		if (panels && panels.length > 0) {
			if (panel = panels[0], panel.getName() == panelName) {
				return panel;
			}
			panel.distroy();
			panel = null;
		}
		return panel || (pn || (pn = {}), pn.name = panelName, pn.kind = kind, panel = this.addPanel(pn)), panel;
	}
})