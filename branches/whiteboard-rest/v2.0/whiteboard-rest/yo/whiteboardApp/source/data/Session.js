enyo.kind({
    name: "blanc.Session",
    kind: "enyo.Object",
    statics: {
        MAX_FREE_PAGES: 6,
        SERVERURL: "http://localhost:8080/",
        APIPATH: "v1.0",
        APP_ID: "353b302c44574f565045687e534e7d6a",
        APP_SECRET: "286924697e615a672a646a493545646c",
        baseSession: null,
        deviceSize: "LARGE",
        conferenceSession: null,
        premium: false,
        getServerUrl: function() {
            return this.SERVERURL;
        },
        getBaseSession: function() {
            return this.baseSession || (this.baseSession = new bjse.api.Session(this.getRuntime(), this.getDevice(), this.APP_ID, this.APP_SECRET)), this.baseSession;
        },
        getRuntime: function() {
            return this.runtime || (this.runtime = new bjse.api.Runtime(this.SERVERURL + this.APIPATH)), this.runtime;
        },
        getPersistenceManager: function() {
            return null == this.persistenceManager && (this.persistenceManager = enyo.platform.ios || enyo.platform.safari || enyo.platform.androidChrome ? new blanc.WebSQLManager : window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB ? new blanc.IndexedDBManager : new blanc.WebSQLManager), this.persistenceManager
        },
        getUserDirectory: function() {
            return this.getBaseSession().getUserDirectory();
        },
        isMobile: function() {
            return enyo.platform.ios || enyo.platform.android || enyo.platform.androidChrome || enyo.platform.windowsPhone
        },
        isTablet: function() {
            return this.isMobile() && "LARGE" === this.getDeviceSize();
        },
        isGuest: function() {
            return !this.isAuthenticated();
        },
        getDevice: function() {
            return new bjse.api.devices.Device({
                id: blanc.Session.getDeviceId(),
                ownerid: this.getUserId(),
                platformType: "WEB",
                platformVersion: 2,
                model: blanc.Session.guessModel()
            })
        },
        signin: function(email, password, success, error){
            var that = this;
            if (!email || !password){
                error();
                return void 0;
            }
            var clearWhenErr = function(e){
                try {
                    blanc.Session.clearCredentials();
                } catch (err){
                    error(err);
                }
            }, sync = function(user){
                that.setUserId(user.id);
                blanc.Session.getSyncManager().synchronize(function(){});
                success(user);
            };
            this.getRuntime().connect(email, password, this.APP_ID, this.APP_SECRET, this.getDevice(), function(session){
                that.baseSession = session;
                that.premium = session.user.accountType == bjse.api.users.AccountType.PREMIUM;
                //that.saveCredentials(session.user.id);
                var persist = blanc.Session.getPersistenceManager();
                persist.getUserById(session.user.id, function(){
                    //if user exists then update
                    persist.updateUser(session.user, sync, clearWhenErr);
                }, function(){
                    //fails if the user doesn't exist
                    persist.storeUser(session.user, sync, clearWhenErr)
                })
            }, clearWhenErr)
        },
        signinAsGuest: function(firstName, lastName, success, error){
            var that = this,
                complete = function(user){
                    that.setUserId(user.id);
                    success(user)
                };
            this.getRuntime().connectAsGuest(this.APP_ID, this.APP_SECRET, this.getDevice(), function(){
                var user = new bjse.api.users.User({
                    id: '',
                    firstName: firstName,
                    lastName: lastName,
                    displayName: enyo.macroize("${firstName} {$lastName}", firstName, lastName).trim()
                });
                that.user = user;
                that.premium = false;

            }, error)
        },
        signout: function(success, error){
            var that = this,
                complete = function(){
                    that.baseSession = null;
                    that.premium = false
                    var persist = blanc.Session.getPersistenceManager();
                    persist.deleteUser(blanc.Session.getUserId(), function(){
                        that.getSyncManager().clearTimestamp();
                        that.clearUserData();
                        persist.deleteAllDocuments(function(){
                            success();
                        },function(){
                        logError("failed to clear the document cache");
                        error();
                    }
                        )
                    }, error )
                }
                this.getBaseSession() ? this.getBaseSession().disconnect(complete, complete) : complete();
        },
        register: function(params, success, error){
            this.getRuntime().register(params, this.APP_ID, this.APP_SECRET, success, error);
        },
        getDeviceId: function() {
            var e = localStorage.getItem("blanc_deviceid");
            return e || (e = bjse.util.randomUUID(), localStorage.setItem("blanc_deviceid", e)), e
        },
        setConference: function(conference){
            this.conferenceSession = conference;
        },
        isConferenceActive: function(){
            return this.conferenceSession != null;
        },
        getConference: function(){
            return this.conferenceSession;
        },
        getConferenceManager: function(){
            return this.getBaseSession().getConferenceManager();
        },
        guessModel: function() {
            enyo.platform.ios ? "iOS Safari" : enyo.platform.androidChrome ? "Android Chrome" : enyo.platform.safari ? "Safari" : enyo.platform.android ? "Android" : enyo.platform.chrome ? "Chrome" : enyo.platform.anroidFirefox ? "Android Firefox" : enyo.platform.firefox ? "Firefox" : enyo.platform.ie ? "Windows IE" : "Webapp"

        },
        getUserId: function() {
            return localStorage.getItem("blanc_userid");
        },
        setUserId: function(e) {
            localStorage.setItem("blanc_userid", e);
        },
        setCurrentSessionDetails: function(session) {
            var ses = this.getCurrentSessionDetails();
            ses = ses || {};
            session = bjse.util.extend(ses, session);
            localStorage.setItem("current_session", JSON.stringify(session));
        },
        clearUserData: function(){
            localStorage.removeItem("blanc_session_userid");
        },
        getCurrentSessionDetails: function() {
            return JSON.parse(localStorage.getItem("current_session"));
        },
        getDeviceSize: function() {
            return this.deviceSize;
        },
        setDeviceSize: function(e) {
            this.deviceSize = e;
        },
        getUserInfo: function(success, error) {
            var pers = blanc.Session.getPersistenceManager();
            pers.getUserById(blanc.Session.getUserId(), success, error);
        },
        getToolbox: function() {
            return this.toolbox || (this.toolbox = new blanc.Toolbox, this.toolbox);
        },
        getSyncManager: function(){
            return this.syncManager || (this.syncManager = new blanc.SyncManager, this.syncManager);
        },
        getAssetManager: function(){
            return this.baseSession.getAssetManager();
        },
        isAuthenticated: function(){
            //return !!this.getBaseSession().username;
            return true;
        },
        isDrawing: function() {
            return this.getToolbox().isToolboxActive();
        },
        isDrawingEnabled: function() {
            return this.drawEngine !== undefined
        },
        getDrawEngine: function(drawOptions) {
            return this.drawEngine;
        },
        setDrawEngine: function(drawOptions) {
            this.drawEngine = $.DrawEngine;
            drawOptions = drawOptions || {};
            drawOptions.wbConfig = Configuration;
            drawOptions.logging = true;
            drawOptions.onLog = function(type, message) {
                logInfo(type + ": " + message);
            };
            this.drawEngine.setOptions(drawOptions);
            this.drawEngine.initWhiteboard();
        }
    }

})