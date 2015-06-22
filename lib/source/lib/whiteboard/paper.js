/**
 * paperGroup has all the logic related to Raphael paper and the page
 * properties.
 */
paperGroup = (function() {

    var _paperProperties, _pageCount, _paperStack, _paperEmpty, _initialElementOrder, _paperOptions = {
        // the following are mandatory to set
        // whiteboard placehold component
        whiteboard: null,
        // Document placehold component
        docrepo: null,
        // wrapper div for whiteboard and document board
        boardWrapper: null,
        // UUID of the user
        userId: null,
        // Configuration of paper
        paperConfig: null,
        //
        isCreator: false
    };

    function _init() {
        /**
         * Paper Properties to store paper information
         */
        _paperProperties = {
            "header": {},
            "paper": null,
            "elementOrder": {},
            "paperType": null,
            "pageId": 0
        };
        /**
         * Page Count. There is always be atleast a page, so it's initial value
         * is 1.
         *
         * @private
         * @type integer
         */
        _pageCount = 1;
        /**
         * Stores _paperProperties
         *
         * @private
         * @type array
         */
        _paperStack = [];
        /**
         * To determine whether the paper is empty
         */
        _paperEmpty = {
            isEmpty: true,
            pageId: []
        };
        /**
         * Initial setting for low Sequence and Max sequence for ordering the
         * element
         *
         * @private
         * @type object
         */
        _initialElementOrder = {
            "lowSeq": 10000, // default min
            "maxSeq": 10000 // default max
        };
    }

    function _setOptions(options) {
        _init();
        _paperOptions = $.extend(_paperOptions, options);
    };
    /**
     * Triggers the callback function
     */
    function _invokeFunction(arg) {
        switch (arg.state) {
            case "onEmptyPage":
                if (typeof(_paperOptions.onEmptyPage) != 'undefined')
                    _paperOptions.onEmptyPage(arg.properties);
                break;
            case "onNonEmptyPage":
                if (typeof(_paperOptions.onNonEmptyPage) != 'undefined')
                    _paperOptions.onNonEmptyPage(arg.properties);
                break;
            case "onLastPage":
                if (typeof(_paperOptions.onLastPage) != 'undefined')
                    _paperOptions.onLastPage(arg.properties);
                break;
            case "onNotLastPage":
                if (typeof(_paperOptions.onNotLastPage) != 'undefined')
                    _paperOptions.onNotLastPage(arg.properties);
                break;
            case "onCreateDocPaper":
                if (typeof(_paperOptions.onCreateDocPaper) != 'undefined')
                    _paperOptions.onCreateDocPaper(arg.properties);
                break;
            case "onCreatePaper":
                if (typeof(_paperOptions.onCreatePaper) != 'undefined')
                    _paperOptions.onCreatePaper(arg.properties);
                break;
            case "onRemovePaper":
                if (typeof(_paperOptions.onRemovePaper) != 'undefined')
                    _paperOptions.onRemovePaper(arg);
                break;
            case "onBeforePageChange":
                if (typeof(_paperOptions.onBeforePageChange) != 'undefined')
                    _paperOptions.onBeforePageChange(arg.properties);
                break;
            case "onFirstPage":
                if (typeof(_paperOptions.onFirstPage) != 'undefined')
                    _paperOptions.onFirstPage(arg.properties);
                break;
            case "onPageChange":
                if (typeof(_paperOptions.onPageChange) != 'undefined')
                    _paperOptions.onPageChange(arg.properties);
                break;
        };
    };
    /**
     * Returns the index of the page number. It returns -1 if it don't find the
     * page
     *
     * @param pageId
     */
    function _indexOfPaperstack(pageId) {
        var retVal = undefined;
        for (var i = 0; i < _paperStack.length; i += 1) {
            if (_paperStack[i].pageId == pageId) {
                retVal = i;
                break;
            }
        }
        if (retVal === undefined)
            retVal = -1;
        return retVal;
    };

    function _findPaper(pageId) {
        return $.grep(_paperStack, function(el) {
            return el.pageId == pageId;
        });
    };

    function hasPages() {
        return _paperStack.length > 0;
    };
    /**
     * Next Valid Page Number after the remove operation
     *
     * @param indexId
     */
    function _nextValidPage(indexId) {
        if (indexId > 0) {
            return _paperStack[parseInt(indexId) - 1].pageId;
        }
        if (indexId == 0) {
            return _paperStack[parseInt(indexId) + 1].pageId;
        } else {
            log
                .error("Illegal Action, there are no pages in the whiteboard");
            return -1;
        }
    };
    /**
     * Mark an Empty Page. Also make sure only unique paperpageId are stored. It
     * check the page at sending and receiving to mark it
     *
     * @private
     * @param paperNo
     */
    function _markEmptyPage(paperNo) {
        logDebug("Marking page as empty :" + paperNo);
        _paperEmpty.isEmpty = true;
        var returnObject = {};
        returnObject.state = "onEmptyPage";
        returnObject.properties = _paperProperties;
        _invokeFunction(returnObject);
        if ($.inArray(paperNo, _paperEmpty.pageId) < 0)
            _paperEmpty.pageId.push(paperNo);
    };
    /**
     * Un Mark any empty page. Unmark page if something written on the page.
     *
     * @private
     */
    function _unmarkEmptyPage(paperNo) {
        logDebug("Unmarking page as empty :" + paperNo);
        if (paperNo == undefined)
            _paperEmpty.pageId = [];
        else
            _paperEmpty.pageId.splice($
                .inArray(paperNo, _paperEmpty.pageId), 1);
        if (_paperEmpty.pageId.length == 0) {
            logDebug("UnMarking everything. No page found to be empty");
            _paperEmpty.isEmpty = false;
            var returnObject = {};
            returnObject.state = "onNonEmptyPage";
            returnObject.properties = _paperProperties;
            _invokeFunction(returnObject);
        }
    };
    /**
     * If it is the last page in the paperstack then page close will be
     * deactivated
     */
    function _markLastPage() {

        if (_getWhitePapers().length == 1) {
            logDebug("Last page left, so deactivating the page close icon");
            var returnObject = {};
            returnObject.state = "onLastPage";
            _invokeFunction(returnObject);
        } else {
            logDebug("Not a last page");
            var returnObject = {};
            returnObject.state = "onNotLastPage";
            _invokeFunction(returnObject);
        }
    };
    /**
     * Create new paper. It set the currentPageId, paper to this new page.
     *
     * @private
     * @function
     */
    function _createPaperOfSize(id, isDoc, svgWidth, svgHeight) {
            // maintain a 4:3 aspect ratio : landscape
            var widthToHeightRatio = 4 / 3;
            // we will fit to width
            svgHeight = wrapperWidth / widthToHeightRatio;
            if (wrapperHeight < svgHeight) {
                svgWidth = wrapperWidth * (wrapperHeight / svgHeight);
                svgHeight = wrapperHeight;
            }
            var paper;
            if (isDoc) {
                paper = Raphael($(_paperOptions.docrepo).attr("id"), svgWidth, svgHeight);
            } else {
                paper = Raphael($(_paperOptions.whiteboard).attr("id"), svgWidth, svgHeight);
            }
            paper.canvas.id = id;
            paper.setViewBox(0, 0, svgWidth, svgHeight, true);
            var svg = _paperOptions.boardWrapper.find('svg#' + id);
            svg.parent().append(svg);
            $(svg).removeAttr("height");
            $(svg).removeAttr("width");
            $(svg).height(svgHeight);
            $(svg).width(svgWidth);
            // set paper properties
            _paperProperties = {};
            _paperProperties.paper = paper;
            _paperProperties.paper.undocache = [];
            _paperProperties.paper.redocache = [];
            _paperProperties.pageId = id;
            _paperProperties.elementOrder = new Object();
            _paperProperties.elementOrder.lowSeq = _initialElementOrder.lowSeq;
            _paperProperties.elementOrder.maxSeq = _initialElementOrder.maxSeq;
            _paperStack.push(_paperProperties);
            // Add page to carousel
            var returnObject = {};
            returnObject.state = "onCreatePaper";
            returnObject.properties = _paperProperties;
            returnObject.properties.isDocType = isDoc;
            _invokeFunction(returnObject);
            logDebug("Setting the low seq :" + _paperProperties.elementOrder.lowSeq + " and max seq :" + _paperProperties.elementOrder.maxSeq + " for Page " + id);
            logDebug("createPaper()>>>>Marking the new paper " + _paperProperties.pageId + " as Empty");
            if (!isDoc) {
                _markEmptyPage(_paperProperties.pageId);
                _markLastPage();
            };
        }
        /**
         * Create new paper. It set the currentPageId, paper to this new page.
         *
         * @private
         * @function
         */
    function _createPaper(id, isDoc) {
        // var svgWidth = wrapperWidth = _paperOptions.boardWrapper.width();
        // var svgHeight= wrapperHeight = _paperOptions.boardWrapper.height();
        var svgWidth = wrapperWidth = 1460;
        var svgHeight = wrapperHeight = 757;
        _createPaperOfSize(id, isDoc, svgWidth, svgHeight);
    };
    /**
     * Remove page from the paperStack ,front end and wpages component
     *
     * @private
     * @function
     */
    function _removePage(id) {
        var paperId = id;
        if (_paperEmpty.isEmpty) {
            _unmarkEmptyPage(paperId);
        }
        if (paperId == undefined) { // get the last created page
            throw ("pageId to be removed should be undefined");
        } else {
            logDebug("removePage()>>>>removing page no " + paperId);
        }
        // remove svg comp. through carousel,so commenting below
        // _paperOptions.whiteboard.find('svg#' + paperId).remove();
        // validate and send the previous page
        var index = _indexOfPaperstack(paperId);
        if (index >= 0) {
            _currentPage(_nextValidPage(index), true);
            logDebug("removing the index " + index + " from paperStack.");
            _paperStack.splice(index, 1);
            // also remove page from elementOrderByPage -TODO
        } else {
            logError("Couldn't find the page [" + id + "] to remove");
        }
        var returnObject = {};
        returnObject.state = "onRemovePaper";
        if (_isDocumentPaper()) {
            returnObject.type = _paperOptions.paperConfig.getPaperTypes("document");
            returnObject.documentId = _paperProperties.header.documentId;
            returnObject.pageId = paperId;
        } else {
            returnObject.type = _paperOptions.paperConfig.getPaperTypes("whiteboard");
            returnObject.pageId = paperId;
            // as this function applies to non doc pages only
            _markLastPage();
        }

        _invokeFunction(returnObject);
    };

    function _isDocumentPaper(index) {
        if (index !== undefined) {
            return (_paperStack[index].paperType == _paperOptions.paperConfig
                .getPaperTypes("document")) ? true : false;
        }
        return (_paperProperties.paperType == _paperOptions.paperConfig
            .getPaperTypes("document")) ? true : false;
    };
    /**
     *
     * Add new page for a given page id. It check whether empty page exist, if
     * exist it will move to that page
     *
     * @private
     */
    function _addPage(isDoc, docHeader) {
        if (isDoc) {
            _currentPage(_nextPageSquenceNo(true), true, true, docHeader);
            return;
        }
        _currentPage(_nextPageSquenceNo(true), true);
    };
    /**
     * Set current Page both in the javascript and front end.
     *
     * @private
     * @param pageId
     * @param scroll --
     *            true if need to the carousel tab to current page otherwise
     *            false
     */
    function _currentPage(pgId, scroll, isDoc, docHeader) {
        var returnObject = {},
            isDocType = false,
            pageId = pgId;
        returnObject.state = "onBeforePageChange";
        returnObject.properties = _paperProperties;
        _invokeFunction(returnObject);
        if (pageId == 0) {
            if (_paperOptions.isCreator && _paperOptions.paperConfig.getSettings("initialPage")) {
                pageId = 1;
                var returnObject = {};
                returnObject.state = "onFirstPage";
                returnObject.properties = _paperProperties;
                _invokeFunction(returnObject);
            } else {
                return;
            }
        }
        if (_paperProperties.pageId != pageId) {
            // current page don't exist
            logDebug("currentPage()>>>Page No :" + pageId + " not the current page.");
            var paperFound = _findPaper(pageId);
            if (paperFound == undefined || paperFound.length == 0) {
                _createPaper(pageId, isDoc);
            } else if (paperFound.length > 1) {
                logError("Duplicate paper found withe pageId :" + pageId);
            } else {
                _paperProperties = paperFound[0];
            }
            logDebug("currentPage()>>>Turning Display on for : #" + _paperProperties.pageId);
            logDebug("Setting the low seq :" + _paperProperties.elementOrder.lowSeq + " and max seq :" + _paperProperties.elementOrder.maxSeq + " for Page " + pageId);
        }
        isDocType = isDoc || !!_searchDocByPageId(pageId);
        if (isDocType) {
            _paperOptions.docrepo.find('svg').not('svg#' + pageId).hide();
            if (!!arguments[3])
                _changePaperToDocType(docHeader);
            else {
                if (_paperProperties.header === undefined)
                    throw new Error("Trying to create document page but the header info is null");
            }
            _paperOptions.boardWrapper
                .find('svg#' + _paperProperties.pageId)
                .show();
        }
        var returnObject = {};
        returnObject.state = "onPageChange";
        returnObject.properties = _paperProperties;
        returnObject.properties.isDocType = isDocType;
        returnObject.properties.scroll = scroll;
        _invokeFunction(returnObject);
    };

    function _getWhitePapers() {
        var whitePaperStac = [];
        for (var pp = 0; pp < _paperStack.length; pp++) {
            if (!_isDocumentPaper(pp))
                whitePaperStac.push(_paperStack[pp]);
        }
        return whitePaperStac;
    };

    function _getPageNo(pageId) {
        var papers = _getWhitePapers();
        for (var pp; pp < papers.length; pp++) {
            if (papers[pp].pageId == pageId)
                return parseInt(pp) + 1;
        }
    };

    function _getPaper(pageId) {
        var papers = _getWhitePapers();
        for (var pp; pp < papers.length; pp++) {
            if (papers[pp].pageId == pageId)
                return papers[pp].paper;
        }
    };

    function _getDocPapers() {
        var docPaperStac = [];
        for (var pp = 0; pp < _paperStack.length; pp++) {
            if (_isDocumentPaper(pp))
                docPaperStac.push(_paperStack[pp]);
        }
        return docPaperStac;
    };
    /**
     * Search the page id from the given docId
     *
     * @private
     * @docId - Id of the document
     * @returns - pageId
     */
    function _searchDocByDocId(docId) {
        var docPapers = _getDocPapers();
        for (var pp = 0; pp < docPapers.length; pp++) {
            if (docPapers[pp].header.documentId == docId) {
                return docPapers[pp].pageId;
            }
        }
    };
    /**
     * @private
     * @pageId
     * @returns - paperProperties
     */
    function _searchDocByPageId(pageId) {
        var docPapers = _getDocPapers();
        for (var pp = 0; pp < docPapers.length; pp++) {
            if (docPapers[pp].pageId == pageId) {
                return docPapers[pp];
            }
        }
    };

    function _updatePageCnt(docId, pageCnt) {
        var pageId = _searchDocByDocId(docId);
        for (var id = 0; id < _paperStack.length; id++) {
            if (_paperStack[id].pageId == pageId) {
                var paperProps = _paperStack[id];
                paperProps.header.pageCnt = pageCnt;
                _paperStack[id] = paperProps;
            }
        }
    }

    function _setDocDetails(docSlideNo, prevSlideId) {
        _paperProperties.header.docSlideNo = docSlideNo;
        if (prevSlideId !== undefined) {
            _paperProperties.header.prevSlideId = prevSlideId;
        }
    };
    /**
     * Change the paper header to convert to document type, takes 1 or 3
     * arguments
     */
    function _changePaperToDocType(id, slideNo, title, ownerId, pageCnt) {
        if (_isDocumentPaper()) {
            return;
        }
        var headerInfo = {};
        if (arguments.length > 3) {
            headerInfo.documentId = id;
            headerInfo.docSlideNo = slideNo;
            headerInfo.docTitle = title;
            headerInfo.docOwnerId = ownerId;
            headerInfo.pageCnt = pageCnt || 0;
        } else {
            headerInfo = id;
        }
        // add one more property for storing elements of slide
        headerInfo.slideElements = {};
        _paperProperties.paperType = _paperOptions.paperConfig
            .getPaperTypes("document");
        _paperProperties.header = $.extend({}, headerInfo);
    };

    function _createDocPaper(headerInfo) {
        // add doc page
        _addPage(true, headerInfo);
        var returnObject = {};
        returnObject.state = "onCreateDocPaper";
        returnObject.properties = _paperProperties;
        _invokeFunction(returnObject);
    };

    function _updateHelperBox(hb) {
        hb = $
            .extend(
                hb, {
                    documentId: _paperProperties.header.documentId,
                    docSlideNo: _paperProperties.header.docSlideNo,
                    docTitle: _paperProperties.header.docTitle,
                    docOwnerId: _paperProperties.header.docOwnerId,
                    pageCnt: _paperProperties.header.pageCnt,
                    prevSlideId: (_paperProperties.header.prevSlideId !== undefined) ? _paperProperties.header.prevSlideId : null,
                    // set order no. to 0
                    orderNo: 0
                });
        _paperProperties.header.currentSlideId = hb.uuid;
        return hb;
    };
    /**
     * Generates the next page id.
     *
     * @param forceNewPage -
     *            if it is true it always generates new id when empty page is
     *            detected otherwise sends the empty page id
     * @returns pageId
     */
    function _nextPageSquenceNo(forceNewPage) {
        if (!_paperEmpty.isEmpty) {
            if (_paperStack.length == 0) {
                return 1;
            }
            _pageCount = (parseInt(_paperStack[_paperStack.length - 1].pageId) >= _pageCount + 1) ? parseInt(_paperStack[_paperStack.length - 1].pageId) + 1 : _pageCount + 1;
            logDebug("nextPageSequence()>>>>There is no empty page, creating new sequence id :" + _pageCount);
            return _pageCount;
        } else {
            if (forceNewPage) {
                if (_paperStack.length == 0) {
                    return 1;
                }
                _pageCount = (parseInt(_paperStack[_paperStack.length - 1].pageId) >= _pageCount + 1) ? parseInt(_paperStack[_paperStack.length - 1].pageId) + 1 : _pageCount + 1;
                logDebug(
                    "nextPageSquenceNo>>>>Empty page is detected but forcefully generates new id ",
                    _pageCount);
                return _pageCount;
            }
            logDebug(
                "nextPageSquenceNo>>>>Empty page is detected, it will reuse that paper",
                _paperEmpty.pageId);
            return _paperEmpty.pageId[0];
        }
    };
    return {
        // whiteboard paper size
        getWpSize: function() {
            return _getWhitePapers()
                .length;
        },
        removePageId: function(pageId) {
            _paperOptions.boardWrapper.find('svg#' + pageId).remove();
        },
        getCurrentPageId: function() {
            return _paperProperties.pageId;
        },
        getCurrentDocumentId: function() {
            if (_paperProperties.header === undefined || _paperProperties.header["documentId"] === undefined) {
                return 0;
            }
            return _paperProperties.header["documentId"];
        },
        setCurrentPage: function(pageId, scroll, isDoc, docHeader) {
            _currentPage(pageId, scroll, isDoc, docHeader);
        },
        getCurrentPaper: function() {
            return _paperProperties["paper"];
        },
        setElementOrder: function(elementOrder) {
            _paperProperties.elementOrder = elementOrder;
        },
        getElementOrder: function() {
            return _paperProperties.elementOrder;
        },
        isPaperEmpty: function() {
            return _paperEmpty.isEmpty;
        },
        markEmptyPage: function(paperNo) {
            _markEmptyPage(paperNo);
        },
        unmarkEmptyPage: function(paperNo) {
            _unmarkEmptyPage(paperNo);
        },
        createDocPaper: function(headerInfo) {
            _createDocPaper(headerInfo);
        },
        /**
         * Automatically creates the whiteboard or document page based on the
         * element type.
         *
         * @param -
         *            Element -It can be array or object
         * @param -
         *            pageId
         * @param -isCurrentView
         *            -Need to view this paper currently?
         */
        smartPageChange: function(arrEl, pageId, isCurrentView) {
            var document = _paperOptions.paperConfig.getPaperTypes("document"),
                doc = null,
                isDoc = false,
                headerInfo = null;
            if ($.isArray(arrEl)) {
                doc = WBUtility.or(arrEl, function(el) {
                    return el.type == document;
                });
                isDoc = !!doc;
            } else if ($.isPlainObject(arrEl)) {
                if (arrEl.type == document) {
                    doc = arrEl;
                    isDoc = true;
                }
            }
            if (isDoc) {
                var props = doc.properties;
                if (!props)
                    throw new Error("Fn(smartPageChange) >>>Trying to create document page but header info is null");
                headerInfo = {};
                headerInfo.documentId = props.documentId;
                headerInfo.docSlideNo = props.docSlideNo;
                headerInfo.docOwnerId = props.docOwnerId;
                headerInfo.docTitle = props.docTitle;
                headerInfo.pageCnt = props.pageCnt;
            }
            paperGroup.setCurrentPage(pageId, isCurrentView, isDoc, headerInfo);
        },
        getCurrentSlideNo: function() {
            return _paperProperties.header.docSlideNo;
        },
        /**
         * Gets all the Raphael papers in the whiteboard. Called from UI
         * component
         */
        getAllPapers: function() {
            var papers = [];
            for (var i = 0; i < _paperStack.length; i++) {
                papers.push(_paperStack[i].paper);
            }
            return papers;
        },
        isDocumentPaper: function() {
            return _isDocumentPaper();
        },
        removePage: function(id) {
            _removePage(id);
        },
        setDocDetails: function(docSlideNo, prevSlideId) {
            _setDocDetails(docSlideNo, prevSlideId);
        },
        updatePageCnt: function(docId, pageCnt) {
            _updatePageCnt(docId, pageCnt);
        },
        searchDocByDocId: function(docId) {
            return _searchDocByDocId(docId);
        },
        addSlideElementId: function(slideNo, id) {
            // reservation for saving the elements ids
            if (_paperProperties.header.slideElements[slideNo] === undefined) {
                _paperProperties.header.slideElements[slideNo] = [];
            }
            _paperProperties.header.slideElements[slideNo].push(id);
        },
        saveSlideElements: function(slideNo, id) {},
        changePaperToDocType: function(id, slideNo, title, ownerId, pageCnt) {
            _changePaperToDocType(id, slideNo, title, ownerId, pageCnt);
        },
        addPage: function() {
            _addPage();
        },
        updateHelperBox: function(hb) {
            return _updateHelperBox(hb);
        },
        getCurrentSlideId: function() {
            return _paperProperties.header.currentSlideId;
        },
        getSlideElsIDs: function(id) {
            return _paperProperties.header.slideElements[id];
        },
        removeSlideEls: function(id) {
            return _paperProperties.header.slideElements[id] = [];
        },
        setOptions: function(options) {
            _setOptions(options);
        },
        getPageId: function(indexId) {
            return _paperStack[parseInt(indexId)].pageId;
        },
        getPaper: function(paperId) {
            if (paperId)
                return _getPaper(paperId);
            else
                return _paperProperties["paper"];
        },
        getPageNo: function(pageId) {
            return _getPageNo(pageId);
        },
        getWhitePaper: function() {
            return _getWhitePapers();
        },
        getDocuments: function() {
            return _getDocPapers();
        },
        deletePaperStack: function() {
            _init();
            _paperOptions.boardWrapper.find('svg').remove();
        }
    };
})();