bjse.api.users = {};
var AccountType = {
	FREE: "FREE",
	PREMIUM: "PREMIUM",
	ANY: "ANY"
}
bjse.api.users.AccountType = AccountType;
bjse.api.users.User = function(user){
	this.id = "";
	this.emailAddress = "";
	this.name = "";
	this.firstName = "";
	this.lastName = "";
	this.displayName = "";
	this.avatarUrl = "";
	this.about = "";
	this.accountType = AccountType.FREE;
	this.accountId = "";
	this.admin = false;
	bjse.util.mixin(this, user);
};
bjse.api.users.UserDirectory = function(session){
	this.session = session;
};
bjse.api.users.UserDirectory.prototype.getUser = function(userId, success, error){
	var url = bjse.util.format("{$apiurl}/users/{$userId}",{
		apiurl: this.session.runtime.serverUrl,
		userId: userId
	});
	this.session.getHttpClient().getAuth(url, '', function(response){
		var user = new bjse.api.users.User(response);
		success(user);
	}, error);
};
bjse.api.users.UserDirectory.prototype.updateUser = function(userId, updatedUser, success, error){
	var url = bjse.util.format("{$apiurl}/users/{$userId}", {
		apiurl: this.session.runtime.serverUrl,
		userId: userId
		}),
		that = this;
	this.session.getHttpClient().putAuth(url,updatedUser, function(response){
		var user = new bjse.api.users.User(response);
		 	that.session.username = user.publicId;
		 success(user);
	}, error);
};
bjse.api.users.UserDirectory.prototype.getUsers = function(success, error){
	var url = bjse.util.format("{$apiurl}/users", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().getAuth(url, function(data){
		var users = [];
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
bjse.api.users.UserDirectory.prototype.deleteUser = function(userId, success, error) {
	var url = bjse.util.format("{$apiurl}/users/{$userId}", {
		apiurl: this.session.runtime.serverUrl,
		userId: userId
	});
	this.session.getHttpClient().del(url, {}, success, error);
};
bjse.api.users.UserDirectory.prototype.recoverPassword = function(data, success, error){
	var url = bjse.util.format("{$apiurl}/password", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().post(url, data, success, error)
};
bjse.api.users.UserDirectory.prototype.resetPassword = function(data, success, error){
	var url = bjse.util.format("{$apiurl}/password/{$token}",{
		apiurl: this.session.runtime.serverUrl,
		token: data.token
	});
	this.session.getHttpClient().post(url, data, function(response){
		var user = new bjse.api.users.User(JSON.parse(response));
		success(user);
	}, error)
};