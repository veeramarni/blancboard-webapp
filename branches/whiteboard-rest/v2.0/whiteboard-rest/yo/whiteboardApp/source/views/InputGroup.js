enyo.kind({
	name: "blanc.InputGroup",
	published: {
		label: "",
		placeholder: "",
		type: "",
		error: "",
		help: "",
		required: true
	},
	components: [{
		name: "group",
		classes: "form-group",
		components: [{
			name: "label",
			tag: "label",
			content: ""
		},{
			name: "field",
			kind: "enyo.Input",
			classes: "form-control enyo-selectable",
			onfocus: "reset"
		},{
			name: "help",
			tag: "p",
			showing: false,
			classes: "help-block",
			content: ""
		}]
	}],
	create: function(){
		this.inherited(arguments);
		this.$.label.setContent(this.getLabel());
		if(this.getType()){
			this.$.field.setType(this.mapFieldType(this.getType()));
		}
		if(this.getPlaceholder()){
			this.$.field.setPlaceholder(this.getPlaceholder());
		}
		if(this.getHelp()){
			this.$.help.setShowing(true);
			this.$.help.setContent(this.getHelp());
		}
	},
	validate: function(){
		return this.getRequired() && !this.getValue()
    		? (this.showError("Required"), false) 
    		: this.getValue() 
        		? "email" != this.getType() || this.isValidEmail() 
            		? "email_username" != this.getType() || this.isValidEmail() || this.isValidUsername() 
                		? "username" != this.getType() || this.isValidUsername() 
                    		? "roomname" != this.getType() || this.isValidUsername() 
                        		? "displayName" != this.getType() || this.isValidDisplayName()
                            		? "phone" != this.getType() || this.isValidPhone() 
                                		? true 
                                		: (this.showError($L("Enter a valid phone number")), false) 
                            		: (this.showError("Enter both first and last names"), false)  
                        		: (this.showError("Enter a valid meeting room ID"), false) 
                    		: (this.showError("Enter a valid username"), false) 
                		: (this.showError("Enter a valid email address or username"), false) 
            		: (this.showError("Enter a valid email address"), false) 
        		: true
	},
	getValue: function(){
		return enyo.trim(this.$.field.getValue());
	},
	setValue: function(value){
		this.$.field.setValue(value);
	},
	isValidEmail: function(){
		return blanc.util.isValidEmail(this.getValue());
	},
	isValidUsername: function(){
		return blanc.util.isValidUsername(this.getValue());
	},
	isValidDisplayName: function(){
		var e = this.getValue(),
			t = blanc.util.splitName(e);
		return t.length >= 2;
	},
	isValidPhone: function(){
		return blanc.util.isValidPhone(this.getValue());
	},
	reset: function(){
		this.$.group.addRemoveClass("has-success", false);
		this.$.group.addRemoveClass("has-error", false);
		this.$.group.addRemoveClass("has-warning", false);
		if(this.getHelp()){
			this.$.help.setShowing(true);
			this.$.help.setContent(this.getHelp());
		} else 
		{
			this.$.help.setShowing(false);
		}
	},
	showError: function(error){
		this.$.group.addRemoveClass("has-error", true);
		this.$.help.setContent(error);
		this.$.help.setShowing(true);
	},
	mapFieldType: function(e){
		var t = e;
		switch(e){
			case "email_username":
				t = "email";
				break;
			case "username":
			case "displayName":
				t = "text"
		}
		return t;
	}

})