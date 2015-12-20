enyo.kind({
    name: 'blanc.LargeMettingDashboard',
    kind: 'FittableRows',
    // classes: 'enyo-fit',
    style: "padding:20px 40px 20px 40px;height:100%",
    published: {
        session: null
    },
    handlers: {
        onConferenceStarted: "initializeSession"
    },
    components: [{
        classes: "tool-bar-custom",
        name: "headerClick",
        components: [{
            name: "headerIcon",
            kind: "onyx.Icon",
            src: "assets/dashboard-vertical.png",
            classes: "dashboard-header-icon",
            ontap: "clickForVertical"
        }]
    }, {
        style: "height:96%;width:100%;",
        components: [{
            classes: 'side-video-div',
            name: "participants",
            components: []
        }, {
            classes: "main-video-div",
            name: "mainContainer"
        }]
    }],
    rendered: function() {
        this.Flag = false;
        this.fitLayout();
    },
    clickForVertical: function() {
        this.Flag = !this.Flag;
        this.fitLayout();
    },
    fitLayout: function() {
        this.$.headerIcon.addRemoveClass("header-icon-vertical", this.Flag);
        this.$.participants.addRemoveClass("side-video-selected", this.Flag);
        var participants = this.$.participants.getControls();
        var participantsLen = participants.length;
        for (var i = 0; i < participantsLen; i++) {
            participants[i].addRemoveClass("sample-col-selected", this.Flag);
        }
        this.$.mainContainer.addRemoveClass("main-video-selected", this.Flag);
        this.$.mainContainer.addRemoveClass("main-video-only", (participantsLen === 0));
        this.$.participants.addRemoveClass("side-video-hide", (participantsLen === 0));
    },
    initializeSession: function() {
        var self = this;
        this.session = OT.initSession(AppConfig.apiKey, AppConfig.sessionId);
        // Subscribe to a newly created stream
        this.session.on('streamCreated', function(event) {
            var subscriberUI = self.$.participants.createComponent({
                name: event.stream.id,
                classes: "sample-col-cls",
                ontap: "participantTapped"
            }, {
                owner: self
            });
            subscriberUI.addRemoveClass("sample-col-selected", this.Flag);
            subscriberUI.render();
            var subscriber = self.session.subscribe(event.stream, subscriberUI.id, {
                insertMode: 'append',
                width: '100%',
                height: '100%',
                style: {
                    nameDisplayMode: "on"
                }
            });
            subscriberUI.openTokEvent = event;
            self.fitLayout();
        });
        this.session.on("streamDestroyed", function(event) {
            console.log("Stream stopped. Reason: " + event);
            if (self.$.mainContainer.openTokEvent && self.$.mainContainer.openTokEvent.stream.id === event.stream.id) {
                var participants = self.$.participants.getControls();
                if (participants) {
                    var len = participants.length;
                    for (var i = 0; i < len; i++) {
                        if (participants[i].isPublisher) {
                            participants[i].destroy();
                            break;
                        }
                    }
                }
                var participantUI = _.find(self.$.participants.getControls(), function(participant) {
                    return participant.isPublisher;
                });
                if (participantUI) {
                    participantUI.destroy();
                }
                self.$.mainContainer.eventNode.removeChild(self.$.mainContainer.eventNode.childNodes[0])
                blanc.Session.getUserInfo(function(user) {
                    var publisher = OT.initPublisher(self.$.mainContainer.id, {
                        name: user.firstName + " " + user.lastName,
                        insertMode: 'append',
                        width: '100%',
                        height: '100%'
                    });
                    publisher.setStyle("nameDisplayMode", "on");

                }, function(e) {
                    logError(e);
                });
                i
                self.$.mainContainer.openTokEvent = null;
            } else {
                self.$[event.stream.id].destroy();
            }
            self.fitLayout();
        });
        this.session.on('sessionDisconnected', function(event) {
            console.log('You were disconnected from the session.', event.reason);
        });

        // Connect to the session
        this.session.connect(AppConfig.token, function(error) {
            // If the connection is successful, initialize a publisher and publish to the session
            if (!error) {
                blanc.Session.getUserInfo(function(user) {
                    //user.id;
                    //user.publicId
                    //user.emailAddress
                    //user.firstName + " " + user.lastName
                    //user.admin
                    var publisher = OT.initPublisher(self.$.mainContainer.id, {
                        name: user.firstName + " " + user.lastName,
                        insertMode: 'append',
                        width: '100%',
                        height: '100%'
                    });

                    self.session.publish(publisher);
                    publisher.setStyle("nameDisplayMode", "on");
                }, function(e) {
                    logError(e);
                })
            } else {
                console.log('There was an error connecting to the session: ', error.code, error.message);
            }
        });
    },
    participantTapped: function(inSender) {
        console.log(inSender);
        var self = this;
        if (inSender.isPublisher) {
            self.$.mainContainer.eventNode.removeChild(self.$.mainContainer.eventNode.childNodes[0])

            blanc.Session.getUserInfo(function(user) {
                var publisher = OT.initPublisher(self.$.mainContainer.id, {
                    name: user.firstName + " " + user.lastName,
                    insertMode: 'append',
                    width: '100%',
                    height: '100%'
                });
                publisher.setStyle("nameDisplayMode", "on");

            }, function(e) {
                logError(e);
            });
            inSender.eventNode.removeChild(inSender.eventNode.childNodes[0]);
            inSender.setName(inSender.openTokEvent.stream.id);
            inSender.render();
            var subscriber = self.session.subscribe(self.$.mainContainer.openTokEvent.stream, inSender.id, {
                insertMode: 'append',
                width: '100%',
                height: '100%',
                style: {
                    nameDisplayMode: "on"
                }
            });
            inSender.openTokEvent = self.$.mainContainer.openTokEvent;
            self.$.mainContainer.openTokEvent = null;
            inSender.isPublisher = false;
        } else {
            self.$.mainContainer.eventNode.removeChild(self.$.mainContainer.eventNode.childNodes[0])
            var subscriber = self.session.subscribe(inSender.openTokEvent.stream, self.$.mainContainer.id, {
                insertMode: 'append',
                width: '100%',
                height: '100%',
                style: {
                    nameDisplayMode: "on"
                }
            });
            self.$.mainContainer.openTokEvent = inSender.openTokEvent;
            inSender.eventNode.removeChild(inSender.eventNode.childNodes[0])
            inSender.setName("publisher");
            inSender.render();
            blanc.Session.getUserInfo(function(user) {
                var publisher = OT.initPublisher(inSender.id, {
                    name: user.firstName + " " + user.lastName,
                    insertMode: 'append',
                    width: '100%',
                    height: '100%'
                });
                //self.session.publish(publisher);
                publisher.setStyle("nameDisplayMode", "on");
                inSender.isPublisher = true;

            }, function(e) {
                logError(e);
            });
        }
    }
});
