enyo.kind({
	name: "blanc.TooltipDecorator",
	classes: "mm-popup-decorator",
	style: "outline: 0;",
	handlers: {
		onenter: "enter",
		onleave: "leave"
	},
	enter: function(){
		this.requestShowTooltip();
	},
	leave: function(){
		this.requestHideTooltip();
	},
	requestShowTooltip: function(){
		this.waterfallDown("onRequestShowTooltip");
	},
	requestHideTooltip: function(){
		this.waterfallDown("onRequestHideTooltip")
	}
})