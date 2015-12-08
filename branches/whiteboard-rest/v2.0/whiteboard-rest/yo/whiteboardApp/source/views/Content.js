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
	showFile: function(docId, pageNo, n) {
		var pn = this.getPanels();
		if (pn && pn.length > 0) {
			var o = pn[0];
			if (o.getName() === "fileView" && o.docId === docId && !n) {
				o.showPage(pageNo);
				return void 0;
			}
			o instanceof blanc.FileView && o.saveCurrentPageNo();
			o.destroy();
		}
		this.addPanel({
			name: "fileView",
			kind: "blanc.FileView",
			docId: docId,
			pageNo: pageNo
		})
	},
	showPage: function(pageNo) {
		this.$.fileView && this.$.fileView.showPage(pageNo);
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
	},
	restoreView: function(sender, event) {
		var that = this,
			urn = event.urn,
			persist = blanc.Session.getPersistenceManager();
		// comment: Change to switch if there are more 
		if (urn.scheme == "page") {
			persist.getPageById(urn.location, function(pg) {
				that.showFile(pg.assetId, pg.pageNo);
			}, function() {})
		}
	},
	viewDetails: function(sender, event) {

	},
	displayPage: function(sender, event){
		var pnls = this.getPanels();
		if(pnls && pnls.length > 0){
			var pn = pnls[0];
			if("meetingView" === pn.getName()){
				pn.displayPage(event.page);
				return void 0;
			}
			pn.destroy();
		}
		this.addPanel({
			name: "meetingView",
			kind: "blanc.MeetingView",
			page: event.page
		})
	}
})