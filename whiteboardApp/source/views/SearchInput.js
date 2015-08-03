enyo.kind({
	name: "blanc.SearchInput",
	components: [{
		style: "width: 100%;",
		classes: "input-group",
		components: [{
			name: "searchInput",
			classes: "form-control enyo-searchable",
			kind: "onyx.Input",
			placeholder: 'Search...',
		}, {
			name: "searchicon",
			tag: "span",
			classes: "input-group-addon",
			components: [{
				classes: "glyphicon glyphicon-search",
				tag: "i"
			}]
		}]
	}],
	reset: function() {
		this.$.searchInput.setContent("");
	}
})