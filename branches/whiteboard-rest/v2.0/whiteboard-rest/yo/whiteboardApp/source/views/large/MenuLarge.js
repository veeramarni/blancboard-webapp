enyo.kind({
	name: "blanc.MenuLarge",
	kind: "blanc.Menu",
	init: function(menuModel,orientation){
		this.setMenuModel(menuModel);
		this.setOrientation(orientation);
		enyo.forEach(this.getComponents(), function(e){
			if(e.kind === "blanc.ButtonGroup"){
				e.destory();
			}
		})
	},
	render: function(){
		enyo.forEach(this.getComponents(), function(e){
			if(e.kind === "blanc.ButtonGroup"){
				e.render();
			}
		})
	},
	update: function(){
		enyo.forEach(this.getComponents(), function(e){
			if(e.kind === "blanc.ButtonGroup"){
				e.update();
			}
		})
	}
})