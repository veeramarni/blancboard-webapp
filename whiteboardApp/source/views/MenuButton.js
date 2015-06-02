enyo.kind({
	name: "blanc.MenuButton",
	tag: "li",
	components: [{
		kind: "blanc.TooltipDecorator",
		classes: "menu-button-decorator",
		components: [{
			classes: "menu-button"
		}, {
			name: "tooltip",
			kind: "blanc.Tooltip",
			content: ""
		}]
	}],
	create: function(){
		this.inherited(arguments);
		this.$.tooltip.setContent(this.tooltip);
	}
})