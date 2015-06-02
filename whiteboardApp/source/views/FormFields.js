enyo.kind({
	name: "blanc.FormFields",
	kind: "enyo.Control",
	validate: function(){
		for (var e= true, t = this.getControls(), n=0; n < t.length ; n++){
			var i = t[n];
			if(i instanceof blanc.InputGroup){
				i.validate() || (e = false);
			}
		}
		return e;
	},
	reset: function(){
		for(var e = this.getControls(), t = 0; t < e.length; t++){
			var n = e[t];
			if(n instanceof blanc.InputGroup){
				n.reset();
				n.setValue("");
			}
		}
	}
})