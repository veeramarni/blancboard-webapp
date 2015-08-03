enyo.kind({
	name: "blanc.Tooltip",
	kind: "onyx.Popup",
	classes: "mm-tooltip below left-arrow",
	autoDismiss: false,
	showDelay: 500,
	defaultLeft: -6,
	handlers: {
		onRequestShowTooltip: "requestShow",
		onRequestHideTooltip: "requestHide"
	},
   requestShow: function() {
        return this.showJob = setTimeout(this.bindSafely("show"), this.showDelay), !0
    },
    cancelShow: function() {
        clearTimeout(this.showJob)
    },
    requestHide: function() {
        return this.cancelShow(), this.inherited(arguments)
    },
    showingChanged: function() {
        this.cancelShow(), this.adjustPosition(!0), this.inherited(arguments)
    },
    applyPosition: function(e) {
        var t = "";
        for (var n in e) t += n + ":" + e[n] + (isNaN(e[n]) ? "; " : "px; ");
        this.addStyles(t)
    },
    adjustPosition: function() {
        if (this.showing && this.hasNode()) {
            var e = this.node.getBoundingClientRect();
            e.top + e.height > window.innerHeight ? (this.addRemoveClass("below", !1), this.addRemoveClass("above", !0)) : (this.addRemoveClass("above", !1), this.addRemoveClass("below", !0)), e.left + e.width > window.innerWidth && (this.applyPosition({
                "margin-left": -e.width,
                bottom: "auto"
            }), this.addRemoveClass("left-arrow", !1), this.addRemoveClass("right-arrow", !0))
        }
    },
    resizeHandler: function() {
        this.applyPosition({
            "margin-left": this.defaultLeft,
            bottom: "auto"
        }), this.addRemoveClass("left-arrow", !0), this.addRemoveClass("right-arrow", !1), this.adjustPosition(!0), this.inherited(arguments)
    }
})