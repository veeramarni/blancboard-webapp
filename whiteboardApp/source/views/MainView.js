enyo.kind({
	name: "blanc.MainView",
	handlers: {
		 onSignin: "handleSignin",
		 onSignoutClicked: "signoutClicked",
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
		this.setMeetingModel(new blanc.MeetingModel);
	},
	rendered: function(){
		this.inherited(arguments);
		this.processSignin();
	},
	processSignin: function(){
		this.menuModel.processSignin();
		this.meetingModel.reset();
		this.showApp();
	},
	handleSignin: function(sender, event){
		this.processSignin();
		this.waterfallDown("onProcessSignin", event);
	},
	signoutClicked: function(){
		var comp = this.createComponent({
			name: "confirm",
			kind: "blanc.ConfirmDialog",
			onYes: "signout",
			title: $L("Sign Out"),
			message: $L("Are you sure you want to sign out?")
		}, {
			owner: this
		});
		comp.show();
	},
	signout: function(){
		var that = this;
		blanc.Session.signout(function(){
			that.processSignout();
		}, function(err){
			logError(err);
		})
		return true;
	},
	processSignout: function(){
		this.$.container.destroyComponents();
		this.menuModel.processSignout();
		var comp = this.$.container.createComponent({
			name: "signinForm",
			kind: "blanc.SigninForms"
		}, {
			owner: this.$.container
		});
		comp.render();
	},
	showApp: function(){
		var kind = blanc.Session.getDeviceSize() == "LARGE" ? "blanc.AppLarge" : "blanc.AppSmall";
		this.determineOrientation();
		this.$.container.destroyComponents();
		var comp = this.$.container.createComponent({
			name: "app",
			kind: kind,
			menuModel: this.getMenuModel(),
			meetingModel: this.getMeetingModel(),
			orientation: this.getOrientation()
		}, {
			owner: this.$.container
		});
		comp.render();
	},
	showError: function(sender, event){
		if(/\bValidation Error\b/.test(event.consumerMessage) && event.validationErrors.length > 0){
			 var text, val = event.validationErrors;
			for(var i=0; i < val.length; i++){
				var message =  val[i].propertyName + " : " + val[i].message + "\n";
				text = text ? text + message : message;
			}
		}
		var err = $L(event.applicationMessage), title = $L(event.consumerMessage) + "\n";
    	this.$.errorAlert.showMessage(title, err, true, text);
	},
	determineOrientation: function(){
		var w = enyo.dom.getWindowWidth(), 
		    h = enyo.dom.getWindowHeight();
		   w / h < 1 ? this.setOrientation("portrait") : this.setOrientation("landscape");

	},
	determineDeviceSize: function(){
		var w, h;
		window.screen.width && window.screen.height ? (w = window.screen.width, h = window.screen.heigth) : (w = enyo.dom.getWindowWidth, h = enyo.dom.getWindowHeight);
		blanc.Session.setDeviceSize(window.matchMedia("(min-width: 768px)").matches ? "LARGE" : "SMALL");
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
	checkForUpdate: function(){
		var that = this;
		window.applicationCache.addEventListener("updateready", function(){
			var comp = that.createComponent({
				kind: "blanc.ConfirmDialog",
				args: {},
				onYes: "applyUpdate",
				message: $L("An update is available for this application")
			}, {
				owner: that
			});
			comp.show();
		}, false)
	},
	applyUpdate: function(){
		window.applicationCache.swapCache();
		window.location.reload();
	},
	resizeHandler: function(){
		if(this.$.container.$.app){
			this.handleOrientation();
			this.adjustBodyHeight();
		}
	}
})