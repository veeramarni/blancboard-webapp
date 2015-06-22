enyo.kind({
    name: "blanc.GridLayout",
    kind: "Layout",
    layoutClass: "mm-grid",
    getClientControls: function() {
        for (var e, t = this.container.getControls(), n = [], i = 0; e = t[i]; i++) e.tag ? n.push(e) : n.push.apply(n, e.getClientControls());
        return n
    },
    positionControls: function() {
        var e = this.getClientControls();
        if (0 !== e.length) {
            for (var t = 2 * this.margin, n = this.getDimensions(), i = Math.floor(n.width / (t + this.width)), o = 0; e.length > o; o++) this.positionControl(e[o], o, i);
            var s = (Math.ceil(e.length / i) + 1) * (t + this.height);
            this.container.applyStyle("height", s + "px")
        }
    },
    positionControl: function(e, t, n) {
        var i = 2 * this.margin,
            o = this.collapsed ? 0 : Math.floor(t / n) * (i + this.height),
            s = this.collapsed ? this.alignmentMargin : t % n * (i + this.width) + this.alignmentMargin;
        e.applyStyle("top", o + "px"), e.applyStyle("left", s + "px"), e.applyStyle("opacity", this.collapsed && 0 !== t ? 0 : 1)
    },
    reflow: function() {
        this.dim = null, this.margin = this.container.cellMargin || 0, this.collapsed = this.container.gridCollapsed || !1, this.height = this.container.cellHeight || 100, this.width = this.container.cellWidth || 100, this.deferTime = this.container.deferTime || 0, this.align = this.container.gridAlign || "left", this.deferTime ? enyo.job("mm.GridLayout.defer" + this.container.id, enyo.bind(this, "positionControls"), this.deferTime) : this.positionControls()
    },
    getDimensions: function() {
        if (!this.dim) {
            var e = enyo.dom.getComputedStyle(this.container.hasNode());
            this.dim = {
                width: parseInt(e.width),
                height: parseInt(e.height)
            }, this.calcAlignmentMargin(this.dim)
        }
        return this.dim
    },
    calcAlignmentMargin: function(e) {
        e = e || this.getDimensions();
        var t = Math.floor(e.width / (2 * this.margin + this.width)),
            n = e.width - t * (2 * this.margin + this.width);
        this.alignmentMargin = "right" === this.align ? n : "center" === this.align ? Math.round(n / 2) : 0
    }
}), enyo.kind({
    name: "blanc.Grid",
    kind: "Control",
    layoutKind: "blanc.GridLayout"
});