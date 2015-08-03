enyo.kind({
	name: "blanc.Meetings",
	events: {
		onStartedMeeting: "",
		onJoinedMeeting: "",
		onErrorAlert: ""
	},
	components: [{
		kind: "blanc.Toolbar",
		components: [{
			fit: true,
			classes: "toolbar-title",
			tag: "span",
			content: $L("Meetings")
		}]
	}, {
		fit: true,
		classes: "enyo.Scroller",
		touch: true,
		components: [{
			classes: "form-blocks-container",
			components: [{
				classes: "panel panel-default",
				components: [{
					classes: "panel-heading",
					content: $L("Join a Meeting")
				}, {
					classes: "panel-body",
					components: [{
						name: "roomidGroup",
						classes: "form-group",
						style: "margin-bottom: 0px;",
						components: [{
							name: "roomid",
							placeholder: "Enter a meeting room ID",
							onfocus: "resetRoomID",
							kind: "enyo.Input",
							classes: "form-control enyo-selectable",
							onkeydown: "onEnter"
						}, {
							name: "roomidHelp",
							style: "margin-bottom: 0px; text-align: center;",
							classes: "help-block",
							content: $L("The meeting room ID must be provided by the meeting organizer.")
						}]
					}]
				}, {
					classes: "panel-footer",
					components: [{
						name: "joinButton",
						kind: "blanc.Button",
						classes: "btn btn-primary btn-block",
						content: $L("Join a Meeting"),
						ontap: "joinClicked"
					}]
				}]
			}, {
				classes: "panel panel-default",
				components: [{
					classes: "panel-heading",
					components: [{
						tag: "span",
						content: $L("Start a Meeting")
					}]
				}, {
					kind: "Table",
					classes: "table",
					components: [{
						components: [{
							content: $L("Room ID"),
							classes: "field"
						}, {
							name: "roomidValue",
							classes: "value enyo-selectable",
							content: ""
						}]
					}, {
						components: [{
							content: $L("Capacity"),
							classes: "field"
						}, {
							name: "capacityValue",
							classes: "value enyo-selectable",
							content: "unlimited"
						}]
					}]
				}, {
					classes: "panel-footer",
					components: [{
						name: "startButton",
						kind: "blanc.Button",
						classes: "btn btn-primary btn-block",
						content: $L("Start a Meeting"),
						ontap: "startClicked"
					}]
				}]
			}]
		}]
	}],
	init: function(){
		this.resetRoomID();
		var that = this;
		blanc.Session.getUserInfo(function(t){
			that.$.roomidValue.setContent(t.username)
		})
	},
	joinClicked: function(){
		var id = this.$.roomid.getValue();
		if(!id){
			this.$.roomidGroup.addClass("has-error");
			this.$.joinButton.reset();
			return false;
		}
		this.dismissKeyboard();
		var that = this;
		blanc.Session.getUserInfo(function(){

		})
	},
	resetRoomID: function(){
		this.$.roomidGroup.removeClass("has-error");
	},
	dismissKeyboard: function(){
		this.$.roomid.hasNode().blur();
	},
	onEnter: function(sender, event){
		return 13 === event.keyCode ? (this.$.joinButton.clicked(), this.joinClicked(), true) : false 
	},
	startClicked: function(){
		var that = this,
			uuid = enyo.uuid();

		blanc.Session.getConferenceManager().startMeeting(function(){
			blanc.Session.getConferenceManager().initAtmosphere();
		}, function(m){
			that.$.startButton.reset();
			that.doStartedMeeting({
				meeting: m,
				joinid: "test"
			})
		}, function(){
			that.$.startButton.reset();
			that.doErrorAlert({
				message: $L("Failed to start a meeting. Please check the network connection and try again.")
			})
		})
		// collect analytics
	}
})