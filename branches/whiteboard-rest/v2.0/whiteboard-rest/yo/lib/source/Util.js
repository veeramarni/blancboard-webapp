bjse.util = {
    empty: {},
    mixin: function(t, e, i) {
        var n, o, s, a, r, h;
        if (bjse.util.isArray(t) ? (n = {}, o = t, e && bjse.util.isObject(e) && (s = e)) : (n = t || {}, o = e, s = i),
            bjse.util.isObject(s) || (s = {}), !0 === i && (s.ignore = !0, s.exists = !0), bjse.util.isArray(o))
            for (a = 0; h = o[a]; ++a)
                bjse.util.mixin(n, h, s);
        else
            for (r in o)
                h = o[r],
                bjse.util.empty[r] !== h &&
                (s.exists && !h || s.ignore && n[r] || (s.filter && bjse.util.isFunction(s.filter) ? !s.filter(r, h, o, n, s) : 0) || (n[r] = h));
        return n
    },
    isArray: Array.isArray || function(t) {
        return "[object Array]" === this.toString.call(t);
    },
    isFunction: function(t) {
        return "[object Function]" === this.toString.call(t);
    },
    isString: function(t) {
        return "[object String]" === this.toString.call(t);
    },
    isObject: Object.isObject || function(t) {
        return null !== t && "[object Object]" === this.toString.call(t)
    },
    toString: Object.prototype.toString,
    format: function(t, e, i) {
        var n, o, s = t,
            a = i || this.format_pattern,
            r = function(t, i) {
                return n = e[i], void 0 === n || null === n ? "{$" + i + "}" : (o = !0, n)
            },
            h = 0;
        do
            if (o = !1, s = s.replace(a, r), ++h >= 20) throw "bjse.util.format: recursion too deep";
        while (o);
        return s
    },
    randomUUID: function() {
        for (var t = [], e = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"], i = 0; 36 > i; i++) t[i] = Math.floor(16 * Math.random());
        for (t[14] = 4, t[19] = 8 | 3 & t[19], i = 0; 36 > i; i++) t[i] = e[t[i]];
        return t[8] = t[13] = t[18] = t[23] = "-", t.join("")
    },
    randomString: function(t, e) {
        for (var i = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ23456789", n = t + this.irand(e - t), o = "", s = 0; n > s; s++) o += i.charAt(this.irand(i.length));
        return o
    },
    format_pattern: /\{\$([^{}]*)\}/g,
    getTimestamp: function(){
        // set timestamp
        var curDate = new Date();
        return curDate.getTime() + curDate.getTimezoneOffset() * 60000;
    },
    /**
     * Checks whether an JavaScript object is null or empty.
     * 
     * @function
     * @param obj
     *            any JavaScript object
     */
    isBlankObject: function(obj) {
        if (obj == null) {
            return true;
        }

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Escapes blackslash and quotes
     * @param myVal
     * @returns
     */
    escapeBackslashQuotes: function(myVal) {
        myVal = myVal.replace(/\\/g, '\\\\'); // escape backslashes
        myVal = myVal.replace(/,/g, '\\,'); // escape backslashes
        myVal = myVal.replace(/"/g, '\\"'); // escape quotes
        return myVal;
    },
    /** 
     * Similar to $.grep but returns an object on first truthy.
     */
    or: function(arr, callback, context) {
        var el;
        for (var i = 0, l = arr.length; i < l; i++) {
            el = arr[i];
            if (callback.call(context, el, i, arr)) {
                return el;
            }
        }
        return null; //to return null and not undefined
    },
    /**
     *
     *
     */
    extend: function() {
        for (var i = 1; i < arguments.length; i++)
            for (var key in arguments[i])
                if (arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    }
}