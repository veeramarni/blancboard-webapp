enyo.kind({
	name: "blanc.IndexedDBManager",
	kind: "blanc.PersistenceManager",
	// ...........................
	// PROTECTED PROPERTIES
	database: null,
	// ...........................
	// PUBLIC METHODS
	init: function(success, error) {
		window.indexedDB || (window.indexedDB = function() {
			return window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
		}(), window.IDBTransaction = function() {
			return window.webkitIDBTransaction || window.msIDBTransaction
		}(), window.IDBKeyRange = function() {
			return window.webkitIDBKeyRange || window.msIDBKeyRange
		}());
		try {
			var that = this,
				db = window.indexedDB.open("blancdb", 1);
			db.onerror = function(err) {
				console.log(err.target.errorCode);
				error(err.target.error);
			};
			db.onsuccess = function() {
				that.database = db.result;
				success();
			};
			db.onupgradeneeded = function(e) {
				var t = e.target.result;
				if (e.oldVersion < 1) {
					console.log("Creating blancdb Database");
					t.createObjectStore("users", {
						keyPath: "id"
					});
					var dcObjStore = t.createObjectStore("documents", {
						keyPath: "id"
					});
					dcObjStore.createIndex("cachedIndex", "cached", {
						unique: false
					});
					var pagesObjStore = t.createObjectStore("pages", {
						keyPath: "id"
					});
					pagesObjStore.createIndex("assetidIndex", "assetid", {
						unique: false
					});

				}
			}
		} catch (e) {

		}
	},
	storeUser: function(user, success, error) {
		var trans = this.database.transaction(["users"], "readwrite"),
			objstore = trans.objectStore("users"),
			req = objstore.put(user);
		req.onsuccess = function() {};
		req.onerror = function() {
			error(req.error);
		};
		req.oncomplete = function() {
			success(user);
		};
	},
	updateUser: function(user, success, error) {
		this.storeUser(user, success, error);
	},
	getUserById: function(userid, success, error) {
		var n = this,
			trans = this.database.transaction(["users"], "readonly"),
			objstore = trans.objectStore("users"),
			req = objstore.get(userid);
		req.onsuccess = function(res) {
			if (res.target.result) {
				var usr = new bjse.api.users.User(res.target.result);
				success(usr);
			} else {
				error("not found");
			}
		};
		req.onerror = function() {
			error(req.error)
		};
	},
	deleteUser: function(userid, success, error) {
		var trans = this.database.transaction(["users"], "readwrite"),
			objstore = trans.objectStore("users"),
			req = objstore["delete"](userid);
		req.onsuccess = function() {};
		req.onerror = function() {
			error && error(req.error);
		};
		req.oncomplete = function() {
			success && success(userid);
		};
	},
	// BOARD DATA
	storeDocument: function(doc, success, error) {
		var trans = this.database.transaction(["documents"], "readwrite"),
			objstore = trans.objectStore("documents"),
			req = objstore.put(this.doc2record(doc));
		req.onsuccess = function() {
			success && success(doc);
		};
		req.onerror = function() {
			error && error(doc);
		}
	},
	storePage: function(page, success, error) {
		var trans = this.database.transaction(["pages"], "readwrite"),
			objstore = trans.objectStore("pages"),
			req = objstore.put(page);
		req.onsuccess = function() {
			success && success(page);
		};
		req.onerror = function() {
			error(req.error);
		};
	},
	getDocumentById: function(docid, success, error) {
		var trans = this.database.transaction(["documents"], "readwrite"),
			objstore = trans.objectStore("documents"),
			req = objstore.get(docid),
			that = this;
		req.onsuccess = function(res) {
			if (res.target.result) {
				success(that.record2doc(res.target.result));
			} else {
				error("document id :" + docid + " not found");
			}
		};
		req.onerror = function() {
			error(req.error);
		}
	},
	getPagesForDocument: function(docId, success, error) {
		var trans = this.database.transaction(["pages"], "readwrite"),
			objstore = trans.objectStore("pages"),
			req = objstore.index("assetidIndex"),
			cur = req.openCursor(IDBKeyRange.only(docId)),
			pages = [],
			that = this;
		cur.onsuccess = function() {
			var res = cur.result;
			if (res) {
				var page = that.record2page(res.value);
				pages.push(page);
				res["continue"]();
			} else {
				pages.sort(function(compA, compB) {
					return compA.pageNo - compB.pageNo
				});
				success(pages);
			}
			
		};
		cur.onerror = function() {
			error(cur.error);
		}
	},
	record2doc: function(rec) {
		var doc = {
			id: rec.id
		};
		for (var i in rec) {
			rec.hasOwnProperty(i) && (doc[i] = rec[i]);
		}
		doc.cached = rec.cached == 1;
		doc.shared = rec.shared == 1;
		return doc;
	},
	doc2record: function(doc) {
		var docrec = {
			id: doc.id
		};
		for (var i in doc) {
			doc.hasOwnProperty(i) && (docrec[i] = doc[i]);
		}
		docrec.shared = doc.shared ? 1 : 0;
		docrec.cached = doc.cached ? 1 : 0;
		return docrec;
	},
	record2page: function(rec) {
		return new bjse.api.board.Page(rec);
	}
})