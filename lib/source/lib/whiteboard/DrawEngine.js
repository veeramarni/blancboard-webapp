/**
 * DrawEngine is a wrapper to Raphael to assist touch and drawing.
 *
 * Depenendent Lib: Raphael, JQuery(will need to replace few fuction to avoid
 * depneding on jquery, only Text function depends on Jquery)
 *
 * version: 1.0.1
 * @author Veera
 */
jQuery.DrawEngine = (function() {
    var _modeSwitcher, _newProperties, _selectedObj, _ft;

    function _initVariables() {
        /**
         * Action mode.
         *
         * @private
         * @type object
         */
        _modeSwitcher = {
            "textMode": false,
            "freeLineMode": false,
            "straightLineMode": false,
            "rectangleMode": false,
            "circleMode": false,
            "ellipseMode": false,
            "documentMode": false,
            "imageMode": false,
            "iconMode": false,
            "selectMode": false,
            "moveMode": false,
            "bringFrontMode": false,
            "bringBackMode": false,
            "cloneMode": false,
            "removeMode": false,
            "resizeMode": false,
            "fillMode": false
        };
        /**
         * Change default properties
         *
         * @private
         * @type object
         */
        _newProperties = {
            "stroke-width": 3,
        };
        /**
         * Defining variables
         */
        _selectedObj = null;
        /**
         * Element order
         */
        _elementOrder = {
            "lowSeq": 10000, // default min
            "maxSeq": 10000
                // default max
        };
        /**
         * variable for transformation
         */
        _ft = null;
    }
    var _drawOptions = {
            //whiteboard can be null
            //whiteboard: null,
            isBroadcastable: false,
            paper: null,
            offset: null,
            wbConfig: null,
            // onLog function need to be set if it is set true
            logging: false
        },
        /** Cache state change to reduce number of callbacks **/
        cacheStatechange = {
            isUndoActive: false,
            isRedoActive: false,
            isClearDeactive: true
        },
        undoActionConvert = {
            create: "remove",
            update: "update",
            remove: "create",
            clone: "remove",
            toFront: "toBack",
            toBack: "toFront",
            clear: "restore"
        },
        _oldEl = {},
        _wbScroll = {
            x: 0,
            y: 0
        },
        win = Raphael._g.win,
        doc = win.document,
        hasTouch = "createTouch" in doc,
        M = "M",
        L = "L",
        R = "R",
        d = "d",
        COMMA = ",",
        // constant for waiting doodle stop
        INTERRUPT_TIMEOUT_MS = hasTouch ? 100 : 1,
        // offset for better visual accuracy
        CURSOR_OFFSET = hasTouch ? 0 : 0,
        active = false, // flag to check active doodling
        repath = false, // flag to check if a new segment starts
        touchable = false, // flag to check if mode selected is touchable
        // on whiteboard
        interrupt,
        path = "",
        initPath = "",
        lineEl, rectElement, circleElement, ellipseElement, e, left = 0,
        top = 0,
        scale = 1;

    function _invokeLogger(arg) {
        if (_drawOptions.logging)
            try {
                _drawOptions.onLog(arg.type, arg.message);
            } catch (e) {
                console.log("Logging is enable but onLog function is not defined");
            }
    };

    function _extend() {
        for (var i = 1; i < arguments.length; i++)
            for (var key in arguments[i])
                if (arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    };
    /**
     * Checks whether an JavaScript object is null or empty.
     *
     * @function
     * @param obj
     *            any JavaScript object
     */
    function _isBlankObject(obj) {
        if (obj == null) {
            return true;
        }
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    };
    /**
     * Converts wbElements to whiteboard elements
     *
     *
     */
    function _wbElementsToArrayElements(obj) {
        var arr = new Array();
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                arr.push(_createWbElement(obj[i].classType, _getElementProperties(obj[i])));
            }
        }
        return arr;
    };

    function _setWbElement(uuid, el) {
        if (arguments.length == 1) {
            //uuid is object
            _drawOptions.paper.wbElements = uuid;
        } else {
            _drawOptions.paper.wbElements[uuid] = el;
        }
        // set as dirty, the target client need to make it false once data is commited. 
        _drawOptions.paper.isDirty = true;
        //check whether elements are cleared
        _clearStateChange()
    };
    function _getWbElement() {
        return _drawOptions.paper.wbElements;
    };
    function _calculateOffset() {
        left = _drawOptions.offset.left;
        top = _drawOptions.offset.top;
    };

    function _saveAsUndocache(el, ol, avoidRedo) {
        var obj = {};
        obj.el = el;
        obj.ol = ol;
        _drawOptions.paper.undocache.push(obj);
        if (_drawOptions.paper.undocache.length > 20) {
            _drawOptions.paper.undocache.slice(0, 1);
        }
        // remove redo cache if any as redo action contains only new undo actions
        if (!!!avoidRedo && _drawOptions.paper.redocache.length > 0) {
            _drawOptions.paper.redocache = [];
        }

    };

    function _undoAction() {
        var len = _drawOptions.paper.undocache.length;
        if (len > 0) {
            var obj = _drawOptions.paper.undocache.pop();
            _elAction(obj.el, obj.ol, undoActionConvert[obj.el.action]);
            var myObj = {};
            myObj.state = "onEnableRedo";
            _invokeDrawFunction(myObj);
        }
        if (len <= 1) {
            var myObj = {};
            myObj.state = "onDisableUndo";
            _invokeDrawFunction(myObj);
        }
        _clearStateChange();
    };

    function _undoRedoStateChange() {
        var undoObj = {},
            redoObj = {};
        undoObj.state = _drawOptions.paper.undocache.length > 0 ? "onEnableUndo" : "onDisableUndo";
        _invokeDrawFunction(undoObj);
        redoObj.state = _drawOptions.paper.redocache.length > 0 ? "onEnableRedo" : "onDisableRedo";
        _invokeDrawFunction(redoObj);
    };

    function _clearStateChange() {
        var keys= Object.keys(_drawOptions.paper.wbElements), newstate = (keys.length ==1 && _drawOptions.paper.wbElements[keys[0]] == null) || _isBlankObject(_drawOptions.paper.wbElements);
        if (cacheStatechange.isClearDeactive != newstate) {
            var myObj = {};
            myObj.state = "onClearPaper";
            myObj.isEnable = !newstate;
            _invokeDrawFunction(myObj);
        }
    };

    function _redoAction() {
        var len = _drawOptions.paper.redocache.length;
        if (len > 0) {
            var obj = _drawOptions.paper.redocache.pop();
            _elAction(obj.el, obj.ol);
            var myObj = {};
            myObj.state = "onEnableUndo";
            _invokeDrawFunction(myObj);
        }
        if (len <= 1) {
            var myObj = {};
            myObj.state = "onDisableRedo";
            _invokeDrawFunction(myObj);
        }
        _clearStateChange();
    };

    /**
     * Clears the whiteboard.
     *
     * @public
     */
    function _clearAction(broadcast, isEnableUndo) {
        _drawOptions.paper.clear();
        // send changes to server
        var drawReturns = {};
        drawReturns.sendchanges = {
            "action": "clear",
            "elements": null
        };
        if (_drawOptions.isBroadcastable && broadcast) {
            drawReturns.state = "onSend";
            _invokeDrawFunction(drawReturns);
        }
        if (isEnableUndo) {
            drawReturns.state = "onEnableUndo";
            drawReturns.sendchanges.elements = _wbElementsToArrayElements(_drawOptions.paper.wbElements);
            _invokeDrawFunction(drawReturns);
        }
        if (_selectedObj)
            _selectedObj = null;
        //clear up the cached elements
        _setWbElement({});
    };

    function _elAction(el, ol, superAction) {
        switch (superAction || el.action) {
            case "create":
            case "clone":
                _createElementAfterVerification(el.element.properties, el.element.type,
                    el.element.properties.orderNo, true, false);
                break;
            case "update":
                _updateElement(ol && ol.element.properties, ol && ol.element.type);
                break;
            case "remove":
                _removeElementAfterVerification(el.element.properties.uuid, true, false);
                break;
            case "toFront":
                _bringFrontElementAfterVerification(el.element.properties.uuid,
                    el.element.properties.orderNo, true, false);
                break;
            case "toBack":
                _bringBackElementAfterVerification(el.element.properties.uuid,
                    el.element.properties.orderNo, true, false);
                break;
            case "restore":
                _restorePaper(el.elements, true, false);
                break;
        }
        if (superAction !== undefined) {
            var obj = {};
            if (el.action != "update") {
                obj.el = el;
            } else {
                obj.el = ol;
                obj.ol = el;
            }
            _drawOptions.paper.redocache.push(obj);
        } else {
            if (el.action != "update") {
                _saveAsUndocache(el, ol, true);
            } else {
                _saveAsUndocache(ol, el, true);
            }
        }
    };

    function _invokeDrawFunction(arg) {
        switch (arg.state) {
            case "onSend":
                if (typeof(_drawOptions.onSend) != 'undefined')
                    _drawOptions.onSend(arg.sendchanges);
                break;
            case "onEnableUndo":
                if (arg.sendchanges && undoActionConvert[arg.sendchanges.action]) {
                    _saveAsUndocache(arg.sendchanges, _oldEl);
                }
                (typeof(_drawOptions.onUndoRedoChanged) && !cacheStatechange.isUndoActive && _drawOptions.onUndoRedoChanged({
                    type: "undo",
                    enable: true
                }));
                cacheStatechange.isUndoActive = true;
                break;
            case "onDisableUndo":
                (typeof(_drawOptions.onUndoRedoChanged) && cacheStatechange.isUndoActive && _drawOptions.onUndoRedoChanged({
                    type: "undo",
                    enable: false
                }));
                cacheStatechange.isUndoActive = false;
                break;
            case "onEnableRedo":
                (typeof(_drawOptions.onUndoRedoChanged) && !cacheStatechange.isRedoActive && _drawOptions.onUndoRedoChanged({
                    type: "redo",
                    enable: true
                }));
                cacheStatechange.isRedoActive = true;
                break;
            case "onDisableRedo":
                (typeof(_drawOptions.onUndoRedoChanged) && cacheStatechange.isRedoActive && _drawOptions.onUndoRedoChanged({
                    type: "redo",
                    enable: false
                }));
                cacheStatechange.isRedoActive = false;
                break;
            case "onCreateElement":
                if (typeof(_drawOptions.onCreateElement) != 'undefined')
                    _drawOptions.onCreateElement(arg.properties);
                break;
            case "onChangePaperToDoc":
                if (typeof(_drawOptions.onChangePaperToDoc) != 'undefined')
                    _drawOptions.onChangePaperToDoc(arg.properties.arg1,
                        arg.properties.arg2, arg.properties.arg3,
                        arg.properties.arg4, arg.properties.arg5);
                break;
            case "onUpdateHelperBox":
                if (typeof(_drawOptions.onUpdateHelperBox) != 'undefined')
                // has return
                    return _drawOptions.onUpdateHelperBox(arg.properties);
                break;
            case "onBeforeDocCreate":
                if (typeof(_drawOptions.onBeforeDocCreate) != 'undefined')
                    _drawOptions.onBeforeDocCreate(arg.properties);
                break;
            case "onSelectElement":
                // show selectedComponents etc.. properties is the helperbox
                if (typeof(_drawOptions.onSelectElement) != 'undefined')
                    _drawOptions.onSelectElement(arg.type, arg.properties,
                        arg.isTransformed);
                break;
            case "onMouseDownBegin":
                if (typeof(_drawOptions.onMouseDownBegin) != 'undefined')
                    _drawOptions.onMouseDownBegin();
                break;
            case "onModeChange":
                if (typeof(_drawOptions.onModeChange) != 'undefined')
                    _drawOptions.onModeChange(arg.mode, arg.properties);
                break;
            case "onClearPaper":
                if (typeof(_drawOptions.onClearPaper) != 'undefined')
                    _drawOptions.onClearPaper({
                        enable: arg.isEnable
                    });
                cacheStatechange.isClearDeactive = !arg.isEnable;
                break;
        };
    };

    function _setDrawOptions(options) {
        _drawOptions = _extend(_drawOptions, options);
    };
    /**
     * Extended objects
     */
    function _extendWhiteboardObj() {
        _drawOptions.whiteboard = _extend({},
            // _drawOptions.whiteboard,
            {
                "lineEl": {
                    "path": null,
                    "pathArray": null
                },
                "imageEl": {
                    "cx": 0,
                    "cy": 0,
                    "width": 0,
                    "height": 0,
                    "inputUrl": null
                },
                "circleEl": {
                    "cx": 0,
                    "cy": 0
                },
                "ellipseEl": {
                    "cx": 0,
                    "cy": 0
                },
                "rectEl": {
                    "cx": 0,
                    "cy": 0
                },
                "iconEl": {
                    "cx": 0,
                    "cy": 0,
                    "icon": null,
                    "iconName": null
                },
                "textEl": {
                    "cx": 0,
                    "cy": 0,
                    "boxWidth": 0,
                    "boxHeigth": 0
                }
            });
    };
    /**
     * Switches the mode if user selects any action (like "Input Text" or "Draw
     * Circle").
     *
     * @public
     * @param mode
     *            mode defined in the variable modeSwitcher.
     * @param cursor
     *            cursor type, e.g. "default", "move", "wait".
     */
    function _switchToMode(mode, cursor) {
        if (mode != "others") {
            // remove previous selection or bbox
            _trnsUnplug(false);
            // Clean textField
            _closeInputText();
            _createTracker(_drawOptions.paper);
            for (var name in _modeSwitcher) {
                if (_modeSwitcher.hasOwnProperty(name))
                    _modeSwitcher[name] = false;
            }
            _modeSwitcher[mode] = true;
            // enable whiteboard touch
            if (_modeSwitcher.freeLineMode || _modeSwitcher.straightLineMode || _modeSwitcher.rectangleMode || _modeSwitcher.circleMode || _modeSwitcher.ellipseMode) {
                touchable = true;
            } else {
                touchable = false;
            }
            var nwObj = {};
            nwObj.state = "onModeChange";
            nwObj.mode = mode;
            nwObj.properties = _getCurrentElementProperites(mode
                .replace(/Mode/, ''));
            _invokeDrawFunction(nwObj);
        } else {
            // remove tracking
            _drawOptions.paper && _removeTracker(_drawOptions.paper);
        }
    };

    /**
     * Increase the max seq for new elements
     *
     * @private
     * @function
     */
    function _forwardOrder() {
        return _elementOrder.maxSeq = parseInt(_elementOrder.maxSeq) + 1;
    };
    /**
     * Reorder to the last element in the page
     *
     * @private
     * @function
     */
    function _backwardOrder() {
        return _elementOrder.lowSeq = parseInt(_elementOrder.lowSeq) - 1;
    };

    function _setElementSequence(orderNo) {
        if (orderNo == 0) {
            return;
        }
        if (_elementOrder.maxSeq < orderNo) {
            _elementOrder.maxSeq = orderNo;
        } else if (_elementOrder.lowSeq > orderNo) {
            _elementOrder.lowSeq = orderNo;
        }
    };

    function _setElementProperties(el, propsObj) {
        for (prop in propsObj) {
            if (propsObj.hasOwnProperty(prop)) {
                if (prop != "rotation") {
                    if (prop == "stroke-dasharray") {
                        el.attr(prop, _drawOptions.wbConfig
                            .getDasharrayMapping(propsObj[prop]));
                    } else {
                        el.attr(prop, propsObj[prop]);
                    }
                }
            }
        }
    };

    function _getCurrentElementProperites(type) {
        propsObj = _drawOptions.wbConfig.getProperties(type);
        for (prop in propsObj) {
            if (propsObj.hasOwnProperty(prop)) {
                if (type == "text" && prop == "fill" && _newProperties["stroke"]) {
                    propsObj[prop] = _newProperties["stroke"];
                    continue;
                }
                if (_newProperties[prop] !== undefined) {
                    propsObj[prop] = _newProperties[prop];
                }
            }
        }
        return propsObj;
    };

    function _setCurrentElementProperties() {
        if (!_selectedObj && (_modeSwitcher.selectMode || _modeSwitcher.fillMode)) {
            return
        }
        if (_modeSwitcher.selectMode) {
            _setNewElementProperties(_selectedObj.element,
                _selectedObj.element.attrs);
        } else if (_modeSwitcher.fillMode) {
            _selectedObj.element.attr("fill", _newProperties["fill"]);
        }
        var sendProps = _getElementProperties(_selectedObj);
        var objChanges = {
            "action": "update",
            "element": {
                "type": _selectedObj.classType,
                "properties": sendProps
            }
        };
        // send changes
        if (_drawOptions.isBroadcastable) {
            var drawReturns = {};
            drawReturns.state = "onSend";
            drawReturns.sendchanges = objChanges;
            _invokeDrawFunction(drawReturns);
        }
        _trnsUnplug(true);
        _selectedObj = null;
    };

    function _setNewElementProperties(el, propsObj) {
        for (prop in propsObj) {
            if (propsObj.hasOwnProperty(prop)) {
                if (prop != "rotation") {
                    // text don't have stroke instead have fill
                    if (el.type == "text" && prop == "fill" && _newProperties["stroke"]) {
                        el.attr(prop, _newProperties["stroke"]);
                        continue;
                    }
                    if (_newProperties[prop] !== undefined && (prop != "fill")) {
                        el.attr(prop, _newProperties[prop]);
                    } else {
                        if (prop == "stroke-dasharray") {
                            el.attr(prop, _drawOptions.wbConfig
                                .getDasharrayMapping(propsObj[prop]));
                        } else {
                            el.attr(prop, propsObj[prop]);
                        }
                    }
                }
            }
        }
    };

    function _getSelectedProperties(el, propsObj) {
        var selectedProps = {};
        for (prop in propsObj) {
            if (propsObj.hasOwnProperty(prop)) {
                if (prop == "stroke-dasharray") {
                    selectedProps[prop] = _getDasharrayValue(el.attr(prop));
                } else {
                    selectedProps[prop] = el.attr(prop);
                }
            }
        }
        return selectedProps;
    };

    function _changeProperties(prop) {
        if (_modeSwitcher["fillMode"]) {
            prop["fill"] = prop["stroke"];
            delete prop["stroke"];
        }
        _newProperties = _extend(_newProperties, prop);
        if (_modeSwitcher["selectMode"]) {
            // to save unmodified object for undo cache
            _oldEl = {};
            _oldEl = _createSelectObj();
            _setCurrentElementProperties();
        }
        if (_modeSwitcher["textMode"]) {
            _setNewPropertiesToText();
        }
    }

    function _getDasharrayValue(label) {
        var _dashArray = _drawOptions.wbConfig.getDasharrayMapping();
        for (value in _dashArray) {
            if (_dashArray.hasOwnProperty(value)) {
                if (label == _drawOptions.wbConfig.getDasharrayMapping(value)) {
                    return value;
                }
            }
        }
        return "No";
    };

    function _createTracker(paper) {
        paper.canvas.onmousedown = _mousedowntrack;
        paper.canvas.onmousemove = _mousemovetrack;
        paper.canvas.ontouchstart = _mousedowntrack;
        paper.canvas.ontouchmove = _mousemovetrack;
        paper.canvas.onclick = _clickHandler;
    }

    function _removeTracker(paper) {
        paper.canvas.onmousedown = null;
        paper.canvas.onmousemove = null;
        paper.canvas.ontouchstart = null;
        paper.canvas.ontouchmove = null;
        paper.canvas.onclick = null;
    }
    // var r;
    function _mousedowntrack(event) {

        if (hasTouch && event.touches) {
            if (event.targetTouches.length > 1) {
                return;
            }
            e = event.targetTouches[0] || event.touches[0] || event.originalEvent.touches[0];
        } else {
            e = event;
        }
        if (!touchable) {
            _clickHandler(e);
            try {
                event.preventDefault();
                event.stopPropagation();
            } catch (e) {
                // ignore if it fails
            }
            return;
        }
        // DISABLING causing slowness
        // var nwObj = {};
        // nwObj.state = "onMouseDownBegin";
        // _invokeDrawFunction(nwObj);
        active = true;
        x = (e.pageX - left) * scale;
        y = (e.pageY - top) * scale;
        if (_modeSwitcher.freeLineMode) {
            repath = true;
            var lineprops = _drawOptions.wbConfig.getProperties("freeLine"),
                mean = parseInt(lineprops["stroke-width"]) / 2;
            lineEl = _drawOptions.paper.path();
            initPath = M + x + COMMA + y + L + (x + mean) + COMMA + (y + mean);
            path = M + x + COMMA + y + L + (x) + COMMA + (y);
            _setNewElementProperties(lineEl, lineprops);
            lineEl.attr({
                path: initPath
            });
            return false;
        } else if (_modeSwitcher.straightLineMode) {
            _drawStraightLineBegin(x, y);
            return false;
        } else if (_modeSwitcher.circleMode) {
            _drawCircle(x, y);
            return false;
        } else if (_modeSwitcher.ellipseMode) {
            _drawEllipse(x, y);
            return false;
        } else if (_modeSwitcher.rectangleMode) {
            _drawRectangle(x, y);
            return false;
        }
        return false;
    };

    function _mousemovetrack(event) {
        // do nothing if doodling is inactive
        if (!active) {
            return;
        }
        if (hasTouch && event.touches) {
            if (event.targetTouches.length > 1) {
                return;
            }
            e = event.targetTouches[0] || event.touches[0] || event.originalEvent.touches[0];
        } else if (!hasTouch) {
            e = event;
        } else {
            event.preventDefault();
            return;
        }
        x = (e.pageX - left) * scale;
        y = (e.pageY - top) * scale;
        if (_modeSwitcher.freeLineMode) {
            if (repath) {
                path += R + " " + (x) + COMMA + (y) + " " + (x) + COMMA + (y);
                repath = false;
            }
            path += " " + (x) + COMMA + (y); // append line point
            lineEl.attr({
                path: path
            });
            return false;
        } else if (_modeSwitcher.removeMode) {

        } else if (_modeSwitcher.straightLineMode) {
            _drawOptions.whiteboard.lineEl.pathArray[1] = ["L",
                x,
                y
            ];
            lineEl.attr("path",
                _drawOptions.whiteboard.lineEl.pathArray);
            return false;
        } else if (_modeSwitcher.circleMode) {
            var endX = x;
            var endY = y;
            var strtX = _drawOptions.whiteboard.circleEl.cx;
            var strtY = _drawOptions.whiteboard.circleEl.cy;
            rad = parseInt(Math.sqrt((strtX - endX) * (strtX - endX) + (strtY - endY) * (strtY - endY)));
            var coX = (endX + strtX) / 2;
            var coY = (endY + strtY) / 2;
            circleElement.attr({
                "r": rad / 2,
                "cx": coX,
                "cy": coY
            });
            return false;
        } else if (_modeSwitcher.ellipseMode) {
            var endX = x;
            var endY = y;
            var strtX = _drawOptions.whiteboard.ellipseEl.cx;
            var strtY = _drawOptions.whiteboard.ellipseEl.cy;
            var coX = (endX + strtX) / 2;
            var coY = (endY + strtY) / 2;
            var diaX = endX - strtX;
            var diaY = endY - strtY;
            ellipseElement.attr({
                "rx": Math.abs(diaX / 2),
                "ry": Math.abs(diaY / 2),
                "cx": coX,
                "cy": coY
            });
            return false;
        } else if (_modeSwitcher.rectangleMode) {
            var strtX = _drawOptions.whiteboard.rectEl.cx;
            var strtY = _drawOptions.whiteboard.rectEl.cy;
            var endX = x;
            var endY = y;
            var w = endX - strtX;
            var h = endY - strtY;
            if (w < 0 && h < 0) {
                rectElement.attr({
                    "x": endX,
                    "y": endY,
                    "width": Math.abs(w),
                    "height": Math.abs(h)
                });
            }
            if (w > 0 && h < 0) {
                rectElement.attr({
                    "x": strtX,
                    "y": endY,
                    "width": w,
                    "height": Math.abs(h)
                });
            }
            if (w < 0 && h > 0) {
                rectElement.attr({
                    "x": endX,
                    "y": strtY,
                    "width": Math.abs(w),
                    "height": h
                });
            }
            if (w > 0 && h > 0) {
                rectElement.attr({
                    "x": strtX,
                    "y": strtY,
                    "width": w,
                    "height": h
                });
            };
            return false;
        };
    };
    // track window mouse up to ensure mouse up even outside
    // paper works.
    Raphael.mouseup(function() {
        // do nothing if doodling is inactive
        if (!active) {
            return;
        }
        active = false, e = null;
        var hb = null,
            drawReturns = {};
        if (lineEl) {
            var classType, defProperties;
            if (_modeSwitcher.freeLineMode) {
                classType = _drawOptions.wbConfig.getClassTypes("freeLine");
                defProperties = _drawOptions.wbConfig.getProperties("freeLine");
                // Need to investigate why we need this
                // transferMethod = "transferFreeLinePropertiesToDialog";
            } else {
                classType = _drawOptions.wbConfig.getClassTypes("straightLine");
                defProperties = _drawOptions.wbConfig.getProperties("straightLine");
            }
            hb = _drawHelperBox(lineEl, classType,
                _forwardOrder(), defProperties.rotation, null, true, null);
            _setWbElement(hb.uuid, hb);
            drawReturns.sendchanges = {
                "action": "create",
                "element": {
                    "type": classType,
                    "properties": {
                        "uuid": hb.uuid,
                        "orderNo": hb.orderNo,
                        "rotationDegree": defProperties.rotation,
                        "path": lineEl
                            .attr("path") + '',
                        "color": lineEl
                            .attr("stroke"),
                        "lineWidth": lineEl
                            .attr("stroke-width"),
                        "lineStyle": _getDasharrayValue(lineEl
                            .attr("stroke-dasharray")),
                        "opacity": lineEl
                            .attr("stroke-opacity")
                    }
                }
            };
            // reset
            lineEl = null;
            _drawOptions.whiteboard.lineEl.pathArray = null;
        }
        if (_modeSwitcher.circleMode) {
            var x = circleElement.attr("cx"),
                y = circleElement.attr("cy"),
                r = circleElement.attr("r");
            if (r == 0) {
                _invokeLogger({
                    type: "info",
                    message: " Element was choosen but haven't drawn anything "
                });
                return;
            }
            hb = _drawHelperBox(circleElement, _drawOptions.wbConfig
                .getClassTypes("circle"), _forwardOrder(), _drawOptions.wbConfig
                .getProperties("circle")
                .rotation, null, true, null);
            _setWbElement(hb.uuid, hb);
            // send changes to server
            drawReturns.sendchanges = {
                "action": "create",
                "element": {
                    "type": _drawOptions.wbConfig.getClassTypes("circle"),
                    "properties": {
                        "uuid": hb.uuid,
                        "orderNo": hb.orderNo,
                        "x": x,
                        "y": y,
                        "rotationDegree": _drawOptions.wbConfig
                            .getProperties("circle")
                            .rotation,
                        "radius": r,
                        "backgroundColor": circleElement.attr("fill"),
                        "borderColor": circleElement.attr("stroke"),
                        "borderWidth": circleElement.attr("stroke-width"),
                        "borderStyle": _getDasharrayValue(circleElement
                            .attr("stroke-dasharray")),
                        "backgroundOpacity": circleElement
                            .attr("fill-opacity"),
                        "borderOpacity": circleElement
                            .attr("stroke-opacity")
                    }
                }
            };
            _drawOptions.whiteboard.circleEl.cx = 0;
            _drawOptions.whiteboard.circleEl.cy = 0;
        }
        if (_modeSwitcher.ellipseMode) {
            ellipseElement.scale(1, 1); // workaround for webkit based
            // browsers
            var x = ellipseElement.attr("cx"),
                y = ellipseElement.attr("cy"),
                rx = ellipseElement.attr("rx"),
                ry = ellipseElement.attr("ry");
            if (rx == 0 && ry == 0) {
                _invokeLogger({
                    type: "info",
                    message: " Element was choosen but haven't drawn anything "
                });
                return;
            }
            hb = _drawHelperBox(ellipseElement, _drawOptions.wbConfig
                .getClassTypes("ellipse"), _forwardOrder(), _drawOptions.wbConfig
                .getProperties("ellipse")
                .rotation, null, true, null);
            _setWbElement(hb.uuid, hb);
            // send changes to server
            drawReturns.sendchanges = {
                "action": "create",
                "element": {
                    "type": _drawOptions.wbConfig.getClassTypes("ellipse"),
                    "properties": {
                        "uuid": hb.uuid,
                        "orderNo": hb.orderNo,
                        "x": x,
                        "y": y,
                        "rotationDegree": _drawOptions.wbConfig
                            .getProperties("ellipse")
                            .rotation,
                        "hRadius": rx,
                        "vRadius": ry,
                        "backgroundColor": ellipseElement.attr("fill"),
                        "borderColor": ellipseElement.attr("stroke"),
                        "borderWidth": ellipseElement.attr("stroke-width"),
                        "borderStyle": _getDasharrayValue(ellipseElement
                            .attr("stroke-dasharray")),
                        "backgroundOpacity": ellipseElement
                            .attr("fill-opacity"),
                        "borderOpacity": ellipseElement
                            .attr("stroke-opacity")
                    }
                }
            };
            _drawOptions.whiteboard.ellipseEl.cx = 0;
            _drawOptions.whiteboard.ellipseEl.cy = 0;
        }
        if (_modeSwitcher.rectangleMode) {
            var x = rectElement.attr("x"),
                y = rectElement.attr("y"),
                w = rectElement.attr("width"),
                h = rectElement.attr("height");
            if (w == 0 && h == 0) {
                _invokeLogger({
                    type: "info",
                    message: " Element was choosen but haven't drawn anything "
                });
                return;
            }
            hb = _drawHelperBox(rectElement, _drawOptions.wbConfig
                .getClassTypes("rectangle"), _forwardOrder(), _drawOptions.wbConfig
                .getProperties("rectangle")
                .rotation, null, true, null);
            _setWbElement(hb.uuid, hb);
            // send changes to server
            drawReturns.sendchanges = {
                "action": "create",
                "element": {
                    "type": _drawOptions.wbConfig.getClassTypes("rectangle"),
                    "properties": {
                        "uuid": hb.uuid,
                        "orderNo": hb.orderNo,
                        "x": x,
                        "y": y,
                        "rotationDegree": _drawOptions.wbConfig
                            .getProperties("rectangle")
                            .rotation,
                        "width": w,
                        "height": h,
                        "cornerRadius": rectElement.attr("r"),
                        "backgroundColor": rectElement.attr("fill"),
                        "borderColor": rectElement.attr("stroke"),
                        "borderWidth": rectElement.attr("stroke-width"),
                        "borderStyle": _getDasharrayValue(rectElement
                            .attr("stroke-dasharray")),
                        "backgroundOpacity": rectElement
                            .attr("fill-opacity"),
                        "borderOpacity": rectElement
                            .attr("stroke-opacity")
                    }
                }
            };
            // reset
            _drawOptions.whiteboard.rectEl.cx = 0;
            _drawOptions.whiteboard.rectEl.cy = 0;
        };
        if (_isBlankObject(drawReturns) || drawReturns === undefined) {
            return;
        }
        if (_drawOptions.isBroadcastable) {
            drawReturns.state = "onSend";
            _invokeDrawFunction(drawReturns);
        }
        // Save it in the undo cache
        drawReturns.state = "onEnableUndo";
        _invokeDrawFunction(drawReturns);
        var myObj = {};
        myObj.state = "onCreateElement";
        myObj.properties = hb;
        _invokeDrawFunction(myObj);
    });
    /**
     * Draws begin point of the free line and registers mouse handlers.
     *
     * @public
     * @param x
     *            X-coordinate.
     * @param y
     *            Y-coordinate.
     */
    function _drawFreeLineBegin(x, y) {
        lineEl = _drawOptions.paper.path();
        path = M + x + COMMA + y + R;
        _setNewElementProperties(lineEl,
            _drawOptions.wbConfig.getProperties("freeLine"));
    };
    /**
     * Draws begin point of the straight line and registers mouse handlers.
     *
     * @public
     * @param x
     *            X-coordinate.
     * @param y
     *            Y-coordinate.
     */
    function _drawStraightLineBegin(x, y) {
        _drawOptions.whiteboard.lineEl.pathArray = [];
        _drawOptions.whiteboard.lineEl.pathArray[0] = ["M", x, y];
        lineEl = _drawOptions.paper
            .path(_drawOptions.whiteboard.lineEl.pathArray);
        _setNewElementProperties(lineEl,
            _drawOptions.wbConfig.getProperties("straightLine"));
    };
    /**
     * Draws text with default properties.
     *
     * @public
     * @param x
     *            text message.
     */
    function _drawText(inputText) {
        if (inputText !== "") {
            var textElement = _drawOptions.paper.text(
                    _drawOptions.whiteboard.textEl.cx,
                    _drawOptions.whiteboard.textEl.cy, inputText)
                .attr({
                    "text-anchor": "start"
                });
            var realTextProps = _extend({}, _drawOptions.wbConfig
                .getProperties("text"), {
                    "text": inputText
                });
            _setNewElementProperties(textElement, realTextProps);
            // Resizing the length and width of text to be printed on paper.
            var tempText = "";
            var words = inputText.split(" ");
            for (var i = 0; i < words.length; i++) {
                textElement.attr("text", tempText + " " + words[i]);
                if (textElement.getBBox()
                    .width > _drawOptions.whiteboard.textEl.boxWidth) {
                    tempText += "\n" + words[i];
                } else {
                    tempText += " " + words[i];
                }
            }
            textElement.attr("text", tempText.substring(1));
            alignTop(textElement);
            var hb = _drawHelperBox(textElement, _drawOptions.wbConfig
                .getClassTypes("text"), _forwardOrder(), _drawOptions.wbConfig
                .getProperties("text")
                .rotation, null, true, null);
            _setWbElement(hb.uuid, hb);
            if (_drawOptions.isBroadcastable) {
                // send changes to server
                var drawReturns = {};
                drawReturns.state = "onSend";
                drawReturns.sendchanges = {
                    "action": "create",
                    "element": {
                        "type": _drawOptions.wbConfig.getClassTypes("text"),
                        "properties": {
                            "uuid": hb.uuid,
                            "orderNo": hb.orderNo,
                            "x": textElement.attr("x"),
                            "y": textElement.attr("y"),
                            "rotationDegree": _drawOptions.wbConfig
                                .getProperties("text")
                                .rotation,
                            "text": tempText.substring(1),
                            "fontFamily": textElement.attr("font-family"),
                            "fontSize": textElement.attr("font-size"),
                            "fontWeight": textElement.attr("font-weight"),
                            "fontStyle": textElement.attr("font-style"),
                            "isTransformed": hb.isTransformed,
                            "color": textElement.attr("fill")
                        }
                    }
                };
                _invokeDrawFunction(drawReturns);
            }
            var myObj = {};
            myObj.state = "onCreateElement";
            myObj.properties = hb;
            _invokeDrawFunction(myObj);
        }
    };
    /**
     * Draws image with default properties.
     *
     * @public
     *
     */
    function _drawImage() {
        var imageElement = _drawOptions.paper.image(
            _drawOptions.whiteboard.imageEl.inputUrl,
            _drawOptions.whiteboard.imageEl.cx,
            _drawOptions.whiteboard.imageEl.cy,
            _drawOptions.whiteboard.imageEl.width,
            _drawOptions.whiteboard.imageEl.height);
        var hb = _drawHelperBox(imageElement, _drawOptions.wbConfig
            .getClassTypes("image"), _forwardOrder(), _drawOptions.wbConfig
            .getProperties("image")
            .rotation, null, true, null);
        _setWbElement(hb.uuid, hb);
        // send changes to server
        if (_drawOptions.isBroadcastable) {
            // send changes to server
            var drawReturns = {};
            drawReturns.state = "onSend";
            drawReturns.sendchanges = {
                "action": "create",
                "element": {
                    "type": _drawOptions.wbConfig.getClassTypes("image"),
                    "properties": {
                        "uuid": hb.uuid,
                        "orderNo": hb.orderNo,
                        "x": _drawOptions.whiteboard.imageEl.cx,
                        "y": _drawOptions.whiteboard.imageEl.cy,
                        "rotationDegree": _drawOptions.wbConfig.getProperties("image")
                            .rotation,
                        "url": _drawOptions.whiteboard.imageEl.inputUrl,
                        "width": _drawOptions.whiteboard.imageEl.width,
                        "height": _drawOptions.whiteboard.imageEl.height
                    }
                }
            };
            _invokeDrawFunction(drawReturns);
        }
        var myObj = {};
        myObj.state = "onCreateElement";
        myObj.properties = hb;
        _invokeDrawFunction(myObj);
    };
    /**
     * Draws Document slide with default properties. The document is always at
     * the furthest from the view.
     *
     * @public
     *
     */
    function _drawDocument(slideNo) {
        var nwObj = {};
        nwObj.state = "onBeforeDocCreate";
        nwObj.properties = slideNo;
        _invokeDrawFunction(nwObj);
        var imageElement = _drawOptions.paper.image(
            _drawOptions.whiteboard.imageEl.inputUrl,
            _drawOptions.whiteboard.imageEl.cx,
            _drawOptions.whiteboard.imageEl.cy,
            _drawOptions.whiteboard.imageEl.width,
            _drawOptions.whiteboard.imageEl.height);
        var hb = _drawHelperBox(imageElement, _drawOptions.wbConfig
            .getClassTypes("document"), _forwardOrder(), _drawOptions.wbConfig
            .getProperties("image")
            .rotation, null, true, null, null, null);
        // bring to back
        imageElement.toBack();
        hb.toBack();
        var nwObj = {};
        nwObj.state = "onUpdateHelperBox";
        nwObj.properties = hb;
        hb = _invokeDrawFunction(nwObj);
        _setWbElement(hb.uuid, hb);
        // send changes to server
        if (_drawOptions.isBroadcastable) {
            // send changes to server
            var drawReturns = {};
            drawReturns.state = "onSend";
            drawReturns.sendchanges = {
                "action": hb.prevSlideId != null ? "replace" : "create",
                "element": {
                    "type": _drawOptions.wbConfig.getClassTypes("document"),
                    "properties": {
                        "uuid": hb.uuid,
                        "orderNo": hb.orderNo,
                        "x": _drawOptions.whiteboard.imageEl.cx,
                        "y": _drawOptions.whiteboard.imageEl.cy,
                        "rotationDegree": _drawOptions.wbConfig.getProperties("image").rotation,
                        "url": _drawOptions.whiteboard.imageEl.inputUrl,
                        "width": _drawOptions.whiteboard.imageEl.width,
                        "height": _drawOptions.whiteboard.imageEl.height,
                        "documentId": hb.documentId,
                        "docSlideNo": hb.docSlideNo,
                        "docTitle": hb.docTitle,
                        "docOwnerId": hb.docOwnerId,
                        "pageCnt": hb.pageCnt
                    }
                },
                "parameters": {
                    "prevUuid": hb.prevSlideId
                }
            };
            _invokeDrawFunction(drawReturns);
        }
        var myObj = {};
        myObj.state = "onCreateElement";
        myObj.properties = hb;
        _invokeDrawFunction(myObj);
    };
    /**
     * Draws rectangle with default properties.
     *
     * @public
     * @param x
     *            X-coordinate.
     * @param y
     *            Y-coordinate.
     */
    function _drawRectangle(x, y) {
        rectElement = _drawOptions.paper.rect(x, y, 0, 0);
        _drawOptions.whiteboard.rectEl.cx = x;
        _drawOptions.whiteboard.rectEl.cy = y;
        rectElement.scale(1, 1); // workaround for webkit based browsers
        _setNewElementProperties(rectElement, _drawOptions.wbConfig
            .getProperties("rectangle"));
    };
    /**
     * Draws circle with default properties.
     *
     * @public
     * @param x
     *            X-coordinate.
     * @param y
     *            Y-coordinate.
     */
    function _drawCircle(x, y) {
        circleElement = _drawOptions.paper.circle(x, y, 0);
        _drawOptions.whiteboard.circleEl.cx = x;
        _drawOptions.whiteboard.circleEl.cy = y;
        circleElement.scale(1, 1); // workaround for webkit based browsers
        _setNewElementProperties(circleElement, _drawOptions.wbConfig
            .getProperties("circle"));
    };
    /**
     * Draws ellipse with default properties.
     *
     * @public
     * @param x
     *            X-coordinate.
     * @param y
     *            Y-coordinate.
     */
    function _drawEllipse(x, y) {
        ellipseElement = _drawOptions.paper.ellipse(x, y, 0, 0);
        _drawOptions.whiteboard.ellipseEl.cx = x;
        _drawOptions.whiteboard.ellipseEl.cy = y;
        ellipseElement.scale(1, 1); // workaround for webkit based browsers
        _setNewElementProperties(ellipseElement, _drawOptions.wbConfig
            .getProperties("ellipse"));
    };
    /**
     * Selects an element if user clicks on it.
     *
     * @private
     * @param helperBox
     *            helper rectangle around element to be selected.
     */
    function _selectElement(helperBox) {
        if (_selectedObj != null && _selectedObj.uuid != helperBox.uuid) {
            // hide last selection
            _trnsUnplug(true);
        }
        _selectedObj = helperBox;
        // to save unmodified object for undo cache
        _oldEl = {};
        _oldEl = _createSelectObj();
        _selectedObj.attr(_drawOptions.wbConfig.getAttributes("opacityHidden"));
        _addFreeTransform(helperBox.element);
        // remove hover
        helperBox.hover(_hoverOutEl, _hoverOutEl);
        var nwObj = {};
        nwObj.state = "onSelectElement";
        nwObj.type = _selectedObj.classType;
        if (_selectedObj.isTransformed) {
            nwObj.isTransformed = _selectedObj.isTransformed;
        }
        nwObj.properties = _selectedObj.element.attrs;
        _invokeDrawFunction(nwObj);
    };

    function _fillElement(helperBox) {
        _selectedObj = helperBox;
        // to save unmodified object for undo cache
        _oldEl = {};
        _oldEl = _createSelectObj();
    };

    function _createSelectObj() {
        return {
            "action": "update",
            "element": {
                "type": _selectedObj.classType,
                "properties": _getElementProperties(_selectedObj)
            }
        };
    };
    /**
     *   Converts hb to whiteboard Element
     *
     */
    function _createWbElement(type, props) {
        return {
            "type": type,
            "properties": props
        };
    };

    /**
     * Removes element after verification
     */
    function _removeElementAfterVerification(uuid, broadcast, isEnableUndo) {
        // find element to be removed
        var hbr = _drawOptions.paper.wbElements[uuid];
        if (hbr == null) {
            // not found ==> nothing to do
            _invokeLogger({
                type: "debug",
                message: "Element to be removed does not exist anymore in this Whiteboard"
            });
            return;
        }
        _removeElement(hbr, broadcast, isEnableUndo);
    }

    /**
     * Removes element.
     *
     * @public
     * @param helperBox
     *            helper rectangle around element to be removed.
     */
    function _removeElement(helperBox, broadcast, isEnableUndo) {
        var eluuid = helperBox.uuid,
            elprops = _getElementProperties(helperBox),
            elclasstype = helperBox.classType,
            removeSelected = false;
        if (_selectedObj != null && _selectedObj.uuid == eluuid) {
            removeSelected = true;
            _trnsUnplug(false);
        }
        _setWbElement(eluuid, null);
        delete _drawOptions.paper.wbElements[eluuid];

        helperBox.element.remove();
        helperBox.remove();
        // send changes to server
        var drawReturns = {};
        drawReturns.sendchanges = {
            "action": "remove",
            "element": {
                "type": elclasstype,
                "properties": {
                    "uuid": eluuid
                }
            }
        };
        if (_drawOptions.isBroadcastable && broadcast) {
            drawReturns.state = "onSend";
            _invokeDrawFunction(drawReturns);
        }
        if (isEnableUndo) {
            drawReturns.state = "onEnableUndo";
            drawReturns.sendchanges.element.properties = elprops;
            _invokeDrawFunction(drawReturns);
        }

        if (removeSelected) {
            // last selected object = this object ==> reset
            _selectedObj = null;
        }
    };

    function _hideElements(ids) {
        if (ids === undefined) {
            return;
        }
        if (typeof ids === 'string') {
            var hb = _drawOptions.paper.wbElements[ids];
            _disableBindings(hb);
            hb && hb.element.hide();
        } else {
            for (var i = 0; i < ids.length; i++) {
                var hb = _drawOptions.paper.wbElements[ids[i]];
                _disableBindings(hb);
                hb && hb.element.hide();
            };
        }
    }

    function _showElements(ids) {
        if (ids === undefined) {
            return;
        }
        if (typeof ids === 'string') {
            var hb = _drawOptions.paper.wbElements[ids];
            _enableBindings(hb);
            hb.element.show();
        } else {
            for (var i = 0; i < ids.length; i++) {
                var hb = _drawOptions.paper.wbElements[ids[i]];
                _enableBindings(hb);
                try {
                    hb.element.show();
                } catch (e) {
                    _invokeLogger({
                        type: "error",
                        message: "Elements of the document appears to be in header but doesn't actually exist"
                    });
                }

            };
        }
    }

    function _bringFrontElementAfterVerification(uuid, orderNo, broadcast, isEnableUndo) {
        // find element to be brought to top
        var hbf = _drawOptions.paper.wbElements[uuid];
        if (hbf == null) {
            // not found ==> nothing to do
            _invokeLogger({
                type: "debug",
                message: "Element to be brought to front does not exist anymore in this Whiteboard"
            });
            return;
        }
        _bringFrontElement(hbf, orderNo, broadcast, isEnableUndo);
    }
    /**
     * Brings element to front (over all other elements).
     *
     * @private
     * @param helperBox
     *            helper rectangle around element.
     */
    function _bringFrontElement(helperBox, orderNo, broadcast, isEnableUndo) {
        // unselect the element
        _trnsUnplug(false);
        helperBox.element.toFront();
        helperBox.toFront();
        helperBox.attr(_drawOptions.wbConfig.getAttributes("opacityHidden"));
        helperBox.orderNo = orderNo;
        var drawReturns = {};
        drawReturns.sendchanges = {
            "action": "toFront",
            "element": {
                "type": helperBox.classType,
                "properties": {
                    "uuid": helperBox.uuid,
                    "orderNo": helperBox.orderNo
                }
            }
        };
        // send changes to server
        if (_drawOptions.isBroadcastable && broadcast) {
            drawReturns.state = "onSend";
            _invokeDrawFunction(drawReturns);
        }
        if (isEnableUndo) {
            drawReturns.state = "onEnableUndo";
            _invokeDrawFunction(drawReturns);
        }
    };
    /**
     * Brings element to back after verification
     */
    function _bringBackElementAfterVerification(uuid, orderNo, broadcast, isEnableUndo) {
        // find element to be brought to back
        var hbb = _drawOptions.paper.wbElements[uuid];
        if (hbb == null) {
            // not found ==> nothing to do
            _invokeLogger({
                type: "debug",
                message: "Element to be brought to back does not exist anymore in this Whiteboard"
            });
            return;
        }
        _bringBackElement(hbb, orderNo, broadcast, isEnableUndo);
    }
    /**
     * Brings element to back (behind all other elements).
     *
     * @private
     * @param helperBox
     *            helper rectangle around element.
     * @param orderNo
     *            order number of the element
     * @param broadcast
     *            broadcastable = true otherwise not
     * @param isEnableUndo
     *            Is local undo/redo enable
     */
    function _bringBackElement(helperBox, orderNo, broadcast, isEnableUndo) {
        _trnsUnplug(false);
        helperBox.toBack();
        helperBox.element.toBack();
        helperBox.attr(_drawOptions.wbConfig.getAttributes("opacityHidden"));
        helperBox.orderNo = _backwardOrder();
        var drawReturns = {};
        drawReturns.sendchanges = {
            "action": "toBack",
            "element": {
                "type": helperBox.classType,
                "properties": {
                    "uuid": helperBox.uuid,
                    "orderNo": helperBox.orderNo
                }
            }
        };
        // send changes to server
        if (_drawOptions.isBroadcastable && broadcast) {
            drawReturns.state = "onSend";
            _invokeDrawFunction(drawReturns);
        }
        if (isEnableUndo) {
            drawReturns.state = "onEnableUndo";
            _invokeDrawFunction(drawReturns);
        }
    };

    /**
     * Clears the elements in the Slide
     */
    function _clearDocElements(ids) {
        if (ids === undefined) {
            return;
        }
        if (typeof ids === 'string') {
            var hb = _drawOptions.paper.wbElements[ids];
            if (hb !== undefined) {
                hb.element.remove();
                hb.remove();
                _setWbElement(ids, null);
                delete _drawOptions.paper.wbElements[ids];
            }
        } else {
            for (var i = 0; i < ids.length; i++) {
                var hb = _drawOptions.paper.wbElements[ids[i]];
                if (hb !== undefined) {
                    hb.element.remove();
                    hb.remove();
                    _setWbElement(ids[i], null);
                    delete _drawOptions.paper.wbElements[ids[i]];
                }
            }
        }
    }
    /**
     * Clones element to back.
     *
     * @private
     * @param helperBox
     *            helper rectangle around element to be cloned.
     */
    function _cloneElement(helperBox) {
        var cloneEl, hb;
        _trnsUnplug(false);
        cloneEl = helperBox.element.clone();
        // shift clone
        cloneEl.attrs.transform = "";
        cloneEl.transform("");
        hb = _drawHelperBox(cloneEl, helperBox.classType, _forwardOrder(),
            null, null, false, null);
        var transformArray = _covertTransToArray(helperBox.element, 15, 15);
        hb.element.transform(transformArray);
        hb.transform(transformArray);
        if (helperBox.classType == _drawOptions.wbConfig.getClassTypes("icon")) {
            hb.iconName = helperBox.iconName;
        }
        helperBox.attr(_drawOptions.wbConfig.getAttributes("opacityHidden"));
        _setWbElement(hb.uuid, hb);
        var props = _getElementProperties(hb);
        var objChanges = {
            "action": "clone",
            "element": {
                "type": hb.classType,
                "properties": props
            }
        };
        if (_drawOptions.isBroadcastable) {
            // send changes to server
            var drawReturns = {};
            drawReturns.state = "onSend";
            drawReturns.sendchanges = objChanges;
            _invokeDrawFunction(drawReturns);
        }
    };
    // not using potential for removing
    function convertPropertiesToCSSType(props) {
        var newProp = {};
        for (prop in props) {
            switch (prop) {
                case "fontFamily":
                    newProp[prop] = "font-family";
                    break;
                case "fontSize":
                    newProp[prop] = "font-size";
                    break;
                case "rotationDegree":
                    newProp[prop] = "rotation";
                    break;
                case "fontWeight":
                    newProp[prop] = "font-weight";
                    break;
                case "fontStyle":
                    newProp[prop] = "front-style";
                    break;
                case "borderColor":
                    newProp[prop] = "stroke";
                    break;
                case "borderWidth":
                    newProp[prop] = "stroke-width";
                    break;
                case "borderStyle":
                    newProp[prop] = "stroke-dasharray";
                    break;
                case "borderOpacity":
                    newProp[prop] = "stroke-opacity";
                    break;
                case "backgroundOpacity":
                    newProp[prop] = "fill-opacity";
                    break;
            }
        }
        return newProp;
    }
    /**
     * Converts element attributes to whiteboard properties. Note: for text and
     * icon there are additional properties which should be manually set to the
     * properties before executing this function. such as isTransformed and
     * iconName
     *
     * @param classType
     *            Class type of the element
     * @param props
     *            Attributes of the element
     * @returns sendProps Whiteboard Properties
     */
    function _convertAttrToWbProperties(classType, props) {
        var sendProps = {};
        // extend properties to coordinates
        switch (classType) {
            case _drawOptions.wbConfig.getClassTypes("text"):
                sendProps.text = props["text"];
                sendProps.fontFamily = props["font-family"];
                sendProps.fontSize = props["font-size"];
                sendProps.fontWeight = props["font-weight"];
                sendProps.fontStyle = props["font-style"];
                sendProps.color = props["fill"];
                sendProps.x = props["x"];
                sendProps.y = props["y"];
                sendProps.isTransformed = props["isTransformed"];
                break;
            case _drawOptions.wbConfig.getClassTypes("freeLine"):
            case _drawOptions.wbConfig.getClassTypes("straightLine"):
                sendProps.path = props["path"] + '';
                sendProps.backgroundColor = props["fill"];
                sendProps.color = props["stroke"];
                sendProps.lineWidth = props["stroke-width"];
                sendProps.lineStyle = props["stroke-dasharray"];
                sendProps.opacity = props["stroke-opacity"];
                break;
            case _drawOptions.wbConfig.getClassTypes("rectangle"):
                sendProps.width = props["width"];
                sendProps.height = props["height"];
                sendProps.cornerRadius = props["r"];
                sendProps.backgroundColor = props["fill"];
                sendProps.borderColor = props["stroke"];
                sendProps.borderWidth = props["stroke-width"];
                sendProps.borderStyle = props["stroke-dasharray"];
                sendProps.backgroundOpacity = props["fill-opacity"];
                sendProps.borderOpacity = props["stroke-opacity"];
                sendProps.x = props["x"];
                sendProps.y = props["y"];
                break;
            case _drawOptions.wbConfig.getClassTypes("circle"):
                sendProps.radius = props["r"];
                sendProps.backgroundColor = props["fill"];
                sendProps.borderColor = props["stroke"];
                sendProps.borderWidth = props["stroke-width"];
                sendProps.borderStyle = props["stroke-dasharray"];
                sendProps.backgroundOpacity = props["fill-opacity"];
                sendProps.borderOpacity = props["stroke-opacity"];
                sendProps.x = props["cx"];
                sendProps.y = props["cy"];
                break;
            case _drawOptions.wbConfig.getClassTypes("ellipse"):
                sendProps.hRadius = props["rx"];
                sendProps.vRadius = props["ry"];
                sendProps.backgroundColor = props["fill"];
                sendProps.borderColor = props["stroke"];
                sendProps.borderWidth = props["stroke-width"];
                sendProps.borderStyle = props["stroke-dasharray"];
                sendProps.backgroundOpacity = props["fill-opacity"];
                sendProps.borderOpacity = props["stroke-opacity"];
                sendProps.x = props["cx"];
                sendProps.y = props["cy"];
                break;
            case _drawOptions.wbConfig.getClassTypes("document"): // didn't added
                // doc
                // header
            case _drawOptions.wbConfig.getClassTypes("image"):
                sendProps.url = props["src"];
                sendProps.width = props["width"];
                sendProps.height = props["height"];
                sendProps.x = props["x"];
                sendProps.y = props["y"];
                break;
            case _drawOptions.wbConfig.getClassTypes("icon"):
                sendProps.iconName = props["iconName"];
                sendProps.x = props["x"];
                sendProps.y = props["y"];
                break;
            default:
                break;
        }
        return sendProps;
    }
    /**
     * Return the properties of the element to send the server.
     *
     * @private internal
     * @param helperBox
     * @returns sendProps
     */
    function _getElementProperties(helperbox) {
        if (helperbox === undefined) {
            return;
        }
        var sendProps = {},
            attrs = helperbox.element.attrs;
        sendProps.uuid = helperbox.uuid;
        sendProps.orderNo = helperbox.orderNo;
        if (helperbox.isTransformed)
            sendProps.isTransformed = helperbox.isTransformed;
        if (helperbox.iconName)
            sendProps.iconName = helperbox.iconName;
        sendProps.rotationDegree = attrs["rotation"];
        sendProps.transform = helperbox.element.transform();
        sendProps.slideNo = helperbox.slideNo;
        sendProps.wall = helperbox.wall;
        return _extend({}, _convertAttrToWbProperties(helperbox.classType, attrs), sendProps);
    };
    /**
     *
     */
    function _getPageElement(el) {
        var wbEl = {};
        wbEl.type = el.classType;
        wbEl.properties = _getElementProperties(el);
        return wbEl;
    }

    function _convertToJson(arg) {
        var elements = new Array,
            pageId, paper = arg;
        if (paper === undefined || paper == null) {
            paper = _drawOptions.paper;
        }
        if (!paper)
            return null;
        pageId = paper.canvas.id;
        for (var el = paper.bottom; el != null; el = el.next) {
            var elm;
            // if the element is not helperbox then ignore
            if (el.uuid === undefined) {
                continue;
            }
            elm = _getPageElement(el);
            elements.push({
                action: "create",
                element: elm,
                pageId: pageId
            });
        }
        return elements;
    }
    /**
     * Open dialog to input a text.
     *
     * @public
     * @param x
     *            X-coordinate where the text has to be input.
     * @param y
     *            Y-coordinate where the text has to be input.
     */
    var textField = $('<textarea id="whiteboardText"/>');

    function _pasteText(x, y, evntX, evntY) {
        _drawOptions.whiteboard.textEl.cx = cx = x;
        _drawOptions.whiteboard.textEl.cy = cy = y;
        textFieldHelper(evntX, evntY);
        textField.focus();
        // enable font size spinner if it is disabled
        // _enableFontSize();
    };

    function _closeInputText() {
        // to make sure last input text is cleared
        if (textField !== undefined) {
            var data = textField.val();
            textField.val('');
            textField.remove();
            if (!!data) {
                _drawOptions.whiteboard.textEl.boxWidth = textField.width();
                _drawOptions.whiteboard.textEl.boxHeight = textField.height();
                _drawText(data);
            }
        }
    };
    /**
     * Align Top for paper.text when there are multiple lines
     */
    function alignTop(t) {
        var b = t.getBBox();
        var h = Math.abs(b.y2) - Math.abs(b.y) + 1;
        t.attr({
            'y': b.y + h
        });
    }

    function editText() {
        // alert("Text edited");
    }

    function _setNewPropertiesToText() {
        textField
            .css({
                "font-family": _newProperties["font-family"] ? _newProperties["font-family"] : _drawOptions.wbConfig.getProperties("text")["font-family"],
                "font-size": _newProperties["font-size"] ? _newProperties["font-size"] : _drawOptions.wbConfig.getProperties("text")["font-size"],
                "font-style": _newProperties["font-style"] ? _newProperties["font-style"] : _drawOptions.wbConfig.getProperties("text")["font-style"],
                "font-weight": _newProperties["font-weight"] ? _newProperties["font-weight"] : _drawOptions.wbConfig.getProperties("text")["font-weight"],
                "color": _newProperties["stroke"] ? _newProperties["stroke"] : _drawOptions.wbConfig.getProperties("text")["fill"]
            });
    };

    function textFieldHelper(x, y) {
        _setNewPropertiesToText();
        textField.css({
                // To auto size the textArea
                position: 'absolute',
                width: 200,
                height: 50,
                left: x,
                top: y - 7
            })
            .mousemove(
                function(e) {
                    var myPos = $(this)
                        .offset();
                    myPos.bottom = $(this)
                        .offset()
                        .top + $(this)
                        .outerHeight();
                    myPos.right = $(this)
                        .offset()
                        .left + $(this)
                        .outerWidth();
                    if (myPos.bottom > e.pageY && e.pageY > myPos.bottom - 16 && myPos.right > e.pageX && e.pageX > myPos.right - 16) {
                        $(this)
                            .css({
                                cursor: "nw-resize"
                            });
                    } else {
                        $(this)
                            .css({
                                cursor: ""
                            });
                    };
                }) // the following simple make the textbox
            // "Auto-Expand" as it is typed in
            .keyup(
                function(e) {
                    // the following will help the text expand
                    // as typing
                    // takes place
                    while ($(this)
                        .outerHeight() < this.scrollHeight + parseFloat($(this)
                            .css("borderTopWidth")) + parseFloat($(this)
                            .css(
                                "borderBottomWidth"))) {
                        $(this)
                            .height($(this)
                                .height() + 1);
                    };
                })
            .appendTo(document.body);
    }
    // /**
    // * Position of the input text
    // *
    // * @private
    // * @param x
    // * @param y
    // */
    // _positionOfSelectedText = function(x, y) {
    // cx = x - _drawOptions.offset.left;
    // cy = y - _drawOptions.offset.top;
    // return cx, cy;
    // };
    /**
     * Register hover on element
     *
     * @param event
     */
    function _hoverOverEl(event) {
        if (_modeSwitcher.selectMode) {
            this.attr(_drawOptions.wbConfig.getAttributes("selectBoxVisible"));
            // this.attr("cursor", "default");
            return true;
        }
        if (_modeSwitcher.fillMode) {
            this.attr(_drawOptions.wbConfig.getAttributes("selectBoxVisible"));
            // this.attr("cursor", "default");
            return true;
        }
        if (_modeSwitcher.removeMode) {
            this.attr(_drawOptions.wbConfig.getAttributes("removeBoxVisible"));
            // this.attr("cursor", "crosshair");
            return true;
        }
        if (_modeSwitcher.bringFrontMode) {
            this.attr(_drawOptions.wbConfig.getAttributes("bringFrontBackBoxVisible"));
            // this.attr("cursor", "default");
            return true;
        }
        if (_modeSwitcher.bringBackMode) {
            this.attr(_drawOptions.wbConfig.getAttributes("bringFrontBackBoxVisible"));
            // this.attr("cursor", "default");
            return true;
        }
        if (_modeSwitcher.cloneMode) {
            this.attr(_drawOptions.wbConfig.getAttributes("cloneBoxVisible"));
            // this.attr("cursor", "default");
            return true;
        }
        // this.attr("cursor", _drawOptions.whiteboard.css("cursor"));
    };
    /**
     * Hover out
     *
     * @public
     * @param event
     */
    function _hoverOutEl(event) {
        if (_modeSwitcher.selectMode) {
            if (_selectedObj == null || _selectedObj.uuid != this.uuid || !_selectedObj.visibleSelect) {
                this.attr(_drawOptions.wbConfig.getAttributes("opacityHidden"));
            }
            return true;
        }
        with(_modeSwitcher) {
            if (moveMode || removeMode || bringFrontMode || bringBackMode || cloneMode || fillMode) {
                if (_selectedObj != null && _selectedObj.uuid == this.uuid && _selectedObj.visibleSelect) {
                    this.attr(_drawOptions.wbConfig.getAttributes("selectBoxVisible"));
                } else {
                    this.attr(_drawOptions.wbConfig.getAttributes("opacityHidden"));
                }
                // this.attr("cursor", "default");
                return true;
            }
        }
    };

    function _disableBindings(element) {
        if (element === undefined) {
            return;
        }
        return element.unhover(_hoverOverEl, _hoverOutEl)
            .unclick(_clickEl).untouchstart(_touchstartEl).untouchmove(_touchstartEl);
    }

    function _enableBindings(element) {
        if (element === undefined) {
            return;
        }
        return element.hover(_hoverOverEl, _hoverOutEl)
            .click(_clickEl).touchstart(_touchstartEl).touchmove(_touchstartEl);
    }

    function _touchstartEl(event) {
        if (_modeSwitcher.removeMode) {
            _removeElement(this, true, false).fadeOut(300);
            return true;
        }
    }
    /**
     * Register click hanlder to the element
     *
     * @private
     * @param event
     */
    function _clickEl(event) {
        if (_modeSwitcher.selectMode) {
            _selectElement(this);
            return true;
        }
        if (_modeSwitcher.removeMode) {
            _removeElement(this, true, true);
            return true;
        }
        if (_modeSwitcher.bringFrontMode) {
            // forward order
            var orderNo = _forwardOrder();
            _setElementSequence(orderNo);
            _bringFrontElement(this, orderNo, true, false);
            return true;
        }
        if (_modeSwitcher.bringBackMode) {
            // reverse order
            var orderNo = _backwardOrder();
            _setElementSequence(orderNo);
            _bringBackElement(this, orderNo, true, false);
            return true;
        }
        if (_modeSwitcher["fillMode"]) {
            _fillElement(this);
            _setCurrentElementProperties();
            return true;
        }
        if (_modeSwitcher.cloneMode) {
            _cloneElement(this);
            return true;
        }
        return false;
    };
    /**
     * Pase Image on the whiteboard
     *
     * @private
     * @param x
     *            X-coordinate where the image has to be pasted.
     * @param y
     *            Y-coordinate where the image has to be pasted.
     */
    function _pasteImage(x, y) {
        _drawOptions.whiteboard.imageEl.cx = x;
        _drawOptions.whiteboard.imageEl.cy = y;
        if (_drawOptions.whiteboard.imageEl.inputUrl != null)
            _drawImage();
        return false;
    };
    /**
     * Paste Icon on the whiteboard
     *
     * @private
     * @param x
     *            X-coordinate where the icon has to be pasted.
     * @param y
     *            Y-coordinate where the icon has to be pasted.
     */
    function _pasteIcon(x, y) {
        if (_drawOptions.whiteboard.iconEl.icon == null || _drawOptions.whiteboard.iconEl.icon === undefined) {
            _invokeLogger({
                type: "error",
                message: "Clicking the whiteboard without selecting the icon."
            });
            return;
        }
        _drawOptions.whiteboard.iconEl.cx = x - _drawOptions.whiteboard.iconEl.icon.offsetX;
        _drawOptions.whiteboard.iconEl.cy = y - _drawOptions.whiteboard.iconEl.icon.offsetY;
        var iconElement = _drawOptions.paper.path(
                _drawOptions.whiteboard.iconEl.icon.attr("path"))
            .attr({
                fill: "#000",
                stroke: "none"
            });
        var transformArray = _covertTransToArray(
            _drawOptions.whiteboard.iconEl.icon, _drawOptions.whiteboard.iconEl.cx, _drawOptions.whiteboard.iconEl.cy);
        var hb = _drawHelperBox(iconElement, _drawOptions.wbConfig
            .getClassTypes("icon"), null, _drawOptions.wbConfig
            .getProperties("icon")
            .rotation, _drawOptions.wbConfig
            .getProperties("icon")
            .scale, true, null);
        hb.iconName = _drawOptions.whiteboard.iconEl.iconName;
        iconElement.transform(transformArray);
        hb.transform(transformArray);
        // send changes to server
        var xC = Math.round(hb.attr("x") + 1);
        var yC = Math.round(hb.attr("y") + 1);
        if (_drawOptions.isBroadcastable) {
            var drawReturns = {};
            drawReturns.state = "onSend";
            drawReturns.sendchanges = {
                "action": "create",
                "element": {
                    "type": _drawOptions.wbConfig.getClassTypes("icon"),
                    "properties": {
                        "uuid": hb.uuid,
                        "orderNo": hb.orderNo,
                        "x": xC,
                        "y": yC,
                        "rotationDegree": _drawOptions.wbConfig.getProperties("icon")
                            .rotation,
                        "iconName": _drawOptions.whiteboard.iconEl.iconName,
                        "scaleFactor": _drawOptions.wbConfig.getProperties("icon")
                            .scale,
                        "transform": hb.transform()
                    }
                }
            };
            _invokeDrawFunction(drawReturns);
        }
        var myObj = {};
        myObj.state = "onCreateElement";
        myObj.properties = hb;
        _invokeDrawFunction(myObj);
    };
    /**
     * Click handler on whiteboard Here when we click it will print the element
     * on the whiteboard.
     */
    function _clickHandler(event) {
        _closeInputText();
        if (_modeSwitcher.imageMode) {
            _pasteImage((event.pageX - left) * scale, (event.pageY - top) * scale);
            return true;
        }
        if (_modeSwitcher.iconMode) {
            _pasteIcon((event.pageX - left) * scale, (event.pageY - top) * scale);
            return true;
        }
        if (_modeSwitcher.textMode) {
            _pasteText((event.pageX - left) * scale, (event.pageY - top) * scale, event.pageX, event.pageY);
            return true;
        }
        return false;
    };

    function _initWhiteboard() {
        _initVariables();
        //   _calculateOffset();
        _extendWhiteboardObj();
    };
    /**
     * Draw helper shapes around the element
     *
     * @param el
     * @param classType
     *            rectangle,circle, line etc
     * @param rotation
     * @param scale
     * @param select
     * @param id
     * @param isTransformed
     *            Whether the element is transformed
     * @param wall
     *            The element background. 'W' - Whiteboard, 'D' - Document
     * @param slideNo
     *            The slide no. of the document.
     */
    function _drawHelperBox(el, classType, orderNo, rotation, scale, select,
        id, isTransformed, wall, slideNo) {
        // scale
        if (scale && scale != 1.0) {
            el.scale(scale, scale);
        }
        var bbox = el.getBBox();
        var bboxWidth = parseFloat(bbox.width);
        var bboxHeight = parseFloat(bbox.height);
        var helperRect = _drawOptions.paper.rect(bbox.x - 1, bbox.y - 1, (bboxWidth !== 0 ? bboxWidth + 2 : 3), (bboxHeight !== 0 ? bboxHeight + 2 : 3));
        helperRect.attr(_drawOptions.wbConfig.getAttributes("helperRect"));
        helperRect.hover(_hoverOverEl, _hoverOutEl);
        helperRect.click(_clickEl);
        helperRect.touchstart(_touchstartEl);
        helperRect.touchmove(_touchstartEl);
        // rotate
        if (rotation && rotation != 0) {
            el.rotate(rotation, bbox.x + bboxWidth / 2,
                bbox.y + bboxHeight / 2, true);
            el.attr("rotation", parseInt(rotation));
            helperRect.rotate(rotation, bbox.x + bboxWidth / 2, bbox.y + bboxHeight / 2, true);
        }
        // set references
        helperRect.element = el;
        helperRect.classType = classType;
        helperRect.orderNo = orderNo;
        if (!wall) {
            helperRect.wall = wall;
        } else {
            helperRect.wall = 'W';
        }
        if (slideNo !== undefined && slideNo != null) {
            helperRect.slideNo = slideNo;
        } else {
            helperRect.slideNo = 0;
        }
        if (classType == _drawOptions.wbConfig.getClassTypes("text"))
            helperRect.isTransformed = isTransformed;
        if (id == null) {
            helperRect.uuid = Raphael.createUUID() || uuid();
        } else {
            helperRect.uuid = id;
        }
        if (select) {
            if (_selectedObj != null) {
                // hide last selection
                _selectedObj.attr(_drawOptions.wbConfig.getAttributes("opacityHidden"));
            }
            // set drawn element as selected
            _selectedObj = helperRect;
            _selectedObj.visibleSelect = false;
        }
        return helperRect;
    };
    /**
     * Renew Dimensions of helper box
     */
    function _renewHelperbox() {
        var bbox = _selectedObj.element.getBBox();
        var bboxWidth = parseFloat(bbox.width);
        var bboxHeight = parseFloat(bbox.height);
        _selectedObj.attr({
            'x': bbox.x - 1,
            'y': bbox.y - 1,
            'width': (bboxWidth !== 0 ? bboxWidth + 2 : 3),
            'height': (bboxHeight !== 0 ? bboxHeight + 2 : 3)
        });
    };
    /**
     * Draw icons in the "choose icon" dialog
     *
     * @function
     */
    function _drawIcons() {
        var x = 0,
            y = 0;
        var fillStroke = {
            fill: "#000",
            stroke: "none"
        };
        var fillNone = {
            fill: "#000",
            opacity: 0
        };
        var fillHover = {
            fill: "90-#0050af-#002c62",
            stroke: "#FF0000"
        };
        var iconPaper = Raphael("iconsArea", 600, 360);
        var wbIcons = _drawOptions.wbConfig.getSvgIconSet();
        for (var name in wbIcons) {
            if (wbIcons.hasOwnProperty(name)) {
                var curIcon = iconPaper.path(wbIcons[name])
                    .attr(fillStroke)
                    .translate(x, y);
                curIcon.offsetX = x + 20;
                curIcon.offsetY = y + 20;
                var overlayIcon = iconPaper.rect(x, y, 40, 40)
                    .attr(fillNone);
                overlayIcon.icon = curIcon;
                overlayIcon.iconName = name;
                overlayIcon.click(function(event) {
                        _drawOptions.whiteboard.iconEl.icon = this.icon;
                        _drawOptions.whiteboard.iconEl.iconName = this.iconName;
                    })
                    .hover(function() {
                        this.icon.attr(fillHover);
                    }, function() {
                        this.icon.attr(fillStroke);
                    });
                x += 40;
                if (x > 560) {
                    x = 0;
                    y += 40;
                }
            }
        }
    };
    /**
     *  Restores elements into the paper. 
     */
    function _restorePaper(arrElements, broadcast, isEnableUndo) {
        for (var i = 0; i < arrElements.length; i++) {
            var objElement = arrElements[i];
            _createElementAfterVerification(objElement.properties,
                objElement.type, objElement.properties.orderNo, broadcast, isEnableUndo);
        }
    };
    /**
     * Verify and create element when restoring the whiteboard elements
     */
    function _createElementAfterVerification(props, classType, orderNo, broadcast, isEnableUndo) {
        // Make sure if the object with this UID exist or not, if it
        // is exist skip to avoid duplication.
        if (_drawOptions.paper.wbElements[props.uuid] !== undefined) {
            return;
        };
        if (orderNo == undefined) {
            orderNo = _forwardOrder();
        }
        _setElementSequence(orderNo);
        _createElement(props, classType, orderNo, broadcast, isEnableUndo);
    }
    /**
     * Creates element used when restoring the whiteboard elements or when
     * the broadcaster receives the element
     *
     * @private
     * @param props
     *            element properties as JavaScript object (key, value).
     * @param classType
     *            element type.
     * @param orderNo
     * @param broadcast
     *            Broadcastable is true otherwise not
     * @isEnableUndo Is enable udno/redo action?
     */
    function _createElement(props, classType, orderNo, broadcast, isEnableUndo) {
        var hb;
        switch (classType) {
            case _drawOptions.wbConfig.getClassTypes("text"):
                var textElement = _drawOptions.paper.text(props.x, props.y,
                        props.text)
                    .attr({
                        "text-anchor": "start"
                    });
                _setElementProperties(textElement, {
                    "font-family": props.fontFamily,
                    "font-size": props.fontSize,
                    "font-weight": props.fontWeight,
                    "font-style": props.fontStyle,
                    "fill": props.color
                });
                hb = _drawHelperBox(textElement, _drawOptions.wbConfig
                    .getClassTypes("text"), orderNo, props.rotationDegree,
                    null, false, props.uuid, props.isTransformed, props.wall,
                    props.slideNo);
                _setWbElement(hb.uuid, hb);
                break;
            case _drawOptions.wbConfig.getClassTypes("freeLine"):
                var freeLine = _drawOptions.paper.path(props.path);
                _setElementProperties(freeLine, {
                    "stroke": props.color,
                    "stroke-width": props.lineWidth,
                    "stroke-dasharray": props.lineStyle,
                    "stroke-opacity": props.opacity,
                    "fill": props.backgroundColor
                });
                hb = _drawHelperBox(freeLine, _drawOptions.wbConfig
                    .getClassTypes("freeLine"), orderNo, props.rotationDegree,
                    null, false, props.uuid, props.isTransformed, props.wall,
                    props.slideNo);
                _setWbElement(hb.uuid, hb);
                break;
            case _drawOptions.wbConfig.getClassTypes("straightLine"):
                var straightLine = _drawOptions.paper.path(props.path);
                _setElementProperties(straightLine, {
                    "stroke": props.color,
                    "stroke-width": props.lineWidth,
                    "stroke-dasharray": props.lineStyle,
                    "stroke-opacity": props.opacity
                });
                hb = _drawHelperBox(straightLine, _drawOptions.wbConfig
                    .getClassTypes("straightLine"), orderNo,
                    props.rotationDegree, null, false, props.uuid,
                    props.isTransformed, props.wall, props.slideNo);
                _setWbElement(hb.uuid, hb);
                break;
            case _drawOptions.wbConfig.getClassTypes("rectangle"):
                var rectElement = _drawOptions.paper.rect(props.x, props.y,
                    props.width, props.height, props.cornerRadius);
                rectElement.scale(1, 1); // workaround for webkit based
                // browsers
                _setElementProperties(rectElement, {
                    "fill": props.backgroundColor,
                    "stroke": props.borderColor,
                    "stroke-width": props.borderWidth,
                    "stroke-dasharray": props.borderStyle,
                    "fill-opacity": props.backgroundOpacity,
                    "stroke-opacity": props.borderOpacity
                });
                hb = _drawHelperBox(rectElement, _drawOptions.wbConfig
                    .getClassTypes("rectangle"), orderNo, props.rotationDegree,
                    null, false, props.uuid, props.isTransformed, props.wall,
                    props.slideNo);
                _setWbElement(hb.uuid, hb);
                break;
            case _drawOptions.wbConfig.getClassTypes("circle"):
                var circleElement = _drawOptions.paper.circle(props.x, props.y,
                    props.radius);
                circleElement.scale(1, 1); // workaround for webkit based
                // browsers
                _setElementProperties(circleElement, {
                    "fill": props.backgroundColor,
                    "stroke": props.borderColor,
                    "stroke-width": props.borderWidth,
                    "stroke-dasharray": props.borderStyle,
                    "fill-opacity": props.backgroundOpacity,
                    "stroke-opacity": props.borderOpacity
                });
                hb = _drawHelperBox(circleElement, _drawOptions.wbConfig
                    .getClassTypes("circle"), orderNo, props.rotationDegree,
                    null, false, props.uuid, props.isTransformed, props.wall,
                    props.slideNo);
                _setWbElement(hb.uuid, hb);
                break;
            case _drawOptions.wbConfig.getClassTypes("ellipse"):
                var ellipseElement = _drawOptions.paper.ellipse(props.x, props.y,
                    props.hRadius, props.vRadius);
                ellipseElement.scale(1, 1); // workaround for webkit based
                // browsers
                _setElementProperties(ellipseElement, {
                    "fill": props.backgroundColor,
                    "stroke": props.borderColor,
                    "stroke-width": props.borderWidth,
                    "stroke-dasharray": props.borderStyle,
                    "fill-opacity": props.backgroundOpacity,
                    "stroke-opacity": props.borderOpacity
                });
                hb = _drawHelperBox(ellipseElement, _drawOptions.wbConfig
                    .getClassTypes("ellipse"), orderNo, props.rotationDegree,
                    null, false, props.uuid, props.isTransformed, props.wall,
                    props.slideNo);
                _setWbElement(hb.uuid, hb);
                break;
            case _drawOptions.wbConfig.getClassTypes("image"):
                var imageElement = _drawOptions.paper.image(props.url, props.x,
                    props.y, props.width, props.height);
                hb = _drawHelperBox(imageElement, _drawOptions.wbConfig
                    .getClassTypes("image"), orderNo, props.rotationDegree,
                    null, false, props.uuid, props.isTransformed, props.wall,
                    props.slideNo);
                _setWbElement(hb.uuid, hb);
                break;
            case _drawOptions.wbConfig.getClassTypes("document"):
                // remove previous slide and hide elements
                // set doc details
                var nwObj = {};
                nwObj.state = "onBeforeDocCreate";
                nwObj.properties = props.docSlideNo;
                _invokeDrawFunction(nwObj);
                var imageElement = _drawOptions.paper.image(props.url, props.x,
                    props.y, props.width, props.height);
                hb = _drawHelperBox(imageElement, _drawOptions.wbConfig
                    .getClassTypes("document"), orderNo, props.rotationDegree,
                    null, false, props.uuid, props.isTransformed, props.wall,
                    props.slideNo);
                imageElement.toBack();
                hb.toBack();
                // show elements of the slide
                var nwObj = {};
                nwObj.state = "onUpdateHelperBox";
                nwObj.properties = hb, hb = _invokeDrawFunction(nwObj);
                _setWbElement(hb.uuid, hb);
                break;
            case _drawOptions.wbConfig.getClassTypes("icon"):
                var iconElement = _drawOptions.paper.path(
                        _drawOptions.wbConfig.getSvgIconSet(props.iconName))
                    .attr({
                        fill: "#000",
                        stroke: "none"
                    });
                hb = _drawHelperBox(iconElement, _drawOptions.wbConfig
                    .getClassTypes("icon"), orderNo, props.rotationDegree,
                    null, false, props.uuid, props.isTransformed, props.wall,
                    props.slideNo);
                hb.iconName = props.iconName;
                _setWbElement(hb.uuid, hb);
                break;
            default:
                break;
        }
        var drawReturns = {};
        drawReturns.sendchanges = {
            "action": "create",
            "element": {
                "type": classType,
                "properties": props
            }
        };
        if (_drawOptions.isBroadcastable && broadcast) {
            drawReturns.state = "onSend";
            _invokeDrawFunction(drawReturns);
        }
        if (isEnableUndo) {
            drawReturns.state = "onEnableUndo";
            _invokeDrawFunction(drawReturns);
        }
        var myObj = {};
        myObj.state = "onCreateElement";
        myObj.properties = hb;
        _invokeDrawFunction(myObj);
        // add transform to the element and helper
        if (props.transform !== undefined && props.transform != null) {
            hb.element.transform(props.transform);
            hb.transform(props.transform);
        };
    };
    /**
     * Update element, used when the broadcaster receives the element
     *
     * @private
     * @param props
     *            element properties as JavaScript object (key, value).
     * @param classType
     *            element type.
     */
    function _updateElement(sentProps, classType) {
        // find element to be updated
        var hbu = _drawOptions.paper.wbElements[sentProps.uuid];
        if (hbu == null) {
            // not found ==> nothing to do
            _invokeLogger({
                type: "debug",
                message: "Element to be updated does not exist anymore in this Whiteboard"
            });
            return;
        }
        // make sure that previous elements bbox are changed to
        // invisible
        _trnsUnplug(false);
        if (_selectedObj != null) {
            _selectedObj.attr(_drawOptions.wbConfig.getAttributes("opacityHidden"));
        }
        var props = {};
        switch (classType) {
            case _drawOptions.wbConfig.getClassTypes("text"):
                props["text"] = sentProps.text;
                props["font-family"] = sentProps.fontFamily;
                props["font-size"] = sentProps.fontSize;
                props["font-weight"] = sentProps.fontWeight;
                props["font-style"] = sentProps.fontStyle;
                props["fill"] = sentProps.color;
                break;
            case _drawOptions.wbConfig.getClassTypes("freeLine"):
            case _drawOptions.wbConfig.getClassTypes("straightLine"):
                // props["path"] = sentProps.path;
                props["stroke"] = sentProps.color;
                props["stroke-width"] = sentProps.lineWidth;
                props["stroke-dasharray"] = sentProps.lineStyle;
                props["stroke-opacity"] = sentProps.opacity;
                props["fill"] = sentProps.backgroundColor;
                break;
            case _drawOptions.wbConfig.getClassTypes("rectangle"):
                props["width"] = sentProps.width;
                props["height"] = sentProps.height;
                props["r"] = sentProps.cornerRadius;
                props["fill"] = sentProps.backgroundColor;
                props["stroke"] = sentProps.borderColor;
                props["stroke-width"] = sentProps.borderWidth;
                props["stroke-dasharray"] = sentProps.borderStyle;
                props["fill-opacity"] = sentProps.backgroundOpacity;
                props["stroke-opacity"] = sentProps.borderOpacity;
                break;
            case _drawOptions.wbConfig.getClassTypes("circle"):
                props["r"] = sentProps.radius;
                props["fill"] = sentProps.backgroundColor;
                props["stroke"] = sentProps.borderColor;
                props["stroke-width"] = sentProps.borderWidth;
                props["stroke-dasharray"] = sentProps.borderStyle;
                props["fill-opacity"] = sentProps.backgroundOpacity;
                props["stroke-opacity"] = sentProps.borderOpacity;
                break;
            case _drawOptions.wbConfig.getClassTypes("ellipse"):
                props["rx"] = sentProps.hRadius;
                props["ry"] = sentProps.vRadius;
                props["fill"] = sentProps.backgroundColor;
                props["stroke"] = sentProps.borderColor;
                props["stroke-width"] = sentProps.borderWidth;
                props["stroke-dasharray"] = sentProps.borderStyle;
                props["fill-opacity"] = sentProps.backgroundOpacity;
                props["stroke-opacity"] = sentProps.borderOpacity;
                break;
            case _drawOptions.wbConfig.getClassTypes("document"):
                props["documentId"] = sentProps.documentId;
                props["docSlideNo"] = sentProps.docSlideNo;
                props["docTitle"] = sentProps.docTitle;
                props["pageCnt"] = sentProps.pageCnt;
            case _drawOptions.wbConfig.getClassTypes("image"):
                // props["src"] = sentProps.url;
                props["width"] = sentProps.width;
                props["height"] = sentProps.height;
                break;
            case _drawOptions.wbConfig.getClassTypes("icon"):
                props["scale"] = sentProps.scaleFactor.toFixed(1);
                hbu.iconName = sentProps.iconName;
                break;
            default:
        }
        props["rotation"] = sentProps.rotationDegree;
        // update element
        _setElementProperties(hbu.element, props);
        // transform element
        if (sentProps.transform !== undefined) {
            hbu.element.transform(sentProps.transform);
            hbu.transform(sentProps.transform);
        };
    };
    /**
     * To convert free transformation properties to array
     *
     * @private
     * @param obj
     * @param xoffset
     * @param yoffset
     */
    function _covertTransToArray(obj, xoffset, yoffset) {
        var ftest = _drawOptions.paper.freeTransform(obj, {
            keepRatio: false,
            draw: ['bbox'],
            scale: ['axisX', 'axisY', 'bboxCorners', 'bboxSides']
        });
        var center = {
                x: ftest.attrs.center.x + ftest.offset.translate.x,
                y: ftest.attrs.center.y + ftest.offset.translate.y
            },
            rotate = ftest.attrs.rotate - ftest.offset.rotate,
            scale = {
                x: ftest.attrs.scale.x / ftest.offset.scale.x,
                y: ftest.attrs.scale.y / ftest.offset.scale.y
            },
            translate = {
                x: ftest.attrs.translate.x - ftest.offset.translate.x,
                y: ftest.attrs.translate.y - ftest.offset.translate.y
            };
        var transformArray = ['R', rotate, center.x, center.y, 'S', scale.x,
            scale.y, center.x, center.y, 'T', translate.x + xoffset,
            translate.y + yoffset
        ];
        ftest.unplug();
        return transformArray;
    }
    /**
     * Add free transform to the object
     *
     * @param obj
     */
    function _addFreeTransform(obj) {
        _ft = _drawOptions.paper.freeTransform(obj, {
            keepRatio: false,
            draw: ['bbox'],
            scale: ['axisX', 'axisY', 'bboxCorners', 'bboxSides'],
            size: {
                axes: 5,
                bboxCorners: 2,
                bboxSides: 2,
                center: 5
            }
        }, function(ft, events) {
            if (events == "scale start" || events == "drag start" || events[0] == "rotate start") {
                // to save unmodified object for undo cache
                _oldEl = {};
                _oldEl = _createSelectObj();
            }
            if (events == "scale end" || events == "drag end" || events[0] == "rotate end") {
                _selectedObj.transform(obj.transform());
                _selectedObj.element = obj;
                if (_selectedObj.classType == _drawOptions.wbConfig
                    .getClassTypes("text")) {
                    _selectedObj.isTransformed = true;
                };
                var sendProps = _getElementProperties(_selectedObj);
                var objChanges = {
                    "action": "update",
                    "element": {
                        "type": _selectedObj.classType,
                        "properties": sendProps
                    }
                };
                if (_drawOptions.isBroadcastable) {
                    var drawReturns = {};
                    drawReturns.state = "onSend";
                    drawReturns.sendchanges = objChanges;
                    _invokeDrawFunction(drawReturns);
                }
            }
        });
    };
    /**
     * Unplug the transformation
     *
     * @private param flag -- true -- Add the hover, false skip
     *
     */
    function _trnsUnplug(flag) {
        if (flag)
            _selectedObj.hover(_hoverOverEl, _hoverOutEl);
        else if (_selectedObj != null && _drawOptions.paper.wbElements[_selectedObj.uuid]) {
            _selectedObj.hover(_hoverOverEl, _hoverOutEl);
        }
        if (_ft !== undefined && _ft !== null) {
            _ft.unplug();
        }
    };
    return {
        /**
         * Gets currently selected whiteboard element.
         *
         * @public
         * @returns {Raphael's element} currently selected element
         */
        getSelectedObject: function() {
            return _selectedObj;
        },
        /**
         * Get current element properties
         */
        getCurrentElementProperites: function(type) {
            return _getCurrentElementProperites(type);
        },
        /**
         * Set the image url, height, width when clicked "ok" on the image
         * dialog
         */
        setImageDetails: function(inputUrl, x, y, width, height) {
            _drawOptions.whiteboard.imageEl.cx = x * scale;
            _drawOptions.whiteboard.imageEl.cy = y * scale;
            _drawOptions.whiteboard.imageEl.inputUrl = inputUrl;
            _drawOptions.whiteboard.imageEl.width = width * scale;
            _drawOptions.whiteboard.imageEl.height = height * scale;
        },
        setPaper: function(paper) {
            _drawOptions.paper = paper;
            _undoRedoStateChange();
            if (!_drawOptions.paper.wbElements) {
                _setWbElement({});
            } else {
                _clearStateChange();
            }
        },
        deleteElementStorage: function() {
            _initWhiteboard();
        },
        getElementOrder: function() {
            return _elementOrder;
        },
        getAllElements: function() {
            return _wbElementsToArrayElements(_drawOptions.paper.wbElements);
        },
        wbElementsToArrayElements: function(elementsObj) {
            return _wbElementsToArrayElements(elementsObj);
        },
        setElementOrder: function(elementOrder) {
            _elementOrder = elementOrder;
        },
        /**
         * Removes element but doesn't broadcast the changes
         */
        removeElement: function(uuid, broadcast, isEnableUndo) {
            _removeElementAfterVerification(uuid, broadcast, isEnableUndo);
        },
        bringFrontElement: function(uuid, orderNo, broadcast, isEnableUndo) {
            _bringFrontElementAfterVerification(uuid, orderNo, broadcast, isEnableUndo);
        },
        bringBackElement: function(uuid, orderNo, broadcast, isEnableUndo) {

            _bringBackElementAfterVerification(uuid, orderNo, broadcast, isEnableUndo);
        },
        undoAction: function() {
            _undoAction();
        },
        redoAction: function() {
            _redoAction();
        },
        clearAction: function(broadcast) {
            broadcast = broadcast || false;
            _clearAction(broadcast, true);
        },
        clearDocElements: function(elArray) {
            _clearDocElements(elArray);
        },
        createElement: function(props, classType, orderNo, broadcast, isEnableUndo) {
            _createElementAfterVerification(props, classType, orderNo, broadcast, isEnableUndo);
        },
        updateElement: function(props, classType) {
            _updateElement(props, classType);
        },
        restorePaper: function(arrElements, broadcast, isEnableUndo) {
            _restorePaper(arrElements, broadcast, isEnableUndo);
        },
        switchToMode: function(mode, cursor) {
            _switchToMode(mode, cursor);
        },
        /**
         * @name : Can be Object as type->name or just string
         * @value : value
         */
        changeProperties: function(name, value) {
            if (arguments.length < 2) {
                _changeProperties(name);
            } else {
                var obj = {};
                obj[name] = value;
                _changeProperties(obj);
            }

        },
        setOptions: function(options) {
            _setDrawOptions(options);
        },
        changeBroadcastState: function(state) {
            _drawOptions.isBroadcastable = state;
        },
        initWhiteboard: function() {
            _initWhiteboard();
        },
        drawIcons: function() {
            _drawIcons();
        },
        drawDocument: function(slideNo) {
            _drawDocument(slideNo);
        },
        createTracker: function(paper) {
            if (paper == undefined) {
                _createTracker(_drawOptions.paper);
            } else
            // create a rectangle to capture the mouse and touch events
                _createTracker(paper);
        },
        removeTracker: function(paper) {
            if (paper == undefined) {
                _removeTracker(_drawOptions.paper);
            } else
                _removeTracker(paper);
        },
        /**
         * removes hover and click bindings.
         *
         * @param element
         * @returns
         */
        disableBindings: function(element) {
            return _disableBindings(element);
        },
        enableBindings: function(element) {
            return _enableBindings(element);
        },
        hideElements: function(ids) {
            _hideElements(ids);
        },
        showElements: function(ids) {
            _showElements(ids);
        },
        setOffset: function(offset) {
            if (offset == undefined) {
                return;
            }
            _drawOptions.offset = offset;
            _calculateOffset();
        },
        getOffset: function() {
            return _drawOptions.offset;
        },
        getScale: function() {
            if (isNaN(scale)) {
                _invokeLogger({
                    type: "error",
                    message: "Found the scale to NaN.Replacing with 1"
                });
                return parseInt(1);
            }
            return scale;
        },
        setScale: function(newScale) {
            scale = newScale;
        },
        /**
         * Get supported mode options
         */
        getModOption: function() {
            var modOptions = []
            for (var name in _modeSwitcher) {
                if (_modeSwitcher.hasOwnProperty(name))
                    modOptions.push(name);
            }
            return modOptions;
        },
        getCurrentMode: function() {
            for (var name in _modeSwitcher) {
                if (_modeSwitcher.hasOwnProperty(name))
                    if (_modeSwitcher[name])
                        return name;
            }
            return "others"
        },
        setScroll: function(x, y) {
            _wbScroll.x = x;
            _wbScroll.y = y;
            _calculateOffset();
        },
        reset: function() {
            _wbScroll.x = 0;
            _wbScroll.y = 0;
            _calculateOffset();
            scale = 1;
        },
        convertToJson: function(paper) {
            return _convertToJson(paper);
        }
    };
}(jQuery));