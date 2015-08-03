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
	getPage: function(pageid, success, error){
		var pg = this.getMeetingPages()[pageid];
		if(pg){
			success(pg);
		} else {
			var that = this;
			blanc.Session.getConference().getPage(pageid, function(p){
				that.getMeetingPages()[pageid] = p;
				success(p);
			}, error)
		}
	},
	getAsset: function(assetid, success, error){
		var asset = this.getMeetingAssets()[assetid];
		if(asset){
			success(asset);
		} else {
			var that = this;
			blanc.Session.getPersistenceManager().getDocumentById(assetid, function(a){
				that.getMeetingPages()[assetid] = a;
				success(a);
			}, function(){
				blanc.Session.getConference().getAsset(assetid, function(a){
					that.getMeetingPages()[assetid] = a;
					success(a);
				})
			})
			
		}
	}
})