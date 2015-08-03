enyo.kind({
	name: "blanc.PersistenceManager",
	kind: "enyo.Object",
	createWhiteboard: function(name, success, error) {
		var dt = (new Date).getTime(),
			that = this,
			count = 0,
			newDoc = new bjse.api.board.Document;
		newDoc.id = bjse.util.randomUUID();
		newDoc.title = name;
		newDoc.type = "File";
		newDoc.ownerid = blanc.Session.getUserId();
		newDoc.shared = false;
		newDoc.cached = true;
		newDoc.timeCreated = dt;
		newDoc.contentType = "application/blanc-note";
		this.storeDocument(newDoc, function(doc) {
			for (var i = 0; i < 3; i++) {
				that.createEmptyPage(doc.id, i + 1, function() {
					3 === ++count && success(doc);
				}, function() {
					error();
				})
			}
		}, function() {
			error();
		})
	},
	createEmptyPage: function(id, pageno, success, error) {
		var page = new bjse.api.board.Page;
		page.id = bjse.util.randomUUID();
		page.assetid = id;
		page.pageNo = pageno;
		page.height = 768;
		page.width = 1024;
		id == 1 && (page.thumbid = "thumb_" + id);
		this.storePage(page, function(e) {
			success(e);
		}, error);


	},
	getLogForPage: function() {

	},
	retoreLogForPage: function() {

	}
})