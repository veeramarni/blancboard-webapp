Configuration = (function() {
    /**
     * Paper Type
     *
     * @private
     * @type property
     * @mandatory
     */
    var paperTypes = {
            whiteboard: "Whiteboard",
            document: "Document"
        },
        /**
         * Java classes for JSON serialization / deserialization.
         *
         * @private
         * @type object
         */
        classTypes = {
            text: "Text",
            freeLine: "FreeLine",
            straightLine: "StraightLine",
            rectangle: "Rectangle",
            circle: "Circle",
            ellipse: "Ellipse",
            image: "Image",
            icon: "Icon",
            document: "Document"
        },
        errorTypes = {
            info: "Info",
            warn: "Warn",
            error: "Error"
        },
        /**
         * Default properties for all elements.
         *
         * @private
         * @type object
         */
        properties = {
            text: {
                "text": "",
                "font-family": "Verdana",
                "font-size": 12,
                "font-weight": "normal",
                "font-style": "normal",
                "fill": "#000000",
                "rotation": 0
            },
            freeLine: {
                "stroke": "#000000",
                "stroke-width": 3,
                "stroke-dasharray": "No",
                "stroke-opacity": 1.0,
                "rotation": 0
            },
            straightLine: {
                "stroke": "#000000",
                "stroke-width": 3,
                "stroke-dasharray": "No",
                "stroke-opacity": 1.0,
                "rotation": 0
            },
            rectangle: {
                "width": 0,
                "height": 0,
                "r": 0,
                // "fill": "#FFFFFF",
                "stroke": "#000000",
                "stroke-width": 1,
                "stroke-dasharray": "No",
                "fill-opacity": 1.0,
                "stroke-opacity": 1.0,
                "rotation": 0
            },
            circle: {
                "r": 0,
                // "fill": "#FFFFFF",
                "stroke": "#000000",
                "stroke-width": 1,
                "stroke-dasharray": "No",
                "fill-opacity": 1.0,
                "stroke-opacity": 1.0,
                "rotation": 0
            },
            ellipse: {
                "rx": 0,
                "ry": 0,
                // "fill": "none",
                "stroke": "#000000",
                "stroke-width": 1,
                "stroke-dasharray": "No",
                "fill-opacity": 1.0,
                "stroke-opacity": 1.0,
                "rotation": 0
            },
            image: {
                "width": 150,
                "height": 150,
                "rotation": 0
            },
            icon: {
                "scale": 1.0,
                "rotation": 0
            }
        },
        /**
         * Dasharray mapping.
         *
         * @private
         * @type object
         */
        dasharrayMapping = {
            // "No": "", // Batik don't understand it so replaced with "none"
            "No": "none",
            "Dash": "-",
            "Dot": ".",
            "DashDot": "-.",
            "DashDotDot": "-..",
            "DotBlank": ". ",
            "DashBlank": "- ",
            "DashDash": "--",
            "DashBlankDot": "- .",
            "DashDashDot": "--.",
            "DashDashDotDot": "--.."
        },
        /**
         * Attributes for various helper objects around element - e.g. selected,
         * moving, to be removed, etc. element.
         *
         * @private
         * @type object
         */
        attributes = {
            helperRect: {
                "stroke-width": 2,
                "stroke-opacity": 0,
                "fill": "#0D0BF5",
                "fill-opacity": 0
            },
            circleSet: {
                "stroke": "#0D0BF5",
                "stroke-width": 1,
                "stroke-opacity": 0,
                "fill": "#0D0BF5",
                "fill-opacity": 0
            },
            opacityHidden: {
                "stroke-opacity": 0,
                "fill-opacity": 0
            },
            opacityVisible: {
                "stroke-opacity": 0.8,
                "fill-opacity": 0.8
            }
        };
    /**
     * Attributes for helper object around selected element.
     *
     * @private
     * @type object
     */
    attributes.selectBoxVisible = $.extend({}, attributes.helperRect, {
        "stroke": "#0D0BF5",
        "stroke-opacity": 0.8,
        "stroke-dasharray": ".",
        "fill-opacity": 0
    });
    /**
     * Attributes for helper object around moving element.
     *
     * @private
     * @type object
     */
    attributes.moveBoxVisible = $.extend({}, attributes.helperRect, {
        "stroke": "#0D0BF5",
        "stroke-opacity": 0.8,
        "stroke-dasharray": "-",
        "fill": "#0276FD",
        "fill-opacity": 0.2
    });
    /**
     * Attributes for helper object around element to be brought to front or to
     * back.
     *
     * @private
     * @type object
     */
    attributes.bringFrontBackBoxVisible = $.extend({}, attributes.helperRect, {
        "stroke": "#71AA24",
        "stroke-opacity": 0.8,
        "stroke-dasharray": "-",
        "fill": "#A5DC5B",
        "fill-opacity": 0.2
    });
    /**
     * Attributes for helper object around element to be removed.
     *
     * @private
     * @type object
     */
    attributes.removeBoxVisible = $.extend({}, attributes.helperRect, {
        "stroke": "#FF0000",
        "stroke-opacity": 0.8,
        "stroke-dasharray": "-",
        "fill": "#FF0000",
        "fill-opacity": 0.2
    });
    /**
     * Attributes for helper object around element to be cloned.
     *
     * @private
     * @type object
     */
    attributes.cloneBoxVisible = $.extend({}, attributes.helperRect, {
        "stroke": "#8B4513",
        "stroke-opacity": 0.8,
        "stroke-dasharray": "-.",
        "fill": "#F4A460",
        "fill-opacity": 0.2
    });
    return {
        getSettings: function(param) {
            return settings[param];
        },
        getClassTypes: function(type) {
            return classTypes[type];
        },
        getPaperTypes: function(type) {
            return paperTypes[type];
        },
        getDocumentProps: function(property) {
            if (property !== undefined) return document[property];
            else return document;
        },
        getProperties: function(property) {
            return properties[property];
        },
        getDasharrayMapping: function (dash)
        {
            if (dash !== undefined)
                return dasharrayMapping[dash];
            else
                return
            dasharrayMapping;
        },
        getAttributes: function(attribute) {
            return attributes[attribute];
        },
        getSelectBoxVisible: function() {
            return attributes.selectBoxVisible;
        },
        getMoveBoxVisible: function() {
            return attributes.moveBoxVisible;
        },
        getBringFrontBackBoxVisible: function() {
            return attributes.bringFrontBackBoxVisible;
        },
        getRemoveBoxVisible: function() {
            return attributes.removeBoxVisible;
        },
        getCloneBoxVisible: function() {
            return attributes.cloneBoxVisible;
        },
        getErrorTypes: function(type) {
            return errorTypes[type];
        }
    };
})();