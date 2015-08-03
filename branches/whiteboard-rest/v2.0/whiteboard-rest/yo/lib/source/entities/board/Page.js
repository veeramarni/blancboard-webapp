bjse.api.board = bjse.api.board || {};

bjse.api.board.Page = function(props){
	this.id = "";
	this.assetid = "";
	this.meetingid = "";
	this.previewid = "";
	this.thumbid = "";
	this.contentType = "";
	this.title = "";
	this.pageNo = 0;
	this.width = 0;
	this.height = 0;
	this.contentWidth = 0;
	this.contentHeight = 0;
	this.contentUrl = "";
	bjse.util.mixin(this,props);

}