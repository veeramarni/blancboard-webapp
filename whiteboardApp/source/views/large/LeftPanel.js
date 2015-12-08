enyo.kind({
	name: "blanc.LeftPanel",
	kind: "blanc.Panel",
	axis: "h",
	unit: "%",
	min: -120,
	max: 0,
	value: -120,
	classes: "left-panel",
	draggable: false,
	completion: null,
	handlers: {
		onAnimateFinish: "finishedAnimating"
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
		components: [{},{
			name: "settings",
			kind: "blanc.Settings"
		},{
			name: "meetings",
			kind: "blanc.Meetings"
		},{
			name: "people",
			kind: "blanc.Participants"
		},{
			name: "files",
			kind: "blanc.FileList"
		},{
			name: "widgets",
		//	kind: "blanc:WidgetList"
		}]
	}],
	rendered: function(){
		this.inherited(arguments), this.$.panels.setIndex(0);
	},
	isOpen: function(){
		return this.getMax() == this.getValue();
	},
	isClosed: function(){
		return this.getMin() == this.getValue();
	},
	close: function(e){
		this.inherited(arguments);
		this.completion = e;
		this.animateToMin();
	},
	open: function(e){
		this.inherited(arguments);
		this.completion = e;
		this.animateToMax();
	},
	finishedAnimating: function(){
		if(this.completion){
			typeof this.completion === "function" && this.completion();
			this.completion = null;
		}
		var e = this.$.panels.getActive();
		if(e.onClose){
			e.onClose();
		}
		if(this.isOpen()){
			this.doOpened();
		} else {
			this.doClosed();
		}
		return true;
	},
	toggle: function(e){
		if(this.isClosed()){
			for(var panels = this.$.panels.getPanels(), n =0; n < panels.length; n++){
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
	}
})