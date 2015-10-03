enyo.kind({
	name: "blanc.FileDownload",
	// ...........................
	// PUBLIC PROPERTIES
	doc: null,

	events: {
		onCanceledDownload: "",
		onDownloaded: "",
		onErrorAlert: ""
	},
	components: [{
		classes: "download-container",
		components: [{
			tag: "p",
			name: "message",
			content: $L("Downloading ... Please wait.")
		}, {
			name: "progressBar",
			kind: "blanc.ProgressBar"
		}, {
			kind: "enyo.Button",
			classes: "btn btn-default",
			content: $L("Cancel"),
			ontap: "cancelDownload"
		}]
	}],
	download: function() {
		var that = this;
		this.$.progressBar.setProgress(.02);
		this.$.message.setContent($L("Downloading ... Please wait."));
		var persist = blanc.Session.getPersistenceManager();
		persist.deleteDocumentFromCache(that.doc.id, function() {
			blanc.Session.getAssetManager().loadPages(that.doc.id, function(pages) {
				persist.storePages(pages, function(cnt, isCompleted) {
					that.$.progressBar.setProgress(cnt);
					if (isCompleted) {
						that.doc.cached = true;
						persist.updateDocument(that.doc, function() {
							that.doDownloaded({
								docId: that.doc.id
							})
						}, function(err) {
							logError("Error when updating document due to :" + err);
							that.doErrorAlert({
								message: $L("Could not update document")
							})
						})
					}
				}, function(err) {
					logError("Storing pages interrupted due to :" + err);
					that.doErrorAlert({
						message: $L("Failed to store pages")
					});
					that.cancelDownload();
				});
			}, function(err) {
				logError("Modifying document failed due to :" + err);
				that.doErrorAlert({
					message: $L("A local database operation failed")
				});
				that.cancelDownload();
			})
		})
	},
	cancelDownload: function() {
		var that = this;
		// TODO:
		//find logic to cancel file download operation by stopping ajax request.
		blanc.Session.getPersistenceManager().deleteDocumentFromCache(this.doc.id, function() {
			that.doCanceledDownload();
		}, function() {
			logError("Failed to delete document from cache :" + this.doc.id);
		})
	}
})