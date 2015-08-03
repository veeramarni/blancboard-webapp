enyo.kind({
	name: "blanc.SyncManager",
	kind: "enyo.Object",
	syncInProgress: false,
	syncTimestamp: function(time){
		localStorage.setItem("blanc_sync_time_" + blanc.Session.getUserId(), time);
	},
	getTimestamp: function(){
		return localStorage.getItem("blanc_sync_time_" + blanc.Session.getUserId());
	},
	clearTimestamp: function(){
		localStorage.removeItem("blanc_sync_time_"+ blanc.Session.getUserId());
	},
	synchronize: function(error){
		if(!this.syncInProgress){
			this.syncInProgress = true;
			var that = this,
				complete = function(err){
					that.syncInProgress = false;
					error(err);
				};
			blanc.Session.getAssetManager().getAssets({
				timestamp: this.getTimestamp(),
				type: [bjse.api.assets.AssetType.FILE]
			}, function(docs, time){
				that.syncTimestamp(time);
				that.processDocuments(docs, complete)
			}, function(){
				logError("Sync failed ");
				complete(false);
			})
		}
	},
	processDocuments: function(docs, complete){
		if( docs == null || docs.length < 1){
		    complete(false);
			return void 0;
		}
		var persist = blanc.Session.getPersistenceManager();
		persist.mergeDocuments(docs, function(){
			complete(true);
		}, function(){
			complete(false);
		})
	},
	createDocument: function(doc, success, error){
		blanc.Session.getAssetManager().createAsset(doc, function(d){
			blanc.Session.getPersistenceManager().storeDocument(d, function(dd){
				success(dd)
			}, error)
		}, error)
	},
	deleteDocument: function(docid, success, error){

	},
	updateDocument: function(doc, success, error){
		blanc.Session.getAssetManager().updateAsset(doc.id, doc, function(asset){
			blanc.Session.getPersistenceManager().updateDocument(asset, success, error);
		}, error)
	}
})