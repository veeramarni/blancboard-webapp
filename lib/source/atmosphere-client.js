    /**
	 * Subscribes to bidirectional channel. This method will be called once the
	 * web-application is ready to use.
	 * 
	 * @public
	 */
    var socket = atmosphere,
        subSocket = null,
        request = {
            url: null,
            contentType: "application/json",
            logLevel: 'debug',
            transport: 'websocket',
            headers: {"X-Atmosphere-WebSocket-Proxy": "true"},
            timeout: -1,
            fallbackTransport: 'long-polling',
            enableProtocol: true,
            maxRequest: 100000000,
            attachHeadersAsQueryString: true,
            // enabling tracking on the client side. It should also added in the
            // server side in web.xml
            trackMessageLength: true
        };
        /**
     * Atmosphere's Request Error
     * 
     * @private
     * @param response
     */
    request.onError = function (response)
    {
        if(_self.manualPubsubState)
        {
            manualPubSubDef.reject();
            _self.manualPubsubState = false;
         return;
        }
        if(response.reasonPhrase != "maxReconnectOnClose reached")
        {
            logError("Error : with response state : " + response.state + " with reason : " + response.reasonPhrase);
            onOfflineConnection();
            alert("Your whiteboard session got disconnected due to " + response.reasonPhrase + " , please refresh your page");
        } else {
            if(_self.pubsubDef !== null){
                _self.pubsubDef.reject();
            }
            onOfflineConnection();
            logError("Atmophere error: "+ response.reasonPhrase);
        }
        if(_self.createType == "join"){
            paperGroup.deletePaperStack();
            $.DrawEngine.deleteElementStorage();
        }
    };
    /**
     * Atmosphere's Request Open
     * 
     * @private
     * @param response
     */
    request.onOpen = function (response)
    {
        if(_self.manualPubsubState)
            {
            return;
            }
        if(_self.pubsubDef !== null){
            _self.pubsubDef.resolve();
        }
        onOnlineConnection();
        if(_isWbStarted()){
         // if the user user is joiner
         if(_self.createType == "join")
             {
             joinWhiteboard();
             }else {
                 reloadallWhiteboard();
             }
             // notificate subscribers about new user
             joinUser(usersCount);
             // reload chat
             reloadAllChat();
             // reset
             _self.status = "inactive";
        } else{
            createWhiteboard();
        }
    };
    request.onFailureToReconnect = function (request, response)
    {
        onOfflineConnection();
        logError("Your whiteboard session got disconnected , please refresh your page");
    };
    request.onReopen= function (response) {
        logInfo("OnReopen response state");
    };
    request.onClientTimeout= function(request){
        logError("Client Timeout :")
    };
    request.onReconnect = function (request, response)
    {
        onOnlineConnection();
        logInfo("Atmosphere connection Reconnecting...");
    }
    
    request.onClose = function (response)
    {

        
        logInfo("On Close response state :" + response.state);
        if(response.state == "unsubscribe")
        {
            if(_self.manualPubsubState)
            {
                if(manualPubSubDef)
                manualPubSubDef.resolve();
                _self.manualPubsubState = false;
            return;
            }
            logInfo("The browser is closed");
            onOfflineConnection();
            if(_self.createType == "join"){
                paperGroup.deletePaperStack();
                $.DrawEngine.deleteElementStorage();
            }
        }
        else
        {
            logDebug("onClose is called. Status: "+response.status + " state: "+ response.state + " transport :" + response.transport + " reasonPhrase: "+ response.reasonPhras);
        }
    };

        /**
     * Callback method defined in subscribePubSub(). This method is always
     * called when new data (updates) are available on server side.
     * 
     * @public
     * @param response
     *            response object having state, status and sent data.
     */
    request.onMessage = function (response)
    {
        if(response.state != 'connected' && response.state != 'closed' && response.status == 200)
        {
            var data = response.responseBody,
                jsData;
            if(data.length > 0)
            {
                if(_self.logging)
                {
                    logIncoming(data);
                }
                // convert to JavaScript object
                var jsArray = WBUtility.parseToJson(data);
                if(jsArray === undefined)
                {
                    return;
                }
                for(var id =0 ; id < jsArray.length; id++)
                {
                    jsData = jsArray[id];
                    if(jsData == null){
                        return;
                    }
                    if(_self.logging)
                    {
                        logProfile(jsData.timestamp);
                    }
                    
                    var action = jsData.action,pageId = jsData.pageId;
                    if(jsData.senderId != null && jsData.senderId == _self.senderId)
                        {
                        if(action == "exit" || action == "leave"){
                            _self.unsubscribePubSub();
                            onOfflineConnection();
                        }
                        logDebug("Duplicate data. Ignoring it!")
                        return;
                        }
                    // cases when pageId is null for ex. "leave"
                    if(pageId !== undefined && pageId != null && paperGroup.getCurrentPageId() != pageId && action != "reloadPage")
                    {
                        paperGroup.smartPageChange(jsData.element,pageId,true);
                    }
                    var sentProps = (jsData.element != null ? jsData.element.properties : null);
                    switch(action)
                    {
                    case "chat":
                        logDebug(" Printing chat message :" + jsData.parameters.conversation + "from user " + jsData.parameters.userName);
                        ChatResource.getInstance()
                            .generateChatMessage(
                                jsData.parameters);
                        break;
                    case "privDoc":
                        Slideshare.getInstance()
                            .slideTrigger(jsData.parameters);
                        if(jsData.parameters.header["sendState"] == "completed"){
                            if(_self.manualPubsubState){
                                manualPubSubDef.resolve();
                            }
                        }
                        break;
                    case "notifyMessage":
                        if(jsData.parameters.errorCode == "atm-600"){
                            alert("Sorry, online session is disconnected!");
                            // whiteboard doesn't exist
                            onOfflineConnection();
                            _self.unsubscribePubSub();
                            return;
                        }
                        var sage = {};
                        sage.summary = jsData.parameters.notifySummary;
                        sage.detail = jsData.parameters.notifyDetail;
                        ErrorBox.getInstance()
                            .notify(jsData.parameters.status,
                                sage);
                        break;
                    case "pageChange":
                    case "pageCreate":
                        paperGroup.setCurrentPage(pageId, true);
                        break;
                    case "pageRemove":
                        paperGroup.removePage(jsData.parameters.remPageId);
                        break;
                    case "join":
                        Participant.joinUser(jsData.parameters);
                        break;
                    case "leave":
                        Participant.leaveUser(jsData.parameters.senderId);
                        if(jsData.parameters.disconnect)
                            {
                            onOfflineConnection();
                            _self.unsubscribePubSub();
                            }
                        break;
                    case "replace": // replace is used only for Document, to
                        // replace
                        // the previous slide
                    case "create":
                    case "clone":
                        $.DrawEngine.createElement(sentProps, jsData.element.type,
                            jsData.element.properties.orderNo, false, true);
                        break;
                    case "update":
                        $.DrawEngine.updateElement(sentProps, jsData.element.type);
                        break;
                    case "remove":
                        $.DrawEngine.removeElement(sentProps.uuid, false, true);
                        break;
                    case "toFront":
                        $.DrawEngine.bringFrontElement(sentProps.uuid,
                            jsData.element.properties.orderNo, false, true);
                        break;
                    case "toBack":
                        $.DrawEngine.bringBackElement(sentProps.uuid,
                            jsData.element.properties.orderNo, false, true);
                        break;
                    case "clear":
                        $.DrawEngine.clearWhiteboard();
                        break;
                    case "resize":
                        var width = jsData.parameters.width;
                        var height = jsData.parameters.height;
                        whiteboard.css(
                        {
                            width: width + 'px',
                            height: height + 'px'
                        });
                        paperGroup.getCurrentPaper()
                            .setSize(parseInt(width),
                                parseInt(height));
                        break;
                    case "reload":
                        if(jsData.parameters.elementsAsJSon && !WBUtility.isBlankObject(jsData.parameters.elementsAsJSon.elementByPage))
                        {
                            _self.restoreWhiteboard(jsData.parameters.elementsAsJSon);
                        }
                        break;
                    case "reloadall":
                        var jsElement ;
                        if(jsData.parameters.elementsAsJSon && !WBUtility.isBlankObject(jsData.parameters.elementsAsJSon.elementByPage)){
                            _self.restoreWhiteboard(jsData.parameters.elementsAsJSon);
                        }
                        startSharing(jsData.parameters.creatorId,jsData.parameters.UserData);
                        break;
                    case "reloadChat":
                        if(jsData.parameters.UserChat.length > 0)
                        ChatResource.getInstance().chatpost(jsData.parameters.UserChat);
                        break;
                    case "reloadPage":
                        uploadPage(pageId);
                        break;
                    case "share":
                        if(jsData.parameters.participantId == _self.senderId)
                        {
                            if(jsData.parameters.shareStatus == "enable")
                            {
                                // unblockToolbar();
                            }
                            else
                            {
                                // blockToolbar();
                            }
                        }
                        break;
                    case "videoConfStatus":
                        VideoConf.videoToggle(jsData.parameters.status,jsData.parameters.vcsessionId );
                        break;
                    default:
                    }
                    // show new message in the event monitoring pane
                    // prependMessage(jsData.message);
                }
            }
        }
    };