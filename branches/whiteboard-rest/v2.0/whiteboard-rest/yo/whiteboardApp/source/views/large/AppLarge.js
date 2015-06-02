enyo.kind({
	name: "blanc.AppLarge",
	classes: "appLarge",
	kind: "blanc.AppView",
	published: {
		orientation: null,
		menuModel: null,
		meetingModel: null
	},
	components: [{
		name: "app",
		classes   : "app-container",
		components: [{
			kind: "blanc.MainLarge",
			name: "main"
		},{
			kind: "blanc.LeftBottomMenu",
			name: "leftBottom",
			onMenuClicked: "menuClicked"
		},{
			kind: "blanc.TopRightMenu",
			name: "topRight",
			onMenuClicked: "menuClicked"
		},{
			classes: "meeting-state-container",
			name: "meeting-state",
			showing: false,
			components: [{
				classes: "meeting-state",

			}]
		}]
	}],
	create: function(){
		this.inherited(arguments);
		this.$.leftBottom.init(this.getMenuModel());
		this.$.topRight.init(this.getMenuModel());

	},
	menuClicked: function(e,t){
		switch (t.menu) {
			case "files":
			case "widgets":
			case "meetings":
			case "settings":
			case "people":
				this.$.main.toggleLeftMenu(t.menu);
				break;
			case "filemenu":
			case "pages":
				this.$.main.toggleRightMenu(t.menu);
				break;
		}
	}
})