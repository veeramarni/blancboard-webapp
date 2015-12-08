enyo.kind({
	name: "blanc.MeetingModel",
	kind: "enyo.Object",


	// ...........................
	// PUBLIC PROPERTIES
	uploadHistory: {},
	meetingPages: {},
	meetingAssets: {},


	reset: function(){
		this.uploadHistory = {};
		this.meetingAssets = {};
		this.meetingPages = {};
	},
	loadPage: function(data){
		if(data){
			this.meetingPages[data.id] = data;
		}
	},
	loadAsset: function(data){
		if(data){
			this.meetingAssets[data.id] = data;
		}
	},
	getPage: function(pageId, success, error){
		var pg = this.meetingPages[pageId];
		if(pg){
			success(pg);
		} else {
			var that = this;
			blanc.Session.getConferenceSession().getPage(pageId, function(p){
				that.meetingPages[pageId] = p;
				success(p);
			}, error)
		}
	},
	getAsset: function(assetId, success, error){
		var asset = this.meetingAssets[assetId];
		if(asset){
			success(asset);
		} else {
			var that = this;
			blanc.Session.getPersistenceManager().getDocumentById(assetId, function(a){
				that.meetingAssets[assetId] = a;
				success(a);
			}, function(){
				blanc.Session.getConferenceSession().getAsset(assetId, function(a){
					that.meetingAssets[assetId] = a;
					success(a);
				})
			})
			
		}
	}
})