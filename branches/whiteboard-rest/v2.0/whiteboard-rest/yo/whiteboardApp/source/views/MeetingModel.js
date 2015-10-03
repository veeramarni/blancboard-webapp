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
	getPage: function(pageId, success, error){
		var pg = this.getMeetingPages()[pageId];
		if(pg){
			success(pg);
		} else {
			var that = this;
			blanc.Session.getConference().getPage(pageId, function(p){
				that.getMeetingPages()[pageId] = p;
				success(p);
			}, error)
		}
	},
	getAsset: function(assetId, success, error){
		var asset = this.getMeetingAssets()[assetId];
		if(asset){
			success(asset);
		} else {
			var that = this;
			blanc.Session.getPersistenceManager().getDocumentById(assetId, function(a){
				that.getMeetingPages()[assetId] = a;
				success(a);
			}, function(){
				blanc.Session.getConference().getAsset(assetId, function(a){
					that.getMeetingPages()[assetId] = a;
					success(a);
				})
			})
			
		}
	}
})