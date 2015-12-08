var bjse = bjse || {};
bjse.api = bjse.api || {};

bjse.api.conference = {};
var ConferenceType = {
	ANY: "ANY",
	SCHEDULED: "SCHEDULED",
	INSTANT: "INSTANT"
};
bjse.api.conference.ConferenceType = ConferenceType;
var ParticipantState = {
	ANY: "ANY",
	ONLINE: "ONLINE",
	OFFLINE: "OFFLINE",
	REMOVED: "REMOVED"
};
bjse.api.conference.ParticipantState = ParticipantState;
var AVState = {
	ANY: "ANY",
	OFFLINE: "OFFLINE",
	MUTED: "MUTED",
	UNMUTED: "UNMUTED"
};
bjse.api.conference.AVState = AVState;
var Action = {
	GET: "get",
	JOIN: "join",
	REJOIN: "reJoin",
	LEAVE: "leave",
	PAGESEND: "pageSend",
	PAGECHANGE: "pageChange",
	PAGECREATE: "pageCreate",
	PAGEREMOVE: "pageRemove",
	CREATE: "create",
	UPDATE: "update",
	REMOVE: "remove",
	REPLACE: "replace",
	CLONE: "clone",
	MOVE: "move",
	BRINGTOFRONT: "toFront",
	BRINGTOBACK: "toBack",
	CLEAR: "clear",
	RESIZE: "resize",
	SHARE: "share",
	CAMSTATUS: "camStatus",
	SESSIONRECORD: "sessionRecord",
	VIDEOCONFSTATUS: "videoConfStatus",
	STARTED: "started",
	STOPPED: "stopped",
	SVGELEMENT: "svgElement",
	DOCUMENT: "document",
	RECORDSTATE: "recordState",
	RELOAD: "reload",
	RELOADALL: "reloadall",
	RELOADPAGE: "reloadPage",
	SNAPSHOT: "snapshot",
	EXIT: "exit",
	PRIVDOC: "privDoc",
	STARTMEETING: "startConference",
	CREATEWHITEBOARD: "createWhiteboard",
	JOINWHITEBOARD: "joinWhiteboard",
	DESTROY: "destroy",
	RELOADCHAT: "reloadChat",
	NOTIFYMESSAGE: "notifyMessage",
	REQGENPAGES: "reqGenPages"
};
bjse.api.conference.Action = Action;
var ActionType = {
	ANY: "any",
	BOARD: "board",
	CHAT: "chat",
	SCREENSHARE: "screenshare",
	AVCONF: "avconf",
	DOCUMENTSYNC: "documentsync",
	PARTICIPANTS: "participants",
	CONFPROTOCOL: "confprotocol"
};
var HeaderAction = {
	CONFERENCE: "Conference",
	BOARDACTION: "boardaction"
};
bjse.api.conference.Participant = function(participant) {
	this.id = "";
	this.userId = "";
	this.conferenceId = "";
	this.deviceId = "";
	this.avatarUrl = "";
	this.displayName = "";
	this.email = "";
	this.state = ParticipantState.ANY;
	this.about = "";
	this.timeUpdated = null;
	this.canShare = false;
	this.avState = AVState.OFFLINE;
	this.avPin = "";
	bjse.util.mixin(this, participant);
};
bjse.api.conference.Conference = function(conference) {
	this.id = "";
	this.ownerId = "";
	this.presenterId = "";
	this.organizerId = "";
	this.attId = "";
	this.state = LifecycleState.ANY;
	this.serverPubSubUrl = "";
	this.timeCreate = null;
	this.timeUpdated = null;
	this.allCanShare = false;
	this.videoEnabled = false;
	this.audioEnabled = false;
	this.roomName = "";
	this.locked = false;
	this.dailinNumber = "";
	this.AVPassword = "";
	this.conferenceType = ConferenceType.ANY;
	this.startTime = null;
	this.duration = 0;
	bjse.util.mixin(this, conference);
};
bjse.api.conference.SPage = function(page, elements) {
	var SPage = page;
	SPage.elements = elements;
	return SPage;
};
bjse.api.conference.SAsset = function(asset, pages) {
	var SAsset = asset;
	SAsset.pages = pages;
	return SAsset;
};
bjse.api.conference.ConferenceManager = function(session) {
	this.session = session;
};
bjse.api.conference.ConferenceSession = function(session, conference) {
	this.conference = conference;
	this.connected = false;
	this.canShare = false,
		this.session = session;
	this.participants = [];
	this.conferencePassword = "";
	this.currentUrn = "";
	this.onParticipantJoined = function() {};
	this.onParticipantLeave = function() {};
	this.onParticipantUpdated = function() {};
	this.onConferenceEnded = function() {};
	this.onInitialLoad = function() {};
	this.onBoardAction = function() {};
	this.onAudioStarted = function() {};
	this.onAudioStopped = function() {};
	this.onAudioFailed = function() {};
};
bjse.api.conference.ConferenceSession.prototype.isPresenter = function() {
	return this.conference && this.conference.presenterId == this.session.device.id
};
bjse.api.conference.ConferenceSession.prototype.canPresent = function() {
	return this.isOrganizer() || this.canShare || this.conference && this.conference.allCanShare
};
bjse.api.conference.ConferenceSession.prototype.isOrganizer = function() {
	return this.conference && this.conference.organizerId == this.session.device.id
}
bjse.api.conference.ConferenceManager.prototype.createConference = function(data, success, error) {
	var that = this,
		url = bjse.util.format("{$apiurl}/conferences", {
			apiurl: this.session.runtime.serverUrl
		});
	//if presenterId not defined then consider current deviceId
	data.persenterId ? data.persenterId : data.persenterId = this.session.device.id
		//if organiserId not defined then consider current deviceId
	data.organizerId ? data.organizerId : data.organizerId = this.session.device.id
	this.session.getHttpClient().postAuth(url, data, function(response) {
		var conference = new bjse.api.conference.Conference(response),
			conferenceSession = new bjse.api.conference.ConferenceSession(that.session, conference);
		success && success(conferenceSession);
	}, error)
};
bjse.api.conference.ConferenceManager.prototype.updateConference = function(data, success, error) {
	var that = this,
		url = bjse.util.format("{$apiurl}/conferences/update", {
			apiurl: this.session.runtime.serverUrl
		});
	this.session.getHttpClient().postAuth(url, data, function(response) {
		success && success(response);
	}, error)
};
/**
 *	Pulls the board data from the server
 */
