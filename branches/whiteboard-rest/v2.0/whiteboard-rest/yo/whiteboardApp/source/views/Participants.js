enyo.kind({
	name: "blanc.Participants",
	handlers: {
		onParticipantJoined: "populateList",
		onParticipantLeft: "poplulateList",
		onParticipantUpdated: "refreshList",
		onConferenceEnded: "clear"
	},
	components: [{
		kind: "ViewStack",
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
			}, {
				fit: true,
				name: "list",
				kind: "List",
				multiSelect: true,
				classes: "mm-att-list",
				onSetupItem: "setupItem",
				components: [{
					name: "item",
					kind: "blanc.ParticipantItem",
					ontap: "itemTap"
				}]
			}]
		}]
	}],
	init: function() {
		this.populateList();
		this.$.panels.popToRootView();
		this.updateLockButton();
	},
	create: function() {
		this.inherited(arguments);
		//this.init();
	},
	updateLockButton: function(locked) {
		locked ? this.$.lockButton.setContent($L("Unlock")) : this.$.lockButton.setContent($L("Lock"))
	},
	populateList: function() {
		this.data = [];
		for(var p = blanc.Session.getConferenceSession().participants, i=0;  i < p.length; i++){
			var pp = p[i];
			pp.state == bjse.api.conference.ParticipantState.ONLINE && this.data.push(pp)
		}
		this.$.list.setCount(this.data.length);
		this.$.list.reset();
	},
	refreshList: function() {
		this.$.list.refresh();
	},
	clear: function() {
		this.data = [];
		this.$.list.setCount(this.data.length);
		this.$.list.reset();
	},
	setupItem: function(sender, event){
		var ind = event.index;
		if(!(ind >= this.data.length || this.data[ind] == null)){
			var participant = this.data[ind];
			if(participant.deviceId === blanc.Session.getDeviceId()){
				this.$.item.setName(participant.displayName + " (me)");
				this.$.item.setCanShare(false);
				this.$.item.addRemoveClass("mm-att-item-guest", false);
			} else {
				this.$.item.setName(participant.displayName);
				this.$.item.setCanShare(participant.canShare);
				this.$.item.addRemoveClass("mm-att-item-guest", true);
			}
			this.$.item.addRemoveClass("mm-att-item-audio-unmuted", participant.avState === bjse.api.conference.UNMUTED);
			this.$.item.addRemoveClass("mm-att-item-audio-muted", participant.avState === bjse.api.conference.MUTED);
			this.$.item.setSelected(sender.isSelected(ind));
			this.$.item.addRemoveClass("mm-first-att-item", 0 === ind)
		}
	},
	itemTap: function(sender, event) {
		var ind = this.data[event.index];
		if(ind.deviceId != blanc.Session.getDeviceId()){
			this.$.panels.pushView({
				kind: "blanc.ParticipantView",
				pp: ind,
				onBackClicked: "navBack"
			}, {
				owner: this
			})
			return true
		}
	},
	navBack: function(){
		this.$.list.refresh();
		this.$.panels.popView()
	},
	lockClicked: function(){
		var that = this,
			conference = blanc.Session.getConferenceSession().conference;
		conference.locked = !conference.locked;
		blanc.Session.getConferenceManager().updateConference(conference, function(conf){
			that.$.lockButton.reset();
			that.updateLockButton(conf.locked);
		}, function(err){
			that.$.lockButton.reset();
			that.doErrorAlert(err)
		})
	}

});

enyo.kind({
	name: "blanc.ParticipantItem",
	classes: "mm-att-item",
	components: [{
		components: [{
			classess: "audio-state"
		}, {
			name: "displayName",
			content: ""
		}]
	}],
	setName: function(name) {
		this.$.displayName.setContent(name)
	},
	setCanShare: function(canShare) {
		this.addRemoveClass("mm-att-item-canshare", canShare)
	},
	setSelected: function() {}
});

