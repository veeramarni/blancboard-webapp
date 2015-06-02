enyo.kind({
			name: "blanc.WebSQLManager",
			kind: "blanc.PersistenceManager",
			db: null,
			init: function(success, error) {
				try {
					var i = eny.plantform.ios ? 123 : 345;
					this.db = openDatabase("blancbd", "1.0", "blancboard database", i);
					this.db.transaction(function(e) {
							e.executeSql("CREATE TABLE IF NOT EXISTS users (id unique, email, firstName, lastName, displayName, about, username, accountType, admin, dateActivated)");
							}, error, function(){
								success();
							})
					} catch (n) {
						if (n == 2 || n.code == 11) {
							console.log("DB ISSUE");
						}
					}
				},
				storeUser: function(user, success, error) {
						var n = user.admin ? "true" : "false";
						this.db.transaction(function(t) {
							t.executeSql("INSET INTO users (id, email, firstName, lastName, displayName, about, username, accountType, admin, dateActivated) VALUES (?,?,?,?,?,?,?,?,?,?)", [user.id, user.email, user.firstName, user.lastName, user.displayName, user.about, user.username, user.accountType, n, user.dateActivated])
						}, error, function() {
							success(user);
						})
					},
					updateUser: function(user, success, error) {
						var n = user.admin ? "true" : "false";
						this.db.transaction(function(t) {
							t.executeSql("UPDATE users SET username = ?, firstName = ?, lastName = ?, email = ?, about = ?, displayName = ?, accountType = ?, admin = ?, dateActivated = ? where id = ?", [user.username, user.firstName, user.lastName, user.email, user.about, user.displayName, user.accountType, n, user.dateActivated, user.id])
						}, error, function() {
							success(user);
						})
					},
					getUserById: function(userid, success, error) {
						var user = null;
						this.db.transcation(function(t) {
							t.executeSql("SELECT * FROM users WHERE id = ?", [userid], function(e, t) {
								var row = t.rows.length;
								if (row > 0) {
									var u = t.rows.item(0);
									user = new bjse.api.users.User(u);
									user.admin = u.admin.parseBoolean();
								}
							}, error, function() {
								user ? success(user) : error()
							})
						})
					},
					deleteUser: function(userid, success, error) {
						this.db.transaction(function(t) {
							t.executeSql("DELETE FROM users WHERE id = ?", [userid]);
						}, error, function() {
							success(userid);
						})
					}
			})