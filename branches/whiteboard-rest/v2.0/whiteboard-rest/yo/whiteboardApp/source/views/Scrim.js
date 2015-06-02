enyo.kind({
    name: "blanc.Scrim",
    showing: !1,
    classes: "blanc-scrim enyo-fit",
    floating: !1,
    create: function() {
        this.inherited(arguments), this.zStack = [], this.floating && this.setParent(enyo.floatingLayer)
    },
    showingChanged: function() {
        this.floating && this.showing && !this.hasNode() && this.render(), this.inherited(arguments)
    },
    addZIndex: function(e) {
        0 > enyo.indexOf(e, this.zStack) && this.zStack.push(e)
    },
    removeZIndex: function(e) {
        enyo.remove(e, this.zStack)
    },
    showAtZIndex: function(e) {
        this.addZIndex(e), void 0 !== e && this.setZIndex(e), this.show()
    },
    hideAtZIndex: function(e) {
        if (this.removeZIndex(e), this.zStack.length) {
            var t = this.zStack[this.zStack.length - 1];
            this.setZIndex(t)
        } else this.hide()
    },
    setZIndex: function(e) {
        this.zIndex = e, this.applyStyle("z-index", e)
    },
    make: function() {
        return this
    }
}), enyo.kind({
    name: "blanc.scrimSingleton",
    kind: null,
    constructor: function(e, t) {
        this.instanceName = e, enyo.setPath(this.instanceName, this), this.props = t || {}
    },
    make: function() {
        var e = new blanc.Scrim(this.props);
        return enyo.setPath(this.instanceName, e), e
    },
    showAtZIndex: function(e) {
        var t = this.make();
        t.showAtZIndex(e)
    },
    hideAtZIndex: enyo.nop,
    show: function() {
        var e = this.make();
        e.show()
    }
}), new blanc.scrimSingleton("blanc.scrim", {
    floating: !0,
    classes: "mm-scrim-translucent"
}), new blanc.scrimSingleton("blanc.scrimTransparent", {
    floating: !0,
    classes: "mm-scrim-transparent"
});