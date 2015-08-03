enyo.kind({
	name: "blanc.PickPasswordGroup",
	kind: "blanc.InputGroup",
	create: function(){
		this.type = "password";
		this.inherited(arguments);
	},
	validate: function(){
		this.inherited(arguments);
		if(this.getValue().length < 6){
			this.showError($L("Must be at least 6 characters long"));
			return false;
		}
		return true;
	}
})