//depreciated
enyo.kind({
	name: "blanc.Pages",
	kind: "FittableRows",
	fit: true,
	components: [{
		name: "titlebar",
		kind: "blanc.Toolbar",
		components: [{
			fit: true,
			classes: "toolbar-title",
			tag: "span",
			content: $L("Pages")
		}]
	}, {
		name: "pagesList",
		fit: true,
		kind: "blanc.PagesList"
	}],
	init: function(){
		this.$.pagesList.init();

	}
})

