bjse.api.platform={};
function() {
    if ("undefined" != typeof navigator)
        for (var t, e, i, n = navigator.userAgent, o = mc.platform, s = [{
            platform: "androidChrome",
            regex: /Android .* Chrome\/(\d+)[.\d]+/
        }, {
            platform: "android",
            regex: /Android (\d+)/
        }, {
            platform: "android",
            regex: /Silk\/1./,
            forceVersion: 2,
            extra: {
                silk: 1
            }
        }, {
            platform: "android",
            regex: /Silk\/2./,
            forceVersion: 4,
            extra: {
                silk: 2
            }
        }, {
            platform: "windowsPhone",
            regex: /Windows Phone (?:OS )?(\d+)[.\d]+/
        }, {
            platform: "ie",
            regex: /MSIE (\d+)/
        }, {
            platform: "ie",
            regex: /Trident\/.*; rv:(\d+)/
        }, {
            platform: "ios",
            regex: /iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/
        }, {
            platform: "webos",
            regex: /(?:web|hpw)OS\/(\d+)/
        }, {
            platform: "webos",
            regex: /WebAppManager|Isis/,
            forceVersion: 4
        }, {
            platform: "safari",
            regex: /Version\/(\d+)[.\d]+\s+Safari/
        }, {
            platform: "chrome",
            regex: /Chrome\/(\d+)[.\d]+/
        }, {
            platform: "androidFirefox",
            regex: /Android;.*Firefox\/(\d+)/
        }, {
            platform: "firefoxOS",
            regex: /Mobile;.*Firefox\/(\d+)/
        }, {
            platform: "firefox",
            regex: /Firefox\/(\d+)/
        }, {
            platform: "blackberry",
            regex: /PlayBook/i,
            forceVersion: 2
        }, {
            platform: "blackberry",
            regex: /BB1\d;.*Version\/(\d+\.\d+)/
        }, {
            platform: "tizen",
            regex: /Tizen (\d+)/
        }, {
            platform: "operaMobile",
            regex: /Opera\sMobi\/(\d+)/
        }, {
            platform: "opera",
            regex: /Opera\/(\d+)/
        }], a = 0; t = s[a]; a++)
            if (e = t.regex.exec(n)) {
                i = t.forceVersion ? t.forceVersion : Number(e[1]),
                o[t.platform] = i,
                t.extra && mc.util.mixin(o, t.extra),
                o.platformName = t.platform;
                break
            }
}
(),
mc.platform.isFullscreenSupported = function() {
    var t = mw.platform;
    return t.chrome || t.firefox
}
,
mc.platform.isVideoSupported = function() {
    var t = mw.platform;
    return t.chrome >= 26 || t.firefox >= 22
}
,
mc.platform.isMobile = function() {
    var t = mw.platform;
    return t.android || t.androidChrome || t.androidFirefox || t.ios
}
,
mc.platform.isCanvasSupported = function() {
    var t = document.createElement("canvas");
    return !(!t.getContext || !t.getContext("2d"))
}
;