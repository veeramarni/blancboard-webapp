enyo.kind({
	name: "blanc.Panel",
	kind: "Slideable",
	eventsToCapture: {
		ondown: "down"
	},
	destroy: function(){
		this.inherited(arguments);
		this.release();
	},
	release: function(){
		enyo.dispatcher.release(this);
	},
	open: function(){
		this.capture();
	},
	capture: function(){
		enyo.dispatcher.capture(this, this.eventsToCapture);
	},
	close: function(){
		this.release();
	},
	down: function(e,t){
		return t.dispatchTarget.isDescendantOf(this) || (t.preventDefault(), this.close()), true;

	}
	
})