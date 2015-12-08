bjse.api.board = bjse.api.board || {};

bjse.api.board.Element = function(el, pageId, assetId){
	this.type = el.type;
	this.properties = el.properties;
	this.properties.assetId = assetId;
	this.properties.pageId = pageId;
}