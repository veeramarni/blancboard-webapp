enyo.kind({
	name: "blanc.AppView",
	classes: "app-view",
	events: {
		onErrorAlert: "",
	},
	handlers: {
		onPageChanged: "pageChanged",
		onPageCreated: "pageCreated",
		onPageRendered: "pageRendered",
		onPageDisplayed: "pageDisplayed",
		onPageSelected: "pageSelected",
		onDrawAction: "drawAction",
		onUndoRedoStateChanged: "undoRedoStateChanged",
		onClearStateChanged: "clearStateChanged",
		onFileCreated: "fileCreated",
		onFileRemoveClicked: "fileRemovedClicked",
		onThumbnailUpdated: "thumbnailUpdated",
		onConferenceStarted: "conferenceStarted",
		onConferenceEnded: "conferenceEnded"
	},
	components: [{}],
	// ...........................
	// PUBLIC PROPERTIES
	menuModel: null,
	meetingModel: null,
	orientation: null,


	// ...........................
	// PROTECTED METHODS
	rendered: function() {
		this.inherited(arguments);
		this.restoreSession();
	},
	fileCreated: function(sender, event) {
		this.waterfallDown("onFileCreated", event);
	},
	pageChanged: function(sender, event) {
		this.menuModel.pageChanged(sender, event);
		this.updateMenu();
		var urn = new bjse.api.URN({
			scheme: "page",
			location: event.pageId
		})
		if (urn.equals(blanc.Session.getCurrentUrn())) {
			return true;
		} else {
			blanc.Session.setCurrentUrn(urn);
		}
		this.waterfallDown("onUpdatePage", event);
		return true;
	},
	pageCreated: function(sender, event) {
		this.menuModel.pageCreated(sender, event);
		this.updateMenu();
		this.waterfallDown("onPageCreated", event);
		return true;
	},
	pageRendered: function(sender, event) {
		var meetingModel = this.meetingModel;
		if (blanc.Session.isConferenceActive() && !meetingModel.get("uploadHistory")[event.pageId]) {
			meetingModel.get("uploadHistory")[event.pageId] = true;
			var pm = blanc.Session.getPersistenceManager(),
				err = function(e) {
					meetingModel.get("uploadHistory")[event.pageId] = false;
					logError("Failed to upload page: " + e);
				}
			pm.getPageById(event.pageId, function(pg) {
				// need to set the page title by calling the document
				pm.getDocumentById(pg.assetId, function(doc) {
					pg.title = doc.title;
					pm.getElementsByPageId(pg.id, function(els) {
   						blanc.Session.getConferenceSession().sendPage(pg, els, function() {}, err);
					}, err);
				}, err);
			}, err);
		}
	},
	undoRedoStateChanged: function(sender, event) {
		if (event.type == "undo") {
			this.menuModel.undoStateChanged(event);
		}
		this.updateMenu();
		return true;
	},  
	clearStateChanged: function(sender, event) {
		this.menuModel.clearStateChanged(event);
		this.updateMenu();
		return true;
	},
	clearView: function(sender, event) {
		this.waterfallDown("onClearContent", event);
	},
	restoreSession: function() {
		var joinId = this.joinId();
		if (joinId) {
			if (blanc.Session.isConferenceActive()) {
				var confSess = blanc.Session.getConferenceSession();
				this.meetingStarted(this, {
					conferenceSession: confSess
				});
				confSess.conference.currentUrn && this.waterfallDown("onRestoreView", {
					urn: blanc.api.URN.parse(confSess.conference.currentUrn)
				})
			} else {
				var that = this;
				blanc.Session.getUserInfo(function(user) {
					blanc.Session.getConferenceManager().joinConference(joinId, {
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email
					}, function(session){
						that.conferenceStarted(that, {
							conferenceSession: session,
							joinId: joinId
						})
					}, function(){
						that.handleJoinConferenceError();
					})
				}, function() {}
				)
			}
		} else {
			if (blanc.Session.getCurrentUrn()) {
				this.waterfallDown("onRestoreView", {
					urn: blanc.Session.getCurrentUrn()
				})
			} else {
				this.waterfallDown("onStartPage");
			}
		}
	},
	joinId: function() {
		var param = blanc.Session.getUrlParams();
		return param.joinId || blanc.Session.getSavedJoinId()
	},
	// ...........................
	// PUBLIC METHODS
	paletteClicked: function() {
		var comp = this.createComponent({
			kind: "blanc.Palette",
			name: "palette",
			onHide: "paletteHidden"
		}, {
			owner: this
		});
		comp.show();
	},
	conferenceStarted: function(sender, event) {
		var conferenceSession = event.conferenceSession;
		conferenceSession.onBoardAction = enyo.bind(this, this.boardAction);
		conferenceSession.onConferenceEnded = enyo.bind(this, this.conferenceEnded);
		conferenceSession.onInitialLoad = enyo.bind(this, this.initialLoad);
		blanc.Session.setConferenceSession(conferenceSession);
		this.menuModel.processConferenceStarted();
		this.waterfallDown("onConferenceStarted", {
			conferenceSession: conferenceSession
		})
		if (conferenceSession.isPresenter()) {
			var sesdetail = blanc.Session.getCurrentUrn();
			// display the current board
		} else {

		}
	},
	conferenceEnded: function(sender, event) {

	},
	initialLoad: function(data){
		var urn = data.parameters.currentUrn;
		if(urn.scheme == "page"){
			this.meetingModel.loadPage(data.page);
		} else if(urn.scheme == "asset"){
			this.meetingModel.loadAsset(data.asset);
		}
		this.displayResource(urn);
	},
	displayResource: function(urn){
		"page" === urn.scheme ? this.displayPage(urn) : this.contentDisplayed();
	},
	displayPage: function(urn){
		var that = this;
		this.meetingModel.getPage(urn.location, function(pg){
			blanc.Session.isConferenceActive() && that.waterfallDown("onDisplayPage", { page: pg});
		}, function(){
			logError("Unable to get Page with id " + urn.location);
		})
	},
	contentDisplayed: function(){

	},
	pageDisplayed: function(sender, event){
		this.contentDisplayed();
		this.menuModel.pageDisplayed(sender, event);
		this.updateMenu();
	},
	boardAction: function(d) {
		this.waterfallDown("onBoardAction", {data: d});
	},
	drawAction: function(sender, event) {
		if (blanc.Session.isConferenceActive()) {
			var cSession = blanc.Session.getConferenceSession();
			cSession.drawAction(event.sendAction, event.pageId, event.assetId, function(e) {
				logError("Failed to post the draw action " + e.message);
			});
		}
	},
	paletteHidden: function() {
		if (this.$.palette) {
			if (this.$.palette.get("colorSelected") || this.$.palette.get("widthSelected")) {
				this.menuModel.activatePen();
				this.updateMenu();
				this.$.palette.destroy();
			} else {
				this.$.palette.destroy();
			}
		}
	},
	handleJoinConferenceError: function(){
		var urlParams = blanc.Session.getUrlParams();
		if(urlParams.joinId){
			var comp = this.createComponent({
				kind: "blanc.Alert",
				onHide: "conferenceEnded",
				showing: false
			}, {
				owner: this
			});
			comp.render();
			comp.showMessage($L("Meeting Error"), $L("This meeting invitation is no longer valid. Please contact your organizer."))
		} else {
			this.conferenceEnded();
		}
	},
	fileRemovedClicked: function(sender, event) {
		var comp = this.createComponent({
			kind: "blanc.ConfirmDialog",
			args: event, // to carry the event to other functions
			onYes: "deleteFile",
			onNo: "canceledFileDeletion",
			title: $L("Delete File"),
			message: $L("Are sure you want to delete this file?")
		}, {
			owner: this
		})
		comp.show();
		return true;
	},
	deleteFile: function(sender, event) {
		var callbackFunction = enyo.bind(this, function() {
			event.currentView && this.clearView();
			this.waterfallDown("onFileDeleted", event);
		});
		blanc.Session.getSyncManager().deleteDocument(event.docId, function() {
			callbackFunction();
		}, function(err) {
			callbackFunction();
			logError(err);
		})
		return true;
	},
	canceledFileDeletion: function(sender, event) {
		this.waterfallDown("onFileDeletionCanceled");
	},
	thumbnailUpdated: function(sender, event) {
		this.waterfallDown("onThumbnailUpdated", event);
	},
	// ...........................
	// Overwritten METHODS
	updateMenu: function() {

	}
})