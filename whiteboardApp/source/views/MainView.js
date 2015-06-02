enyo.kind({
	name: "blanc.MainView",
	handlers: {
		// onSignin: "handleSignin",
		// onSignoutClicked: "signoutClicked",
		 onErrorAlert: "showError",
		// onAudioStarted: "audioStarted",
		// onAudioEnded: "audioEnded"
	},
	published: {
		orientation: null,
		menuModel: null,
		meetingModel: null
	},
	components: [{
		kind: "FittableRows",
		style: "width:100%;height:100%",
		components: [{
			classes: "status-bar"
		}, {
			fit: true,
			name: "container",
			classes: "container-view"
		}]
	}, {
		name: "errorAlert",
		kind: "blanc.Alert"
	}],
	create: function(){
		this.inherited(arguments);
		this.setMenuModel(new blanc.MenuModel);
	},
	rendered: function(){
		this.inherited(arguments);
		this.processSignin();
	},
	processSignin: function(){
		this.menuModel.processSignin();
		//this.meetingModel.reset();
		this.showApp();
	},
	showApp: function(){
		this.determineOrientation();
		this.$.container.destroyComponents();
		var comp = this.$.container.createComponent({
			name: "app",
			kind: "blanc.AppLarge",
			menuModel: this.getMenuModel(),
		//	meetingModel: this.getMeetingModel(),
			orientation: this.getOrientation()
		}, {
			owner: this.$.container
		});
		comp.render();
	},
	showError: function(e, t){
		var mes = t.message;
    	this.$.errorAlert.showMessage($L("Error"), mes, t.allowHtml);
	},
	determineOrientation: function(){
		var w = enyo.dom.getWindowWidth(), 
		    h = enyo.dom.getWindowHeight();
		   w / h < 1 ? this.setOrientation("portrait") : this.setOrientation("landscape");

	},
	handleOrientation: function(){
		var o = this.getOrientation();
		this.determineOrientation();
		if (o !== this.getOrientation()){
			this.windowRotated();
		}
	},
	windowRotated: function(){
		this.waterfallDown("onWindowRotated", {
			orientation: this.getOrientation()
		})
	},
	adjustBodyHeight: function(){
		if(enyo.platform.ios){
			var comp = this.hasNode(),
				h = comp.clientHeight();
				wh = enyo.dom.getWindowHeight();
			if( h != wh ){
				document.body.style.height = wh + "px";
				window.scrollTo(0,0);
			}
		}
	},
	resizeHandler: function(){
		if(this.$.container.$.app){
			this.handleOrientation();
			this.adjustBodyHeight();
		}
	}
})