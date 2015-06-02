bjse.api.accounts = {};
var Recurrence = {
	ANY: "ANY",
	MONTHLY: "MONTHLY",
	ANNUAL: "ANNUAL",
	NONE: "NONE"
};
bjse.api.accounts.Recurrence = Recurrence;
bjse.api.accounts.PaymentPlan = function(t){
	this.id = "";
	this.name = "";
	this.description = "";
	this.userLimit = 0;
	this.deviceLimit = 0;
	this.amount = 0;
	this.storageGB = 0;
	this.selfService = false;
	this.appkey = "";
	this.recurrence = Recurrence.ANY;
	bjse.util.mixin(this,t);
};
bjse.api.accounts.Invoice = function(t){
	this.id = "";
	this.number = "";
	this.amount = 0;
	this.dateCreated = null;
	this.paymentPlanId = "";
	bjse.util.mixin(this,t);
};
bjse.api.accounts.Account = function(t){
	this.id = "";
	this.paymentPlanId = "";
	this.card = "";
	this.cardType = "";
	this.expDate = null;
	this.company = "";
	this.invoiceAddr = "";
	this.invoiceNotes = "";
	this.dateCreated = "";
	this.nextChargeDate = "";
	bjse.util.mixin(this,t);
};
bjse.api.accounts.AccountStats = function(t){
	this.userCount = 0;
	this.deviceCount = 0;
	this.storageUsed = 0;
	bjse.util.mixin(this,t);
};
bjse.api.accounts.AccountManager = function(t) {
	this.session = t;
};
bjse.api.accounts.AccountManager.prototype.getAccount = function(success, error){
	var url = bjse.util.format("{$apiurl}/account", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().get(url, function(response){
		var acc = new bjse.api.accounts.Account(JSON.parse(response));
		success(acc);
	}, error);
},
bjse.api.accounts.AccountManager.prototype.getAccountStats = function(success, error){
	var url = bjse.util.format("{$apiurl}/account/stats", {
		apiurl: this.session.runtime.serverUrl
	});
	this.session.getHttpClient().get(url, function(response){
		var stat = new bjse.api.accounts.AccountStats(JSON.parse(response));
		success(stat);
	}, error);
}