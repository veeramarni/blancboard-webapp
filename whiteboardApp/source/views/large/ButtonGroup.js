enyo.kind({
	name: "blanc.ButtonGroup",
	tag: "ul",
	components: [{}],
	events: {
		onMenuClicked: ""
	},
	// ...........................
	// PUBLIC PROPERTIES
	buttons: [],
	menuModel: "",
	// ...........................
	// PROTECTED PROPERTIES
	create: function() {
		this.inherited(arguments);
		for (e = 0; e < this.buttons.length; e++) {
			var buttonName = this.buttons[e];
			var button = this.menuModel.buttons[buttonName];
			button.ontap = "buttonClicked";
			var comp = this.createComponent(button, {
				owner: this
			});
			comp.addRemoveClass("menu-button-enabled", comp.state === ButtonState.ENABLED);
			comp.addRemoveClass("menu-button-active", comp.state == ButtonState.ACTIVE);
		}
	},
	buttonClicked: function(e) {
		var button = this.menuModel.buttons[e.name];
		if (button.state != ButtonState.DISABLED) {
			this.doMenuClicked({
				menu: e.name
			})
		}
	},

	// ...........................
	// PROTECTED METHODS
	update: function() {
		for (var e = this.getComponents(), t = 0; t < e.length; t++) {
			var comp = e[t];
			var bt = this.menuModel.buttons[comp.name];
			if (bt) {
				comp.addRemoveClass("menu-button-enabled", bt.state === ButtonState.ENABLED);
				comp.addRemoveClass("menu-button-active", bt.state == ButtonState.ACTIVE);
			}

		}
	}
})