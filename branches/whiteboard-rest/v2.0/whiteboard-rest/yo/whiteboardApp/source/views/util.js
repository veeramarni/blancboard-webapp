enyo.kind({
    name: "blanc.util",
    kind: "enyo.Object",
    statics: {
        splitName: function(e) {
            var t = e.indexOf(" ");
            return t >= 0 && e.length > t + 1 ? [e.substring(0, t), e.substring(t + 1)] : [e]
        },
        isValidEmail: function(e) {
            var t = RegExp("^[0-9a-zA-Z]{1}[0-9a-zA-Z.+-_]*@(([a-zA-Z0-9\\-])+\\.)+[a-zA-Z0-9]{2,4}$");
            return t.exec(e) ? !0 : !1
        },
        isValidUsername: function(e) {
            var t = RegExp("^[0-9a-zA-Z]{1}[0-9a-zA-Z.+-_]*"),
                n = t.exec(e);
            return n && n[0] == e
        },
        getFileName: function(e) {
            var t, n = e.split("\\").pop().split("/").pop(),
                i = n.lastIndexOf(".");
            return t = i > 0 && n.length - 1 > i ? n.substring(0, i) : n
        },
        getFileExt: function(e) {
            var t, n = e.lastIndexOf(".");
            return t = n > 0 && e.length - 1 > n ? e.substring(n + 1) : ""
        },
        scaleRect: function(clientWidth, clientHeight, targetWidth, targetHeight) {
            var o = clientWidth / clientHeight > targetWidth / targetHeight ? clientHeight / targetHeight : clientWidth / targetWidth,
                s = targetWidth * o,
                a = targetHeight * o,
                r = (clientHeight - a) / 2,
                l = (clientWidth - s) / 2;
            return {
                top: r,
                left: l,
                width: s,
                height: a,
                scale: o
            }
        },
        formatPhone: function(e) {
            var t = e.replace(/[^0-9]/g, "");
            return 10 == t.length ? t = t.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : 11 == t.length && (t = t.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3-$4")), t
        },
        isValidPhone: function(e) {
            var t = e.replace(/[^0-9]/g, "").length;
            return 10 == t || 11 == t && "1" == e.charAt(0)
        }
    }
});