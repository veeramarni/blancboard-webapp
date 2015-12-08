enyo.kind({
	name: "blanc.MeetingView",
	kind: "FittableRows",
	fit: true,
	handlers: {
		onUndoClicked: "undo",
		onClearClicked: "clear",
		onBoardAction: "boardAction"
	},
	events: {
		onPageDisplayed: ""
	},
	components: [{
		layoutKind: "FittableColumnsLayout",
		classes: "file-header",
		components: [{
			classes: "file-title",
			name: "title",
			content: ""
		}, {}]
	}, {
		fit: true,
		components: [{
			kind: "Panels",
			style: "width:100%;height:100%;",
			draggable: false,
			classes: "file-content",
			name: "panels",
			animate: false,
			components: [{
				kind: "blanc.Page"
			}, {
				kind: "blanc.Page"
			}]
		}]
	}],
	rendered: function(){
		this.inherited(arguments);
		this.page && this.displayPage(this.page);		
	},
	pageView: function(){
		return this.$.panels.getActive();
	},
	displayPage: function(pg){
		var curpn, pn = this.$.panels.getActive();
		if(pn.get("page") == null || pn.get("page").id != pg.id){
			pn.destroyComponents();
			var ind = this.$.panels.getIndex(),
				o = (ind + 1) % 2;
			curpn = this.$.panels.getPanels()[o];
			this.$.title.setContent(pg.title);
			this.$.panels.setIndex(o);
			curpn.displayPage(pg);
		} else 
			this.doPageDisplayed({
				pageId: pg.id
			})
	},
	undo: function(){
		var pv = this.pageView();
		pv && pv.undo();
	},
	clear: function(){
		var pv = this.pageView();
		pv && pv.clear();
	},
	boardAction: function(sender, event){
		var pv = this.pageView();
		pv && pv.boardAction(sender, event.data);
	}
})