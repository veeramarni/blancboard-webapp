bjse.api.URN = function(urn){
	this.scheme = "";
	this.location = "";
	bjse.util.mixin(this, urn);
}
bjse.api.URN.prototype.toString = function(){
	return bjse.util.format("{$scheme}:{$location}", this)
}
bjse.api.URN.parse = function(urn){
	if(!urn)
		return null;
	var s = urn.split(":");
	return new bjse.api.URN({scheme: s[0], location: s[1]})
}
bjse.api.URN.prototype.isEqualTo = function(urn){
	return null != urn && this.scheme === urn.scheme && this.location === urn.location
}
bjse.api.URN.prototype.equals = function(urn){
	return urn ? this == urn : false
}