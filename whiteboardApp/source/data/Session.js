enyo.kind({
    name: "blanc.Session",
    kind: "enyo.Object",
    statics: {
        MAX_FREE_PAGES: 6,
        baseSession: null,
        deviceSize: "LARGE",
        conferenceSession: null,
        urlParams: null,
        premium: false,
        getServerUrl: function() {
            return AppConfig.SERVER_URL;
        },
        getBaseSession: function() {
            return this.baseSession || (this.baseSession = new bjse.api.Session(this.getRuntime(), this.getDevice(), AppConfig.APP_ID, AppConfig.APP_SECRET)), this.baseSession;
        },
        getRuntime: function() {
            return this.runtime || (this.runtime = new bjse.api.Runtime(AppConfig.SERVER_URL + AppConfig.API_PATH)), this.runtime;
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
        isFullScreenSupported: function(){
            // TO DO
            return false;
        },
        getDevice: function() {
            return new bjse.api.devices.Device({
                id: blanc.Session.getDeviceId(),
                ownerId: this.getUserId(),
                platformType: "WEB",
                platformVersion: 2,
                model: blanc.Session.guessModel()
            })
        },
        connect: function(email, success, error) {
            var that = this;
            if (!email) {
                error();
                return void 0;
            }
            var clearWhenErr = function(e) {
                    try {
                        blanc.Session.clearUserData();
                        error(e);
                    } catch (err) {
                        error(e);
                        logError(err);
                    }
                },
                sync = function(user) {
                    that.setUserId(user.id);
                    blanc.Session.getSyncManager().synchronize(function() {});
                    success(user);
                };
            this.getRuntime().connect(email, AppConfig.APP_ID, AppConfig.APP_SECRET, this.getDevice(), function(session) {
                that.baseSession = session;
                that.premium = session.user.accountType == bjse.api.users.AccountType.PREMIUM;
                //that.saveCredentials(session.user.id);
                var persist = blanc.Session.getPersistenceManager();
                persist.getUserById(session.user.id, function() {
                    //if user exists then update
                    persist.updateUser(session.user, sync, clearWhenErr);
                }, function() {
                    //fails if the user doesn't exist
                    persist.storeUser(session.user, sync, clearWhenErr)
                })
            }, clearWhenErr)
        },
        signinAsGuest: function(firstName, lastName, success, error) {
            var that = this,
                complete = function(user) {
                    that.setUserId(user.id);
                    success(user)
                };
            this.getRuntime().connectAsGuest(this.getDevice(), AppConfig.APP_ID, AppConfig.APP_SECRET, function(session) {
                var user = new bjse.api.users.User({
                    id: session.device.id,
                    firstName: firstName,
                    lastName: lastName,
                    displayName: enyo.macroize("{$firstName} {$lastName}", {
                        firstName: firstName,
                        lastName: lastName
                    }).trim()
                });
                session.user = user;
                that.baseSession = session;
                that.premium = false;
                //upload to the database
                var persist = blanc.Session.getPersistenceManager();
                persist.getUserById(user.id, function() {
                    persist.updateUser(user, complete, error)
                }, function() {
                    //if user don't exist it will execute below code
                    persist.storeUser(user, complete, error)
                })

            }, error)
        },
        refreshSession: function(success, error) {
            if (!this.getUserId) {
                error();
                return void 0;
            }
            var that = this;
            this.getRuntime().refresh(this.getUserId(), AppConfig.APP_ID, AppConfig.APP_SECRET, this.getDevice(), function(session) {
                var persist = blanc.Session.getPersistenceManager();
                that.baseSession = session;
                persist.updateUser(session.user, function() {
                    blanc.Session.getSyncManager().synchronize(function() {});
                    success(session.user);
                }, error);
            }, error)

        },
        signout: function(success, error) {
            var that = this,
                complete = function() {
                    that.baseSession = null;
                    that.premium = false
                    var persist = blanc.Session.getPersistenceManager();
                    persist.deleteUser(blanc.Session.getUserId(), function() {
                        that.getSyncManager().clearTimestamp();
                        that.clearUserData();
                        persist.deleteAllDocuments(function() {
                            success();
                        }, function() {
                            logError("failed to clear the document cache");
                            error();
                        })
                    }, error)
                }
            this.getBaseSession() ? this.getBaseSession().disconnect(complete, complete) : complete();
        },
        register: function(params, success, error) {
            this.getRuntime().register(params, AppConfig.APP_ID, AppConfig.APP_SECRET, success, error);
        },
        login: function(params, success, error) {
            this.getRuntime().login(params, AppConfig.APP_ID, AppConfig.APP_SECRET, success, error);
        },
        getDeviceId: function() {
            var e = localStorage.getItem("blanc_deviceId");
            return e || (e = bjse.util.randomUUID(), localStorage.setItem("blanc_deviceId", e)), e
        },
        setConferenceSession: function(conference) {
            this.conferenceSession = conference;
        },
        isConferenceActive: function() {
            return this.conferenceSession != null;
        },
        getConferenceSession: function() {
            return this.conferenceSession;
        },
        getConferenceManager: function() {
            return this.getBaseSession().getConferenceManager();
        },
        guessModel: function() {
            enyo.platform.ios ? "iOS Safari" : enyo.platform.androidChrome ? "Android Chrome" : enyo.platform.safari ? "Safari" : enyo.platform.android ? "Android" : enyo.platform.chrome ? "Chrome" : enyo.platform.anroidFirefox ? "Android Firefox" : enyo.platform.firefox ? "Firefox" : enyo.platform.ie ? "Windows IE" : "Webapp"

        },
        getUrlParams: function() {
            return null == this.urlParams && (this.urlParams = bjse.util.getUrlParams()), this.urlParams
        },
        getSavedJoinId: function() {
            return localStorage.getItem("blanc_joinId");
        },
        unsetJoinId: function() {
            localStorage.removeItem("blanc_joinId");
        },
        setJoinId: function(joinId) {
            localStorage.setItem("blanc_joinId", joinId);
        },
        getUserId: function() {
            return localStorage.getItem("blanc_userId");
        },
        setUserId: function(e) {
            localStorage.setItem("blanc_userId", e);
        },
        setCurrentUrn: function(urn) {
            localStorage.setItem("current_URN", urn);
        },
        unsetCurrentUrn: function() {
            localStorage.removeItem("current_URN");
        },
        clearUserData: function() {
            localStorage.removeItem("blanc_userId");
        },
        getCurrentUrn: function() {
            return bjse.api.URN.parse(localStorage.getItem("current_URN"));
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
        getSyncManager: function() {
            return this.syncManager || (this.syncManager = new blanc.SyncManager, this.syncManager);
        },
        getAssetManager: function() {
            return this.getBaseSession().getAssetManager();
        },
        isAuthenticated: function() {
            return null != this.getUserId();
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
