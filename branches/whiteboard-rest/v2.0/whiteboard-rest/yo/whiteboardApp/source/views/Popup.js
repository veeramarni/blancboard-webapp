enyo.kind({
    name: "blanc.Popup",
    kind: "enyo.Popup",
    published: {
        scrimWhenModal: !0,
        scrim: !1,
        scrimClassName: "",
        defaultZ: 120
    },
    protectedStatics: {
        count: 0,
        highestZ: 120
    },
    showingChanged: function() {
        this.showing ? (blanc.Popup.count++, this.applyZIndex()) : blanc.Popup.count > 0 && blanc.Popup.count--, this.showHideScrim(this.showing), this.inherited(arguments)
    },
    showHideScrim: function(e) {
        if (this.floating && (this.scrim || this.modal && this.scrimWhenModal)) {
            var t = this.getScrim();
            if (e) {
                var n = this.getScrimZIndex();
                this._scrimZ = n, t.showAtZIndex(n)
            } else t.hideAtZIndex(this._scrimZ);
            enyo.call(t, "addRemoveClass", [this.scrimClassName, t.showing])
        }
    },
    getScrimZIndex: function() {
        return blanc.Popup.highestZ >= this._zIndex ? this._zIndex - 1 : blanc.Popup.highestZ
    },
    getScrim: function() {
        return this.modal && this.scrimWhenModal && !this.scrim ? blanc.scrimTransparent.make() : blanc.scrim.make()
    },
    applyZIndex: function() {
        this._zIndex = 2 * blanc.Popup.count + this.findZIndex() + 1, this._zIndex <= blanc.Popup.highestZ && (this._zIndex = blanc.Popup.highestZ + 1), this._zIndex > blanc.Popup.highestZ && (blanc.Popup.highestZ = this._zIndex), this.applyStyle("z-index", this._zIndex)
    },
    findZIndex: function() {
        var e = this.defaultZ;
        return this._zIndex ? e = this._zIndex : this.hasNode() && (e = Number(enyo.dom.getComputedStyleValue(this.node, "z-index")) || e), this.defaultZ > e && (e = this.defaultZ), this._zIndex = e, this._zIndex
    }
});