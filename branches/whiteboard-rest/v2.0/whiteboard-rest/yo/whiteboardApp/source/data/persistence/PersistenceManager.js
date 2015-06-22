enyo.kind({
	name: "blanc.PersistenceManager",
	kind: "enyo.Object",
	createWhiteboard: function(name, success, error) {
		var dt = (new Date).getTime(),
			that = this,
			count = 0,
			board = {
				id: bjse.util.randomUUID(),
				title: name,
				type: "File",
				dateCreated: dt,
				ownerid: blanc.Session.getUserId(),
				shared: false,
			};
		this.storeDocument(board, function(doc) {
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
		id == 1 && (page.thumbid = "thumb_"+id);
		this.storePage(page, function(e){
			success(e);
		}, error);


	},
	getLogForPage: function() {

	},
	retoreLogForPage: function() {

	}
})