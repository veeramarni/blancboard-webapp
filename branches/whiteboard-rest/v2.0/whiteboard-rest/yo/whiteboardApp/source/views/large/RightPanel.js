enyo.kind({
	name: "blanc.RightPanel",
	kind: "blanc.Panel",
	axis: "h",
	unit: "%",
	min: 0,
	max: 120,
	value: 120,
	classes: "right-panel",
	draggable: false,
	completion: null,
	handlers: {
		onAnimateFinish: "finishedAnimating",
		onMenuItemSelected: "itemSelected"
	},
	events: {
		onOpened: "",
		onClosed: ""
	},
	components: [{
		classes: "enyo-fit",
		kind: "Panels",
		name: "panels",
		draggable: false,
		components: [{
			name: "pages",
		//	kind: "blanc.Pages"
		},{
			name: "fileMenu",
		//	kind: "blanc.FileMenu"
		}]
	}],
	create: function(){
		this.inherited(arguments);
	},
	isOpen: function(){
		return this.getMin() == this.getValue();
	},
	isClosed: function(){
		return this.getMax() == this.getValue();
	},
	close: function(e){
		this.inherited(arguments);
		this.completion = e;
		this.animateToMax();
	},
	open: function(e){
		this.inherited(arguments);
		this.completion = e;
		this.animateToMin();
	},
	finishedAnimating: function(){
		if(this.completion){
			this.completion();
			this.completion = null;
		}
		if(this.isOpen()){
			this.doOpened();
		}else {
			this.doClosed();
		}
		return true;
	},
	toggle: function(e){
		if(this.isClosed()){
			for(var panels = this.$.panels.getPanels(), n=0; n < panels.lenght; n++){
				var panel = panels[n];
				if(panel.getName() == e){
					this.$.panels.setIndexDirect(n);
					this.open(function(){
						panel.init();
					});
					break;
				}
			}
			return true;
		}
		this.close();
		return false;
	},
	itemSelected: function(e, t){
	    this.close(t.completion);
	    return true;
	}
})