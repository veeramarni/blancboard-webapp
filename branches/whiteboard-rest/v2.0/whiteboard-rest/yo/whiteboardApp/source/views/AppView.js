enyo.kind({
	name: "blanc.AppView",
	classes: "app-view",
	events: {
		onErrorAlert: ""
	},
	handlers: {

	},
	published: {
		menuModel: null,
		meetingModel: null,
		orientation: null
	},
	components: [{}],
	rendered: function(){
		this.inherited(arguments);
	}
})