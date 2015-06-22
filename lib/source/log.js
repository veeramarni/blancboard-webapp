/**
 * Logging
 */
var logIncoming = function(data) {
        console.log("INCOMING: " + data);
    },
    logOutgoing = function(data) {
        console.log("OUTGOING: " + data);
    },
    logProfile = function(timestamp) {
        //	var curDate = new Date();
        //	log
        //			.profile("TIME BETWEEN BROADCASTING AND RECEIVING: "
        //					+ (curDate.getTime() + curDate.getTimezoneOffset() * 60000 - timestamp)
        //					+ " ms"); 
    },
    logDebug = function(msg) {
        console.log(msg);
    },
    logError = function(msg) {
        console.error(msg);
    },
    logInfo = function(msg) {
        console.info(msg);
    };