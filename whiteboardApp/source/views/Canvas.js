enyo.kind({
    name: "blanc.Canvas",
    kind: "enyo.Control",
    tag: "canvas",
    context: null,
    visibile: !1,
    attributes: {
        width: 0,
        height: 0
    },
    points: null,
    pointIdx: 0,
    animid: null,
    lineWidth: 1,
    thumbnailUpdateTimer: null,
    THUMBNAIL_HEIGHT: 120,
    THUMBNAIL_WIDTH: 160,
    handlers: {
        ondown: "touchDown",
        ondragstart: "dragStart",
        ondrag: "dragMove",
        ondragfinish: "dragEnd",
        onup: "touchUp",
        onMeetingEnded: "commit",
        onCanShare: "canShareChanged"
    },
    events: {
        onCanvasAction: "",
        onUndoStateChanged: "",
        onThumbnailUpdated: ""
    },
    published: {
        scale: 1,
        dirty: !1,
        log: null
    },
    create: function() {
        if (this.inherited(arguments), this.log = [], this.persistent) {
            var e = this,
                t = blanc.Session.getPersistenceManager();
            t.getLogForPage(e.page.id, function(t) {
                e.setLog(t), e.visible && e.restorePaths()
            }, function(t) {
                e.log(t)
            })
        }
    },
    destroy: function() {
        this.commit(), this.inherited(arguments)
    },
    getContext: function() {
        if (!this.context) {
            var e = this.hasNode();
            e.getContext && (this.context = e.getContext("2d"))
        }
        return this.context
    },
    clearCanvas: function() {
        var e = this.getContext();
        e.clearRect(0, 0, this.getAttribute("width"), this.getAttribute("height"))
    },
    reset: function() {
        this.points = null, this.pointIdx = 0, this.clearCanvas()
    },
    clear: function() {
        this.clearAction(!0)
    },
    clearAction: function(e) {
        if (this.reset(), this.persistent) {
            var t = blanc.Session.getPersistenceManager(),
                n = new mc.api.canvas.Path;
            n.pathid = mc.util.randomUUID(), n.pageId = this.page.id, n.assetId = this.page.assetId, n.timestamp = (new Date).getTime(), t.storePath(n, function() {}, function() {
                self.log("failed to clear")
            })
        }
        var i = new mc.api.canvas.PageAction;
        i.type = mc.api.canvas.ActionType.CLEAR, i.pageId = this.page.id, this.addActionToLog(i), e && this.raiseAction(i)
    },
    undo: function() {
        this.undoAction(!0)
    },
    undoAction: function(e) {
        if (this.reset(), this.restorePaths(!0), e) {
            var t = new mc.api.canvas.PageAction;
            t.type = mc.api.canvas.ActionType.UNDO, t.pageId = this.page.id, this.raiseAction(t)
        }
    },
    midPoint: function(e, t) {
        var n = {
            x: (e.x + t.x) / 2,
            y: (e.y + t.y) / 2
        };
        return n
    },
    addPoint: function(e, t) {
        var n = {
            x: e / this.getScale(),
            y: t / this.getScale()
        };
        this.points.push(n)
    },
    doDrawPath: function() {
        if (this.points && !(2 > this.points.length)) {
            var e = this.pointIdx;
            this.pointIdx = this.points.length;
            var t = this.points.slice(0),
                n = this.getContext();
            if (n.lineJoin = "round", n.lineCap = "round", blanc.Session.getCanvasInfo().getMode() == mc.api.canvas.PathMode.PEN) {
                var i = blanc.Session.getCanvasInfo();
                n.strokeStyle = "#" + i.getColor(), n.lineWidth = Math.max(1, i.getWidth() * this.getScale()), n.globalCompositeOperation = "source-over"
            } else n.globalCompositeOperation = "destination-out", n.strokeStyle = "rgba(255,255,255,1.0)", n.lineWidth = Math.max(1, blanc.CanvasInfo.ERASER_WIDTH * this.getScale());
            n.beginPath();
            for (var o = e; t.length > o; o++) {
                var s = t[o],
                    a = t[o - 1],
                    r = o > 1 ? t[o - 2] : a,
                    c = this.midPoint(a, r),
                    l = this.midPoint(s, a);
                n.moveTo(c.x * this.getScale(), c.y * this.getScale()), n.quadraticCurveTo(a.x * this.getScale(), a.y * this.getScale(), l.x * this.getScale(), l.y * this.getScale())
            }
            n.stroke(), n.closePath()
        }
    },
    drawPath: function() {
        var e = this;
        this.animid = requestAnimationFrame(function() {
            e.drawPath()
        }), this.doDrawPath()
    },
    touchDown: function(e, t) {
        if (blanc.Session.notDrawing()) return !1;
        var n = this.hasNode().getBoundingClientRect(),
            i = t.clientY - n.top,
            o = t.clientX - n.left;
        return this.points = [], this.pointIdx = 1, this.addPoint(o, i), this.drawPath(), !0
    },
    dragStart: function(e, t) {
        if (!this.points) return !1;
        var n = this.hasNode().getBoundingClientRect(),
            i = t.clientY - n.top,
            o = t.clientX - n.left;
        return this.pointIdx = 1, this.addPoint(o, i), !0
    },
    dragMove: function(e, t) {
        if (!this.points) return !1;
        var n = this.hasNode().getBoundingClientRect(),
            i = t.clientY - n.top,
            o = t.clientX - n.left;
        return this.addPoint(o, i), !0
    },
    dragEnd: function() {
        return this.points ? !0 : !1
    },
    touchUp: function(e, t) {
        if (this.animid && cancelAnimationFrame(this.animid), !this.points) return !1;
        var n, i = blanc.Session.getCanvasInfo();
        if (1 == this.points.length) {
            var o = this.hasNode().getBoundingClientRect(),
                s = t.clientY - o.top,
                a = t.clientX - o.left;
            n = this.getContext(), n.beginPath(), n.arc(a, s, i.getWidth() / 2, 0, 2 * Math.PI), n.fillStyle = "#" + i.getColor(), n.globalCompositeOperation = i.getMode() == mc.api.canvas.PathMode.PEN ? "source-over" : "destination-out", n.fill(), n.closePath()
        } else if (this.doDrawPath(), this.points.length > 2) {
            var r = this.points[this.points.length - 1],
                c = this.points[this.points.length - 2],
                l = this.midPoint(r, c);
            n = this.getContext(), n.moveTo(l.x * this.getScale(), l.y * this.getScale()), n.lineTo(r.x * this.getScale(), r.y * this.getScale()), n.stroke()
        }
        var h = mc.api.canvas.Segment.segments(this.points),
            d = new mc.api.canvas.Path;
        d.id = mc.util.randomUUID(), d.pageId = this.page.id, d.assetId = this.page.assetId, d.mode = i.getMode(), d.color = i.getColor(), d.width = i.getWidth(), d.segments = h, d.timestamp = (new Date).getTime(), this.savePath(d);
        var u = new mc.api.canvas.PageAction;
        return u.pageId = this.page.id, u.path = d, u.type = mc.api.canvas.ActionType.PATH, this.addActionToLog(u), this.raiseAction(u), this.points = null, !0
    },
    savePath: function(e) {
        if (this.persistent) {
            var t = blanc.Session.getPersistenceManager();
            t.storePath(e, function() {}, function() {
                self.log("failed to store path")
            })
        }
    },
    restorePaths: function(e) {
        var t = this.getLog();
        if (t && enyo.isArray(t)) {
            if (e && t.length > 0 && (t.pop(), this.persistent)) {
                var n = blanc.Session.getPersistenceManager();
                n.undoPath(this.page.id, function() {}, function() {
                    self.log("failed to undo")
                })
            }
            for (var i = t.length - 1; i >= 0 && t[i].type != mc.api.canvas.ActionType.CLEAR;) i--;
            for (var o = i + 1; t.length > o; o++) {
                var s = t[o],
                    a = s.path;
                this.restorePath(a)
            }
            this.pathsChanged()
        }
    },
    performAction: function(e) {
        switch (e.type) {
            case mc.api.canvas.ActionType.CLEAR:
                this.clearAction(!1);
                break;
            case mc.api.canvas.ActionType.UNDO:
                this.undoAction(!1);
                break;
            case mc.api.canvas.ActionType.PATH:
                var t = e.path;
                this.restorePath(t), t.timestamp = (new Date).getTime(), this.savePath(t), this.addActionToLog(e)
        }
        this.scheduleThumbnailUpdate()
    },
    restorePath: function(e) {
        var t = this.getContext();
        t.lineJoin = "round", t.lineCap = "round", e.mode == mc.api.canvas.PathMode.PEN ? (t.strokeStyle = "#" + e.color, t.globalCompositeOperation = "source-over") : (t.globalCompositeOperation = "destination-out", t.strokeStyle = "rgba(255,255,255,1.0)");
        for (var n = 0; e.segments.length > n; n++) {
            var i = e.segments[n].points;
            if (t.beginPath(), 1 == i.length) {
                var o = i[0];
                t.arc(o.x * this.getScale(), o.y * this.getScale(), e.width * this.getScale() / 2, 0, 2 * Math.PI), t.lineWidth = 0, t.fillStyle = "#" + e.color, t.fill()
            } else if (2 == i.length) {
                var s = i[0],
                    a = i[1];
                t.lineWidth = Math.max(1, e.width * this.getScale()), t.moveTo(s.x * this.getScale(), s.y * this.getScale()), t.lineTo(a.x * this.getScale(), a.y * this.getScale()), t.stroke()
            } else if (i.length > 2) {
                t.lineWidth = Math.max(1, e.width * this.getScale());
                for (var r, c, l, h = null, d = null, u = 1; i.length > u; u++) h = i[u], r = i[u - 1], c = u > 1 ? i[u - 2] : r, l = this.midPoint(r, c), d = this.midPoint(h, r), t.moveTo(l.x * this.getScale(), l.y * this.getScale()), t.quadraticCurveTo(r.x * this.getScale(), r.y * this.getScale(), d.x * this.getScale(), d.y * this.getScale());
                t.moveTo(d.x * this.getScale(), d.y * this.getScale()), t.lineTo(h.x * this.getScale(), h.y * this.getScale()), t.stroke()
            }
            t.closePath()
        }
    },
    didAppear: function() {
        this.visible = !0, this.restoreTimeout && clearTimeout(this.restoreTimeout), this.restorePaths()
    },
    didDisappear: function() {
        this.visible = !1, this.commit()
    },
    resizeHandler: function() {
        this.inherited(arguments), this.visible && this.restoreCanvas()
    },
    restoreCanvas: function() {
        var e = this;
        this.restoreTimeout && clearTimeout(this.restoreTimeout), this.restoreTimeout = setTimeout(function() {
            e.visible && (e.clearCanvas(), e.restorePaths(!1))
        }, 500)
    },
    hasPaths: function() {
        return this.log && this.log.length > 0
    },
    canClear: function() {
        return this.log && this.log.length > 0 ? this.log[this.log.length - 1].type != ActionType.CLEAR : !1
    },
    pathsChanged: function() {
        this.doUndoStateChanged({
            undo: this.hasPaths(),
            clear: this.canClear()
        })
    },
    canShareChanged: function(e, t) {
        t.value && this.visible && this.doUndoStateChanged({
            undo: this.hasPaths(),
            clear: this.canClear()
        })
    },
    addActionToLog: function(e) {
        this.getLog().push(e), this.pathsChanged(), this.persistent && this.setDirty(!0)
    },
    commit: function(e, t) {
        if (!this.persistent || !this.dirty) return enyo.isFunction(e) && e(), void 0;
        this.dirty = !1;
        var n = this,
            i = blanc.Session.getPersistenceManager();
        i.commitPaths(this.page.id, function() {
            enyo.isFunction(e) && e()
        }, function() {
            n.dirty = !0, enyo.isFunction(t) && t()
        })
    },
    raiseAction: function(e) {
        this.doCanvasAction({
            action: e
        }), this.thumbnailUpdateTimer && clearTimeout(this.thumbnailUpdateTimer), this.scheduleThumbnailUpdate()
    },
    scheduleThumbnailUpdate: function() {
        if (!this.page.previewId) {
            var e = this;
            this.thumbnailUpdateTimer = setTimeout(function() {
                e.updateThumbnail()
            }, 300)
        }
    },
    updateThumbnail: function() {
        this.thumbnailUpdateTimer = null;
        var e = document.createElement("canvas");
        e.width = this.THUMBNAIL_WIDTH, e.height = this.THUMBNAIL_HEIGHT;
        var t = e.getContext("2d");
        t.drawImage(this.hasNode(), 0, 0, this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);
        var n = e.toDataURL("image/png"),
            i = this,
            o = blanc.Session.getPersistenceManager(),
            s = function(e, t) {
                o.storeBlob(e.thumbId, e.assetId, t, function() {
                    i.doThumbnailUpdated({
                        id: e.id,
                        docId: e.assetId,
                        pageNo: e.pageNo,
                        data: t
                    })
                }, function() {
                    console.log("Failed to store blob")
                })
            };
        this.page.thumbId ? s(this.page, n) : (this.page.thumbId = mc.util.randomUUID(), o.updatePage(this.page, function(e) {
            s(e, n)
        }, function() {
            console.log("Failed to update page")
        }))
    }
});