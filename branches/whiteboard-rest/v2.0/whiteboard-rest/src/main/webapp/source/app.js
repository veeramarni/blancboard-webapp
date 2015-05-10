/**
 * Define and instantiate your enyo.Application kind in this file. Note,
 * application rendering should be deferred until DOM is ready by wrapping it in
 * a call to enyo.ready().
 */

/* Video Conference Plugin using ENYO */
VideoConf = (function() {
	var vcSession = {};
	vcSession.sessionId = null;
	vcSession.apiKey = null;
	vcSession.token = null;
	vcSession.isModerator = false;
	_isVideoEnabled = false;
	vcSession.videoToggleState = true;
	vcSession.isInfoPull = false;
	_isWbSessionRunning = false;
	_isVideoConfRunning = false;
	function _videoToggle(value, vcsessionId) {
		var isMod = whiteboardDesigner && whiteboardDesigner.isSessionOwner();
		if (!isMod) {
			// hide the video toggle button for joinee
			if (value) {
				vcSession.videoToggleState = true;
			}

		}
		// else keep the state of the video option component
		if (vcsessionId !== null && vcsessionId !== undefined) {
			vcSession.sessionId = vcsessionId;
		}
		// if whiteboard is online and videotoggle is on
		if (_isWbSessionRunning && vcSession.videoToggleState
				&& !_isVideoConfRunning) {
			// initial when no sessionId is created
			if (vcSession.sessionId == null && !vcSession.isInfoPull) {
				if (isMod) {
					wbRest
							.createVideoConf(
									"",
									wbRest.getWebflowAppender(),
									function(e, err) {
										if (e !== "ERROR") {
											vcSession.sessionId = e.sessionId;
											vcSession.apiKey = e.apiKey;
											vcSession.token = e.token;
											_isVideoConfRunning = true;
											enyo.Signals.send("onVideoChanged",
													{
														videoState : value
													})
										} else {
											var error = {};
											error.summary = "Invalid Session ";
											error.detail = ErrorBox
													.applicationMessage(err.responseText);
											ErrorBox
													.getInstance()
													.notify(
															Configuration
																	.getErrorTypes("error"),
															error);
										}
									});

				} else {
					// not allowed to perform action if it is not moderator
					_isVideoConfRunning = false;
				}

			}
			// if sessionId exist then just pull the apikey and token
			else if (vcSession.sessionId && !vcSession.isInfoPull) {
				wbRest.getVideoConf(vcSession.sessionId, wbRest
						.getWebflowAppender(), function(e, err) {
					if (e !== "ERROR") {
						vcSession.apiKey = e.apiKey;
						vcSession.token = e.token;
						_isVideoConfRunning = true;
						enyo.Signals.send("onVideoChanged", {
							videoState : value
						})
					} else {
						var error = {};
						error.summary = "Invalid Session ";
						error.detail = ErrorBox
								.applicationMessage(err.responseText);
						ErrorBox.getInstance().notify(
								Configuration.getErrorTypes("error"), error);
					}
				});
			} else if (vcSession.sessionId != null && vcSession.apiKey != null
					&& vcSession.token != null) {
				_isVideoConfRunning = true;
				enyo.Signals.send("onVideoChanged", {
					videoState : value
				})
			}

			if (isMod) {
				whiteboardDesigner.videoConfStatus(value, vcSession.sessionId);
			}
		} else if (_isWbSessionRunning && !value && _isVideoConfRunning) {
			enyo.Signals.send("onVideoChanged", {
				videoState : value
			})
			_isVideoConfRunning = false;
			if (isMod) {
				whiteboardDesigner.videoConfStatus(value, vcSession.sessionId);
				if(!value){
					wbRest.pubsub({"broadcastStatus":"vcinactive"},wbRest.getWebflowAppender(), 	function(e, err) {
										if (e !== "ERROR") {
											
										} else {
											var error = {};
											error.summary = "Cannot change the status ";
											error.detail = ErrorBox
													.applicationMessage(err.responseText);
											ErrorBox
													.getInstance()
													.notify(
															Configuration
																	.getErrorTypes("error"),
															error);
										}
									})
				}
			}
		}

	}
	enyo.kind({
		name : "videoOption",
		kind : "vcSession.videoOption"
	});
	enyo.kind({
		name : "Media",
		kind : "FittableRows",
		handlers : {
			onVideoChanged : "videoChanged"
		},
		classes : "content",
		components : [ {
			kind : "Panels",
			classes : "content-panel",
			name : "panels",
			draggable : false,
			components : [ {
				content : "Something"
			} ]
		}, {
			kind : "Signals",
			onVideoChanged : "videoChanged"
		}, {
			name : "videoWrapper",
			layoutKind : "FittableColumnsLayout",
			style : "padding:5px 10px;"
		} ],
		create : function() {
			this.inherited(arguments);
		},
		videoChanged : function(a, b) {
			if (b.videoState) {
				this.videoOn();
			} else
				this.videoOff();
		},
		videoOff : function() {
			if(this.$.videoPlug){
				this.$.videoPlug.destroy();
				this.$.videoWrapper.applyStyle("height", 0 + "px");
				this.$.videoWrapper.applyStyle("weight", 0 + "px");
			}

			return (true);
		},
		videoOn : function() {
			this.$.videoWrapper.applyStyle("height", 250 + "px");
			this.$.videoWrapper.applyStyle("weight", 250 + "px");
			this.createComponent({
				name : "videoPlug",
				kind : "vcSession.OTWrapper",
				container : this.$.videoWrapper
			});
			this.render();
			this.$.videoPlug.applyStyle("display", "block");
			return (true);
		}
	})

	enyo.kind({
		name : "vcSession.OTWrapper",
		showing : false,
		session : null, // OT session
		publisher : null,
		style : "width:100%;height:100%;",
		create : function() {
			this.inherited(arguments);
			// Create our session right away.
			this.session = OT
					.initSession(vcSession.apiKey, vcSession.sessionId);
			this.session.on("streamCreated", this
					.bindSafely(this.streamCreated));
			this.startVideoConf();
		},
		rendered : function() {
			this.inherited(arguments);
		},
		startVideoConf : function() {
			if (this.session != null) {
				this.session.connect(vcSession.token, this
						.bindSafely(this.connected));
			}
		},
		streamCreated : function(event) {
			this.createComponent({kind: "vcSession.SubscriberWrapper", name : "test1", stream: event.stream, session: this.session});
			this.renderInto(document.getElementById('subscribeButton'));
	//		this.session.subscribe(event.stream, subscribeButton);
		},
		connected : function(error) {
			var pubOptions = {
				publishAudio : true,
				publishVideo : true
			};
			this.publisher = OT.initPublisher(this.hasNode().id, pubOptions);
			this.session.publish(this.publisher);
		},
		destroy : function() {
			this.publisher && this.publisher.destroy();
			this.session.disconnect();
			this.inherited(arguments);
		}
	});
	enyo.kind({
		name : "vcSession.SubscriberWrapper",
		showing: true,
		stream: null,
		session: null,
		create: function(){
			this.inherited(arguments);
			if(this.stream != null && this.session != null){
				this.subscribe();
			}
		},
		subscribe: function(){
			this.session.subscribe(this.stream, "subscribeButton");
		}
	});
	

	enyo.kind({
		name : "vcSession.videoOption",
		showing : true,
		layoutKind : "FittableColumnsLayout",
		style : "padding:5px 10px;",
		published : {
			state : false
		},
		events : {
			onVideoChanged : ""
		},
		components : [ {
			style : "line-height:30px;height:30px;",
			content : "Video conferencing"
		}, {
			style : "text-align:right;",
			fit : !0,
			components : [ {
				name : "videoEnabled",
				kind : "onyx.ToggleButton",
				value : vcSession.videoToggleState,
				onContent : "ON",
				offContent : "OFF",
				onChange : "buttonToggle",

			} ]

		} ],
		create : function() {
			this.inherited(arguments);
			// if (this.$.videoEnabled.value) {
			// this.videoChanged(this.$.videoEnabled.value);
			// }
		},
		buttonToggle : function(inSender, inEvent) {
			vcSession.videoToggleState = inEvent.value;
			this.videoChanged(inEvent.value);
		},
		videoChanged : function(value) {
			_videoToggle(value);
		}

	});

	new Media().renderInto(document.getElementById('videoWrapper'));
	new videoOption().renderInto(document.getElementById('videoOpt'));

	return {
		isWbSessionRunning : function(state) {
			_isWbSessionRunning = state;
		},
		videoToggle : function(state, vcsessionId) {
			_videoToggle(state, vcsessionId);
		},
		/*
		 * State of whiteboard 
		 */
		isVideoEnabled : function(state){
			if(state == "vcactive")
				return true;
			else return false;
		}
	}
})();