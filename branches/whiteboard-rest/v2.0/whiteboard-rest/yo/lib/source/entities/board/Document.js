bjse.api.board = bjse.api.board || {};

bjse.api.board.Document = function(props){
	this.id = "";
	this.title = "";
	this.contentType = "";
	this.type = "";
	this.state = "";
	this.currentPageNo = "";
	this.timeCreated = "";
	this.timeModified = "";
	this.contentUrl = "";
	this.previewUrl = "";
	this.thumnailUrl = "";
	this.ownerid= "";
	this.shared= false;
	this.cached = false;
	bjse.util.mixin(this,props);
}