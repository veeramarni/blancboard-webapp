enyo.kind({
	name: "blanc.ProgressBar",
	components: [{
		name: "container",
		classes: "progress",
		components: [{
			name: "bar",
			classes: "progress-bar",
			style: "width: 0;"
		}]
	}],
	setProgress: function(cnt){
		this.$.bar.setStyle(enyo.macroize("width: {$val}%;", {
			val: 100 * cnt
		}))
	},
	setAnimate: function(e){
		this.$.container.addRemoveClass("progress-striped", e);
		this.$.container.addRemoveClass("active", e);
	},
	setSuccess: function(){
		this.$.container.addRemoveClass("progress-striped", false);
		this.$.container.addRemoveClass("active", false);
		this.$.bar.addRemoveClass("progress-bar-success", true);
	},
	setError: function(){
		this.setProgress(1);
		this.$.container.addRemoveClass("progress-striped", false);
		this.$.container.addRemoveClass("active", false);
		this.$.bar.addRemoveClass("progress-bar-danger", true);
	}
})