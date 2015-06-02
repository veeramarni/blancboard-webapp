bjse.api.users = {};
var AccountType = {
	FREE: "FREE",
	PREMIUM: "PREMIUM",
	ANY: "ANY"
}
bjse.api.users.AccountType = AccountType;
bjse.api.users.User = function(user){
	this.id = "";
	this.email = "";
	this.username = "";
	this.firstName = "";
	this.lastName = "";
	this.displayName = "";
	this.avatarUrl = "";
	this.password = "";
	this.about = "";
	this.accountType = AccountType.FREE;
	this.accountid = "";
	this.admin = false;
	bjse.util.mixin(this, user);
};
bjse.api.users.UserDirectory = function(session){
	this.session = session;
};
bjse.api.users.UserDirectory.prototype.getUser = function(userid, success, error){
	var url = bjse.util.format("{$apiurl}/users/{$userid}",{
		apiurl: this.session.runtime.serverUrl,
		userid: userid
	});
	this.session.getHttpClient().get(n, {}, function(response){
		var user = new bjse.api.users.User(JSON.parse(response));
		success(user);
	}, error);
};
bjse.api.users.UserDirectory.prototype.updateUser = function(userid, updatedUser, success, error){
	var url = bjse.util.format("{$apiurl}/users/{$userid}", {
		apiurl: this.session.runtime.serverUrl,
		userid: userid
		}),
		s = this;
	this.session.getHttpClient().post(url,updatedUser, function(response){
		var user = new bjse.api.users.User(JSON.parse(response));
		 if(s.session.user.id === user.id){
		 	s.session.user = user;
		 	s.session.username = user.email;
		 }
		 success(user);
	}, error);
};
bjse.api.users.UserDirectory.prototype.getUsers = function(success, error){
	var url = bjse.util.format("{$apiurl}/users", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().get(url, function(response){
		var data = JSON.parse(response),
			users = [];
		if(bjse.util.isArray(data.user)){
			for(var i = 0; i < data.user.length; i++){
				users.push(new bjse.api.users.User(data.user[i]));
			}
		} else {
			users.push(new bjse.api.users.User(data.user));
		}
		success(users);
	}, error)
};
bjse.api.users.UserDirectory.prototype.deleteUser = function(userid, success, error) {
	var url = bjse.util.format("{$apiurl}/users/{$userid}", {
		apiurl: this.session.runtime.serverUrl,
		userid: userid
	});
	this.session.getHttpClient().del(url, {}, success, error);
};
bjse.api.users.UserDirectory.prototype.recoverPassword = function(data, success, error){
	var url = bjse.util.format("{apiurl}/recover", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().post(url, data, success, error)
};
bjse.api.users.UserDirectory.prototype.resetPassword = function(data, success, error){
	var url = bjse.util.format("{apiurl}/reset",{
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().post(url, data, function(response){
		var user = new bjse.api.users.User(JSON.parse(response));
		success(user);
	}, error)
};