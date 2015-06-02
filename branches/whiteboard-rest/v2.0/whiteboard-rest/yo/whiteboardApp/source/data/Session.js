enyo.kind({
	name: "blanc.Session",
	kind: "enyo.Object",
	statics: {
		MAX_FREE_PAGES: 6,
		SERVERURL: "http://localhost:8080/",
		APIPATH: "/manage/api",
		APP_ID: "3242",
		APP_SECRET: "434342",
		baseSession: null,
		deviceSize: "LARGE",
		meetingSession: null,
		premium: false,
		getServerUrl: function(){
			return this.SERVERURL;
		},
		getBaseSession: function(){
    		return this.baseSession || (this.baseSession = new bjse.api.Session(this.getRuntime(), this.getDevice(), this.APP_ID, this.APP_SECRET)), this.baseSession;
    	},
    	getRuntime: function(){
    		return this.runtime || (this.runtime = new bjse.api.Runtime(this.SERVERURL + this.APIPATH)), this.runtime;
    	},
    	getPersistenceManager: function() {
            return null == this.persistenceManager && (this.persistenceManager = enyo.platform.ios || enyo.platform.safari || enyo.platform.androidChrome 
            	? new blanc.WebSQLManager 
            	: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB 
            		? new blanc.IndexedDBManager 
            		: new blanc.WebSQLManager), this.persistenceManager
        },
        getUserDirectory: function(){
            return this.getBaseSession().getUserDirectory();
        },
		isMobile: function(){
    		return enyo.platform.ios || enyo.platform.android || enyo.platform.androidChrome || enyo.platform.windowsPhone
    	},
    	isTablet: function(){
    		return this.isMobile() && "LARGE" === this.getDeviceSize();
    	},
    	getDevice: function(){
    		return new bjse.api.devices.Device({
    			id: blanc.Session.getDeviceId(),
    			ownerid: this.getUserId(),
    			platformType: "WEB",
    			platformVersion: 2,
    			model: blanc.Session.guessModel()
    		})
    	},
        getDeviceId: function(){
            var e = localStorage.getItem("blanc_deviceid");
            return e || (e = bjse.util.randomUUID(), localStorage.setItem("blanc_deviceid",e)), e
        },
    	guessModel: function(){
    		enyo.platform.ios 
    		? "iOS Safari" 
    		: enyo.platform.androidChrome 
    			? "Android Chrome" 
    			: enyo.platform.safari 
    				? "Safari" 
    				: enyo.platform.android 
    					? "Android" 
    					: enyo.platform.chrome 
    						? "Chrome" 
    						: enyo.platform.anroidFirefox 
    							? "Android Firefox" 
    							: enyo.platform.firefox 
    								? "Firefox" 
    								: enyo.platform.ie 
    									? "Windows IE" 
    									: "Webapp"
      
    	},
    	getUserId: function() {
            return localStorage.getItem("blanc_userid")
        },
        setUserId: function(e) {
            localStorage.setItem("blanc_userid", e)
        },
    	getDeviceSize: function(){
    		return this.deviceSize;
    	},
    	setDeviceSize: function(e){
    		this.deviceSize = e;
    	},
    	getUserInfo: function(success, error){
    		var pers = blanc.Session.getPersistenceManager();
    		pers.getUserById("23422", success, error);
    	}
	}

})