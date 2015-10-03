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
		onPageSelected: "pageSelected",
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
		var currsess = {
			pageId: event.pageId
		}
		blanc.Session.setCurrentSessionDetails(currsess);
		this.waterfallDown("onUpdatePage", event);
		return true;
	},
	pageCreated: function(sender, event){
		this.menuModel.pageCreated(sender, event);
		this.updateMenu();
		this.waterfallDown("onPageCreated", event);
		return true;
	},
	pageRendered: function(sender, event){
		var meetingModel = this.meetingModel;
		if(blanc.Session.isConferenceActive() && !meetingModel.getUploadHistory()[event.pageId]){
			meetingModel.getUploadHistory()[event.pageId] = true;
			var pm = blanc.Session.getPersistenceManager(), 
				err = function(e){
					meetingModel.getUploadHistory()[event.pageId] = false;
					logError("Failed to upload page: " + e);
				}
			pm.getPageById(event.pageId, function(pg){
				// need to set the page title by calling the document
				pm.getDocumentById(pg.assetId, function(doc){
					pg.title = doc.title;
					pm.getElementsByPageId(pg.id, function(els){
						blanc.Session.getMeetingSession().sendPage(pg, els, function(){}, err);
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
	restoreSession: function(){
		if(blanc.Session.isConferenceActive()){

		} else {
			var that = this;
			blanc.Session.getUserInfo(function(t){
				
			}, function(){
				// redirect to the login page
				
			})
		}
		if(blanc.Session.getCurrentSessionDetails()){
			this.waterfallDown("onRestoreView", {
				page: blanc.Session.getCurrentSessionDetails()
			})
		} else {
			this.waterfallDown("onStartPage");
		}
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
	conferenceStarted: function(sender, event){
		var conference = event.conference;
		conference.onBoardAction = enyo.bind(this, this.boardAction);
		conference.onConferenceEnded = enyo.bind(this, this.conferenceEnded);
		blanc.Session.setConference(event.conference);
		this.waterfallDown("onConferenceStarted", {
			conference: event.conference
		})
		if(event.conference.isPresenter()){
			var sesdetail = blanc.Session.getCurrentSessionDetails();
			// display the current board
		} else {

		}
	},
	conferenceEnded: function(sender, event){

	},
	boardAction: function(sender, event){
		this.waterfallDown("onBoardAction", event);
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
		blanc.Session.getSyncManager().deleteDocument(event.docId, function(){
			callbackFunction();
		}, function(err){
			callbackFunction();
			logError(err);
		})
		return true;
	},
	canceldFileDeletion: function(sender, event) {
		this.waterfallDown("onFileDeletionCanceled");
	},
    thumbnailUpdated: function(sender, event){
    	this.waterfallDown("onThumbnailUpdated", event);
    },
	// ...........................
	// Overwritten METHODS
	updateMenu: function() {

	}
})