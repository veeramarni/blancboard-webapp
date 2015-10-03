enyo.kind({
	name: "blanc.FileMenu",
	handlers: {
		onSelect: "itemSelected"
	},
	events: {

	},
	components: [{
		name: "titlebar",
		kind: "blanc.Toolbar",
		components: [{
			fit: true,
			classes: "toolbar-title",
			tag: "span",
			content: $L("Actions")
		}]
	}, {
		fit: true,
		kind: "enyo.Scroller",
		style: "width:100%;height:100%;",
		touch: true,
		components: [{
			name: "repeater",
			kind: "enyo.FlyweightRepeater",
			count: 0,
			onSetupItem: "setupItem",
			components: [{
				name: "item",
				classes: "file-menu-time"
			}]
		}]
	}]
})