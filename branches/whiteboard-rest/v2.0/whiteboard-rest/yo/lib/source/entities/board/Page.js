bjse.api.board = bjse.api.board || {};

bjse.api.board.Page = function(props){
	this.id = "";
	this.assetId = "";
	this.previewId = "";
	this.thumbId = "";
	this.previewUrl = null;
	this.thumbUrl = null;
	this.contentUrl = "";
	this.mimeType = "";
	this.width = 0;
	this.height = 0;
	this.contentHeight = 0;
	this.contentWidth = 0;
	this.pageNo = 0;
	this.pageExtension = "";
	this.title = "";
	this.data = "";
	bjse.util.mixin(this,props);

}