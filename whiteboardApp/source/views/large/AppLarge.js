enyo.kind({
	name: "blanc.AppLarge",
	classes: "appLarge",
	kind: "blanc.AppView",
	// ...........................
	// PUBLIC PROPERTIES
	orientation: null,
	menuModel: null,
	meetingModel: null,

	components: [{
		name: "app",
		classes: "app-container",
		components: [{
			kind: "blanc.MainLarge",
			name: "main"
		}, {
			kind: "blanc.LeftBottomMenu",
			name: "leftBottom",
			onMenuClicked: "menuClicked"
		}, {
			kind: "blanc.TopRightMenu",
			name: "topRight",
			onMenuClicked: "menuClicked"
		}, {
			classes: "meeting-state-container",
			name: "meeting-state",
			showing: false,
			components: [{
				classes: "meeting-state",

			}]
		}]
	}],
	create: function() {
		this.inherited(arguments);
		this.$.leftBottom.init(this.get("menuModel"));
		this.$.topRight.init(this.get("menuModel"));

	},
	menuClicked: function(sender, event) {
		switch (event.menu) {
			case "files":
			case "widgets":
			case "meetings":
			case "settings":
			case "people":
				this.$.main.toggleLeftMenu(event.menu);
				break;
			case "filemenu":
			case "pages":
				this.$.main.toggleRightMenu(event.menu);
				break;
			case "addDocument":
				this.$.main.showNewItemDialog();
				break;
			case "leftArrow":
				this.waterfallDown("onPrevClicked");
				break;
			case "rightArrow":
				this.waterfallDown("onNextClicked");
				break;
			case "undo":
				this.waterfallDown("onUndoClicked");
				break;
			case "clear":
				this.waterfallDown("onClearClicked");
				break;
			case "pen":
				this.get("menuModel").togglePen();
				this.updateMenu();
				break;
			case "eraser":
				this.get("menuModel").toggleEraser();
				this.updateMenu();
				break;
			case "palette":
				this.paletteClicked();
				break;

		}
	},
	updateMenu: function() {
		this.inherited(arguments);
		this.$.leftBottom.update();
		this.$.topRight.update();
	}
})