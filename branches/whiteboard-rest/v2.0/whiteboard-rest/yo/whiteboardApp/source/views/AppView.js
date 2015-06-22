enyo.kind({
	name: "blanc.AppView",
	classes: "app-view",
	events: {
		onErrorAlert: "",
		onFileCreated: "fileCreated",


	},
	handlers: {
		onPageChanged: "pageChanged"
	},
	components: [{}],
	// ...........................
	// PUBLIC PROPERTIES
	menuModel: null,
	meetingModel: null,
	orientation: null,


	// ...........................
	// PROTECTED METHODS
	rendered: function(){
		this.inherited(arguments);
	},
	fileCreated: function(sender, event){
		this.waterfallDown("onFileCreated", event);
	},
	pageChanged: function(sender, event){
		this.menuModel.pageChanged(sender, event);
		this.updateMenu();
		return true;
	},
	// ...........................
	// Overwritten METHODS
	updateMenu: function(){

	}
})