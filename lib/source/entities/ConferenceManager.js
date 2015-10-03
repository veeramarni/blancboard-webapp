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
	REMVOED: "REMOVED"
};
bjse.api.conference.ParticipantState = ParticipantState;
var AVState = {
	ANY: "ANY",
	OFFLINE: "OFFLINE",
	MUTED: "MUTED",
	UNMUTED: "UNMUTED"
};
bjse.api.conference.AVState = AVState;
var Actions = {
	JOIN: "join",
	LEAVE: "leave",
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
	STARTMEETING: "startMeeting",
	CREATEWHITEBOARD: "createWhiteboard",
	JOINWHITEBOARD: "joinWhiteboard",
	DESTROY: "destroy",
	RELOADCHAT: "reloadChat",
	NOTIFYMESSAGE: "notifyMessage",
	REQGENPAGES: "reqGenPages",
	SENDPAGE: "sendPage"
};
var ActionType = {
	ANY: "any",
	BOARD: "board",
	CHAT: "chat",
	SCREENSHARE: "screenshare",
	AVCONF: "avconf",
	DOCUMENTSYNC: "documentsync",
	PARTICIPANTS: "participants"
};
var HeaderAction = {
	CONFERENCE: "Conference"
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
	this.timeModified = null;
	this.canShare = false;
	this.avState = AVState.OFFLINE;
	this.avPin = "";
	bjse.util.mixin(this, participant);
};
bjse.api.conference.Meeting = function(meeting) {
	this.id = "";
	this.ownerId = "";
	this.presenterId = "";
	this.organizerId = "";
	this.attId = "";
	this.state = LifecycleState.ANY;
	this.serverUrl = "";
	this.timeCreate = null;
	this.timeModified = null;
	this.allCanShare = false;
	this.videoEnabled = false;
	this.audioEnabled = false;
	this.roomId = "";
	this.locked = false;
	this.dailinNumber = "";
	this.AVPassword = "";
	this.conferenceType = ConferenceType.ANY;
	this.startTime = null;
	this.duration = 0;
	bjse.util.mixin(this, meeting);
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
bjse.api.conference.ConferenceSession = function(session, meeting){
	this.meeting = meeting;
	this.connected = false;
	this.session = session;
	this.meetingPassword = "";
	this.onMeetingEnded = function(){};
	this.onBoardAction = function(){};
	this.onAudioStarted = function(){};
	this.onAudioStopped = function(){};
	this.onAudioFailed = function(){};
};
bjse.api.conference.ConferenceManager.prototype.createMeeting = function(data, success, error) {
	var url = bjse.util.format("{apiurl}/meetings", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().post(url, data, function(e) {
		var meeting = new bjse.api.conference.Meeting(JSON.parse(e));
		success && success(meeting);
	}, error)
};
/**
 *	Pulls the board data from the server
 */
bjse.api.conference.ConferenceManager.prototype.startMeeting = function(data) {
	var that = this;
	this.createMeeting(data, function(mt){
		this.meeting = mt;
	})
	var parameters = {
		"first": data.firstName,
		"last": data.lastName,
		"about": data.about,
		"email": data.email,
		"avatarUrl": data.avatarUrl,
		"token": this.session.device.id
	}
	this.outgoingData(ActionType.ANY, this._transferredData(Actions.STARTMEETING, "", parameters));
};
bjse.api.conference.ConferenceManager.prototype.getConference = function(conferenceId, success, error) {
	var url = bjse.util.format("{$apiurl}/conferences/{$conferenceId}", {
		apiurl: this.session.runtime.serverUrl,
		conferenceId: conferenceId
	});
	this.session.getHttpClient().get(url, function(e) {
		var meeting = new bjse.api.conference.Meeting(JSON.parse(e));
		success(meeting)
	}, error);
};
bjse.api.conference.ConferenceManager.prototype.getAsset = function(assetId, success, error) {
	var url = bjse.util.format("{$serverUrl}/conferences/{$conferenceId}/assets{$assetId}", {
		serverUrl: this.meeting.serverUrl,
		meetingId: this.meeting.id,
		assetId: assetId
	});
	this.session.getHttpClient().get(url, function(dt) {
		var doc = new bjse.api.board.Document(JSON.parse(dt));
		success(doc);
	}, error);
};
bjse.api.conference.ConferenceManager.prototype.getPageElements = function(pageId, success, error) {
	var url = bjse.util.format("{$serverUrl}/conferences/{$conferenceId}/pages/{$pageId}/elements", {
		serverUrl: this.meeting.serverUrl,
		conferenceId : this.meeting.id,
		pageId: pageId
	});
	this.session.getHttpClient().get(url, function(dt) {
		success(JSON.parse(dt));
	}, error);
};
bjse.api.conference.ConferenceManager.prototype.getPage = function(pageId, success, error) {
	var url = bjse.util.format("{$serverUrl}/conferences/{$conferenceId}/pages/{$pageId}", {
		serverUrl: this.meeting.serverUrl,
		pageId: pageId
	});
	this.session.getHttpClient().get(url, function(dt) {
		var pg = new blanc.api.board.Page(JSON.parse(dt));
		success(pg);
	}, error)
};
bjse.api.conference.ConferenceManager.prototype.joinMeeting = function() {

};
bjse.api.conference.ConferenceManager.prototype.initAtmosphere = function(success) {
	this.socket = atmosphere;
	this.subSocket = null;
	this.request = {
		url: null,
		contentType: "application/json",
		logLevel: "debug",
		transport: "websocket",
		headers: {
			"X-Atmosphere-WebSocket-Proxy": "true"
		},
		timeout: -1,
		fallbackTransport: "long-polling",
		enableProtocol: true,
		maxRequest: 100000000,
		attachHeadersAsQueryString: true,
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
		success();

		//reloadallWhiteboard();

		// notificate subscribers about new user
		//joinUser(usersCount);
		// reload chat
		//reloadAllChat();
		// reset
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
		if (response.state != 'connected' && response.state != 'closed' && response.status == 200) {
			var data = response.responseBody,
				jsData;
			if (data.length > 0) {
				logIncoming(data);
				// convert to JavaScript object
				var jsArray = JSON.parse(data);
				if (jsArray === undefined) {
					return;
				}
				for (var id = 0; id < jsArray.length; id++) {
					jsData = jsArray[id];
					if (jsData == null) {
						return;
					}
					logProfile(jsData.timestamp);
					var action = jsData.action,
						pageId = jsData.pageId;
					if (jsData.senderId != null && jsData.senderId == _self.senderId) {
						if (action == "exit" || action == "leave") {
							this.unsubscribePubSub();
						}
						logDebug("Duplicate data. Ignoring it!")
						return;
					}
					var sentProps = (jsData.element != null ? jsData.element.properties : null);
					switch (actionType) {
						case ActionType.BOARD:
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
bjse.api.conference.ConferenceManager.prototype.subscribePubSub = function(arg) {
	// if the connection still exist then disconnect
	if (this.subSocket != null) {
		_self.unsubscribePubSub();
	}
	if (arg !== undefined) {
		this.request.url = _constructPubSubUrl(arg);
	}
	if (this.request.url == null) {
		WBUI.getPubSubUrl(_self.whiteboardId);
	} else {
		this.subSocket = socket.subscribe(request);
	}
};
bjse.api.conference.ConferenceManager.prototype.unsubscribePubSub = function() {
	this.socket.unsubscribe();
	this.subSocket = null;
};
bjse.api.conference.ConferenceManager.prototype.sendBoardData = function(board) {
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
bjse.api.conference.ConferenceManager.prototype._transferredData = function(actionType, board, parameters, arayParams) {
	var returnObj = {};
	returnObj.clientActionType = actionType;
	if (arguments[1] && arguments[1] == ActionType.BOARD) {
		returnObj.board = board;
	}
	if (arguments[2]) {
		returnObj.parameters = parameters;
	}
	if (arguments[3]) {
		returnObj.arrayParameters = arrayParams
	}
	return returnObj;
};
bjse.api.conference.ConferenceManager.prototype.outgoingData = function(headerAction, transferData) {
	var sendObject = {},
		outgoingData;
	sendObject.headerData = this._headerData(headerAction);
	sendObject.data = transferData;
	outgoingData = JSON.stringify(sendObject);
	//log the data and send
	logOutgoing(outgoingData);
	// send changes to all subscribed clients
	this.subSocket.push({
		data: outgoingData
	});
};
/**
 *	HeaderData creator for sending to server
 */
bjse.api.conference.ConferenceManager.prototype._headerData = function(action) {
	var returnObj = {
		"roomId": this.meeting.roomId,
		"senderId": this.meeting.senderId,
		"presenterId": this.meeting.presenterId,
		"timestamp": bjse.util.getTimestamp(),
		"action": action
	};
	return returnObj;
};
/**
 *	Creates a board object
 *
 */
bjse.api.conference.ConferenceManager.prototype.board = function(action, element, pageId) {
	var returnObj = {
		"action": action,
		"element": element,
		"pageId": pageId
	}
	return returnObj;
};
/**
 *	Sending page to the server
 */
bjse.api.conference.ConferenceManager.prototype.sendPage = function(page, elements) {
	var parameters = {
		page : bjse.api.conference.SPage(page, elements)
	}
	this.outgoingData(ACtionType.BOARD, this._transferredData(Actions.SENDPAGE, "", parameters));
};
