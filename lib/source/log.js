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
        console.log(msg);
    },
    logInfo = function(msg) {
        console.info(msg);
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
