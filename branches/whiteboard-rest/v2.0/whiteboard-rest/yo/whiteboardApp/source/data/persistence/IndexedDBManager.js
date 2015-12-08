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
				if (e.oldVersion < 5) {
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
					pagesObjStore.createIndex("assetIdIndex", "assetId", {
						unique: false
					});
					var elementsObjStore = t.createObjectStore("elements", {
						keyPath: "id"
					});
					elementsObjStore.createIndex("pageIdIndex", "pageId", {
						unique: false
					});
					elementsObjStore.createIndex("assetIdIndex", "assetId", {
						unique: false
					});
					var blobsObjStore = t.createObjectStore("blobs", {
						keyPath: "id"
					});
					blobsObjStore.createIndex("assetIdIndex", "assetId", {
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
	getUserById: function(userId, success, error) {
		var n = this,
			trans = this.database.transaction(["users"], "readonly"),
			objstore = trans.objectStore("users"),
			req = objstore.get(userId);
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
	deleteUser: function(userId, success, error) {
		var trans = this.database.transaction(["users"], "readwrite"),
			objstore = trans.objectStore("users"),
			req = objstore["delete"](userId);
		req.onsuccess = function() {
			success && success(userId);
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
	mergeDocuments: function(assets, success, error) {
		var trans = this.database.transaction(["documents", "pages", "elements", "blobs"], "readwrite"),
			that = this,
			objstore = trans.objectStore("documents");
		for (var i = 0; i < assets.length; i++) {
			var asset = assets[i];
			objstore.get(asset.id).onsuccess = function(event) {
				var storedAsset = event.target.result
					//delete anything that marked as deleted
				if (storedAsset && asset.state == "DELETED") {
					that.deleteDocumentCascade(asset.id, trans);
				}
			}
			asset.state != "DELETED" && objstore.put(that.doc2record(asset));
		}
		trans.oncomplete = function() {
			success && success();
		};
		trans.onerror = function() {
			error && error();
		};
		trans.onabort = function() {
			error && error();
		}
	},
	deleteAllDocuments: function(success, error) {
		var trans = this.database.transaction(["documents", "pages", "elements", "blobs"], "readwrite");
		trans.objectStore("documents").clear();
		trans.objectStore("pages").clear();
		trans.objectStore("elements").clear();
		trans.objectStore("blobs").clear();
		trans.oncomplete = function() {
			success && success();
		};
		trans.onerror = function() {
			error && error();
		};
		trans.onabort = function() {
			error && error();
		}
	},
	updateDocument: function(doc, success, error) {
		this.storeDocument(doc, success, error);
	},
	updateCurrentPageNo: function(docId, pageNo, success, error) {
		var that = this;
		this.getDocumentById(docId, function(doc) {
			doc.currentPageNo = pageNo;
			that.storeDocument(doc);
		})
	},
	storePage: function(page, success, error) {
		var trans = this.database.transaction(["pages"], "readwrite"),
			that = this,
			objstore = trans.objectStore("pages"),
			thumbUrl = page.thumbUrl,
			previewUrl = page.previewUrl,
			contentUrl = page.contentUrl,
			record = this.page2record(page);
		req = objstore.put(record);
		req.onsuccess = function() {
			if (record.previewId && previewUrl) {
				that.downloadBlob(page.assetId, record.previewId, previewUrl, function() {
					if (record.thumbId && thumbUrl) {
						that.downloadBlob(page.assetId, record.thumbId, thumbUrl, function() {
							success && success(page);
						}, error);
					} else {
						logWarn("Did not find thumbnail details for preview id " + record.previewId);
						success && success(page);
					}
				}, error);
			}else {
				success && success(page);
			}
		};
		req.onerror = function(event) {
			error && error(event.target.error);
		};
	},
	getPageById: function(pageId, success, error){
		var trans = this.database.transaction(["pages"], "readonly"),
			objstore = trans.objectStore("pages"),
			res = objstore.get(pageId),
			that = this;
		res.onsuccess = function(event) {
			var data = event.target.result;
			data ? success(that.record2page(data)) : (error && error("pageId: " + pageId + " not found."));
		}
		res.onerror = function(event) {
			error && error(res.error);
		}
	},
	updatePage: function(page, success, error){
		return this.storePage(page, success, error);
	},
	storePages: function(pages, success, error) {
		var len = pages.length,
			that = this,
			count = 0;
		for (var i = 0; i < len; i++) {
			that.storePage(pages[i], function() {
				if(len == ++count){
					success && success(count/len, true);
				} else {
					success && success(count/len	, false);
				}
			}, function() {
				error && error();
			});
		}
	},
	deletePage: function(pageId, success, error) {
		this.deletePageElements(pageId);
		var trans = this.database.transaction(["pages", "blobs"], "readwrite"),
			obstorePages = trans.objectStore("pages"),
			req = objstore.get(pageId),
			thumbId = null,
			previewId = null;
		req.onsuccess = function(event) {
			var res = event.target.result;
			if (res) {
				thumbId = res.thumbId;
				previewId = res.previewId;
				req["delete"](res.id);
			}
			success();
		}
		req.onerror = function() {
			error && error();
		}
		thumbId && that.deleteBlob(thumbId);
		previewId && this.deleteBlob(previewId);
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
	getDocumentById: function(docId, success, error) {
		var trans = this.database.transaction(["documents"], "readonly"),
			objstore = trans.objectStore("documents"),
			res = objstore.get(docId),
			that = this;
		res.onsuccess = function(event) {
			var data = event.target.result;
			data ? success(that.record2doc(data)) : (error && error("docId: " + docId + " not found."));
		}
		res.onerror = function(event) {
			error && error(res.error);
		}
	},
	deleteDocumentCascade: function(docId, trans) {
		var pagesobjstore = trans.objectStore("pages")
		pagescur = pagesobjstore.index("assetIdIndex").openCursor(IDBKeyRange.only(docId));
		pagescur.onsuccess = function() {
			var res = pagescur.result;
			res && (pagesobjstore["delete"](res.value.id), res["continue"]());
		};
		// var elementsobjstore = trans.objectStore("elements"),
		// 	elementscur = elementsobjstore.index("asssetIdIndex").openCursor(IDBKeyRange.only(docId));
		// elementscur.onsuccess = function(){
		// 	var res = elementscur.result;
		// 	res && (elementsobjstore["delete"](res.value.id), res["continue"]());
		// }
		var blobsobjstore = trans.objectStore("blobs"),
			blobscur = blobsobjstore.index("assetIdIndex").openCursor(IDBKeyRange.only(docId));
		blobscur.onsuccess = function() {
			var res = blobscur.result;
			res && (blobsobjstore["delete"](res.value.id), res["continue"]());
		}

	},
	/**
		Make the document cache status to false and delete all the pages and its associates.

	*/
	deleteDocumentFromCache: function(docId, success, error) {
		var trans = this.database.transaction(["documents", "pages", "elements", "blobs"], "readwrite"),
			objstore = trans.objectStore("documents"),
			docStore = objstore.get(docId);
		docStore.onsuccess = function(e) {
			var data = event.target.result;
			data.cached = 0;
			objstore.put(data);
		};
		this.deleteDocumentCascade(docId, trans);
		trans.oncomplete = success;
		trans.onabort = error;
		trans.onerror = error;
	},
	deleteDocument: function(docId, success, error) {
		var trans = this.database.transaction(["documents", "pages", "elements", "blobs"], "readwrite"),
			objstore = trans.objectStore("documents");
		objstore["delete"](docId);
		this.deleteDocumentCascade(docId, trans);
		trans.oncomplete = success;
		trans.onabort = error;
		trans.onerror = error;
	},
	getPagesForDocument: function(docId, success, error) {
		var trans = this.database.transaction(["pages"], "readwrite"),
			objstore = trans.objectStore("pages"),
			req = objstore.index("assetIdIndex"),
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
	page2record: function(page) {
		// create uuid for URLs
		if (page.previewUrl) {
			page.previewId = bjse.util.randomUUID();
			page.previewUrl = "";
		}
		if (page.thumbUrl) {
			page.thumbId = bjse.util.randomUUID();
			page.thumbUrl = "";
		}
		return page;
	},
	/**
	 *	Store path
	 */
	storeElement: function(element, pageId, success, error) {
		var trans = this.database.transaction(["elements"], "readwrite"),
			objstore = trans.objectStore("elements"),
			req = objstore.put(this.element2record(element, pageId));
		req.onsuccess = function() {
			logDebug("storage: stored element id: " + element.properties.uuid);
			success && success(element);
		}
		req.onerror = function(event) {
			error && error(event.target.error);
		}
	},
	deletePageElements: function(pageId, success, error) {
		var trans = this.database.transaction("elements", "readwrite"),
			objstore = trans.objectStore("elements"),
			req = objstore.index("pageIdIndex").openCursor(IDBKeyRange.only(pageId));
		req.onsuccess = function() {
			var res = req.result;
			res && (objstore["delete"](res.value.id), res["continue"]());
			success();
		}
		req.onerror = function() {
			error();
		}
	},
	deleteElement: function(elementId, success, error) {
		var trans = this.database.transaction("elements", "readwrite"),
			objstore = trans.objectStore("elements"),
			req = objstore["delete"](elementId);
		req.onsuccess = function() {
			logDebug("storage: deleted element id: " + elementId);
			success && success(elementId);
		}
		req.oncomplete = function() {

		}
		req.onerror = function(event) {
			error && error(event.target.error);
		}
	},
	storeElements: function(elemArray, pageId, success, error) {
		var len = elemArray.length,
			that = this,
			count = 0;
		this.deletePageElements(pageId, function() {
			for (var i = 0; i < len; i++) {
				that.storeElement(elemArray[i], pageId, function(elemArray) {
					len == ++count && success && success();
				}, function() {
					error && error();
				});
			}
		}, function() {
			if (elemArray.length == 0) {
				success && success();
			}
		}, function() {
			if (elemArray.length == 0) {
				error && error();
			}
		});
	},
	getElementsByPageId: function(pageId, success, error) {
		var trans = this.database.transaction("elements", "readonly"),
			objstore = trans.objectStore("elements"),
			cur = objstore.openCursor(),
			that = this,
			result = [];
		cur.onsuccess = function() {
			var res = cur.result;
			if (res) {
				if (res.value.pageId == pageId) {
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
	element2record: function(element, pageId) {
		var elrec = {
				id: element.properties.uuid,
				pageId: pageId,
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
			if (rec.hasOwnProperty(i) && (i != "type" && i != "pageId" && i != "id"))
				element.properties[i] = rec[i];
		}
		return element;
	},
	downloadBlob: function(assetId, blobId, url, success, error) {
		var that = this,
			succ = function(res) {
				for (var i = new Uint8Array(res), j = i.length, ar = Array(j); j--;)
					ar[j] = String.fromCharCode(i[j]);
				var join = ar.join(""),
					c = window.btoa(join),
					data = "data:image/jpeg;base64," + c;
				that.storeBlob(assetId, blobId, data, success, error);
			};
		bjse.api.Ajax.img(url, succ, error, "arraybuffer");
	},
	storeBlob: function(assetId, blobId, data, success, error) {
		var trans = this.database.transaction(["blobs"], "readwrite"),
			req = trans.objectStore("blobs").put({
				id: blobId,
				assetId: assetId,
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
	getBlob: function(blobId, success, error) {
		var trans = this.database.transaction(["blobs"], "readonly"),
			objstore = trans.objectStore("blobs"),
			req = objstore.get(blobId);
		req.onsuccess = function(event) {
			var res = event.target.result;
			res ? success(res.data) : (error && error({
				code: 404,
				message: "not found"
			}))
		}
		req.onerror = function(event) {
			error(event.target.error);
		}
	},
	deleteBlob: function(blobId, success, error) {
		var trans = this.database.transaction(["blobs"], "readonly"),
			objstore = trans.objectStore("blobs"),
			req = objstore["delete"](blobId);
		req.onsuccess = function() {
			success && success();
		}
		req.onerror = function(event) {
			error && error(event.target.error);
		}
	}
})