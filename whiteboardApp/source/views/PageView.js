enyo.kind({
	name: "blanc.PageView",
	kind: "blanc.Page",

	// ...........................
	// PUBLIC PROPERTIES
	visible: false,
	pageNo: null,
	docId: null,

	handlers: {
		onConferenceStarted: "conferenceStarted",
	},
	didAppear: function() {
		this.$.board && this.$.board.didAppear();
	},
	didDisappear: function() {
		this.$.board && this.$.board.didDisappear();
	},
	conferenceStarted: function(sender, event) {
		event.conferenceSession.isPresenter() && (this.$.board ? this.$.board.saveElements(enyo.bind(this, "raisePageRendered")) : this.raisePageRendered());
	}
})