enyo.kind({
	name: "blanc.Attendees",
	handlers: {
		onAttendeeJoined: "populateList",
		onAttendeeLeft: "poplulateList",
		onAttendeeUpdated: "refreshList",
		onMeetingEnded: "clear"
	},
	components: [{
		kind: "blanc.ViewStack",
		name: "panels",
		classes: "enyo-fit",
		components: [{
			kind: "FittableRows",
			classes: "enyo-fit enyo-unselectable",
			components: [{
				name: "titlebar",
				kind: "blanc.Toolbar",
				components: [{
					fit: true,
					classes: "toolbar-title",
					tag: "span",
					content: $L("People")
				}, {
					components: [{
						name: "lockButton",
						kind: "blanc.Button",
						classes: $L("Lock"),
						ontap: "lockClicked"
					}]
				}]
			},{
				fit: true,
				name: "list",
				kind: "List",
				multiSelect: true,
				classes: "mm-att-list",
				onSetupItem: "setupItem",
				components: [{
					name: "item",
					kind: "blanc.AttendeeItem",
					ontap: "itemTap"
				}]
			}]
		}]
	}],
	init: function(){
		this.populateList();
		this.$.panels.popToRootView();
		this.updateLockButton();
	},
	create: function(){
		this.inherited(arguments);
		this.init();
	},
	updateLockButton: function(e){

	},
	populateList: function(){
		this.data = [];

	},
	refreshList: function(){
		this.$.list.refresh();
	},
	clear: function(){
		this.data = [];
		this.$.list.setCount(this.data.length);
		this.$.list.reset();
	},
	itemTap: function(e, t){
		var n = this.data[t.index];

	},
	attendeeUpdated: function(e, t){
		if(t.attendee.id === this.att.id){
			this.init();
		}
	},
	removeAttendee: function(){
		var e = this;

	}
})