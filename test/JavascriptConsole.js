var _transferredData = function(actionType, board, parameters, arayParams){
	var returnObj = {};
	returnObj.clientActionType = actionType;
	if(arguments[1]){
		returnObj.board = board;
	}
	if(arguments[2]){
		returnObj.parameters = parameters;
	}
	if(arguments[3]){
		returnObj.arrayParameters = arrayParams
	}
	return returnObj;
};
console.dir(_transferredData("type", "parameters"));