bjse.api.conference.ConferenceManager.prototype.startConference = function(data, success, error) {
	var that = this;
	this.createConference(data, function(mt) {
		that.conferenceSession = mt;
		var userData = that.session.user,
			joinee = {
				"action": Action.JOIN,
				"participant": {
					"firstName": userData.firstName,
					"lastName": userData.lastName,
					"about": userData.about,
					"email": userData.email,
					"avatarUrl": userData.avatarUrl,
					"deviceId": that.session.device.id
				}
			}
		that.conferenceSession.connectConference(joinee, success);
	})
};
bjse.api.conference.ConferenceManager.prototype.getConferenceSession = function(conferenceId, success, error) {
	var that = this,
		url = bjse.util.format("{$apiurl}/conferences/{$conferenceId}", {
			apiurl: this.session.runtime.serverUrl,
			conferenceId: conferenceId
		});
	this.session.getHttpClient().postAuth(url, "", function(response) {
		var conference = new bjse.api.conference.Conference(response),
			conferenceSession = new bjse.api.conference.ConferenceSession(that.session, conference);
		success(conferenceSession);
	}, error);
};
bjse.api.conference.ConferenceManager.prototype.joinConference = function(conferenceId, userData, success, error) {
	var that = this;
	this.getConferenceSession(conferenceId, function(conf) {
		that.conferenceSession = conf;
		var joinee = {
			"action": Action.JOIN,
			"participant": {
				"firstName": userData.firstName,
				"lastName": userData.lastName,
				"about": userData.about,
				"email": userData.email,
				"avatarUrl": userData.avatarUrl,
				"deviceId": that.session.device.id
			}
		}
		that.conferenceSession.connectConference(joinee, success);
	})
};
bjse.api.conference.ConferenceManager.prototype.sendInvitation = function(data, success, error) {
	var url = bjse.util.format("{$apiurl}/conferences/invitations", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().postAuth(url, data, function() {
		success();
	}, error)

};
bjse.api.conference.ConferenceSession.prototype.connectConference = function(joinee, success) {
	var that = this;
	this.initAtmosphere(function() {
		that.connected = true;
		success(that);
		setTimeout(function() {
			that.outgoingData(HeaderAction.CONFERENCE, that._transferredData(ActionType.PARTICIPANTS, joinee));
			// reload chat
			//reloadAllChat();
			// reset
		}, 200)
	});
	var url = bjse.util.format("{$pubsuburl}/{$conferenceId}", {
		pubsuburl: this.conference.serverPubSubUrl,
		conferenceId: this.conference.id
	})
	this.subscribePubSub(url);
};
bjse.api.conference.ConferenceSession.prototype.getAsset = function(assetId, success, error) {
	var request = {
			command: Action.GET,
			parameters: {
				"asset": {
					assetId: assetId
				}
			}
		}
	// send changes to all subscribed clients
	this.subSocket(JSON.stringify(request));
};
bjse.api.conference.ConferenceSession.prototype.getPageElements = function(pageId, success, error) {
	var request = {
			command: Action.GET,
			parameters: {
				"page": {
					pageId: "pageId"
				}
			}
		}
	// send changes to all subscribed clients
	this.subSocket(JSON.stringify(request));
};
bjse.api.conference.ConferenceSession.prototype.getPage = function(pageId, success, error) {
	var request = {
			command: Action.GET,
			parameters: {
				"page": {
					pageId: pageId
				}
			}
		}
	// send changes to all subscribed clients
	this.subSocket(JSON.stringify(request));
};
bjse.api.conference.ConferenceSession.prototype.initAtmosphere = function(success) {
	var that = this;
	this._socket = atmosphere;
	this._subSocket = null;
	this.request = {
		url: null,
		contentType: "application/json",
		logLevel: "debug",
		transport: "websocket",
		//https://github.com/Atmosphere/atmosphere/wiki/JavaScript-jQuery-API-custom-headers
		//https://github.com/Atmosphere/atmosphere/wiki/Surviving-Proxy-that-strip-WebSocket's-Request-Header
		headers: {
			"X-Atmosphere-WebSocket-Proxy": "true",
			userId: this.session.user.id,
			deviceId: this.session.device.id
		},
		attachHeadersAsQueryString: true,
		//timeout: -1,
		//reconnectInterval: 5000,
		fallbackTransport: "long-polling",
		enableProtocol: true,
		// to enable CORS
		//enableXDR: true,
		//maxRequest: 100000000,
		trackMessageLength: true
	}
	this.request.onError = function(response) {
		if (response.reasonPhrase != "maxReconnectOnClose reached") {
			logError("Error : with response state : " + response.state + " with reason : " + response.reasonPhrase);
			alert("Your whiteboard session got disconnected due to " + response.reasonPhrase + " , please refresh your page");
		} else {
			logError("Atmophere error: " + response.reasonPhrase);
		}
	};
	this.request.onClose = function(response) {
		logInfo("On Close response state :" + response.state);
		if (response.state == "unsubscribe") {
			logInfo("The browser is closed");
		} else {
			logDebug("onClose is called. Status: " + response.status + " state: " + response.state + " transport :" + response.transport + " reasonPhrase: " + response.reasonPhras);
		}
	};
	this.request.onOpen = function(response) {
		success && success();
	};
	this.request.onFailureToReconnect = function(request, response) {
		logError("Your whiteboard session got disconnected , please refresh your page");
	};
	this.request.onReopen = function(response) {
		logInfo("OnReopen response state");
	};
	this.request.onClientTimeout = function(request) {
		logError("Client Timeout :" + request.message)
	};
	this.request.onReconnect = function(request, response) {
		logInfo("Atmosphere connection Reconnecting...");
	}
	this.request.onMessage = function(response) {
		if (response.state != 'connected' && response.state != 'closed' && response.responseBody != "X" && response.status == 200) {
			if (response.responseBody.length > 0) {
				logIncoming(response.responseBody);
				var inComing = JSON.parse(response.responseBody),
					peerId = inComing.peerId,
					jsArray = inComing.data,
					jsData;
				if (peerId === undefined) {
					logInfo("Seems to be a self message");
					jsArray = [];
					jsArray.push(inComing)
				}
				if (jsArray === undefined || jsArray == null) {
					return;
				}
				for (var id = 0; id < jsArray.length; id++) {
					jsData = jsArray[id];
					if (jsData == null) {
						return;
					}
					logProfile(jsData.timestamp);
					var actionType = jsData.actionType;
					switch (actionType) {
						case ActionType.BOARD:
							if (peerId == that.session.device.id) {
								logDebug("Duplicate data. Ignoring it!");
								return;
							}
							that.onBoardAction(jsData.serverData);
							break;
						case ActionType.AVCONF:
							break;
						case ActionType.CHAT:
							break;
						case ActionType.SCREENSHARE:
							break;
						case ActionType.DOCUMENTSYNC:
							break;
						case ActionType.PARTICIPANTS:
							var inParticipant = jsData.serverData.participant;
							if (jsData.serverData.action == Action.JOIN || jsData.serverData.action == Action.REJOIN) {
								var isExist = false,
									newParti = new bjse.api.conference.Participant(inParticipant);
								for (var i = 0; !isExist && i < that.participants.length; i++) {
									isExist = (that.participants[i].deviceId === newParti.deviceId)
								}
								(isExist || that.participants.push(newParti)) && that.onParticipantJoined()
							} else if (jsData.serverData.action == Action.UPDATE) {
								for (var i = 0; i < that.participants.length; i++) {
									var parti = that.participants[i];
									if (inParticipant.deviceId === parti.deviceId) {
										parti.canShare = inParticipant.canShare.parseBoolean();
										parti.displayName = inParticipant.displayName;
										parti.avState = inParticipant.avState;
										that.onParticipantUpdated(parti);
										// find out how to determine the owner of conference
										parti.deviceId === that.conference.ownerId && parti.canShare != that.canShare && (that.canShare = parti.canShare,
											that.onCanShareChanged(that.canShare));
										break;
									}
								}
							} else if (jsData.serverData.action == Action.LEAVE || jsData.serverData.action == Action.REMOVE) {
								var leaveId = jsData.serverData.participantId;
								// if owner of the conference disconnects or leaves
								if (leaveId === this.conference.presenterId) {
									that.disconnect(function() {}, function(err) {
										logError("Failed to disconnect from meeting: " + err);
									})
								} else {
									for (var i = 0; i < that.participants.length; i++) {
										var parti = that.participants[i];
										parti.deviceId == leaveId && (jsData.serverData.action == Action.LEAVE ?
											parti.state = bjse.api.conference.ParticipantState.OFFLINE : parti.state = bjse.api.conference.ParticipantState.REMOVED, that.onParticipantLeave(parti));
									}
								}
								// TO DO: if the current user leaves do something
							}

							break;
						case ActionType.PRIVDOC:

							break;
						case ActionType.CONFPROTOCOL:
							var partiList = jsData.participants;
							for (var i = 0; i < partiList.length; i++) {
								that.participants.push(new bjse.api.conference.Participant(partiList[i]))
							}
							that.canShare = jsData.canShare;
							jsData.serverData && that.onInitialLoad(jsData.serverData);
							if (peerId != that.session.device.id) {
								//	that.onBoardAction(jsData.serverData);
							}
							break;
						default:
					}
					// show new message in the event monitoring pane
					// prependMessage(jsData.message);
				}
			}
		}
	};

};
bjse.api.conference.ConferenceSession.prototype.subscribePubSub = function(url) {
	// if the connection still exist then disconnect
	if (this._subSocket != null) {
		_self.unsubscribePubSub();
	}
	this.request.url = url;
	if (this.request.url == null) {
		//get a valid pubsub url from backend
		WBUI.getPubSubUrl(_self.whiteboardId);
	} else {
		this._subSocket = socket.subscribe(this.request);
	}
};
bjse.api.conference.ConferenceSession.prototype.unsubscribePubSub = function() {
	this._socket.unsubscribe();
	this._subSocket = null;
};
bjse.api.conference.ConferenceSession.prototype.sendBoardData = function(board) {
	this._cachedBoardData = this._cachedBoardData || [];
	if (bjse.util.isArray(board)) {
		this._cachedBoardData.length > 0 ? $.merge(this._cachedBoardData, board) : this._cachedBoardData = board;
	} else {
		this._cachedBoardData.push(board);
	}
	if (this._isTimeOutOn) {
		setTimeout(function() {
			this.outgoingData(HeaderAction.CONFERENCE, this._transferredData(ActionType.BOARD, this._cachedBoardData));
			this._cachedBoardData = null;
			this._isTimeOutOn = true;
		}, 30);
		this._isTimeOutOn = false;
	}
};
bjse.api.conference.ConferenceSession.prototype._transferredData = function(actionType, data, parameters) {
	var returnObj = {},
		innerField = {};
	returnObj.clientActionType = actionType;
	returnObj.changes = []
	if (arguments[1]) {
		$.extend(innerField, data);
	}
	if (arguments[2]) {
		innerField.parameters = parameters;
	}
	returnObj.changes.push(innerField);
	return returnObj;
};
bjse.api.conference.ConferenceSession.prototype.outgoingData = function(headerAction, transferData) {
	var sendObject = {},
		outgoingData;
	sendObject.headerData = this._headerData(headerAction);
	sendObject.data = transferData;
	outgoingData = JSON.stringify(sendObject);
	// send changes to all subscribed clients
	this.subSocket(outgoingData);
};
bjse.api.conference.ConferenceSession.prototype.subSocket = function(jsonData){
	//log the data and send
	logOutgoing(jsonData);
	// send changes to all subscribed clients
	this._subSocket.push({
		data: jsonData
	});
};
/**
 *	HeaderData creator for sending to server
 */
bjse.api.conference.ConferenceSession.prototype._headerData = function(action) {
	var returnObj = {
		"roomId": this.conference.id,
		"peerId": this.session.device.id,
		"timestamp": bjse.util.getTimestamp(),
		"action": action
	};
	return returnObj;
};
/**
 *	Creates a board object
 *
 */
bjse.api.conference.ConferenceSession.prototype.drawAction = function(sendAction, pageId, assetId) {
	var data = {
		"action": sendAction.action,
		"element": new bjse.api.board.Element(sendAction.element, pageId, assetId),
	}
	this.outgoingData(HeaderAction.CONFERENCE, this._transferredData(ActionType.BOARD, data));
};
/**
 *	Sending page to the server
 */
bjse.api.conference.ConferenceSession.prototype.sendPage = function(page, elements) {
	var currentUrn = bjse.api.URN.parse(localStorage.getItem("current_URN")),
		data = {
			"page": bjse.api.conference.SPage(page, elements),
			"action": Action.PAGESEND,
			"parameters": {
				scheme: currentUrn.scheme,
				location: currentUrn.location
			}
		}
	this.outgoingData(HeaderAction.CONFERENCE, this._transferredData(ActionType.BOARD, data));
};