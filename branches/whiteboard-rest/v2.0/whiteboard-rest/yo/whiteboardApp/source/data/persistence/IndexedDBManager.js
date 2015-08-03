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
				db = window.indexedDB.open("blancdb", 4);
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
				if (e.oldVersion < 4) {
					logInfo("Creating blancdb Database");
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
					var elementsObjStore = t.createObjectStore("elements", {
						keyPath: "id"
					});
					elementsObjStore.createIndex("pageIndex", "pageid", {
						unique: false
					});
					elementsObjStore.createIndex("assetidIndex", "assetid", {
						unique: false
					});
					var blobsObjStore = t.createObjectStore("blobs", {
						keyPath: "id"
					});
					blobsObjStore.createIndex("assetidIndex", "assetid", {
						unique: false
					})
				}
			}
		} catch (e) {

		}
	},
	storeUser: function(user, success, error) {
		var trans = this.database.transaction(["users"], "readwrite"),
			objstore = trans.objectStore("users"),
			req = objstore.put(user);
		req.onsuccess = function() {
			success(user);
		};
		req.onerror = function(event) {
			error(event.target.error);
		};
		// req.oncomplete = function() {
		// 	success(user);
		// };
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
				success && success(usr);
			} else {
				error && error("not found");
			}
		};
		req.onerror = function(event) {
			error(event.target.error)
		};
	},
	deleteUser: function(userid, success, error) {
		var trans = this.database.transaction(["users"], "readwrite"),
			objstore = trans.objectStore("users"),
			req = objstore["delete"](userid);
		req.onsuccess = function() {
			success && success(userid);
		};
		req.onerror = function(event) {
			error && error(event.target.error);
		};
		req.oncomplete = function() {

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
		req.onerror = function(event) {
			error && error(doc);
		}
	},
	deleteAllDocuments: function(success, error) {
		var trans = this.database.transaction(["documents", "pages", "elements", "blobs"], "readwrite");
		trans.objectStore("documents").clear();
		trans.objectStore("pages").clear();
		trans.objectStore("elements").clear();
		trans.objectStore("blobs").clear();
		trans.oncomplete = function(){
			success && success();
		};
		trans.onerror = function(){
			error && error();
		};
		trans.onabort = function(){
			error && error();
		}
	},
	updateCurrentPageNo: function(docid, pageno, success, error) {
		var that = this;
		this.getDocumentById(docid, function(doc) {
			doc.currentPageNo = pageno;
			that.storeDocument(doc);
		})
	},
	storePage: function(page, success, error) {
		var trans = this.database.transaction(["pages"], "readwrite"),
			objstore = trans.objectStore("pages"),
			req = objstore.put(page);
		req.onsuccess = function() {
			success && success(page);
		};
		req.onerror = function(event) {
			error && error(event.target.error);
		};
	},
	deletePage: function(pageid, success, error) {
		this.deletePageElements(pageid);
		var trans = this.database.transaction(["pages", "blobs"], "readwrite"),
			obstorePages = trans.objectStore("pages"),
			req = objstore.get(pageid),
			thumbid = null,
			previewid = null;
		req.onsuccess = function(event) {
			var res = event.target.result;
			if (res) {
				thumbid = res.thumbid;
				previewid = res.previewid;
				req["delete"](res.id);
			}
			success();
		}
		req.onerror = function() {
			error && error();
		}
		thumbid && that.deleteBlob(thumbid);
		previewid && this.deleteBlob(previewid);
	},
	getDocuments: function(success, error) {
		var trans = this.database.transaction(["documents"], "readonly"),
			objstore = trans.objectStore("documents"),
			cur = objstore.openCursor(),
			that = this,
			result = [];
		cur.onsuccess = function() {
			var res = cur.result;
			if (res) {
				var doc = that.record2doc(res.value);
				result.push(doc);
				res["continue"]();
			} else {
				success && success(result);
			}
		}
		cur.onerror = function(event) {
			error(cur.error);
		}

	},
	getDocumentById: function(docid, success, error) {
		var trans = this.database.transaction(["documents"], "readonly"),
			objstore = trans.objectStore("documents"),
			res = objstore.get(docid),
			that = this;
		res.onsuccess = function(event) {
			var data = event.target.result;
			data ? success(that.record2doc(data)) : (error && error("docid: " + docid + " not found."));
		}
		res.onerror = function(event) {
			error && error(res.error);
		}
	},
	deleteDocumentCascade: function(docid, trans) {
		var pagesobjstore = trans.objectStore("pages")
		pagescur = pagesobjstore.index("assetidIndex").openCursor(IDBKeyRange.only(docid));
		pagescur.onsuccess = function() {
			var res = pagescur.result;
			res && (pagesobjstore["delete"](res.value.id), res["continue"]());
		};
		// var elementsobjstore = trans.objectStore("elements"),
		// 	elementscur = elementsobjstore.index("asssetidIndex").openCursor(IDBKeyRange.only(docid));
		// elementscur.onsuccess = function(){
		// 	var res = elementscur.result;
		// 	res && (elementsobjstore["delete"](res.value.id), res["continue"]());
		// }
		var blobsobjstore = trans.objectStore("blobs"),
			blobscur = blobsobjstore.index("assetidIndex").openCursor(IDBKeyRange.only(docid));
		blobscur.onsuccess = function() {
			var res = blobscur.result;
			res && (blobsobjstore["delete"](res.value.id), res["continue"]());
		}

	},
	deleteDocument: function(docid, success, error) {
		var trans = this.database.transaction(["documents", "pages", "elements", "blobs"], "readwrite"),
			objstore = trans.objectStore("documents");
		objstore["delete"](docid);
		this.deleteDocumentCascade(docid, trans);
		trans.oncomplete = success;
		trans.onabort = error;
		trans.onerror = error;
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
		cur.onerror = function(event) {
			error(cur.error);
		}
	},
	record2doc: function(rec) {
		var doc = new bjse.api.board.Document(rec);
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
	},
	/**
	 *	Store path
	 */
	storeElement: function(element, pageid, success, error) {
		var trans = this.database.transaction(["elements"], "readwrite"),
			objstore = trans.objectStore("elements"),
			req = objstore.put(this.element2record(element, pageid));
		req.onsuccess = function() {
			logDebug("storage: stored element id: " + element.properties.uuid);
			success && success(element);
		}
		req.onerror = function(event) {
			error && error(event.target.error);
		}
	},
	deletePageElements: function(pageid, success, error) {
		var trans = this.database.transaction("elements", "readwrite"),
			objstore = trans.objectStore("elements"),
			req = objstore.index("pageIndex").openCursor(IDBKeyRange.only(pageid));
		req.onsuccess = function() {
			var res = req.result;
			res && (objstore["delete"](res.value.id), res["continue"]());
			success();
		}
		req.onerror = function() {
			error();
		}
	},
	deleteElement: function(elementid, success, error) {
		var trans = this.database.transaction("elements", "readwrite"),
			objstore = trans.objectStore("elements"),
			req = objstore["delete"](elementid);
		req.onsuccess = function() {
			logDebug("storage: deleted element id: " + elementid);
			success && success(elementid);
		}
		req.oncomplete = function() {

		}
		req.onerror = function(event) {
			error && error(event.target.error);
		}
	},
	storeElements: function(elemArray, pageid, success, error) {
		var len = elemArray.length,
			that = this,
			count = 0;
		this.deletePageElements(pageid, function() {
			for (var i = 0; i < len; i++) {
				that.storeElement(elemArray[i], pageid, function(elemArray) {
					len == ++count && success && success();
				}, function() {
					error && error();
				});
			}
		}, function() {
			if (that.elemArray.length == 0) {
				success && success();
			}
		}, function() {
			if (that.elemArray.length == 0) {
				error && error();
			}
		});
	},
	getElementsByPageId: function(pageid, success, error) {
		var trans = this.database.transaction("elements", "readonly"),
			objstore = trans.objectStore("elements"),
			cur = objstore.openCursor(),
			that = this,
			result = [];
		cur.onsuccess = function() {
			var res = cur.result;
			if (res) {
				if (res.value.pageid == pageid) {
					result.push(that.record2element(res.value));
				}
				res["continue"]();
			} else {
				success(result);
			}
		}
		cur.onerror = function(event) {
			error && error();
		}
	},
	element2record: function(element, pageid) {
		var elrec = {
				id: element.properties.uuid,
				pageid: pageid,
				type: element.type
			},
			props = element.properties;
		for (var i in props) {
			props.hasOwnProperty(i) && (elrec[i] = props[i]);
		}
		return elrec;
	},
	record2element: function(rec) {
		var element = {
			type: rec.type,
			properties: {}
		}
		for (var i in rec) {
			if (rec.hasOwnProperty(i) && (i != "type" && i != "pageid" && i != "id"))
				element.properties[i] = rec[i];
		}
		return element;
	},
	storeBlob: function(blobid, data, docid, success, error) {
		var trans = this.database.transaction(["blobs"], "readwrite"),
			objstore = trans.objectStore("blobs"),
			req = objstore.put({
				id: blobid,
				assetid: docid,
				data: data
			});
		req.onsuccess = function() {
			success && success();
		}
		req.onerror = function(event) {
			error && error(event.target.error);
		}
		req.oncomplete = function() {

		}
	},
	getBlob: function(blobid, success, error) {
		var trans = this.database.transaction(["blobs"], "readonly"),
			objstore = trans.objectStore("blobs"),
			req = objstore.get(blobid);
		req.onsuccess = function(event) {
			var res = event.target.result;
			res ? success(res.value.data) : (error && error({
				code: 404,
				message: "not found"
			}))
		}
		req.onerror = function(event) {
			error(event.target.error);
		}
	},
	deleteBlob: function(blobid, success, error) {
		var trans = this.database.transaction(["blobs"], "readonly"),
			objstore = trans.objectStore("blobs"),
			req = objstore["delete"](blobid);
		req.onsuccess = function() {
			success && success();
		}
		req.onerror = function(event) {
			error && error(event.target.error);
		}
	}
})