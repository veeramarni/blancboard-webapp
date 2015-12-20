enyo.kind({
    name: "blanc.Meetings",
    events: {
        onConferenceStarted: "",
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
                        name: "roomnameGroup",
                        classes: "form-group",
                        style: "margin-bottom: 0px;",
                        components: [{
                            name: "roomname",
                            placeholder: "Enter a conference room ID",
                            onfocus: "resetRoomName",
                            kind: "enyo.Input",
                            classes: "form-control enyo-selectable",
                            onkeydown: "onEnter"
                        }, {
                            name: "roomnameHelp",
                            style: "margin-bottom: 0px; text-align: center;",
                            classes: "help-block",
                            content: $L("The conference room ID must be provided by the conference organizer.")
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
                            name: "roomnameValue",
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
                    }, {
                        name: "audioBlock",
                        showing: true,
                        components: [{
                            attributes: {
                                colspan: 2
                            },
                            style: "padding-left: 40px;",
                            components: [{
                                tag: "label",
                                components: [{
                                    name: "audio",
                                    style: "margin-left: -10px;",
                                    kind: "enyo.Checkbox",
                                    checked: false
                                }, {
                                    tag: "span",
                                    style: "margin-left: 10px;",
                                    content: $L("with audio conference")
                                }]
                            }]
                        }]
                    }, {
                        name: "videoBlock",
                        showing: true,
                        components: [{
                            attributes: {
                                colspan: 2
                            },
                            style: "padding-left: 40px;",
                            components: [{
                                tag: "label",
                                components: [{
                                    name: "video",
                                    style: "margin-left: -10px;",
                                    kind: "enyo.Checkbox",
                                    checked: false
                                }, {
                                    tag: "span",
                                    style: "margin-left: 10px;",
                                    content: $L("with video conference")
                                }]
                            }]
                        }]
                    }, {
                        name: "allShareBlock",
                        showing: true,
                        components: [{
                            attributes: {
                                colspan: 2
                            },
                            style: "padding-left: 40px;",
                            components: [{
                                tag: "label",
                                components: [{
                                    name: "allShare",
                                    style: "margin-left: -10px;",
                                    kind: "enyo.Checkbox",
                                    checked: false
                                }, {
                                    tag: "span",
                                    style: "margin-left: 10px;",
                                    content: $L("all can share")
                                }]
                            }]
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
    init: function() {
        this.resetRoomName();
        var that = this;
        blanc.Session.getUserInfo(function(user) {
            that.$.roomnameValue.setContent(user.publicId)
        })
    },
    joinClicked: function() {
        var id = this.$.roomname.getValue();
        if (!id) {
            this.$.roomnameGroup.addClass("has-error");
            this.$.joinButton.reset();
            return false;
        }
        this.dismissKeyboard();
        var that = this;
        blanc.Session.getUserInfo(function() {

        })
    },
    resetRoomName: function() {
        this.$.roomnameGroup.removeClass("has-error");
    },
    dismissKeyboard: function() {
        this.$.roomname.hasNode().blur();
    },
    onEnter: function(sender, event) {
        return 13 === event.keyCode ? (this.$.joinButton.clicked(), this.joinClicked(), true) : false
    },
    startClicked: function() {
        var that = this,
            uuid = enyo.uuid();
        /*blanc.Session.getConferenceManager().startConference({
        			allCanShare: this.$.allShare.getChecked(),
        			audioEnabled: this.$.audio.getChecked(),
        			videoEnabled: this.$.video.getChecked(),
        			conferenceType: bjse.api.conference.ConferenceType.INSTANT,
        			organizerPassword: "",
        			participantPassword: ""
        		}, function(session) {
        			that.$.startButton.reset();
        			that.doConferenceStarted({
        				conferenceSession: session,
        				joinId: "test"
        			})
        		},
        		function() {
        			that.$.startButton.reset();
        			that.doErrorAlert({
        				message: $L("Failed to start a conference. Please check the network connection and try again.")
        			})
        		})*/
        // collect analytics
        that.$.startButton.reset();
        that.doConferenceStarted();
    }
})