enyo.kind({
	name: "blanc.ParticipantView",
	kind: "FittableRows",
	classes: "enyo-fit enyo-unselectable",
	events: {
		onBackClicked: "",
		onErrorAlert: ""
	},
	handlers: {
		onParticipantUpdated: "participantUpdated"
	},
	// variables
	pp: null,

	components: [{
		kind: "blanc.Toolbar",
		components: [{
			name: "displayName",
			fit: true,
			classes: "toolbar-title",
			tag: "span",
			content: ""
		}, {
			components: [{
				name: "backButton",
				kind: "enyo.Button",
				classes: "btn btn-primary",
				content: $L("Back"),
				ontap: "doBackClicked"
			}]
		}]
	}, {
		fit: true,
		components: [{
			kind: "blanc.NameValueList",
			components: [{
				kind: "blanc.NameValue",
				name: "presenter",
				label: $L("Presenter")
			}, {
				kind: "blanc.NameValue",
				name: "email",
				label: $L("Email")
			}, {
				kind: "blanc.NameValue",
				name: "audio",
				label: $L("Audio")
			}]
		}, {
			name: "buttons",
			classes: "mm-att-buttons",
			components: [{
				name: "muteButton",
				kind: "blanc.Button",
				classes: "btn btn-primary btn-block",
				ontap: "muteButtonClicked",
				content: $L("Mute Audio")
			}, {
				name: "presenterButton",
				kind: "blanc.Button",
				classes: "btn btn-primary btn-block",
				ontap: "presenterButtonClicked",
				content: $L("Request as Presenter")
			}, {
				name: "removeButton",
				kind: "blanc.Button",
				classes: "btn btn-danger btn-block",
				ontap: "removeButtonClicked",
				content: $L("Remove from Meeting")
			}]
		}]
	}],
	create: function() {
		this.inherited(arguments);
		this.init();
	},
	init: function() {
		this.$.muteButton.reset();
		this.$.removeButton.reset();
		this.$.presenterButton.reset();
		this.$.displayName.setContent(this.pp.displayName);
		this.$.email.set("value", this.pp.email);
		this.$.presenter.set("value", this.pp.canShare ? $L("YES") : $L("NO"));
		if (blanc.Session.getConferenceSession().conference.audioEnabled) {
			switch (this.pp.avState) {
				case bjse.api.conference.AVState.OFFLINE:
					this.$.muteButton.hide();
					break;
				case bjse.api.conference.AVState.UNMUTED:
					this.$.muteButton.show();
					this.$.muteButton.setContent($L("Mute Audio"));
					break;
				case bjse.api.conference.AVState.MUTED:
					this.$.muteButton.show();
					this.$.muteButton.setContent($L("Unmute Audio"));
					break;
			}
			this.$.audio.set("value", this.pp.avState)
		} else {
			this.$.audio.hide();
			this.$.muteButton.hide();
		}

	},
	presenterButtonClicked: function(){
		var that = this;
		this.pp.canShare = !this.pp.canShare;
		blanc.Session.getConferenceSession().updateParticipant(this.pp, function(){
			that.doBackClicked()
		}, function(err){
			that.$.presenterButton.reset();
			that.doErrorAlert(err);
		})
	},
	removeButtonClicked: function(){
		var comp = this.createComponent({
			kind: "blanc.ConfirmDialog",
			onYes: "removeParticipant",
			onNo: "removeCanceled",
			message: enyo.macroize($L("Are you sure you want to remove {$name} from this meeting?"), {
				name: this.pp.displayName
			})
		}, {
			owner: this
		});
		that.show();
	},
	removeCanceled: function(){
		this.$.removeButton.reset();
	},
	removeParticipant: function(){
		var that = this;
		blanc.Session.getConferenceSession().removeParticipant(this.pp.id, function(){
			that.doBackClicked();
		}, function(err){
			that.$.removeButton.reset();
			that.doErrorAlert(err);
		})
	},
	muteButtonClicked: function(){
		var that = this;
		this.pp.avState = this.pp.avState === bjse.api.conference.AVState.UNMUTED ? bjse.api.conference.AVState.MUTED : bjse.api.conference.AVState.UNMUTED;
		blanc.Session.getConferenceSession().updateParticipant(this.pp, function(){
			that.doBackClicked();
		}, function(){
			that.$.muteButton.reset();
		})
	},
	participantUpdated: function(sender, event){
		event.participant.id === this.pp.id && this.init();
	}
})