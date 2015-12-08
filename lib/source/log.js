/**
 * Logging
 */
var logIncoming = function(data) {
     //   console.log("INCOMING: " + data);
     log.info("INCOMING: " + data);
    },
    logOutgoing = function(data) {
    //   console.log("OUTGOING: " + data);
        log.info("OUTGOING: " + data);
    },
    logProfile = function(timestamp) {
        	var curDate = new Date();
        	log
        			.profile("TIME BETWEEN BROADCASTING AND RECEIVING: "
        					+ (curDate.getTime() + curDate.getTimezoneOffset() * 60000 - timestamp)
        					+ " ms"); 
    },
    logDebug = function(msg) {
    //    console.log(msg);
        log.debug(msg);
    },
    logError = function(msg) {
    //    console.log(msg);
        log.error(msg);
    },
    logWarn = function(msg) {
     //   console.log(msg);
        log.warn(msg);
    },
    logInfo = function(msg) {
     //   console.info(msg);
        log.info(msg);
    };
/**
* Error
*/
bjse.api.errors = {};
// Server send errors in the below format
bjse.api.errors.error = function(err){
    this.applicationMessage= null;
    this.errorMessage = null;
    this.consumerMessage= null;
    this.errorHeader = null;
    this.errorCode= null;
    //validationErrors: [{"propertyName":"password.password","propertyValue":"testing","message":"length must be between 8 and 30"}]
    this.validationErrors = [];
    bjse.util.mixin(this, err);
};
