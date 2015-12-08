enyo.kind({
    name: "ToastsCurve",
    kind: "animated.ToastCurve",
    locationV: "",
    locationH: "right",
    style: "width: 12em; height: 8em",
    components: [{
        content: "Donec nec nisl felis. Donec aliquet semper est, semper sagittis leo.",
        style: "margin-bottom: 10px"
    }, {
        name: "toasterOkBtn",
        kind: "onyx.Button",
        content: $L("Ok"),
        ontap: "toggleToastCurve"
    }, {
        kind: "onyx.Button",
        content: $L("Cancel"),
        ontap: "toggleToastCurve",
        style: "float: right;"
    }],
    toggleToastCurve: function() {
        this.$.toastCurveBottomLeft.set("showing", !this.$.toastCurveBottomLeft.get("showing")),
            this.$.toastCurveRight.set("showing", !this.$.toastCurveRight.get("showing"))
    }
});