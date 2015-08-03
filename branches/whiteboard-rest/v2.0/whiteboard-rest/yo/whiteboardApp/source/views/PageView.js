enyo.kind({
	name: "blanc.PageView",
	kind: "blanc.Page",

	// ...........................
	// PUBLIC PROPERTIES
	visible: false,
	pageno: null,
	docid: null,

	handlers: {
		onMeetingStarted: "meetingStarted"
	},
	didAppear: function() {
		this.$.board && this.$.board.didAppear();
	},
	didDisappear: function() {
		this.$.board && this.$.board.didDisappear();
	},
	meetingStarted: function(sender, event) {
		event.meetingSession.isPresenter() && (this.$.board ? this.$.board.saveElements(enyo.bind(this, "raisePageRendered")) : this.raisePageRendered());
	}
})