/**
 * Created by veeramarni on 12/9/15.
 */
enyo.kind({
  name: "AppConfig",
  statics: {
    SERVER_URL: "@@baseUrl",
    API_PATH: "@@apiVersion",
    APP_ID: "@@appId",
    APP_SECRET: "@@appSecret",
    OPENTOK_API_KEY: "@@openTokApiKey",
    OPENTOK_SESSION_KEY: "@@openTokSessionId",
    OPENTOK_TOKEN: "@@openTokToken"
  }
});
