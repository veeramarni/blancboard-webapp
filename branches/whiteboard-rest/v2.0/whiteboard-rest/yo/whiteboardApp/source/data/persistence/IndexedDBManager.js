enyo.kind({
	name: "blanc.IndexedDBManager",
	kind: "blanc.PersistenceManager",
	database: null,
	init: function(success, error){
		window.indexedDB || (window.indexedDB = function(){
			return window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
		}(), window.IDBTransaction = function(){
			return window.webkitIDBTransaction || window.msIDBTransaction
		}(), window.IDBKeyRange = function(){
			return window.webkitIDBKeyRange || window.msIDBKeyRange
		}());
		try {
			var that = this,
				db = window.indexedDB.open("blancdb", 1);
			db.onerror = function(err){
				console.log(err.target.errorCode);
				error(err.target.error);
			};
			db.onsuccess = function(){
				that.database = db.result;
				success();
			};
			db.onupgradeneeded = function(e){
				var t = e.target.result;
				if(e.oldVersion < 1){
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
		} catch(e){

		}
	},
	storeUser: function(user, success, error){
		var trans = this.database.transaction(["users"], "readwrite"),
			objstore = trans.objectStore("users"),
			req = objstore.put(user);
		req.onsuccess = function(){};
		req.onerror = function(){
			error(req.error);
		};
		req.oncomplete = function(){
			success(user);
		}
	},
	updateUser: function(user, success, error){
		this.storeUser(user, success, error);
	},
	getUserById: function(userid, success, error){
		var n = this,
			trans = this.database.transaction(["users"], "readonly"),
			objstore = trans.objectStore("users"),
			req = objstore.get(userid);
		req.onsuccess = function(res){
			if(res.target.result){
				var usr = new bjse.api.users.User(res.target.result);
				success(usr);
			} else {
				error("not found");
			}
		};
		req.onerror = function(){
			error(req.error)
		}
	},
	deleteUser: function(userid, success, error){
		var trans = this.database.transaction(["users"], "readwrite"),
			objstore = trans.objectStore("users"),
			req = objstore["delete"](userid);
		req.onsuccess = function(){};
		req.onerror = function(){
			error && error(req.error);
		};
		req.oncomplete = function(){
			success && success(userid);
		}
	}
})