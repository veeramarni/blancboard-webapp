enyo.kind({
	name: "blanc.Menu",
	kind: "enyo.Control",
	handlers: {
		onWindowRotated: "windowRotated",
		onConferenceStarted: "refresh",
		onConferenceEnded: "refresh",
		onCanShare: "refresh"
	},
	events: {
		onMenuClicked: ""
	},
	published: {
		menuModel: null,
		orientation: null
	},
	components: [{}],
	init: function(menuModel,orientation){
		this.setMenuModel = menuModel;
		this.setOrientation = orientation;
	},
	windowRotated: function(menuModel,orientation){
		this.destroyComponents();
		this.init(menuModel,orientation);
	},
	refresh: function(){
		this.init(this.getMenuModel(),this.getOrientation());
	}
})