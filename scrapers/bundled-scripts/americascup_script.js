// All the scripts here are from americas cup website just injected the window.pos to expose the position object
const overwriteInitJs = () => {
    !function(e) {
        function t(t) {
            for (var i, a, s = t[0], l = t[1], c = t[2], u = 0, d = []; u < s.length; u++)
                a = s[u],
                Object.prototype.hasOwnProperty.call(r, a) && r[a] && d.push(r[a][0]),
                r[a] = 0;
            for (i in l)
                Object.prototype.hasOwnProperty.call(l, i) && (e[i] = l[i]);
            for (p && p(t); d.length; )
                d.shift()();
            return o.push.apply(o, c || []),
            n()
        }
        function n() {
            for (var e, t = 0; t < o.length; t++) {
                for (var n = o[t], i = !0, s = 1; s < n.length; s++) {
                    var l = n[s];
                    0 !== r[l] && (i = !1)
                }
                i && (o.splice(t--, 1),
                e = a(a.s = n[0]))
            }
            return e
        }
        var i = {}
        , r = {
            1: 0
        }
        , o = [];
        function a(t) {
            if (i[t])
                return i[t].exports;
            var n = i[t] = {
                i: t,
                l: !1,
                exports: {}
            };
            return e[t].call(n.exports, n, n.exports, a),
            n.l = !0,
            n.exports
        }
        a.e = function(e) {
            var t = []
            , n = r[e];
            if (0 !== n)
                if (n)
                    t.push(n[2]);
                else {
                    var i = new Promise((function(t, i) {
                        n = r[e] = [t, i]
                    }
                    ));
                    t.push(n[2] = i);
                    var o, s = document.createElement("script");
                    s.charset = "utf-8",
                    s.timeout = 120,
                    a.nc && s.setAttribute("nonce", a.nc),
                    s.src = function(e) {
                        return a.p + "" + ({}[e] || e) + ".bundle.js"
                    }(e);
                    var l = new Error;
                    o = function(t) {
                        s.onerror = s.onload = null,
                        clearTimeout(c);
                        var n = r[e];
                        if (0 !== n) {
                            if (n) {
                                var i = t && ("load" === t.type ? "missing" : t.type)
                                , o = t && t.target && t.target.src;
                                l.message = "Loading chunk " + e + " failed.\n(" + i + ": " + o + ")",
                                l.name = "ChunkLoadError",
                                l.type = i,
                                l.request = o,
                                n[1](l)
                            }
                            r[e] = void 0
                        }
                    }
                    ;
                    var c = setTimeout((function() {
                        o({
                            type: "timeout",
                            target: s
                        })
                    }
                    ), 12e4);
                    s.onerror = s.onload = o,
                    document.head.appendChild(s)
                }
            return Promise.all(t)
        }
        ,
        a.m = e,
        a.c = i,
        a.d = function(e, t, n) {
            a.o(e, t) || Object.defineProperty(e, t, {
                enumerable: !0,
                get: n
            })
        }
        ,
        a.r = function(e) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            }),
            Object.defineProperty(e, "__esModule", {
                value: !0
            })
        }
        ,
        a.t = function(e, t) {
            if (1 & t && (e = a(e)),
            8 & t)
                return e;
            if (4 & t && "object" == typeof e && e && e.__esModule)
                return e;
            var n = Object.create(null);
            if (a.r(n),
            Object.defineProperty(n, "default", {
                enumerable: !0,
                value: e
            }),
            2 & t && "string" != typeof e)
                for (var i in e)
                    a.d(n, i, function(t) {
                        return e[t]
                    }
                    .bind(null, i));
            return n
        }
        ,
        a.n = function(e) {
            var t = e && e.__esModule ? function() {
                return e.default
            }
            : function() {
                return e
            }
            ;
            return a.d(t, "a", t),
            t
        }
        ,
        a.o = function(e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        }
        ,
        a.p = "",
        a.oe = function(e) {
            throw console.error(e),
            e
        }
        ;
        var s = window.webpackJsonp = window.webpackJsonp || []
        , l = s.push.bind(s);
        s.push = t,
        s = s.slice();
        for (var c = 0; c < s.length; c++)
            t(s[c]);
        var p = l;
        o.push([101, 2]),
        n()
    }([, , function(e, t, n) {
        "use strict";
        n.d(t, "o", (function() {
            return s
        }
        )),
        n.d(t, "p", (function() {
            return l
        }
        )),
        n.d(t, "d", (function() {
            return c
        }
        )),
        n.d(t, "j", (function() {
            return p
        }
        )),
        n.d(t, "n", (function() {
            return u
        }
        )),
        n.d(t, "h", (function() {
            return h
        }
        )),
        n.d(t, "g", (function() {
            return f
        }
        )),
        n.d(t, "l", (function() {
            return g
        }
        )),
        n.d(t, "m", (function() {
            return v
        }
        )),
        n.d(t, "f", (function() {
            return m
        }
        )),
        n.d(t, "k", (function() {
            return y
        }
        )),
        n.d(t, "b", (function() {
            return d
        }
        )),
        n.d(t, "a", (function() {
            return b
        }
        )),
        n.d(t, "c", (function() {
            return w
        }
        )),
        n.d(t, "e", (function() {
            return x
        }
        )),
        n.d(t, "i", (function() {
            return k
        }
        ));
        var i, r = n(6), o = (i = function(e, t) {
            return (i = Object.setPrototypeOf || {
                __proto__: []
            }instanceof Array && function(e, t) {
                e.__proto__ = t
            }
            || function(e, t) {
                for (var n in t)
                    Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
            }
            )(e, t)
        }
        ,
        function(e, t) {
            function n() {
                this.constructor = e
            }
            i(e, t),
            e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype,
            new n)
        }
        ), a = function(e) {
            this.packetId = e
        };
        function s(e) {
            return "raceId"in e
        }
        function l(e) {
            return "time"in e
        }
        var c = function(e) {
            function t(n) {
                return e.call(this, void 0 !== n ? n : t.PACKET_ID_BOAT) || this
            }
            return o(t, e),
            t.prototype.toString = function() {
                return "time: " + this.time + ", boatId: " + this.boatId + ", lan/lon: " + this.lat + "," + this.lon
            }
            ,
            t.PACKET_ID_BOAT = 179,
            t
        }(a)
        , p = function(e) {
            function t() {
                return e.call(this, t.PACKET_ID_PENALTY) || this
            }
            return o(t, e),
            t.prototype.toString = function() {
                return e.prototype.toString.call(this) + ", boatId: " + this.boatId
            }
            ,
            t.PACKET_ID_PENALTY = 182,
            t
        }(a);
        function u(e) {
            return "raceStatus"in e && "startTime"in e
        }
        var d, h = function(e) {
            function t() {
                return e.call(this, t.PACKET_ID_COURSE_INFO) || this
            }
            return o(t, e),
            t.PACKET_ID_COURSE_INFO = 177,
            t
        }(a), f = function(e) {
            function t() {
                var n = e.call(this, t.PACKET_ID_COURSE_BOUNDARY) || this;
                return n.points = [],
                n
            }
            return o(t, e),
            t.prototype.getCenterPoint = function() {
                if (0 === this.points.length)
                    return [0, 0];
                for (var e = Number.MAX_VALUE, t = Number.MAX_VALUE, n = -720, i = -720, r = 0, o = this.points; r < o.length; r++) {
                    var a = o[r]
                    , s = a[0]
                    , l = a[1];
                    e = Math.min(e, s),
                    t = Math.min(t, l),
                    n = Math.max(n, s),
                    i = Math.max(i, l)
                }
                return [e + (n - e) / 2, t + (i - t) / 2]
            }
            ,
            t.prototype.hasEqualPointsTo = function(e) {
                if (e.nPoints !== this.nPoints)
                    return !1;
                for (var t = 0; t < this.nPoints; t += 1) {
                    if (Math.abs(this.points[t][0] - e.points[t][0]) > 1e-7)
                        return !1;
                    if (Math.abs(this.points[t][1] - e.points[t][1]) > 1e-7)
                        return !1
                }
                return !0
            }
            ,
            t.PACKET_ID_COURSE_BOUNDARY = 185,
            t
        }(a), g = function(e) {
            function t() {
                return e.call(this, t.PACKET_ID_WIND) || this
            }
            return o(t, e),
            t.PACKET_ID_WIND = 178,
            t
        }(a), v = function(e) {
            function t() {
                return e.call(this, t.PACKET_ID_WINDPOINT) || this
            }
            return o(t, e),
            t.PACKET_ID_WINDPOINT = 190,
            t
        }(a), m = function(e) {
            function t() {
                return e.call(this, t.PACKET_ID_BUOY) || this
            }
            return o(t, e),
            t.decodeIsStartFinish = function(e) {
                return Object(r.b)(8, e)
            }
            ,
            t.decodeLayLines = function(e) {
                return {
                    upwind_port: Object(r.b)(1, e),
                    upwind_star: Object(r.b)(2, e),
                    downwind_port: Object(r.b)(3, e),
                    downwind_star: Object(r.b)(4, e)
                }
            }
            ,
            t.decodeCircleRad = function(e) {
                return e >> 5 & 7
            }
            ,
            t.prototype.getMarkNumber = function() {
                return Object(r.c)(this.markId)
            }
            ,
            t.PACKET_ID_BUOY = 181,
            t
        }(a), y = function(e) {
            function t() {
                return e.call(this, t.PACKET_ID_ROUNDINGTIME) || this
            }
            return o(t, e),
            t.PACKET_ID_ROUNDINGTIME = 180,
            t
        }(a);
        !function(e) {
            e[e.Off = 0] = "Off",
            e[e.AudioEnabled = 1] = "AudioEnabled",
            e[e.VideoEnabled = 2] = "VideoEnabled",
            e[e.AudioDisabled = 3] = "AudioDisabled",
            e[e.VideoDisabled = 4] = "VideoDisabled"
        }(d || (d = {}));
        var b = function() {
            function e() {}
            return e.prototype.isEnabled = function() {
                return [d.AudioEnabled, d.VideoEnabled].indexOf(this.state) > -1
            }
            ,
            e.prototype.isAudio = function() {
                return [d.AudioEnabled, d.AudioDisabled].indexOf(this.state) > -1
            }
            ,
            e.prototype.isVideo = function() {
                return [d.VideoEnabled, d.VideoDisabled].indexOf(this.state) > -1
            }
            ,
            e
        }()
        , w = function(e) {
            function t() {
                return e.call(this, t.PACKET_ID_AUDIO) || this
            }
            return o(t, e),
            t.prototype.getChannel = function(e) {
                for (var t = 0, n = this.channels; t < n.length; t++) {
                    var i = n[t];
                    if (i.channelID === e)
                        return i
                }
            }
            ,
            t.PACKET_ID_AUDIO = 186,
            t
        }(a)
        , x = function(e) {
            function t() {
                return e.call(this, t.PACKET_ID_STATS) || this
            }
            return o(t, e),
            t.PACKET_ID_STATS = 183,
            t
        }(c)
        , k = function() {
            function e() {}
            return e.prototype.processPacket = function(e) {
                switch (e.packetId) {
                case h.PACKET_ID_COURSE_INFO:
                    void 0 !== this.processCourseInfo && this.processCourseInfo(e);
                    break;
                case c.PACKET_ID_BOAT:
                    void 0 !== this.processBoat && this.processBoat(e);
                    break;
                case x.PACKET_ID_STATS:
                    void 0 !== this.processBoatStats && this.processBoatStats(e);
                    break;
                case g.PACKET_ID_WIND:
                    void 0 !== this.processWind && this.processWind(e);
                    break;
                case m.PACKET_ID_BUOY:
                    void 0 !== this.processBuoy && this.processBuoy(e);
                    break;
                case f.PACKET_ID_COURSE_BOUNDARY:
                    void 0 !== this.processBoundary && this.processBoundary(e);
                    break;
                case y.PACKET_ID_ROUNDINGTIME:
                    void 0 !== this.processRoundingTime && this.processRoundingTime(e);
                    break;
                case v.PACKET_ID_WINDPOINT:
                    void 0 !== this.processWindpoint && this.processWindpoint(e);
                    break;
                case p.PACKET_ID_PENALTY:
                    void 0 !== this.processPenalty && this.processPenalty(e);
                    break;
                case w.PACKET_ID_AUDIO:
                    void 0 !== this.processAudio && this.processAudio(e);
                default:
                    console.log("Unsupported packet type " + e.packetId)
                }
            }
            ,
            e
        }()
    }
    , , function(e, t, n) {
        "use strict";
        n.d(t, "b", (function() {
            return a
        }
        )),
        n.d(t, "c", (function() {
            return s
        }
        )),
        n.d(t, "a", (function() {
            return l
        }
        ));
        var i, r = (i = function(e, t) {
            return (i = Object.setPrototypeOf || {
                __proto__: []
            }instanceof Array && function(e, t) {
                e.__proto__ = t
            }
            || function(e, t) {
                for (var n in t)
                    Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
            }
            )(e, t)
        }
        ,
        function(e, t) {
            function n() {
                this.constructor = e
            }
            i(e, t),
            e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype,
            new n)
        }
        ), o = function() {
            function e() {
                this.valHistory = [],
                this.logging = !1,
                this.loggingPrefix = ""
            }
            return e.prototype.getHistory = function() {
                return this.valHistory
            }
            ,
            e.prototype.getMaxTime = function() {
                return void 0 === this.maxtime ? -1 : this.maxtime
            }
            ,
            e.prototype.hasMinimumSamples = function() {
                return !(this.valHistory.length < this.minSamplesRequired()) && (void 0 !== this.maxtime && void 0 !== this.maxtime)
            }
            ,
            e.prototype.addVal = function(e, t) {
                if (this.valHistory.length > 0) {
                    var n = this.valHistory.length - 1
                    , i = this.valHistory[n][1];
                    if (t < i)
                        return;
                    if (t === i)
                        return void (this.valHistory[n][0] = e)
                }
                this.valHistory.push([e, t]),
                (void 0 === this.mintime || t < this.mintime) && (this.mintime = t),
                (void 0 === this.maxtime || t > this.maxtime) && (this.maxtime = t)
            }
            ,
            e.prototype.clear = function() {
                console.log("Cleared ValHistory"),
                this.valHistory.slice(0, this.valHistory.length)
            }
            ,
            e.prototype.updateIndexForTime = function(e) {
                if (void 0 === this.currentIdx) {
                    if (this.currentIdx = this.calcIndex(e),
                    void 0 === this.currentIdx)
                        return
                } else {
                    var t = this.currentIdx;
                    this.currentIdx = this.moveIndex(this.currentIdx, e),
                    this.logging && t !== this.currentIdx && console.log(this.loggingPrefix + " moving from " + t + " to " + this.currentIdx + " of " + this.valHistory.length + " time " + e)
                }
            }
            ,
            e.prototype.calcIndex = function(e) {
                if (!(this.valHistory.length < this.minSamplesRequired() || void 0 === this.maxtime || void 0 === this.maxtime)) {
                    var t = this.maxtime - this.mintime;
                    if (0 === t)
                        return this.valHistory.length - 1;
                    var n = (e - this.mintime) / t
                    , i = Math.floor(n * this.valHistory.length);
                    return i = this.moveIndex(i, e)
                }
            }
            ,
            e.prototype.moveIndex = function(e, t) {
                for (var n = this.valHistory.length - 1; e >= 0 && e <= n; ) {
                    var i = e < 0 ? 0 : this.valHistory[e][1]
                    , r = e >= n ? Number.MAX_VALUE : this.valHistory[e + 1][1];
                    if (i > t)
                        e -= 1;
                    else {
                        if (!(r < t))
                            return e;
                        e += 1
                    }
                }
                return Math.max(0, Math.min(n, e))
            }
            ,
            e
        }(), a = function(e) {
            function t(t) {
                void 0 === t && (t = 4);
                var n = e.call(this) || this;
                return n.minSamples = t,
                n
            }
            return r(t, e),
            t.prototype.minSamplesRequired = function() {
                return this.minSamples
            }
            ,
            t.prototype.valForTime = function(e) {
                if (this.updateIndexForTime(e),
                void 0 !== this.currentIdx) {
                    if (this.valHistory.length < 4)
                        return this.valHistory[this.currentIdx][0];
                    var t = this.currentIdx - 1
                    , n = this.currentIdx
                    , i = this.currentIdx + 1
                    , r = this.currentIdx + 2;
                    if (t < 0)
                        return this.logging && console.log(this.loggingPrefix + " not enough previous points to interpolate"),
                        this.valHistory[n][0];
                    if (r > this.valHistory.length - 1)
                        return this.logging && console.log(this.loggingPrefix + " not enough future points to interpolate"),
                        i > this.valHistory.length - 1 ? this.valHistory[n][0] : this.valHistory[i][0];
                    var o = this.valHistory[n][1]
                    , a = (e - o) / (this.valHistory[i][1] - o);
                    a = Math.max(0, Math.min(1, a)),
                    this.logging && console.log(this.loggingPrefix + " t val " + a);
                    var s = this.valHistory[t][0]
                    , l = this.valHistory[n][0]
                    , c = this.valHistory[i][0]
                    , p = this.valHistory[r][0];
                    return this.cubic_interpolate(s, l, c, p, a)
                }
            }
            ,
            t.prototype.cubic_interpolate = function(e, t, n, i, r) {
                var o = r * r * r
                , a = r * r;
                return e * (-.5 * o + a - .5 * r) + t * (1.5 * o - 2.5 * a + 1) + n * (-1.5 * o + 2 * a + .5 * r) + i * (.5 * o - .5 * a)
            }
            ,
            t
        }(o), s = function(e) {
            function t(t, n) {
                void 0 === t && (t = 0);
                var i = e.call(this) || this;
                return i.timeoutSecs = 0,
                i.timeoutSecs = t,
                i.timeoutVal = n,
                i
            }
            return r(t, e),
            t.prototype.minSamplesRequired = function() {
                return 1
            }
            ,
            t.prototype.valForTime = function(e) {
                if (this.updateIndexForTime(e),
                void 0 !== this.currentIdx) {
                    if (void 0 !== this.timeoutVal)
                        if (e - this.valHistory[this.currentIdx][1] > this.timeoutSecs)
                            return this.timeoutVal;
                    return this.valHistory[this.currentIdx][0]
                }
            }
            ,
            t.prototype.addVal = function(t, n) {
                if (this.valHistory.length > 0) {
                    var i = this.valHistory.length - 1
                    , r = this.valHistory[i][0]
                    , o = this.valHistory[i][1];
                    if (r === t && n >= o)
                        return
                }
                e.prototype.addVal.call(this, t, n)
            }
            ,
            t
        }(o), l = function(e) {
            function t(t) {
                void 0 === t && (t = 2);
                var n = e.call(this) || this;
                return n.minSamples = t,
                n
            }
            return r(t, e),
            t.prototype.minSamplesRequired = function() {
                return this.minSamples
            }
            ,
            t.prototype.valForTime = function(e) {
                if (this.updateIndexForTime(e),
                void 0 !== this.currentIdx) {
                    if (this.valHistory.length < 2)
                        return this.valHistory[this.currentIdx][0];
                    var t = this.currentIdx
                    , n = this.currentIdx + 1;
                    if (n >= this.valHistory.length)
                        return this.valHistory[t][0];
                    var i = this.valHistory[t][1]
                    , r = (e - i) / (this.valHistory[n][1] - i);
                    r = Math.max(0, Math.min(1, r));
                    var o = this.valHistory[t][0]
                    , a = (this.valHistory[n][0] - o) % 360;
                    return o + (2 * a % 360 - a) * r
                }
            }
            ,
            t
        }(o)
    }
    , function(e, t, n) {
        "use strict";
        function i(e, t, n) {
            return void 0 === n && (n = "0"),
            (n.repeat(t) + e.toString()).slice(-t)
        }
        function r(e, t) {
            return void 0 === t && (t = 2),
            (Math.round(100 * e) / 100).toFixed(t)
        }
        function o(e) {
            var t = Math.floor(e / 60)
            , n = Math.floor(e % 60);
            return i(t, 2) + ":" + i(n, 2)
        }
        function a(e) {
            var t = Math.floor(e / 3600)
            , n = Math.floor(e / 60)
            , r = Math.floor(e % 60);
            return i(t, 2) + ":" + i(n, 2) + ":" + i(r, 2)
        }
        function s(e, t, n) {
            return void 0 === t && (t = 0),
            void 0 === n && (n = 1),
            Math.min(n, Math.max(t, e))
        }
        n.d(t, "b", (function() {
            return r
        }
        )),
        n.d(t, "d", (function() {
            return o
        }
        )),
        n.d(t, "c", (function() {
            return a
        }
        )),
        n.d(t, "a", (function() {
            return s
        }
        ))
    }
    , function(e, t, n) {
        "use strict";
        function i(e) {
            return e >> 6 & 511
        }
        function r(e) {
            return e % 100
        }
        function o(e, t) {
            return (t & 1 << e) > 0
        }
        function a(e) {
            return o(15, e)
        }
        function s(e) {
            return Math.floor(e / 10)
        }
        function l(e) {
            return Math.floor(e / 10) % 100
        }
        n.d(t, "f", (function() {
            return i
        }
        )),
        n.d(t, "c", (function() {
            return r
        }
        )),
        n.d(t, "b", (function() {
            return o
        }
        )),
        n.d(t, "a", (function() {
            return a
        }
        )),
        n.d(t, "d", (function() {
            return s
        }
        )),
        n.d(t, "e", (function() {
            return l
        }
        ))
    }
    , function(e, t, n) {
        "use strict";
        (function(e) {
            n.d(t, "a", (function() {
                return i
            }
            )),
            n.d(t, "b", (function() {
                return r
            }
            )),
            n.d(t, "c", (function() {
                return o
            }
            )),
            n.d(t, "h", (function() {
                return a
            }
            )),
            n.d(t, "g", (function() {
                return s
            }
            )),
            n.d(t, "f", (function() {
                return l
            }
            )),
            n.d(t, "i", (function() {
                return c
            }
            )),
            n.d(t, "e", (function() {
                return p
            }
            )),
            n.d(t, "d", (function() {
                return u
            }
            )),
            n.d(t, "k", (function() {
                return d
            }
            )),
            n.d(t, "l", (function() {
                return h
            }
            )),
            n.d(t, "j", (function() {
                return f
            }
            ));
            var i = g(e.env.BABYLON_DEBUGLAYER_ENABLED)
            , r = g("1")
            , o = g(e.env.DISABLE_UI)
            , a = e.env.LOAD_RACE_PLAYBACK
            , s = e.env.LOAD_RACE_LIVE
            , l = v(e.env.LIVE_PLAYBACK_RATE)
            , c = v(e.env.LOG_DATA_FOR_BOATID)
            , p = g(e.env.FORCE_IPHONE_LAYOUT)
            , u = g(e.env.FORCE_IPAD_LAYOUT)
            , d = g(e.env.TEST_AUDIOMEDIA_PACKET)
            , h = e.env.WEBSOCKET_URL
            , f = e.env.RACE_CONFIG_URL;
            function g(e) {
                return "1" === e || "true" === e
            }
            function v(e) {
                var t = Number(e);
                if (!isNaN(t))
                    return t
            }
        }
        ).call(this, n(24))
    }
    , , , , , , , function(e, t, n) {
        "use strict";
        n.d(t, "a", (function() {
            return a
        }
        )),
        n.d(t, "b", (function() {
            return s
        }
        ));
        var i = n(4)
        , r = n(23)
        , o = n.n(r)
        , a = function() {
            function e(e, t) {
                this.x = e,
                this.y = t
            }
            return e.fromLatLon = function(t, n) {
                var i = (new o.a).convertLatLngToUtm(t, n, 16);
                return new e(i.Easting,i.Northing)
            }
            ,
            e.bounds = function(t) {
                for (var n, i = 0, r = t; i < r.length; i++) {
                    var o = r[i];
                    void 0 !== n ? (n.min.x = Math.min(n.min.x, o.x),
                    n.min.y = Math.min(n.min.y, o.y),
                    n.max.x = Math.max(n.max.x, o.x),
                    n.max.y = Math.max(n.max.y, o.y)) : n = {
                        min: new e(o.x,o.y),
                        max: new e(o.x,o.y)
                    }
                }
                return n
            }
            ,
            e.midPoint = function(t) {
                var n = e.bounds(t);
                if (void 0 !== n)
                    return new e(n.min.x + (n.max.x - n.min.x) / 2,n.min.y + (n.max.y - n.min.y) / 2)
            }
            ,
            e.closestPointOnLine = function(t, n, i) {
                var r = new e(i.x - t.x,i.y - t.y)
                , o = new e(n.x - t.x,n.y - t.y)
                , a = Math.pow(o.x, 2) + Math.pow(o.y, 2)
                , s = (r.x * o.x + r.y * o.y) / a;
                return s = Math.max(0, Math.min(1, s)),
                new e(t.x + o.x * s,t.y + o.y * s)
            }
            ,
            e.calcTPointOnLine = function(t, n, i) {
                var r = new e(i.x - t.x,i.y - t.y)
                , o = new e(n.x - t.x,n.y - t.y)
                , a = Math.pow(o.x, 2) + Math.pow(o.y, 2)
                , s = (r.x * o.x + r.y * o.y) / a;
                return s = Math.max(0, Math.min(1, s))
            }
            ,
            e.distanceBtwPoints = function(e, t) {
                return Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2))
            }
            ,
            e.fromPacket = function(e) {
                return this.fromLatLon(e.lat, e.lon)
            }
            ,
            e.prototype.equals = function(e, t) {
                return void 0 === t && (t = 0),
                Math.abs(this.x - e.x) < t && Math.abs(this.y - e.y) < t
            }
            ,
            e.prototype.toString = function() {
                return this.x + ", " + this.y
            }
            ,
            e
        }()
        , s = function() {
            function e(e) {
                void 0 === e && (e = 4),
                this.xCerp = new i.b(e),
                this.yCerp = new i.b(e)
            }
            return e.prototype.addCoord = function(e, t) {
                this.xCerp.addVal(e.x, t),
                this.yCerp.addVal(e.y, t)
            }
            ,
            e.prototype.getCoordForTime = function(e) {
                var t = this.xCerp.valForTime(e)
                , n = this.yCerp.valForTime(e);
                if (void 0 !== t && void 0 !== n)
                    return new a(t,n)
            }
            ,
            e.prototype.clear = function() {
                this.xCerp.clear(),
                this.yCerp.clear()
            }
            ,
            e.prototype.setLogging = function(e, t) {
                void 0 === t && (t = ""),
                this.xCerp.logging = e,
                this.xCerp.loggingPrefix = t
            }
            ,
            e.prototype.hasMinimumSamples = function() {
                return this.xCerp.hasMinimumSamples() && this.yCerp.hasMinimumSamples()
            }
            ,
            e
        }()
    }
    , , , , , , function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = n.p + "0efc32df54fa67edaec50e2397422efe.png"
    }
    , , function(e, t, n) {
        var i = n(11)
        , r = n(63);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , , , function(e, t, n) {
        var i = n(11)
        , r = n(58);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , , , function(e, t, n) {
        var i = n(11)
        , r = n(51);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , , , , , , , , , , , , , , , , , , , function(e, t, n) {
        var i = n(11)
        , r = n(48);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".racinghud {\n    position: absolute;\n    top:0;\n    left:0;\n    bottom:0;\n    right:0;\n\n\n    padding-top: env(safe-area-inset-top);\n    padding-left: env(safe-area-inset-left);\n    padding-right: 0;\n    padding-bottom: 0;\n\n\n    display: flex;\n    flex-direction: column;\n    align-items: flex-end;\n    pointer-events:none; \n}\n\n.videoAndRoundingTimer {\n    width: 100%;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    align-items: flex-end;\n}\n\n.sidemenu {\n    position: absolute;\n    top:15px;\n    left:15px;\n    width:50px;\n    z-index: 2;\n}\n\n.leaderboardMenu {\n    position: relative;\n    top:0;\n    left:0;\n    right:0;\n    width: 100%;\n    z-index: 2;\n    display: flex;\n    flex-direction: row;\n    align-items: flex-end;\n    flex-wrap: wrap-reverse;\n    justify-content: space-between;\n}\n\n.spacer {\n    flex-grow: 100; /* will take up the remaing space container */\n}\n\n#bottomWrapper {\n    width: 100%;\n    position: absolute;\n    bottom: 0;\n    display: flex;\n    flex-direction: column;\n}\n", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(50);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".leaderboard {\n    position: relative;\n    color: #FFFFFF;\n    background: #000000AA;\n    font-family: 'Myriad-Pro';\n    text-align: center;\n   \n    display: flex;\n    flex-direction: column;\n    flex-wrap: nowrap;\n    \n    z-index: 2;\n    pointer-events:auto; \n  }\n\n  .leaderboardheader {\n    display: flex;\n    flex-direction: row;\n    justify-content: space-between;\n    align-items: center;\n  }\n\n  .leaderboardtitlecolumn {\n    display: flex;\n    padding-top: 15px;\n    padding-bottom: 15px;\n    flex-direction: column;\n    justify-content: space-between;\n    flex-grow: 100;\n  }\n\n  .leaderboardtitlerow {\n    display: flex;\n    flex-direction: row;\n    justify-content: space-between;\n    text-align: left;\n    font-size: 20px;\n  }\n\n  .leaderboardtitle {\n\n    font-family: 'Myriad-Pro';\n    text-align: left;\n    font-size: 23px;\n  }\n\n  .leaderboardsubtitle {\n    font-family: 'Myriad-Regular';\n  }\n\n\n  .leaderboardracestatus {\n    font-family: 'Myriad-Italic';\n  }\n\n  .leaderboardrowbackground {\n    padding: 10px 15px 10px 15px; /* top, right, bottom, left */\n    background: transparent;\n  }\n\n  .leaderboardrowbackground:hover {\n    background: rgba(0,0,0,0.1);\n  }\n\n  .leaderboardrowbackground.highlight {\n    background: #FFFFFF44;\n  }\n\n\n  .leaderboardvals {\n    height: 24px;\n    font-family: 'Myriad-Condensed';\n    font-size: 18px;\n    justify-content: flex-start;\n    align-items: center;\n    display: flex;\n    flex-direction: row;\n    flex-wrap: nowrap;\n  }\n\n  .leaderboardcolheaders {\n\n    height: 40px;\n    \n    font-family: 'Myriad-Condensed';\n    font-size: 18px;\n    justify-content: flex-start;\n    align-items: center;\n    display: flex;\n    flex-direction: row;\n    flex-wrap: nowrap;\n\n    margin-right: 16px;\n    \n  }\n\n\n  .leaderboardname {\n\n    margin-left: 10px;\n    margin-right: 10px;\n    display: flex;\n  }\n\n  .leaderboardcameraicon {\n\n    margin-right: 5px;\n    width: 40px;\n    height: 40px;\n    display: flex;\n  }\n\n  .leaderboarddot {\n\n    display: flex;\n  }\n\n  .leaderboardflag {\n\n    margin-left: 10px;\n    margin-right: 10px;\n    display: flex;\n  }\n\n  .leaderboardval {\n\n    margin-left: 10px;\n    margin-right: 10px;\n    width: 40px;\n    display: flex;\n    font-size: 18px;\n    font-family: 'Myriad-Regular';\n\n  }\n\n  .spacer {\n    flex-grow: 100; /* will take up the remaing space container */\n  }\n", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(12)
        , r = n(29)
        , o = n(52)
        , a = n(53)
        , s = n(54)
        , l = n(55)
        , c = n(56)
        , p = n(57);
        t = i(!1);
        var u = r(o)
        , d = r(a)
        , h = r(s)
        , f = r(l)
        , g = r(c)
        , v = r(p);
        t.push([e.i, '@font-face{\n  font-family: "Myriad-Pro";  \n  src: url(' + u + ') format("truetype");\n}\n\n@font-face{\n  font-family: "Myriad-Regular";  \n  src: url(' + d + ') format("truetype");\n}\n\n@font-face{\n  font-family: "Myriad-Bold";  \n  src: url(' + h + ') format("truetype");\n}\n\n@font-face{\n  font-family: "Myriad-Condensed";  \n  src: url(' + f + ') format("truetype");\n}\n\n@font-face{\n  font-family: "Myriad-BoldCondensed";  \n  src: url(' + g + ') format("truetype");\n}\n\n@font-face{\n  font-family: "Myriad-Italic";  \n  src: url(' + v + ') format("truetype");\n}\n\n\n/*\n@font-face{\n  font-family: "Myriad-BOLD";  \n  src: url(\'../../assets/font/MYRIADPRO-BOLD.OTF\') format("truetype");\n}*/\n\n.noselect {\n  -webkit-touch-callout: none; /* iOS Safari */\n    -webkit-user-select: none; /* Safari */\n     -khtml-user-select: none; /* Konqueror HTML */\n       -moz-user-select: none; /* Old versions of Firefox */\n        -ms-user-select: none; /* Internet Explorer/Edge */\n            user-select: none; /* Non-prefixed version, currently\n                                  supported by Chrome, Edge, Opera and Firefox */\n}\n\n.dev_stats_overlay {\n    color: red;\n    width: 100%;\n    /*height: 10%;*/\n    background:rgba(0,0,0,0.5);\n    position: absolute;\n    top: 0;\n    left: 0;\n    z-index: 10;\n  }\n\n\n.loadingScreen {\n  position: absolute;\n  top: 0;\n  left: 0;\n  background: #000000;\n  width: 100%;\n  height: 100%;\n}\n\n.cursor-pointer {\n  cursor: pointer;\n}\n\n.active-opacity:active {\n  opacity: 0.5 !important;\n}\n', ""]),
        e.exports = t
    }
    , function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = n.p + "368d8d0ec421694172277d72614086ba.OTF"
    }
    , function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = n.p + "4dc5956a31b5832b356867433bb4e516.otf"
    }
    , function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = n.p + "a4a83b50ac24f2af4df10725e63542be.OTF"
    }
    , function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = n.p + "e2a5e608ba42366402cbf775c06f3f15.OTF"
    }
    , function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = n.p + "f0bf606d76cfebc5fb930fff83923231.otf"
    }
    , function(e, t, n) {
        "use strict";
        n.r(t),
        t.default = n.p + "f3e082edab7cc0332d2ade7f77316162.otf"
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, "\n  .footer {\n    font-family: 'Myriad-Pro';\n    color: #FFFFFF;\n    width: 100%;\n    /*height: 10%;*/\n    /*background:rgba(0,0,0,0.5);*/\n\n    /*background-image: linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,1.0));*/\n\n    z-index: 10;\n\n    pointer-events:auto; \n  }\n\n  .footerLayoutColumn {\n\n    margin-left: 15px;\n    margin-right: 15px;\n    display: flex;\n    flex-direction: column;\n    flex-wrap: nowrap;\n\n  }\n\n  .footerLayoutRow {\n    align-items: center;\n    display: flex;\n    flex-direction: row;\n    flex-wrap: nowrap;\n  }\n\n  .slider {\n    margin-left: 15px;\n    margin-right: 15px;\n    margin-top: 15px;\n    position: relative;\n    height: 17px;\n  }\n\n  .spacer {\n    flex-grow: 100; /* will take up the remaing space container */\n  }\n\n  .controlbuttonpanel {\n    flex-direction: row;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    align-items:  center;\n    align-content: center;\n  }\n\n  .timeindicator {\n    font-size: 30px;\n    border-radius: 20px;\n    width: 160px;\n    margin: 15px;\n    height: 40px; \n    text-align: center;\n    vertical-align: middle;\n    line-height: 43px;       /* The same as your div height */\n}\n\n.playrateindicator {\n  font-size: 24px;\n  margin: 15px;\n  height: 34px; \n  line-height: 37px;   \n  text-align: center;\n  vertical-align: middle;\n  white-space: nowrap;\n}\n\n.racetitle {\n  font-size:  2vw;\n}\n\n.timeindicator {\n  background: #000000;\n  transition: width 0.25s 1.75s;\n  display: flex;\n  justify-content: flex-end;\n  width: 160px;\n}\n\n.timeindicator.mobile {\n  width: 80px;\n  font-size: 16px;\n  margin: 10px 0;\n  height: 30px;\n  line-height: 33px;\n}\n\n.timeindicator.show {\n  width: 235px;\n  transition: width 0.25s;\n}\n\n.timeindicator.show.mobile {\n  width: 120px;\n}\n\n.actualTime {\n  width: 160px;\n  flex-shrink: 0;\n}\n\n.actualTime.mobile {\n  width: 80px;\n}\n\n.roundingTime {\n  opacity: 0;\n  pointer-events: none;\n  margin-right: -0.25em;\n  transition: opacity 0.25s 1.5s;\n  font-size: 70%;\n}\n\n.roundingTime.show {\n  opacity: 1;\n  transition: opacity 0.25s 0.25s;\n}\n\n.slidermarker {\n  width: 20px;\n  height: 20px;\n  background: #0000FF;\n  margin-top: -15px;\n  z-index:1000;\n}\n\n.layoutRow {\n  \n  align-items: center;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  margin: 15px;\n  flex-grow: 1;\n  justify-content: space-evenly;\n\n}\n\n.sliderLabelCenter {\n  font-size: 18px;\n  width: 40px;\n  color: #FFFFFF;\n  margin-top: -40px;\n  text-align: center;\n  pointer-events: none;\n}\n\n.sliderRange {\n\n  position: relative;\n  margin-left: 10%;\n\n  width: 80%;\n  margin-top: -9px;\n  pointer-events: none;\n\n}\n\n.mobileSafeAreaSpacer {\n  height: 40px;\n}\n\n\n\n.liveindicator {\n  font-size: 25px;\n  border-radius: 20px;\n  width: 120px;\n  margin: 20px;\n  height: 35px; \n  background: #a9232a;\n  text-align: center;\n  vertical-align: middle;\n  font-family: 'Myriad-Pro';\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: space-evenly;\n}\n\n\n.livetext {\n  margin-top: 5px;\n  text-align: left;\n}\n\n.liveplayicon {\n  width:25px;\n  height:25px;\n}\n\n/* Material UI Slider classes */\n.slider .MuiSlider-mark {\n  width: 8px;\n  height: 8px;\n  margin-top: -2px;\n  margin-left: -4px;\n  border-radius: 50%;\n  background-color: #fff;\n  z-index: 5;\n}\n\n.MuiSlider-root .sliderLabelCenter {\n  margin-top: -42px;\n}\n\n.slider .MuiSlider-marked {\n  margin-bottom: 0;\n  /* margin-top: 40px; */\n}\n\n.slider .MuiSlider-rail {\n  height: 4px;\n  opacity: 1;\n  border-radius: 6px;\n}\n\n.slider .MuiSlider-track {\n  height: 4px;\n} \n\n.slider .MuiSlider-root {\n  color: rgb(152,153,154);\n}\n\n.slider .MuiSlider-thumb {\n  margin-top: -5px;\n  height: 14px;\n  width: 14px;\n  /* The important here and below are so on some mobile other \n   * a box shadow effect does not persist after touch */\n  box-shadow: none !important;\n}\n\n.slider .MuiSlider-thumb:hover {\n  box-shadow: 0px 0px 0px 3px rgba(180, 81, 90, 0.16) !important;\n}\n.slider .MuiSlider-thumb.MuiSlider-active {\n  box-shadow: 0px 0px 4px #57c5f7 !important;\n}\n\n.slider .MuiSlider-thumbColorPrimary {\n  color: #e6242e;\n}\n\n.slider .MuiSlider-active {\n  color: #e6242e;\n}\n\n.MuiSlider-root + .sliderRange {\n  /* margin-top: -24px; */\n  bottom: 0;\n  height: 4px !important;\n  position: absolute;\n}\n\n/* Don't change on touch devices, keep usual padding */\n@media (pointer: coarse) {\n  .slider .MuiSlider-root {\n    padding: 13px 0;\n  }\n}\n\n@media (pointer: coarse) {\n  .slider .MuiSlider-markLabel {\n    top: 26px;\n  }\n}\n", ""]),
        e.exports = t
    }
    , , , , , function(e, t, n) {
        var i = n(12)
        , r = n(29)
        , o = n(20);
        t = i(!1);
        var a = r(o);
        t.push([e.i, "\n  .boatLabels {\n    transition: 0.5s;\n    opacity: 0;\n    visibility: hidden; \n  }\n\n  .boatLabels.show {\n    opacity: 1;\n    visibility: visible; \n  }\n\n  .boatLabelElement {\n    color: #FFFFFF;\n    background: #00000088;\n    font-family: 'Myriad-Regular';\n    font-size:22px;\n    text-align: center;\n    vertical-align: middle;\n    line-height:24px;\n  }\n\n  .speedLabelElement {\n    color: #FFFFFF;\n    background: #00000088;\n    font-family: 'Myriad-Regular';\n    font-size:22px;\n    text-align: center;\n    vertical-align: middle;\n    line-height:34px;\n    white-space: nowrap;\n\n    padding: 0px 4px 0px 4px; /* top, right, bottom, left */\n  }\n\n  .dtlElement {\n    color: #FFFFFF;\n    background: #00000000;\n    font-family: 'Myriad-Regular';\n    font-size:22px;\n    text-align: center;\n    vertical-align: top;\n    line-height:24px;\n    white-space: nowrap;\n    padding: 4px 4px 2px 4px; /* top, right, bottom, left */\n    transform: translate(-50%,-100%);\n  }\n\n  .windSpeedElement {\n    color: #FFFFFF;\n    background: #00000000;\n    font-family: 'Myriad-Regular';\n    font-size:22px;\n    text-align: center;\n    vertical-align: top;\n    line-height:24px;\n    white-space: nowrap;\n    padding: 4px 4px 2px 4px; /* top, right, bottom, left */\n    transform: translate(-50%,-100%);\n  }\n\n  .penaltyLabelBackground {\n    color: #FFFFFF;\n    background: #00000088;\n    background-image:  url(" + a + ");\n  }\n\n  .penaltyLabelText {\n    font-family: 'Myriad-Regular';\n    font-size:18px;\n    line-height:18px;\n    text-align: center;\n    vertical-align: middle;\n    margin: 4px 8px 4px 8px;  /* top, right, bottom, left */\n    padding: 3px 4px 0px 4px; /* top, right, bottom, left */\n    \n    white-space: nowrap;\n    background-color: #102731;\n\n\n  }\n\n", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(65);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, "\n  .windpointLabels {\n    transition: 0.5s;\n    opacity: 0;\n    visibility: hidden; \n  }\n\n  .windpointLabels.show {\n    opacity: 0.6;\n    visibility: visible; \n  }\n\n  .windpointLabelsElement {\n    color: #FFFFFF;\n    background: #00000088;\n    font-family: 'Myriad-Regular';\n    font-size:22px;\n    text-align: center;\n    vertical-align: middle;\n    line-height:24px;\n  }\n\n  .windpointLabelsElement {\n    color: #FFFFFF;\n    background: #00000088;\n    font-family: 'Myriad-Regular';\n    font-size:22px;\n    text-align: center;\n    vertical-align: middle;\n    line-height:34px;\n    white-space: nowrap;\n\n    padding: 0px 4px 0px 4px; /* top, right, bottom, left */\n  }\n", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(67);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, "\n  .devOverlay {\n    position: absolute;\n    top:0;\n    left:0;\n    width: 100%;\n    font-family: 'Courier';\n   \n    color: #000000;\n    background:rgba(255, 255, 255, 0.5);\n    z-index: 10;\n    pointer-events:none; \n    white-space: pre-wrap;\n\n  }\n\n  .devOverlay.shrink {\n    width: auto\n  }\n\n  .devOverlayRow {\n    position: relative;\n    left:0;\n    top:0;\n  }\n\n", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(69);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".optionsmenu {\n\n  color: #FFFFFF;\n\n  display: flex;\n  flex-flow: row wrap;\n  pointer-events:auto; \n  z-index: 2;\n}\n\n.menuitem {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n}\n\n.menutext {\n  margin:5px;\n  width:140px;\n  font-family: 'Myriad-Pro';\n  text-align: left;\n}\n\n.fadeable {\n  transition: 0.5s;\n  opacity: 0;\n  visibility: hidden; \n}\n\n\n.fadeable.show {\n  opacity: 1;\n  visibility: visible; \n}\n\n\n\n ", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(71);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".video {\n  position: relative;\n  \n  margin-right: 15px;\n  \n  z-index: 2;\n  pointer-events:auto; \n\n  background-color: black; /* So has background on initial load */\n}\n\n.youtube {\n  background-color:black;\n}\n\n\n.embed-wrapper {\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  bottom: 0;\n}\n\n.embed-wrapper iframe, .embed-wrapper object, .embed-wrapper embed {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n\n@media (hover: hover) and (pointer: fine) {\n  .video:hover .video-close {\n    pointer-events: auto !important;\n    opacity: 1 !important;\n  }\n}\n", ""]),
        e.exports = t
    }
    , , , , , , , , , , , , function(e, t, n) {
        var i = n(11)
        , r = n(84);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".optionspopover {\n    position: relative;\n  \n    display: flex;\n    flex-direction: row;\n    flex-wrap: wrap;\n    justify-content: center;\n\n  }\n\n", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(86);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".mediapopover {\n    position: relative;\n    padding: 40px 8px 0px 8px;\n    display: flex;\n    flex-direction: column;\n    flex-wrap: wrap;\n    justify-content: center;\n    color: white; \n  }\n\n\n.mediabuttongroup {\n    margin-top: 8px;\n    margin-bottom: 8px;\n    padding: 4px 8px 4px 8px;\n    position: relative;\n    flex-grow: 1;\n    display: flex;\n    flex-direction: row;\n    flex-wrap: wrap;\n    justify-content: space-between;\n    align-content: center;\n\n    background-color: #2C3F46;\n\n}\n@media screen and (max-width: 600px) {\n  .mediabuttongroup {\n    flex-direction: column;\n    align-content: flex-start;\n  }\n}\n\n\n.medialabel {\n  margin: 16px;\n  width: 80px;\n  color: #FFFFFF;\n\n  font-family: 'Myriad-Regular';\n  font-size:22px;\n  text-align: center;\n  vertical-align: middle;\n  line-height:24px;\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n}\n\n.mediaButton {\n  display: flex;\n  width: 165px;\n  flex-direction: row;\n  align-items: center;\n}\n\n.mediaText {\n  margin:5px;\n  font-family: 'Myriad-Pro';\n  text-align: left;\n}\n\n.mediaVELogo {\n\n  width: 70px;\n  height: 30px;\n  object-fit:contain;\n}\n\n.mediapopovermsg {\n  padding: 10px;\n\n  font-family: 'Myriad-Regular';\n  text-align: left;\n  font-size: 24px;\n}\n\n\n  ", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(88);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".nextracebutton {\n      height: 108px;\n      margin-left: 15px;\n      margin-right: 15px;\n      margin-top: 60px;\n      margin-bottom: 20px;\n      background: #FFFFFF11;\n      display: flex;\n      flex-wrap:  wrap;\n      text-align: left;\n      align-items: center; \n    }\n\n.nextracebuttonwatch{\n\n    font-size: 50px;\n    width:auto;\n    text-align: left;\n    color: #FFFFFF;\n    font-family: 'Myriad-Regular';\n}\n\n .nextracebuttonlive {\n    font-size: 50px;\n    margin-left:15px;\n    width:auto;\n    text-align: left;\n    color: #FFFFFF;\n    white-space: nowrap;\n    overflow: hidden;\n    font-family: 'Myriad-Bold';\n}", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(90);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".menuscreen {\n  position: absolute;\n  top: 0;\n  left: 0;\n  background: #09232C;\n  color: #FFFFFF;\n  width: 100%;\n  height: 100%;\n}\n\n.centreContainer {\n  width: 100%;\n  height: 80%;\n\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  display: inline-flex;\n  flex-direction: column;\n  justify-content: space-around;\n}\n\n.veLogo {\n\n  min-width: 0;\n  min-height: 0;\n  max-height:100px;\n  max-width: 310px;\n  margin-bottom: 40px;\n\n  \n  object-fit:contain;\n}\n\n.logoLoadingCol {\n  min-width: 0;\n  min-height: 0;\n  display: inline-flex;\n  align-items: center; \n  flex-direction: column;\n}\n\n.buttonRow {\n  width: 100%;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  justify-content: space-evenly;\n}\n\n.livebutton {\n  flex-grow: 1;\n    height: 108px;\n\n    margin-left: 15px;\n    margin-right: 15px;\n    max-width: 404px;\n    min-width: 292px;\n    margin-top: 20px;\n    margin-bottom: 20px;\n    background: #182F38;\n    display: flex;\n    text-align: left;\n    align-items: center; \n  }\n  \n  .playbackbutton {\n    flex-grow: 1;\n    height: 108px;\n    margin-left: 15px;\n    margin-right: 15px;\n    max-width: 404px;\n    min-width: 292px;\n    margin-top: 20px;\n    margin-bottom: 20px;\n    background:#182F38;\n    text-align: center;\n    align-items: center; \n    display: flex;\n    justify-content: center;\n  }\n\n.livebuttonImg {\n  height: 36px;\n  width: 36px;\n  margin-left: 20px;\n  margin-right: 20px;\n}\n\n.buttonTextCol {\n  display: inline-flex;\n  flex-grow: 4;\n  align-items: stretch; \n  flex-direction: column;\n  margin-left:15px;\n  margin-right:15px;\n}\n\n.buttonTextRow {\n  display: inline-flex;\n  flex-direction: row;\n  align-items: center; \n}\n\n.buttonTitleBold {\n  font-size: 50px;\n  margin-left:15px;\n  width:auto;\n  text-align: left;\n  color: #FFFFFF;\n  font-family: 'Myriad-Bold';\n\n}\n\n.buttonTitleMed {\n  font-size: 50px;\n  width:auto;\n  text-align: left;\n  color: #FFFFFF;\n  font-family: 'Myriad-Regular';\n\n}\n\n.buttonSubtitle {\n  font-size: 20px;\n  width:auto;\n  margin-left: 5px;\n  margin-right: 5px;\n  text-align: left;\n  color: #FFFFFF;\n  font-family: 'Myriad-Italic';\n\n}\n\n.liveButtonSubtitle {\n  font-size: 20px;\n  width:auto;\n  margin-left: 80px;\n  text-align: left;\n  color: #FFFFFF;\n  font-family: 'Myriad-Italic';\n}", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(92);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".progress-div {\n    background-color: #205971;\n    border-color: white;\n    border-width: 1px;\n    border-style: solid;\n}\n\n.progress {\n    background-color: #41A8D9;\n    height: 20px;\n    transition: 300ms ease-in;\n    transition-delay: 0.0s;\n  }", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(94);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".racePickerBackground {\n    position: absolute;\n    top: 0;\n    left: 0;\n    background: #000000DD;\n    width: 100%;\n    height: 100%;\n}\n\n.racePicker {\n    position: fixed;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n\n    width: 410px;\n    max-height: 500px;\n    background-color: #182F38;\n    display: inline-flex;\n    flex-direction: column;\n}\n\n.racePickerTitle {\n    margin: 10px;\n    font-family: 'Myriad-Regular';\n    text-align: left;\n    font-size: 50px;\n}\n\n.racePickerHeaderRow {\n    padding: 10px;\n    font-family: 'Myriad-Regular';\n    text-align: left;\n    font-size: 24px;\n}\n\n.racePickerButtonRow {\n    margin: 10px;\n    display: inline-flex;\n    flex-wrap: wrap;\n    justify-content: flex-start;\n    flex-direction: row;\n}\n\n.racePickerButton {\n    font-family: 'Myriad-Regular';\n    text-align: left;\n    font-size: 18px;\n    padding:5px;\n    min-width: 80px;\n}\n\n.racePickerText {\n    font-family: 'Myriad-Regular';\n    text-align: left;\n    font-size: 18px;\n    padding:15px;\n    min-width: 80px;\n\n}", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(96);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, ".deviceinfopopover {\n    position: relative;\n    padding: 40px 8px 0px 8px;\n    display: flex;\n    flex-direction: column;\n    flex-wrap: wrap;\n    justify-content: center;\n    color: white; \n    font-family: 'Myriad-Regular';\n    font-size:18px;\n  }\n\n  .deviceinfotext {\n    font-family: 'Courier';\n    font-size:12px;\n  }\n\n  a:link, a:visited {\n    color: #f44336;\n    text-decoration: none;\n  }", ""]),
        e.exports = t
    }
    , function(e, t, n) {
        var i = n(11)
        , r = n(98);
        "string" == typeof (r = r.__esModule ? r.default : r) && (r = [[e.i, r, ""]]);
        var o = {
            insert: "head",
            singleton: !1
        }
        , a = (i(r, o),
        r.locals ? r.locals : {});
        e.exports = a
    }
    , function(e, t, n) {
        (t = n(12)(!1)).push([e.i, "select, select:hover {\n    background-color: #717171;\n    color: #fff;\n}\n\noption {\n    color: #000;\n    background-color: white;\n}\n\n.note0 {\n    position: relative;\n    margin-Right: 24px;\n    pointer-Events: auto;\n    transform: translateY(33%);\n    color: white !important;\n    z-Index: 1;\n    display: none;\n}\n\n.note1 {\n    position: relative;\n    margin-Right: 5px;\n    pointer-events: auto;\n    transform: translateY(56px);\n    z-index: 1;\n}\n\n.note2 {\n    position: absolute;\n    text-align: center;\n    pointer-events: auto;\n    color: #ffffff70;\n    z-index: 1;\n    display: none;\n    width: 100%;\n    transform: translateY(58vh);\n}\n\n.u-wrap {\n    mask-image: linear-gradient(to top, black 75%, transparent 100%) !important;\n    -webkit-mask-image: linear-gradient(to top, black 75%, transparent 100%) !important;\n}", ""]),
        e.exports = t
    }
    , , , function(e, t, n) {
        "use strict";
        n.r(t);
        var i = n(7)
        , r = n(115)
        , o = n(2)
        , a = function() {
            function e() {
                this.bytesProcessed = 0,
                this.previousBytes = new Uint8Array([])
            }
            return e.prototype.parse = function(t) {
                var n = new Uint8Array(this.previousBytes.length + t.length);
                for (n.set(this.previousBytes, 0),
                n.set(t, this.previousBytes.length),
                this.previousBytes = new Uint8Array(0); n.byteLength > 0; ) {
                    var i = u(n);
                    if (i < 0) {
                        this.previousBytes = n;
                        break
                    }
                    i > 0 && (console.log("WARNING : discarding " + i + " bytes"),
                    this.bytesProcessed += i,
                    n = n.slice(i),
                    i = 0);
                    var r = d(n);
                    if (r < 0) {
                        this.previousBytes = n;
                        break
                    }
                    var o = r + 1
                    , a = o - i;
                    a > e.MAX_BUFFER_SIZE && console.log("WARNING : packet size too big  " + a);
                    var s = n.slice(i, i + a);
                    try {
                        this.parsePacket(s)
                    } catch (e) {
                        console.log("ERROR : failed to parse packet " + e)
                    }
                    this.bytesProcessed += a,
                    n = n.slice(o)
                }
            }
            ,
            e.prototype.reset = function() {
                this.previousBytes = new Uint8Array([])
            }
            ,
            e.prototype.parsePacket = function(e) {
                var t = function(e) {
                    var t = s.byteLength
                    , n = e.length - l.length;
                    e = e.slice(t, n);
                    var i = []
                    , r = 0;
                    for (; r < e.length; )
                        r < e.length - 1 && 16 === e[r] && 16 === e[r + 1] ? (i.push(16),
                        r += 2) : (i.push(e[r]),
                        r += 1);
                    return new Uint8Array(i)
                }(e);
                if (0 !== t.length) {
                    var n, i, r, a = t[0], u = new h(t);
                    switch (a) {
                    case c:
                        return void (null !== this.onServerHeartbeat && this.onServerHeartbeat());
                    case p:
                        return void (null !== this.onWarpboxHeartbeat && this.onWarpboxHeartbeat());
                    case o.d.PACKET_ID_BOAT:
                        n = function(e) {
                            var t = new o.d;
                            e.skip(1);
                            var n = e.readUInt8();
                            if (n < 6)
                                throw new Error("Unsupported Boat packet type: " + n);
                            t.raceId = e.readUInt16(),
                            t.boatId = e.readUInt16(),
                            t.time = e.readUInt32() / 100,
                            t.lat = e.readLatLon32(),
                            t.lon = e.readLatLon32(),
                            t.elevation = (e.readUInt16() - 32768) / 1e3,
                            t.heading = e.readUInt16() / 100,
                            t.heel = e.readUInt16() / 100 - 180,
                            t.pitch = e.readUInt16() / 100 - 180,
                            t.sails = e.readUInt8(),
                            t.status = e.readUInt8(),
                            t.speed = e.readUInt16() / 100,
                            t.dtl = e.readUInt24() / 1e3,
                            6 === n ? e.numBytesLeft() > 0 && (t.flyTime = e.readUInt8() / 100 - 100) : 7 === n ? (t.flyTime = e.readUInt16() / 100 - 100,
                            e.skip(3),
                            t.rank = e.readUInt8(),
                            t.currentLeg = e.readUInt8()) : 8 === n && (t.flyTime = e.readUInt16() / 100 - 100,
                            e.skip(3),
                            t.rank = e.readUInt8(),
                            t.currentLeg = e.readUInt8(),
                            t.foilState = e.readUInt8(),
                            t.rudderAngle = e.readUInt8() - 90);
                            return t.trailColor = t.boatId >> 15,
                            t.teamId = t.boatId >> 6 & 511,
                            t.yachtId = 63 & t.boatId,
                            t
                        }(u);
                        break;
                    case o.e.PACKET_ID_STATS:
                        n = function(e) {
                            var t = new o.e;
                            e.skip(1);
                            e.readUInt8();
                            t.raceId = e.readUInt16(),
                            t.boatId = e.readUInt16(),
                            t.trailColor = t.boatId >> 15,
                            t.teamId = t.boatId >> 6 & 511,
                            t.yachtId = 63 & t.boatId,
                            t.time = e.readUInt32() / 100;
                            for (var n = e.readUInt8(), i = 0; i < n; i++) {
                                var r = e.readUInt8();
                                switch (r) {
                                case 0:
                                    t.sails = e.readUInt8();
                                    break;
                                case 1:
                                    t.status = e.readUInt8();
                                    break;
                                case 2:
                                    t.rank = e.readUInt8();
                                    break;
                                case 3:
                                    t.currentLeg = e.readUInt8();
                                    break;
                                case 4:
                                    t.foilState = e.readUInt8();
                                    break;
                                case 5:
                                    t.rudderAngle = e.readUInt8() - 90;
                                    break;
                                case 50:
                                    t.elevation = (e.readUInt16() - 32768) / 1e3;
                                    break;
                                case 51:
                                    t.heading = e.readUInt16() / 100;
                                    break;
                                case 52:
                                    t.heel = e.readUInt16() / 100 - 180;
                                    break;
                                case 53:
                                    t.pitch = e.readUInt16() / 100 - 180;
                                    break;
                                case 54:
                                    t.speed = e.readUInt16() / 100;
                                    break;
                                case 55:
                                    t.flyTime = e.readUInt16() / 100 - 100;
                                    break;
                                case 56:
                                    t.sow = e.readUInt16() / 100;
                                    break;
                                case 57:
                                    t.vmg = e.readUInt16() / 100;
                                    break;
                                case 58:
                                    t.tws = e.readUInt16() / 100;
                                    break;
                                case 59:
                                    t.twd = e.readUInt16() / 100;
                                    break;
                                case 60:
                                    t.portFoilAngle = e.readUInt16() / 100;
                                    break;
                                case 61:
                                    t.stbdFoilAngle = e.readUInt16() / 100;
                                    break;
                                case 100:
                                    e.skip(3);
                                    break;
                                case 101:
                                    t.dtl = e.readUInt24() / 1e3;
                                    break;
                                case 200:
                                    e.skip(1),
                                    t.lat = e.readLatLon32(),
                                    t.lon = e.readLatLon32();
                                    break;
                                default:
                                    r < 200 ? e.skip(Math.floor(r / 50 + 1)) : e.skip(e.readUInt8()),
                                    console.error("Unknown data type in boat stats packet")
                                }
                            }
                            return t
                        }(u);
                        break;
                    case o.l.PACKET_ID_WIND:
                        n = function(e) {
                            var t = new o.l;
                            e.skip(1);
                            var n = e.readUInt8();
                            t.raceId = e.readUInt16(),
                            t.time = n >= 2 ? e.readUInt32() / 100 : e.readUInt24();
                            return t.speed = e.readUInt16() / 1e3,
                            t.heading = e.readUInt16() / 100,
                            t.upwind_layline_angle = e.readUInt16() / 100,
                            t.downwind_layline_angle = e.readUInt16() / 100,
                            t
                        }(u);
                        break;
                    case o.f.PACKET_ID_BUOY:
                        n = function(e) {
                            var t = new o.f;
                            e.skip(1);
                            e.readUInt8();
                            return t.raceId = e.readUInt16(),
                            t.markId = e.readUInt16(),
                            t.states = e.readUInt16(),
                            t.model = e.readUInt8(),
                            t.time = e.readUInt32() / 100,
                            t.lat = e.readLatLon32(),
                            t.lon = e.readLatLon32(),
                            t.heading = e.readUInt16() / 100,
                            t.firstLegBouyVisible = e.readUInt8(),
                            t.lastLegBouyVisisble = e.readUInt8(),
                            t
                        }(u);
                        break;
                    case o.g.PACKET_ID_COURSE_BOUNDARY:
                        n = function(e) {
                            var t = new o.g;
                            e.skip(1);
                            e.readUInt8();
                            t.raceId = e.readUInt16(),
                            t.time = e.readUInt32() / 100,
                            t.nPoints = e.readUInt8(),
                            t.points = [];
                            var n = 0;
                            for (; n < t.nPoints; ) {
                                var i = e.readLatLon32()
                                , r = e.readLatLon32();
                                t.points.push([i, r]),
                                n += 1
                            }
                            return t
                        }(u);
                        break;
                    case o.m.PACKET_ID_WINDPOINT:
                        n = function(e) {
                            var t = new o.m;
                            e.skip(1);
                            e.readUInt8();
                            return t.raceId = e.readUInt16(),
                            t.id = e.readUInt8(),
                            t.isOn = e.readUInt8(),
                            t.time = e.readUInt32() / 100,
                            t.lat = e.readLatLon32(),
                            t.lon = e.readLatLon32(),
                            t.tws = .00194384 * e.readUInt16(),
                            t.twd = e.readUInt16() / 100,
                            t
                        }(u);
                        break;
                    case o.h.PACKET_ID_COURSE_INFO:
                        n = function(e) {
                            var t = new o.h;
                            e.skip(1);
                            var n = e.readUInt8();
                            t.raceId = e.readUInt16(),
                            t.startTime = e.readUInt32(),
                            t.numLegs = e.readUInt8(),
                            t.courseAngle = e.readUInt16(),
                            t.raceStatus = e.readUInt8(),
                            n > 1 && (t.boatType = e.readUInt8(),
                            t.liveDelaySecs = e.readUInt8());
                            return t
                        }(u);
                        break;
                    case o.k.PACKET_ID_ROUNDINGTIME:
                        i = u,
                        r = new o.k,
                        i.skip(1),
                        i.skip(1),
                        r.raceId = i.readUInt16(),
                        r.boatId = i.readUInt16(),
                        r.markNumber = i.readUInt8(),
                        r.time = i.readUInt32() / 100,
                        n = r;
                        break;
                    case o.j.PACKET_ID_PENALTY:
                        n = function(e) {
                            var t = new o.j;
                            e.skip(1);
                            var n = e.readUInt8();
                            t.raceId = e.readUInt16(),
                            t.boatId = e.readUInt16(),
                            t.time = e.readUInt24() / 10,
                            t.type = e.readUInt8(),
                            t.numPenalties = e.readUInt8(),
                            t.distance = e.readUInt24(),
                            t.angle = e.readUInt16(),
                            n > 1 && e.bytesLeft() > 0 ? t.protest = e.readUInt8() > 0 : t.protest = !1;
                            return t
                        }(u);
                        break;
                    case o.c.PACKET_ID_AUDIO:
                        n = function(e) {
                            var t = new o.c;
                            e.skip(1);
                            e.readUInt8();
                            t.nChannels = e.readUInt8(),
                            t.channels = [];
                            for (var n = 0; n < t.nChannels; n++) {
                                var i = new o.a;
                                switch (i.teamID = e.readUInt8(),
                                i.buttonID = e.readUInt8(),
                                e.readUInt8()) {
                                case 0:
                                    i.state = o.b.Off;
                                    break;
                                case 1:
                                    i.state = o.b.AudioEnabled;
                                    break;
                                case 2:
                                    i.state = o.b.VideoEnabled;
                                    break;
                                case 3:
                                    i.state = o.b.AudioEnabled;
                                    break;
                                case 4:
                                    i.state = o.b.VideoEnabled;
                                    break;
                                default:
                                    i.state = o.b.Off
                                }
                                i.channelID = e.readUInt8(),
                                t.channels.push(i)
                            }
                            return t
                        }(u);
                        break;
                    default:
                        return void console.log("WARNING : Discarding packet ID " + a.toString(16).toUpperCase())
                    }
                    void 0 !== n && null !== this.onDataPacket && (this.onDataPacket(n),
                    u.bytesLeft() > 0 && console.log("WARNING : PID: " + a.toString(16).toUpperCase() + " has " + u.bytesLeft() + " bytes unread"))
                } else
                    console.log("no packet data")
            }
            ,
            e.MAX_BUFFER_SIZE = 2048,
            e
        }()
        , s = new Uint8Array([16])
        , l = new Uint8Array([16, 3])
        , c = (new Uint8Array([16, 16]),
        96)
        , p = 176;
        function u(e) {
            for (var t = 0; t < e.length - 1; ) {
                if (16 === e[t] && 16 !== e[t + 1])
                    return t;
                t += 1
            }
            return -1
        }
        function d(e) {
            for (var t = 0; t < e.length - 1; )
                if (16 !== e[t] || 16 !== e[t + 1]) {
                    if (16 === e[t] && 3 === e[t + 1])
                        return t + 1;
                    t += 1
                } else
                    t += 2;
            return -1
        }
        var h = function() {
            function e(e) {
                this.bytes = e,
                this.bytes2 = e.slice(0)
            }
            return e.prototype.numBytesLeft = function() {
                return this.bytes.byteLength
            }
            ,
            e.prototype.readUInt8 = function() {
                return this.readInt(1)
            }
            ,
            e.prototype.readUInt16 = function() {
                return this.readInt(2)
            }
            ,
            e.prototype.readUInt24 = function() {
                return this.readInt(3)
            }
            ,
            e.prototype.readUInt32 = function() {
                return this.readInt(4)
            }
            ,
            e.prototype.readLatLon32 = function() {
                return (this.readUInt32() - (1 << 31 >>> 0)) / 1e7
            }
            ,
            e.prototype.skip = function(e) {
                this.bytes = this.bytes.slice(e)
            }
            ,
            e.prototype.bytesLeft = function() {
                return this.bytes.byteLength
            }
            ,
            e.prototype.clear = function() {
                this.bytes = new Uint8Array(0)
            }
            ,
            e.prototype.printPacket = function() {
                console.log("ByteArray: "),
                console.log(this.bytes),
                console.log(this.bytes2)
            }
            ,
            e.prototype.readInt = function(e) {
                if (e > this.bytes.byteLength)
                    throw new Error("Not enough bytes");
                for (var t = 0, n = 0; n < e; n += 1) {
                    var i = 8 * (e - 1 - n);
                    t |= this.bytes[n] << i >>> 0
                }
                return this.bytes = this.bytes.slice(e),
                t >>> 0
            }
            ,
            e
        }();
        var f, g, v = function() {
            function e() {
                var e = this;
                this.retryConnectId = 0,
                this.parser = new a,
                this.parser.onServerHeartbeat = function() {
                    null !== e.onServerHeartbeat && e.onServerHeartbeat()
                }
                ,
                this.parser.onWarpboxHeartbeat = function() {
                    null !== e.onWarpboxHeartbeat && e.onWarpboxHeartbeat()
                }
                ,
                this.parser.onDataPacket = function(t) {
                    null !== e.onDataPacket && e.onDataPacket(t)
                }
            }
            return e.prototype.connect = function(e) {
                var t = this;
                this.ws = new WebSocket(e),
                this.ws.binaryType = "arraybuffer",
                console.log("connecting WS"),
                clearTimeout(this.retryConnectId),
                this.ws.addEventListener("open", (function(e) {
                    console.log("WS connected."),
                    null !== t.onConnectionEvent && t.onConnectionEvent(!0)
                }
                )),
                this.ws.addEventListener("error", (function(e) {
                    console.log("There was an error connecting to the webSocket " + e),
                    null !== t.onConnectionEvent && t.onConnectionEvent(!1, e)
                }
                )),
                this.ws.addEventListener("close", (function(n) {
                    console.log("Websocket closed " + n.code + " " + n.reason),
                    null !== t.onConnectionEvent && t.onConnectionEvent(!1),
                    t.retryConnectId = setTimeout((function() {
                        console.log("Reconnecting.. "),
                        t.connect(e)
                    }
                    ), 15e3)
                }
                )),
                this.ws.addEventListener("message", (function(e) {
                    try {
                        var n = e.data
                        , i = new Uint8Array(n);
                        t.parser.parse(i)
                    } catch (e) {
                        console.log("Error : " + e)
                    }
                }
                ))
            }
            ,
            e.prototype.disconnect = function() {
                var e;
                null === (e = this.ws) || void 0 === e || e.close()
            }
            ,
            e
        }(), m = function(e, t, n, i) {
            return new (n || (n = Promise))((function(r, o) {
                function a(e) {
                    try {
                        l(i.next(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function s(e) {
                    try {
                        l(i.throw(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function l(e) {
                    var t;
                    e.done ? r(e.value) : (t = e.value,
                    t instanceof n ? t : new n((function(e) {
                        e(t)
                    }
                    ))).then(a, s)
                }
                l((i = i.apply(e, t || [])).next())
            }
            ))
        }, y = function(e, t) {
            var n, i, r, o, a = {
                label: 0,
                sent: function() {
                    if (1 & r[0])
                        throw r[1];
                    return r[1]
                },
                trys: [],
                ops: []
            };
            return o = {
                next: s(0),
                throw: s(1),
                return: s(2)
            },
            "function" == typeof Symbol && (o[Symbol.iterator] = function() {
                return this
            }
            ),
            o;
            function s(o) {
                return function(s) {
                    return function(o) {
                        if (n)
                            throw new TypeError("Generator is already executing.");
                        for (; a; )
                            try {
                                if (n = 1,
                                i && (r = 2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i),
                                0) : i.next) && !(r = r.call(i, o[1])).done)
                                    return r;
                                switch (i = 0,
                                r && (o = [2 & o[0], r.value]),
                                o[0]) {
                                case 0:
                                case 1:
                                    r = o;
                                    break;
                                case 4:
                                    return a.label++,
                                    {
                                        value: o[1],
                                        done: !1
                                    };
                                case 5:
                                    a.label++,
                                    i = o[1],
                                    o = [0];
                                    continue;
                                case 7:
                                    o = a.ops.pop(),
                                    a.trys.pop();
                                    continue;
                                default:
                                    if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                        a = 0;
                                        continue
                                    }
                                    if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                        a.label = o[1];
                                        break
                                    }
                                    if (6 === o[0] && a.label < r[1]) {
                                        a.label = r[1],
                                        r = o;
                                        break
                                    }
                                    if (r && a.label < r[2]) {
                                        a.label = r[2],
                                        a.ops.push(o);
                                        break
                                    }
                                    r[2] && a.ops.pop(),
                                    a.trys.pop();
                                    continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e],
                                i = 0
                            } finally {
                                n = r = 0
                            }
                        if (5 & o[0])
                            throw o[1];
                        return {
                            value: o[0] ? o[1] : void 0,
                            done: !0
                        }
                    }([o, s])
                }
            }
        }, b = function() {
            function e() {
                this.dataPackets = []
            }
            return e.prototype.loadFile = function(e) {
                return m(this, void 0, void 0, (function() {
                    var t = this;
                    return y(this, (function(n) {
                        return this.dataPackets = [],
                        [2, fetch(e).then((function(e) {
                            return e.arrayBuffer()
                        }
                        )).then((function(e) {
                            var t = []
                            , n = new a;
                            n.onDataPacket = function(e) {
                                t.push(e)
                            }
                            ;
                            for (var i = 0; i < e.byteLength; ) {
                                var r = e.byteLength - i
                                , o = Math.min(a.MAX_BUFFER_SIZE, r)
                                , s = new Uint8Array(e.slice(i, i + o));
                                n.parse(s),
                                i += o
                            }
                            return t
                        }
                        )).then((function(e) {
                            t.dataPackets = e
                            window.pos = e;
                        }
                        ))]
                    }
                    ))
                }
                ))
            }
            ,
            e
        }(), w = function(e, t, n, i) {
            return new (n || (n = Promise))((function(r, o) {
                function a(e) {
                    try {
                        l(i.next(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function s(e) {
                    try {
                        l(i.throw(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function l(e) {
                    var t;
                    e.done ? r(e.value) : (t = e.value,
                    t instanceof n ? t : new n((function(e) {
                        e(t)
                    }
                    ))).then(a, s)
                }
                l((i = i.apply(e, t || [])).next())
            }
            ))
        }, x = function(e, t) {
            var n, i, r, o, a = {
                label: 0,
                sent: function() {
                    if (1 & r[0])
                        throw r[1];
                    return r[1]
                },
                trys: [],
                ops: []
            };
            return o = {
                next: s(0),
                throw: s(1),
                return: s(2)
            },
            "function" == typeof Symbol && (o[Symbol.iterator] = function() {
                return this
            }
            ),
            o;
            function s(o) {
                return function(s) {
                    return function(o) {
                        if (n)
                            throw new TypeError("Generator is already executing.");
                        for (; a; )
                            try {
                                if (n = 1,
                                i && (r = 2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i),
                                0) : i.next) && !(r = r.call(i, o[1])).done)
                                    return r;
                                switch (i = 0,
                                r && (o = [2 & o[0], r.value]),
                                o[0]) {
                                case 0:
                                case 1:
                                    r = o;
                                    break;
                                case 4:
                                    return a.label++,
                                    {
                                        value: o[1],
                                        done: !1
                                    };
                                case 5:
                                    a.label++,
                                    i = o[1],
                                    o = [0];
                                    continue;
                                case 7:
                                    o = a.ops.pop(),
                                    a.trys.pop();
                                    continue;
                                default:
                                    if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                        a = 0;
                                        continue
                                    }
                                    if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                        a.label = o[1];
                                        break
                                    }
                                    if (6 === o[0] && a.label < r[1]) {
                                        a.label = r[1],
                                        r = o;
                                        break
                                    }
                                    if (r && a.label < r[2]) {
                                        a.label = r[2],
                                        a.ops.push(o);
                                        break
                                    }
                                    r[2] && a.ops.pop(),
                                    a.trys.pop();
                                    continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e],
                                i = 0
                            } finally {
                                n = r = 0
                            }
                        if (5 & o[0])
                            throw o[1];
                        return {
                            value: o[0] ? o[1] : void 0,
                            done: !0
                        }
                    }([o, s])
                }
            }
        }, k = function() {
            function e() {
                this.playbackTimeSeconds = 0,
                this.playbackIdx = 0,
                this.playbackRate = 1
            }
            return e.prototype.play = function(e, t) {
                var n = this;
                void 0 === t && (t = 1),
                console.log("Loading " + e),
                this.loadFile(e).then((function() {
                    var i;
                    console.log("Loaded BIN");
                    for (var r = !1, a = 0, s = n.binFile.dataPackets; a < s.length; a++) {
                        var l = s[a];
                        if (Object(o.n)(l) && (r = !0),
                        r && Object(o.p)(l)) {
                            i = l.time;
                            break
                        }
                    }
                    if (void 0 === i)
                        throw new Error("BIN file has no race data " + e);
                    n.playbackRate = t,
                    n.playbackIdx = 0,
                    n.playbackTimeSeconds = i,
                    n.lastTimerUpdate = performance.now(),
                    n.playbackTimerId = setTimeout(n.timerUpdate.bind(n), 0)
                }
                ))
            }
            ,
            e.prototype.stop = function() {
                clearInterval(this.playbackTimerId)
            }
            ,
            e.prototype.loadFile = function(e) {
                return w(this, void 0, void 0, (function() {
                    return x(this, (function(t) {
                        return this.binFile = new b,
                        [2, this.binFile.loadFile(e)]
                    }
                    ))
                }
                ))
            }
            ,
            e.prototype.timerUpdate = function() {
                var e = performance.now() - this.lastTimerUpdate;
                this.playbackTimeSeconds += e / 1e3 * this.playbackRate;
                for (var t = this.nextPacket(); void 0 !== t; ) {
                    var n = 0;
                    if (Object(o.p)(t) && (n = t.time - this.playbackTimeSeconds),
                    n > 0)
                        return this.lastTimerUpdate = performance.now(),
                        void (this.playbackTimerId = setTimeout(this.timerUpdate.bind(this), 1e3 * n / this.playbackRate));
                    null !== this.onDataPacket && this.onDataPacket(t),
                    this.playbackIdx += 1,
                    t = this.nextPacket()
                }
            }
            ,
            e.prototype.nextPacket = function() {
                if (!(this.playbackIdx < 0 || this.playbackIdx >= this.binFile.dataPackets.length))
                    return this.binFile.dataPackets[this.playbackIdx]
            }
            ,
            e.UPDATE_FREQ_SECS = 2,
            e.MIN_INTERPOLATION_PERIOD_SECS = 4 * e.UPDATE_FREQ_SECS,
            e
        }();
        !function(e) {
            e[e.NotConnected = 0] = "NotConnected",
            e[e.Connected = 1] = "Connected",
            e[e.ConectionActive = 2] = "ConectionActive",
            e[e.WarpboxActive = 3] = "WarpboxActive",
            e[e.Live = 4] = "Live"
        }(f || (f = {})),
        function(e) {
            e[e.None = 0] = "None",
            e[e.Live = 1] = "Live",
            e[e.Playback = 2] = "Playback"
        }(g || (g = {}));
        var C = function() {
            function e() {
                this.liveStatusListeners = [],
                this.racingListeners = [],
                this.dataMode = g.None,
                this._liveStatus = f.NotConnected,
                this.liveStatusUpdateTime = new Date,
                this.liveDataSource = this.createLiveSource(),
                this.recordedDataSource = this.createRecordedSource()
            }
            return Object.defineProperty(e.prototype, "liveStatus", {
                get: function() {
                    return this._liveStatus
                },
                set: function(e) {
                    if (this.liveStatusUpdateTime = new Date,
                    this.liveStatus !== e) {
                        this._liveStatus = e;
                        for (var t = 0, n = this.liveStatusListeners; t < n.length; t++) {
                            n[t].updateStatus(this._liveStatus)
                        }
                    }
                },
                enumerable: !1,
                configurable: !0
            }),
            e.prototype.connectLive = function(e) {
                this.liveDataSource.connect(e)
            }
            ,
            e.prototype.playLiveData = function() {
                this.dataMode = g.Live
            }
            ,
            e.prototype.playRecordedData = function(e, t) {
                void 0 === t && (t = 1),
                this.dataMode = g.Playback,
                this.recordedDataSource.play(e, t)
            }
            ,
            e.prototype.stopData = function() {
                this.dataMode = g.None,
                this.recordedDataSource.stop()
            }
            ,
            e.prototype.attachLiveStatusListener = function(e) {
                this.liveStatusListeners.push(e),
                e.updateStatus(this.liveStatus)
            }
            ,
            e.prototype.attachRacingListener = function(e) {
                this.racingListeners.push(e)
            }
            ,
            e.prototype.detachLiveStatusListener = function(e) {
                var t = this.liveStatusListeners.indexOf(e);
                t < 0 ? console.log("Listener not found") : this.liveStatusListeners.splice(t, 1)
            }
            ,
            e.prototype.detachRacingListner = function(e) {
                var t = this.racingListeners.indexOf(e);
                t < 0 ? console.log("Listener not found") : this.racingListeners.splice(t, 1)
            }
            ,
            e.prototype.packetUpdate = function(e) {
                for (var t = 0, n = this.racingListeners; t < n.length; t++) {
                    n[t].dataPacket(e)
                }
            }
            ,
            e.prototype.createLiveSource = function() {
                var e = this
                , t = new v;
                return t.onConnectionEvent = function(t, n) {
                    t ? e.processLiveStatusUpdate(f.Connected) : e.liveStatus = f.NotConnected
                }
                ,
                t.onServerHeartbeat = function() {
                    e.processLiveStatusUpdate(f.ConectionActive)
                }
                ,
                t.onWarpboxHeartbeat = function() {
                    e.processLiveStatusUpdate(f.WarpboxActive)
                }
                ,
                t.onDataPacket = function(t) {
                    t instanceof o.d && e.processLiveStatusUpdate(f.Live),
                    e.dataMode === g.Live && e.packetUpdate(t)
                }
                ,
                t
            }
            ,
            e.prototype.createRecordedSource = function() {
                var e = this
                , t = new k;
                return t.onDataPacket = function(t) {
                    e.dataMode === g.Playback && e.packetUpdate(t)
                }
                ,
                t
            }
            ,
            e.prototype.processLiveStatusUpdate = function(t) {
                this.liveStatus <= t ? this.liveStatus = t : (new Date).getTime() - this.liveStatusUpdateTime.getTime() > e.LIVE_STATUS_EXPIRY_TIME_MS && (this.liveStatus = t)
            }
            ,
            e.LIVE_STATUS_EXPIRY_TIME_MS = 3e3,
            e
        }()
        , I = function(e, t, n, i) {
            return new (n || (n = Promise))((function(r, o) {
                function a(e) {
                    try {
                        l(i.next(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function s(e) {
                    try {
                        l(i.throw(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function l(e) {
                    var t;
                    e.done ? r(e.value) : (t = e.value,
                    t instanceof n ? t : new n((function(e) {
                        e(t)
                    }
                    ))).then(a, s)
                }
                l((i = i.apply(e, t || [])).next())
            }
            ))
        }
        , S = function(e, t) {
            var n, i, r, o, a = {
                label: 0,
                sent: function() {
                    if (1 & r[0])
                        throw r[1];
                    return r[1]
                },
                trys: [],
                ops: []
            };
            return o = {
                next: s(0),
                throw: s(1),
                return: s(2)
            },
            "function" == typeof Symbol && (o[Symbol.iterator] = function() {
                return this
            }
            ),
            o;
            function s(o) {
                return function(s) {
                    return function(o) {
                        if (n)
                            throw new TypeError("Generator is already executing.");
                        for (; a; )
                            try {
                                if (n = 1,
                                i && (r = 2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i),
                                0) : i.next) && !(r = r.call(i, o[1])).done)
                                    return r;
                                switch (i = 0,
                                r && (o = [2 & o[0], r.value]),
                                o[0]) {
                                case 0:
                                case 1:
                                    r = o;
                                    break;
                                case 4:
                                    return a.label++,
                                    {
                                        value: o[1],
                                        done: !1
                                    };
                                case 5:
                                    a.label++,
                                    i = o[1],
                                    o = [0];
                                    continue;
                                case 7:
                                    o = a.ops.pop(),
                                    a.trys.pop();
                                    continue;
                                default:
                                    if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                        a = 0;
                                        continue
                                    }
                                    if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                        a.label = o[1];
                                        break
                                    }
                                    if (6 === o[0] && a.label < r[1]) {
                                        a.label = r[1],
                                        r = o;
                                        break
                                    }
                                    if (r && a.label < r[2]) {
                                        a.label = r[2],
                                        a.ops.push(o);
                                        break
                                    }
                                    r[2] && a.ops.pop(),
                                    a.trys.pop();
                                    continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e],
                                i = 0
                            } finally {
                                n = r = 0
                            }
                        if (5 & o[0])
                            throw o[1];
                        return {
                            value: o[0] ? o[1] : void 0,
                            done: !0
                        }
                    }([o, s])
                }
            }
        }
        , T = function() {
            function e() {
                this.raceDataSubUrl = "",
                this.raceConfigUrl = "",
                this.teams = new Map,
                this.terrainConfig = new R,
                this.defaultboatmodel = new E,
                this.defaultbuoymodel = new L,
                this.buoymodels = new Map
            }
            return e.loadFromFile = function(t) {
                return I(this, void 0, void 0, (function() {
                    return S(this, (function(n) {
                        return [2, fetch(t).then((function(e) {
                            return e.json()
                        }
                        )).then((function(t) {
                            console.log(t);
                            var n = new e;
                            return n.deserialize(t),
                            n
                        }
                        )).catch((function(e) {
                            console.log("config deserialize error:"),
                            console.log(e)
                        }
                        ))]
                    }
                    ))
                }
                ))
            }
            ,
            e.prototype.deserialize = function(e) {
                for (var t = 0, n = Object.keys(this); t < n.length; t++) {
                    var i = n[t];
                    if (e.hasOwnProperty(i)) {
                        if ("teams" === i) {
                            for (var r = 0, o = e[i]; r < o.length; r++) {
                                var a = o[r]
                                , s = new P;
                                console.log(s),
                                s.deserialize(a),
                                this.teams.set(s.team_id, s)
                            }
                            continue
                        }
                        if ("buoymodels" === i) {
                            for (var l = 0, c = e[i]; l < c.length; l++) {
                                a = c[l];
                                var p = new L;
                                p.deserialize(a),
                                this.buoymodels.set(p.buoy_id, p)
                            }
                            continue
                        }
                        this[i] = e[i]
                    }
                }
            }
            ,
            e.prototype.getTeam = function(e) {
                return this.teams.get(e)
            }
            ,
            e.prototype.getTerrainConfig = function() {
                return this.terrainConfig
            }
            ,
            e.prototype.getBoatModel = function(e) {
                var t = this.getTeam(e);
                return void 0 === t || void 0 === t.boatmodel ? (console.log("Undefined boat model"),
                this.defaultboatmodel) : t.boatmodel
            }
            ,
            e.prototype.getBuoy = function(e) {
                return this.buoymodels.get(e)
            }
            ,
            e.prototype.getBuoyModel = function(e) {
                if (e >= 50) {
                    var t = 10 * Math.trunc(e / 10);
                    e - t,
                    e = t
                }
                var n = this.getBuoy(e);
                return void 0 === n || void 0 === n.model ? this.defaultbuoymodel : n
            }
            ,
            e
        }()
        , R = function() {
            function e() {
                this.model = "",
                this.location = {
                    x: 0,
                    y: 0
                },
                this.rotation = {
                    x: 0,
                    y: 0,
                    z: 0
                }
            }
            return e.prototype.deserialize = function(e) {
                for (var t = 0, n = Object.keys(this); t < n.length; t++) {
                    var i = n[t];
                    this[i] = e[i]
                }
            }
            ,
            e
        }()
        , E = function() {
            function e() {
                this.name = "",
                this.topMastOffset = {
                    x: 0,
                    y: 0,
                    z: 0
                },
                this.defaultbowoffset = 15,
                this.jibtarget = "",
                this.mainsailtarget = "",
                this.leftfoil = "",
                this.rightfoil = ""
            }
            return e.prototype.deserialize = function(e) {
                for (var t = 0, n = Object.keys(this); t < n.length; t++) {
                    var i = n[t];
                    this[i] = e[i]
                }
            }
            ,
            e
        }()
        , L = function() {
            function e() {
                this.buoy_id = 0,
                this.model = ""
            }
            return e.prototype.deserialize = function(e) {
                for (var t = 0, n = Object.keys(this); t < n.length; t++) {
                    var i = n[t];
                    this[i] = e[i]
                }
            }
            ,
            e
        }()
        , P = function() {
            function e() {
                this.team_id = 0,
                this.flag_id = "",
                this.name = "",
                this.abbr = "",
                this.color = "#FFFFFF",
                this.bowoffset = void 0,
                this.boatmodel = void 0
            }
            return e.prototype.deserialize = function(e) {
                for (var t = 0, n = Object.keys(this); t < n.length; t++) {
                    var i = n[t];
                    this[i] = e[i]
                }
            }
            ,
            e
        }()
        , F = n(5)
        , _ = (n(40),
        n(3))
        , M = n(0)
        , O = n.n(M)
        , D = n(21)
        , A = (n(47),
        n(49),
        n(28),
        n.p + "fd15a01804495fa36b30ef1e7633164b.svg")
        , B = n.p + "506d32cbae98afa9f9dff5ca3bb0758e.svg"
        , N = n.p + "494256c3910d7a99b333495e7120c364.svg"
        , V = n.p + "c6f62c8d1b4c211900b9ae02c30801ba.svg"
        , U = n(20)
        , j = n.p + "ff6b5d70e81daf92105696db00aba385.png"
        , W = n.p + "2472483d9b4d7cb7f6e5f4854a796ceb.png"
        , H = n(6)
        , z = n.p + "c28f060f7b4a6b48f6086c675c49421f.png"
        , G = n.p + "b6746a464ff8a4dc279d38c3fd906d41.png"
        , K = n.p + "bebfd0f9af6b3cd707366945b3dd5e0a.png"
        , Y = n.p + "2dd3237d143206ba598db6ae1398dfe9.png";
        function q(e, t) {
            var n;
            switch (e) {
            case "nz":
                n = G;
                break;
            case "it":
                n = z;
                break;
            case "uk":
                n = K;
                break;
            case "usa":
                n = Y;
                break;
            default:
                n = ""
            }
            return M.createElement("img", {
                style: t,
                alt: "",
                src: n
            })
        }
        function X(e, t) {
            var n = {
                background: e,
                width: t,
                height: t,
                borderRadius: t / 2
            };
            return M.createElement("div", {
                style: n
            })
        }
        var J, Q = (J = function(e, t) {
            return (J = Object.setPrototypeOf || {
                __proto__: []
            }instanceof Array && function(e, t) {
                e.__proto__ = t
            }
            || function(e, t) {
                for (var n in t)
                    Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
            }
            )(e, t)
        }
        ,
        function(e, t) {
            function n() {
                this.constructor = e
            }
            J(e, t),
            e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype,
            new n)
        }
        ), Z = function(e) {
            function t(t) {
                var n, i, r = e.call(this, t) || this;
                return r.state = {
                    pressed: !1,
                    selected: null !== (n = t.selected) && void 0 !== n && n,
                    alt: null !== (i = t.alt) && void 0 !== i ? i : ""
                },
                r
            }
            return Q(t, e),
            t.prototype.render = function() {
                var e, t, n, i, r = this, o = (void 0 !== this.props.getStyle ? this.props.getStyle : $)(this.state.pressed, this.state.selected), a = {
                    opacity: null === (e = this.props.enabled) || void 0 === e || e ? 1 : .5
                };
                if (void 0 !== this.props.text) {
                    var s = null !== (t = this.props.divClassName) && void 0 !== t ? t : "menuitem"
                    , l = null !== (n = this.props.textClassName) && void 0 !== n ? n : "menutext"
                    , c = s + " cursor-pointer";
                    return M.createElement("div", {
                        className: c,
                        onClick: this.handleClick.bind(this)
                    }, M.createElement("div", {
                        style: o,
                        onMouseDown: function(e) {
                            return r.setPressed(!0)
                        },
                        onMouseUp: function(e) {
                            return r.setPressed(!1)
                        }
                    }, M.createElement("img", {
                        src: this.props.svgSrc,
                        alt: this.state.alt,
                        draggable: !1
                    })), M.createElement("div", {
                        className: l,
                        style: a
                    }, this.props.text))
                }
                return M.createElement("div", {
                    className: "cursor-pointer " + (null !== (i = this.props.divClassName) && void 0 !== i ? i : ""),
                    style: o,
                    onClick: this.handleClick.bind(this)
                }, M.createElement("img", {
                    src: this.props.svgSrc,
                    alt: this.state.alt,
                    draggable: !1
                }))
            }
            ,
            t.prototype.setPressed = function(e) {
                var t;
                (null === (t = this.props.enabled) || void 0 === t || t) && this.setState({
                    pressed: e
                })
            }
            ,
            t.prototype.onClick = function() {
                var e = void 0 !== this.props.isSelected && this.props.isSelected();
                if (this.props.onClick(),
                void 0 !== this.props.isSelected) {
                    var t = this.props.isSelected();
                    this.setState({
                        selected: t
                    }),
                    console.log("Changed from " + e + " to " + t)
                }
            }
            ,
            t.prototype.handleClick = function(e) {
                var t;
                (null === (t = this.props.enabled) || void 0 === t || t) && (e.stopPropagation(),
                this.onClick())
            }
            ,
            t
        }(M.Component);
        function $(e, t) {
            return {
                padding: "5px",
                width: "50px",
                height: "50px",
                opacity: e ? .5 : 1
            }
        }
        var ee = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , te = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.timerId = 0,
                n.flashingBackButton = !1,
                n.state = {
                    minimised: window.parent !== window,
                    rankings: t.playbackController.getBoatRankings(),
                    backButtonHighlighted: t.playbackController.isAnotherLiveRaceWaiting()
                },
                n
            }
            return ee(t, e),
            t.prototype.render = function() {
                var e, t = this, n = [], i = void 0, r = this.props.playbackController.getEventName(), o = !1;
                this.props.renderCanvas.clientWidth < this.props.renderCanvas.clientHeight ? (o = !0,
                e = this.props.renderCanvas.clientWidth) : e = this.props.renderCanvas.clientHeight;
                var a, s, l, c, p, u, d, h = {}, f = {}, g = {}, v = {}, m = "50px", y = !1;
                _.isMobileOnly ? (h = {
                    right: "0px",
                    top: "0px",
                    width: (y = !o) ? "250px" : this.state.minimised ? "auto" : e + "px"
                },
                f = {
                    fontSize: "18px"
                },
                v = {
                    fontSize: "18px"
                },
                g = {
                    background: "transparent"
                },
                m = "35px") : h = {
                    right: "15px",
                    top: "15px"
                };
                if (!this.state.minimised || y) {
                    (function(e) {
                        if (_.isMobileOnly)
                            return;
                        var t = e.playbackController.getRoundingTimerVisible() ? "SECS" : "DTL"
                        , n = {
                            fontFamily: "Myriad-Italic"
                        };
                        return M.createElement("div", {
                            className: "leaderboardcolheaders"
                        }, M.createElement("div", {
                            className: "spacer"
                        }), M.createElement("div", {
                            className: "leaderboardval",
                            style: n
                        }, "STAT"), M.createElement("div", {
                            className: "leaderboardval",
                            style: n
                        }, t))
                    }
                    )(this.props),
                    a = this.props,
                    s = v,
                    l = a.playbackController.getRaceName(),
                    c = a.playbackController.getCurrentLeg(),
                    p = a.playbackController.getNumLegs(),
                    u = "Leg " + Math.min(p, c) + "/" + p,
                    d = a.playbackController.getRaceStatusString(),
                    i = M.createElement("div", {
                        className: "leaderboardtitlerow",
                        style: s
                    }, M.createElement("div", {
                        className: "leaderboardsubtitle"
                    }, l), M.createElement("div", {
                        className: "leaderboardracestatus",
                        style: {
                            color: "#FF0000"
                        }
                    }, d), M.createElement("div", {
                        className: "leaderboardsubtitle"
                    }, u));
                    for (var b = 0, w = this.state.rankings; b < w.length; b++) {
                        var x = w[b]
                        , k = Object(H.f)(x.boat_id)
                        , C = ne(x, this.props.config.getTeam(k), this.props.canvasRenderer.getBoatFocus() === x.boat_id, this.props, y);
                        n.push(C)
                    }
                }
                var I = void 0;
                return y || (I = M.createElement("div", {
                    className: "leaderboardheader",
                    style: g
                }, M.createElement(Z, {
                    svgSrc: this.state.backButtonHighlighted ? N : B,
                    onClick: this.onBackButtonPressed.bind(this),
                    getStyle: function(e, t) {
                        return {
                            margin: "5px",
                            width: m,
                            height: m,
                            flexShrink: 0,
                            transition: "1.0s",
                            opacity: e ? .5 : 1
                        }
                    }
                }), M.createElement("div", {
                    className: "leaderboardtitlecolumn"
                }, M.createElement("div", {
                    className: "leaderboardtitle",
                    style: f
                }, r), i), M.createElement(Z, {
                    svgSrc: V,
                    onClick: this.collapseButtonPressed.bind(this),
                    getStyle: function(e, t) {
                        return {
                            padding: 5,
                            width: 50,
                            height: 50,
                            transform: t ? "" : "rotate(180deg)",
                            transition: "0.3s",
                            opacity: e ? .5 : 1
                        }
                    },
                    isSelected: function() {
                        return t.state.minimised
                    }
                }))),
                M.createElement("div", {
                    className: "leaderboard",
                    style: h
                }, I, n)
            }
            ,
            t.prototype.refreshLiveRaceWaitingState = function() {
                var e = this;
                this.flashingBackButton = this.props.playbackController.isAnotherLiveRaceWaiting(),
                this.flashingBackButton ? 0 === this.timerId && (this.timerId = setInterval((function() {
                    return e.flashButton()
                }
                ), 1e3)) : 0 !== this.timerId && (clearInterval(this.timerId),
                this.timerId = 0)
            }
            ,
            t.prototype.refreshRankings = function(e) {
                this.setState((function(t) {
                    return {
                        rankings: e
                    }
                }
                ))
            }
            ,
            t.prototype.collapseButtonPressed = function() {
                var e = !this.state.minimised;
                this.setState((function(t) {
                    return {
                        minimised: e
                    }
                }
                ))
            }
            ,
            t.prototype.onBackButtonPressed = function() {
                this.props.playbackController.loadMenu()
            }
            ,
            t.prototype.flashButton = function() {
                var e = this;
                this.flashingBackButton ? this.setState((function(t) {
                    return {
                        backButtonHighlighted: !e.state.backButtonHighlighted
                    }
                }
                )) : this.setState((function(e) {
                    return {
                        backButtonHighlighted: !1
                    }
                }
                ))
            }
            ,
            t
        }(M.Component);
        function ne(e, t, n, i, r) {
            var o, a, s, l, c = null !== (o = null == t ? void 0 : t.color) && void 0 !== o ? o : "#FFFFFF", p = "";
            p = _.isMobileOnly ? null !== (a = null == t ? void 0 : t.abbr) && void 0 !== a ? a : "" + Object(H.f)(e.boat_id) : null !== (s = null == t ? void 0 : t.name) && void 0 !== s ? s : "" + Object(H.f)(e.boat_id);
            var u, d = null !== (l = null == t ? void 0 : t.flag_id) && void 0 !== l ? l : "", h = X(c, 13), f = function(e, t) {
                return q(e, {
                    width: t * (256 / 150),
                    height: t,
                    padding: 5
                })
            }(d, 20);
            if (i.playbackController.getRoundingTimerVisible()) {
                var g = Math.floor(e.secsToLeader);
                u = 0 === g ? "" : "+" + F.d(g)
            } else
                u = e.leg > 0 && 0 === e.status ? function(e) {
                    if (e <= 0)
                        return "";
                    var t = F.b(e, 0);
                    if ("0" === t)
                        return "";
                    return "+" + t + "m"
                }(e.dtl) : "";
            var v, m, y = i.playbackController.getNumLegs(), b = e.leg > y;
            if (e.leg > 0)
                switch (e.rank) {
                case 0:
                    "-";
                    break;
                case 1:
                    "1st";
                    break;
                case 2:
                    "2nd";
                    break;
                case 3:
                    "3rd";
                    break;
                default:
                    e.rank + "th"
                }
            switch (v = i.playbackController.getBoatStatusString(e.status, b),
            e.status) {
            case 0:
                m = b ? "#FF0000" : "white";
                break;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                m = "#FF0000";
                break;
            default:
                m = "#FF0000"
            }
            var w = {
                color: m
            }
            , x = {}
            , k = {}
            , C = e.penaltyCount > 0
            , I = e.protestActive;
            if (C || I) {
                var S = "";
                C && I ? S = W : C ? S = U.default : I && (S = j),
                x = {
                    backgroundImage: "url(" + S + ")"
                },
                k = {
                    backgroundColor: "#102731"
                }
            }
            var T = ["leaderboardrowbackground", "cursor-pointer"];
            var R = void 0
            , E = void 0
            , L = void 0;
            return r || (R = M.createElement("div", {
                className: "leaderboardname"
            }, p),
            E = M.createElement("div", {
                className: "spacer"
            }),
            L = n ? M.createElement("img", {
                className: "leaderboardcameraicon",
                src: A
            }) : M.createElement("div", {
                className: "leaderboardcameraicon"
            })),
            M.createElement("div", {
                className: T.join(" "),
                style: x,
                key: e.boat_id,
                onClick: function() {
                    return i.onClick(e.boat_id)
                }
            }, M.createElement("div", {
                className: "leaderboardvals",
                style: k
            }, L, M.createElement("div", {
                className: "leaderboarddot"
            }, h), R, E, M.createElement("div", {
                className: "leaderboardflag"
            }, f), M.createElement("div", {
                className: "leaderboardval",
                style: w
            }, v), M.createElement("div", {
                className: "leaderboardval"
            }, u)))
        }
        n(25);
        var ie = n.p + "5a0dde660c9a918b842d40442014815c.svg"
        , re = n.p + "c865ec42049469caf583699a786b5c98.svg"
        , oe = n.p + "15e903688e63238b41b1c7418e297b6b.svg"
        , ae = n.p + "a10ffc91fcbb59c5f093899ced632f2f.svg"
        , se = n.p + "5925d3dca4c4af7a631b622c2e3d429f.svg"
        , le = n.p + "b8df1890e7be70ef5fc36bf878bcd424.svg"
        , ce = n.p + "91f4c36532bd5c1d14bc6a4650123bef.svg"
        , pe = n.p + "6c77f332413119c57d476c7c78bd8376.svg"
        , ue = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , de = function(e) {
            function t(t) {
                var n, i = e.call(this, t) || this;
                return i.state = {
                    text: null !== (n = t.text) && void 0 !== n ? n : "LIVE",
                    pressed: !1,
                    paused: 0 === i.props.playbackController.getPlaybackRate()
                },
                i
            }
            return ue(t, e),
            t.prototype.render = function() {
                var e = this
                , t = this.state.pressed ? .5 : 1
                , n = this.state.paused ? "#707475" : "#a9232a"
                , i = this.state.paused ? "Myriad-Italic" : "Myriad-Regular"
                , r = this.state.paused ? se : ae
                , o = {};
                return o = _.isMobile ? {
                    fontSize: "16px",
                    width: "100px",
                    margin: "10px",
                    height: "30px",
                    lineHeight: "33px",
                    opacity: t,
                    backgroundColor: n,
                    fontFamily: i
                } : {
                    opacity: t,
                    backgroundColor: n,
                    fontFamily: i
                },
                M.createElement("div", {
                    className: "liveindicator",
                    style: o,
                    onClick: this.handleClick.bind(this),
                    onMouseDown: function(t) {
                        return e.setPressed(!0)
                    },
                    onMouseUp: function(t) {
                        return e.setPressed(!1)
                    }
                }, M.createElement("div", {
                    className: "livetext"
                }, this.state.text), M.createElement("img", {
                    className: "liveplayicon",
                    src: r
                }))
            }
            ,
            t.prototype.refreshState = function() {
                this.props.playbackController.getPlaybackRate();
                this.setState({
                    paused: 0 === this.props.playbackController.getPlaybackRate()
                })
            }
            ,
            t.prototype.setPressed = function(e) {
                this.setState({
                    pressed: e
                })
            }
            ,
            t.prototype.onClick = function() {
                if (this.state.paused) {
                    var e = 1;
                    void 0 !== i.f && (e = i.f),
                    this.props.playbackController.setPlaybackRate(e)
                } else
                    this.props.playbackController.setPlaybackRate(0);
                this.refreshState()
            }
            ,
            t.prototype.handleClick = function(e) {
                e.stopPropagation(),
                this.onClick()
            }
            ,
            t
        }(M.Component)
        , he = n(114)
        , fe = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , ge = function(e) {
            var t, n;
            return 1 === e.leg ? (n = "Start",
            t = "sliderLabelCenter") : e.leg > e.numLegs ? (n = "Finish",
            t = "sliderLabelCenter") : (n = "" + (e.leg - 1),
            t = "sliderLabelCenter"),
            M.createElement("div", {
                className: t
            }, n)
        }
        , ve = function(e) {
            function t(t) {
                var n, i, r, o, a, s = e.call(this, t) || this;
                return s.mouseDown = !1,
                s.state = {
                    val: null !== (n = t.val) && void 0 !== n ? n : 0,
                    min: null !== (i = t.min) && void 0 !== i ? i : 0,
                    max: null !== (r = t.max) && void 0 !== r ? r : 1e3,
                    minRange: null !== (o = t.min) && void 0 !== o ? o : 0,
                    numLegs: t.playbackController.getNumLegs(),
                    maxRange: null !== (a = t.max) && void 0 !== a ? a : 1e3,
                    timeBased: s.props.graphVisibleFn()
                },
                s
            }
            return fe(t, e),
            t.prototype.render = function() {
                for (var e = {}, t = [], n = 1; n <= this.state.numLegs + 1; n += 1) {
                    var i = this.legProgressToSliderPos(n);
                    e[i] = M.createElement(ge, {
                        leg: n,
                        numLegs: this.state.numLegs
                    }),
                    t.push({
                        value: i,
                        label: e[i]
                    })
                }
                var r = this.state.max - this.state.min
                , o = 0
                , a = 0;
                this.props.dataMode === g.Live ? (o = this.state.minRange / r,
                a = (this.state.maxRange - this.state.minRange) / r) : (o = 0,
                a = this.state.val / r);
                var s = {
                    backgroundColor: "#e6242e",
                    height: 5,
                    marginLeft: 100 * o + "%",
                    width: 100 * a + "%"
                };
                return M.createElement("div", {
                    className: "slider"
                }, M.createElement(he.a, {
                    min: this.state.min,
                    max: this.state.max,
                    value: this.state.val,
                    track: !1,
                    onChange: this.handleChangeMui.bind(this),
                    onChangeCommitted: this.handleCommittedChangeMui.bind(this),
                    marks: t
                }), M.createElement("div", {
                    className: "sliderRange",
                    style: s
                }))
            }
            ,
            t.prototype.componentDidMount = function() {
                var e = this;
                this.timerId = setInterval((function() {
                    return e.tick()
                }
                ), 250)
            }
            ,
            t.prototype.componentWillUnmount = function() {
                clearInterval(this.timerId)
            }
            ,
            t.prototype.refreshSliderState = function() {
                this.tick()
            }
            ,
            t.prototype.handleChangeMui = function(e, t) {
                this.handleMouseDown(),
                this.handleChange(t)
            }
            ,
            t.prototype.handleCommittedChangeMui = function(e, t) {
                this.handleChange(t),
                this.handleMouseUp()
            }
            ,
            t.prototype.handleMouseDown = function() {
                this.mouseDown = !0,
                this.props.playbackController.setScrubbingActive(!0)
            }
            ,
            t.prototype.handleMouseUp = function() {
                this.mouseDown = !1,
                this.props.playbackController.setScrubbingActive(!1)
            }
            ,
            t.prototype.handleChange = function(e) {
                if (!(e < this.state.minRange || e > this.state.maxRange) && (this.setState((function(t) {
                    return {
                        val: e
                    }
                }
                )),
                this.mouseDown)) {
                    var t = this.sliderPosToLeg(e);
                    this.props.playbackController.setLegProgress(t)
                }
            }
            ,
            t.prototype.tick = function() {
                var e = this;
                if (!this.mouseDown) {
                    var t = this.props.playbackController.getNumLegs()
                    , n = this.props.playbackController.getLegProgress()
                    , i = this.props.playbackController.getMinMaxLegProgress();
                    if (void 0 !== n && void 0 !== i) {
                        var r = this.legProgressToSliderPos(n)
                        , o = this.legProgressToSliderPos(i.min)
                        , a = this.legProgressToSliderPos(i.max);
                        this.setState((function(n) {
                            return {
                                val: r,
                                minRange: o,
                                maxRange: a,
                                numLegs: t,
                                timeBased: e.props.graphVisibleFn()
                            }
                        }
                        ))
                    }
                }
            }
            ,
            t.prototype.legProgressToSliderPos = function(e) {
                var t, n;
                if (this.props.graphVisibleFn()) {
                    var i = this.props.playbackController.getCurrentRaceData()
                    , r = null !== (t = i.getEarliestRoundingTimeForLeg(Math.floor(e))) && void 0 !== t ? t : i.minRaceTime;
                    return 1e3 * ((e % 1 * ((null !== (n = i.getEarliestRoundingTimeForLeg(Math.floor(e + 1))) && void 0 !== n ? n : i.maxRaceTime) - r) + r - i.minRaceTime) / (i.maxRaceTime - i.minRaceTime))
                }
                var o = 1e3 / (this.state.numLegs + 1)
                , a = .5 * o
                , s = a + o * this.state.numLegs;
                return e < 1 ? Math.max(0, e) * a : e > this.state.numLegs + 1 ? s + Math.min(1, e - (this.state.numLegs + 1)) * (.5 * o) : a + (e - 1) * o
            }
            ,
            t.prototype.sliderPosToLeg = function(e) {
                if (this.props.graphVisibleFn()) {
                    var t = this.props.playbackController.getCurrentRaceData()
                    , n = e / 1e3 * (t.maxRaceTime - t.minRaceTime) + t.minRaceTime;
                    return t.getLegProgressAtTime(n)
                }
                var i = 1e3 / (this.state.numLegs + 1)
                , r = this.legProgressToSliderPos(1)
                , o = this.legProgressToSliderPos(this.state.numLegs + 1);
                if (e < r)
                    return e / (.5 * i);
                if (e > o)
                    return (e - o) / (.5 * i) + (this.state.numLegs + 1);
                var a = (e - r) / (o - r);
                return this.state.numLegs * a + 1
            }
            ,
            t
        }(M.Component)
        , me = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , ye = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.state = {
                    time: n.props.getDisplayTime(),
                    roundingTime: n.props.getRoundingTime(),
                    roundingVisible: !1
                },
                n
            }
            return me(t, e),
            t.prototype.render = function() {
                var e = this.state.roundingVisible ? "show" : ""
                , t = _.isMobile ? "mobile" : "";
                return M.createElement("div", {
                    id: "timeWrapper",
                    className: "timeindicator " + e + " " + t
                }, M.createElement("div", {
                    className: "roundingTime " + e,
                    style: {}
                }, "+" + this.state.roundingTime), M.createElement("div", {
                    className: "actualTime " + t
                }, this.state.time))
            }
            ,
            t.prototype.setVisible = function(e) {
                e !== this.state.roundingVisible && this.setState({
                    roundingVisible: e
                })
            }
            ,
            t.prototype.refreshTimer = function() {
                var e = this;
                this.state.roundingVisible ? this.setState((function(t) {
                    return {
                        time: e.props.getDisplayTime(),
                        roundingTime: e.props.getRoundingTime()
                    }
                }
                )) : this.setState((function(t) {
                    return {
                        time: e.props.getDisplayTime()
                    }
                }
                ))
            }
            ,
            t
        }(M.Component)
        , be = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , we = function(e) {
            function t(t) {
                var n = e.call(this, t) || this
                , i = t.playbackController.getPlaybackRate();
                return n.state = {
                    playing: 0 !== i,
                    playrate: n.getDisplayPlayrate(i),
                    isFullScreen: n.isFullScreen()
                },
                n.registerFullScreenEvents(),
                n
            }
            return be(t, e),
            t.prototype.componentDidMount = function() {
                document.addEventListener("keydown", this.keyFunction.bind(this), !1)
            }
            ,
            t.prototype.componentWillUnmount = function() {
                document.removeEventListener("keydown", this.keyFunction.bind(this), !1)
            }
            ,
            t.prototype.render = function() {
                return _.isMobile ? this.renderMobile() : this.renderDeskTop()
            }
            ,
            t.prototype.renderDeskTop = function() {
                var e = this.state.isFullScreen ? oe : re;
                return M.createElement("div", {
                    className: "footer",
                    style: {
                        backgroundImage: "linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,1.0))"
                    }
                }, M.createElement("div", {
                    className: "footerLayoutColumn"
                }, M.createElement(ve, {
                    dataMode: this.props.dataMode,
                    playbackController: this.props.playbackController,
                    graphVisibleFn: this.props.graphVisibleFn,
                    ref: this.setSliderRef.bind(this)
                }), M.createElement("div", {
                    className: "footerLayoutRow"
                }, this.props.dataMode === g.Playback ? ke(this.state.playrate, this.state.playing ? ae : se, this.handleOnRewindClicked.bind(this), this.handlePlayClicked.bind(this), this.handleOnFastForwardClicked.bind(this)) : xe(!1, this.props.playbackController, this.setLiveIndicatorRef.bind(this), this.handleOnSkipBackClicked.bind(this), this.handleOnSkipFwdClicked.bind(this)), M.createElement("div", {
                    className: "spacer"
                }), M.createElement(ye, {
                    ref: this.setTimeIndicatorRef.bind(this),
                    getDisplayTime: this.props.playbackController.getDisplayTime.bind(this.props.playbackController),
                    getRoundingTime: this.props.playbackController.getRoundingTimer.bind(this.props.playbackController)
                }), Ce(e, this.handleFullscreenClicked.bind(this)))))
            }
            ,
            t.prototype.renderMobile = function() {
                var e = this.state.isFullScreen ? oe : re
                , t = {
                    backgroundImage: this.props.compactView ? "" : "linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,1.0))"
                };
                return M.createElement("div", {
                    className: "footer",
                    style: t
                }, M.createElement("div", {
                    className: "footerLayoutColumn",
                    style: {
                        fontSize: "16px",
                        marginLeft: "5px",
                        marginRight: "5px",
                        marginBottom: "15px"
                    }
                }, this.props.compactView ? void 0 : M.createElement(ve, {
                    dataMode: this.props.dataMode,
                    playbackController: this.props.playbackController,
                    graphVisibleFn: this.props.graphVisibleFn,
                    ref: this.setSliderRef.bind(this)
                }), M.createElement("div", {
                    className: "footerLayoutRow"
                }, this.props.dataMode === g.Playback ? this.props.compactView ? void 0 : ke(this.state.playrate, this.state.playing ? ae : se, this.handleOnRewindClicked.bind(this), this.handlePlayClicked.bind(this), this.handleOnFastForwardClicked.bind(this)) : xe(this.props.compactView, this.props.playbackController, this.setLiveIndicatorRef.bind(this), this.handleOnSkipBackClicked.bind(this), this.handleOnSkipFwdClicked.bind(this)), M.createElement("div", {
                    className: "spacer"
                }), M.createElement(ye, {
                    ref: this.setTimeIndicatorRef.bind(this),
                    getDisplayTime: this.props.playbackController.getDisplayTime.bind(this.props.playbackController),
                    getRoundingTime: this.props.playbackController.getRoundingTimer.bind(this.props.playbackController)
                }), Ce(e, this.handleFullscreenClicked.bind(this)))))
            }
            ,
            t.prototype.refreshTimers = function() {
                var e;
                null === (e = this.timeIndicator) || void 0 === e || e.refreshTimer()
            }
            ,
            t.prototype.setRoundingVisible = function(e) {
                var t;
                null === (t = this.timeIndicator) || void 0 === t || t.setVisible(e)
            }
            ,
            t.prototype.refreshState = function() {
                var e, t, n = this.props.playbackController.getPlaybackRate();
                this.setState({
                    playing: 0 !== n,
                    playrate: this.getDisplayPlayrate(n)
                }),
                null === (e = this.liveIndicator) || void 0 === e || e.refreshState(),
                null === (t = this.sliderRef) || void 0 === t || t.refreshSliderState()
            }
            ,
            t.prototype.handlePlayClicked = function() {
                var e = !this.state.playing ? 1 : 0;
                this.props.playbackController.setPlaybackRate(e),
                this.refreshState()
            }
            ,
            t.prototype.handleFullscreenClicked = function() {
                var e = !this.isFullScreen();
                document.fullscreenEnabled && (e ? document.documentElement.requestFullscreen({
                    navigationUI: "hide"
                }) : document.exitFullscreen())
            }
            ,
            t.prototype.handleOnRewindClicked = function() {
                var e, t = this.props.playbackController.getPlaybackRate();
                e = 0 === t ? -2 : t > 0 ? t <= 1 ? -2 : t / 2 : Math.max(-16, 2 * t),
                this.props.playbackController.setPlaybackRate(e),
                this.refreshState()
            }
            ,
            t.prototype.handleOnFastForwardClicked = function() {
                var e, t = this.props.playbackController.getPlaybackRate();
                e = 0 === t ? 2 : t < 0 ? t < -1 ? 2 : t / 2 : Math.min(16, 2 * t),
                this.props.playbackController.setPlaybackRate(e),
                this.refreshState()
            }
            ,
            t.prototype.handleOnSkipBackClicked = function() {
                this.props.playbackController.skipToStart()
            }
            ,
            t.prototype.handleOnSkipFwdClicked = function() {
                this.props.playbackController.skipToLatest()
            }
            ,
            t.prototype.getDisplayPlayrate = function(e) {
                return 0 === e || 1 === e ? "" : "x " + e
            }
            ,
            t.prototype.setTimeIndicatorRef = function(e) {
                this.timeIndicator = e
            }
            ,
            t.prototype.setSliderRef = function(e) {
                this.sliderRef = e
            }
            ,
            t.prototype.setLiveIndicatorRef = function(e) {
                this.liveIndicator = e
            }
            ,
            t.prototype.registerFullScreenEvents = function() {
                var e = this;
                document.fullscreenEnabled && (document.onfullscreenchange = function() {
                    e.setState({
                        isFullScreen: e.isFullScreen()
                    })
                }
                )
            }
            ,
            t.prototype.isFullScreen = function() {
                var e = document.fullscreenElement;
                return null != e
            }
            ,
            t.prototype.keyFunction = function(e) {
                38 !== e.keyCode || this.state.playing ? 40 === e.keyCode && this.state.playing ? this.handlePlayClicked() : 39 !== e.keyCode ? 37 !== e.keyCode || (this.props.dataMode === g.Live ? this.handleOnSkipBackClicked() : this.props.dataMode === g.Playback && this.handleOnRewindClicked()) : this.props.dataMode === g.Live ? this.handleOnSkipFwdClicked() : this.props.dataMode === g.Playback && this.handleOnFastForwardClicked() : this.handlePlayClicked()
            }
            ,
            t
        }(M.Component);
        function xe(e, t, n, i, r) {
            if (e)
                return M.createElement(de, {
                    ref: n,
                    playbackController: t
                });
            var o = {};
            _.isMobile && (o = {
                margin: "0px"
            });
            var a = function(e, t) {
                return {
                    margin: "5px",
                    width: "35px",
                    height: "35px",
                    opacity: e ? .5 : 1
                }
            };
            return M.createElement("div", {
                className: "layoutRow",
                style: o
            }, M.createElement(Z, {
                svgSrc: pe,
                onClick: i,
                getStyle: a
            }), M.createElement(de, {
                ref: n,
                playbackController: t
            }), M.createElement(Z, {
                svgSrc: ce,
                onClick: r,
                getStyle: a
            }))
        }
        function ke(e, t, n, i, r) {
            var o = function(e, t) {
                return {
                    margin: "5px",
                    width: "35px",
                    height: "35px",
                    opacity: e ? .5 : 1
                }
            }
            , a = {};
            _.isMobile && (a = {
                margin: "0px"
            });
            var s = {};
            return _.isMobile && (s = {
                fontSize: "16px",
                margin: "5px"
            }),
            M.createElement("div", {
                className: "layoutRow",
                style: a
            }, M.createElement(Z, {
                svgSrc: le,
                onClick: n,
                getStyle: o
            }), M.createElement(Z, {
                svgSrc: t,
                onClick: i,
                getStyle: o
            }), M.createElement(Z, {
                svgSrc: ie,
                onClick: r,
                getStyle: o
            }), M.createElement("div", {
                className: "playrateindicator",
                style: s
            }, e))
        }
        function Ce(e, t) {
            if (!_.isIOS)
                return M.createElement(Z, {
                    svgSrc: e,
                    onClick: t,
                    getStyle: function(e, t) {
                        return {
                            margin: "5px",
                            width: "35px",
                            height: "35px",
                            opacity: e ? .5 : 1
                        }
                    }
                })
        }
        n(22);
        var Ie = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , Se = function(e) {
            function t() {
                return null !== e && e.apply(this, arguments) || this
            }
            return Ie(t, e),
            t.prototype.render = function() {
                var e = function(e, t) {
                    var n, i, r, o, a, s = null !== (n = null == t ? void 0 : t.flag_id) && void 0 !== n ? n : "", l = null !== (i = null == t ? void 0 : t.abbr) && void 0 !== i ? i : "" + (null == t ? void 0 : t.team_id), c = null !== (r = null == t ? void 0 : t.color) && void 0 !== r ? r : "#FFFFFF";
                    if (s.length > 0) {
                        o = q(s, {
                            width: a = 256 / 150 * 20,
                            height: 20,
                            position: "absolute",
                            left: 8,
                            top: 8
                        })
                    } else
                        o = X(c, a = 15);
                    var p = {
                        width: 50,
                        height: 20,
                        position: "absolute",
                        left: a + 16,
                        top: 8
                    }
                    , u = M.createElement("div", {
                        style: p
                    }, l)
                    , d = {
                        position: "absolute",
                        height: e,
                        width: a + 50 + 24
                    };
                    return M.createElement("div", {
                        className: "boatLabelElement",
                        style: d
                    }, o, u)
                }(this.props.height, this.props.teamConfig)
                , t = {
                    left: this.props.left,
                    top: this.props.top,
                    pointerEvents: "auto",
                    position: "absolute"
                };
                return M.createElement("div", {
                    style: t
                }, e)
            }
            ,
            t.prototype.shouldComponentUpdate = function(e) {
                return !1
            }
            ,
            t
        }(M.Component);
        var Te, Re = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }(), Ee = function(e) {
            function t(t) {
                return e.call(this, t) || this
            }
            return Re(t, e),
            t.prototype.render = function() {
                var e = {
                    top: this.props.top,
                    left: this.props.left,
                    height: this.props.height,
                    position: "absolute"
                };
                return M.createElement("div", {
                    className: "speedLabelElement",
                    style: e
                }, this.props.speedTxt)
            }
            ,
            t.prototype.shouldComponentUpdate = function(e) {
                return e.speedTxt !== this.props.speedTxt || e.top !== this.props.top
            }
            ,
            t
        }(M.Component), Le = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }();
        !function(e) {
            e[e.Penalty = 0] = "Penalty",
            e[e.Protest = 1] = "Protest"
        }(Te || (Te = {}));
        var Pe = function(e) {
            function t(t) {
                return e.call(this, t) || this
            }
            return Le(t, e),
            t.prototype.render = function() {
                var e = ""
                , t = "";
                switch (this.props.type) {
                case Te.Penalty:
                    e = "PENALTY",
                    t = U.default;
                    break;
                case Te.Protest:
                    e = "PROTEST",
                    t = j;
                    break;
                default:
                    console.log("Error : Unsupported Penalty Label type " + this.props.type)
                }
                var n = {
                    top: this.props.top,
                    left: this.props.left,
                    height: this.props.height,
                    position: "absolute",
                    backgroundImage: "url(" + t + ")"
                };
                return M.createElement("div", {
                    className: "penaltyLabelBackground",
                    style: n
                }, M.createElement("div", {
                    className: "penaltyLabelText"
                }, e))
            }
            ,
            t.prototype.shouldComponentUpdate = function(e) {
                return e.top !== this.props.top
            }
            ,
            t
        }(M.Component)
        , Fe = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , _e = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.state = {
                    visible: n.props.visible,
                    positions: n.props.canvasRenderer.getBoatLabelData(),
                    ranks: n.props.playbackController.getBoatRankings()
                },
                n
            }
            return Fe(t, e),
            t.prototype.render = function() {
                var e = this
                , t = ["boatLabels", "cursor-pointer"];
                this.state.visible && t.push("show");
                for (var n = new Map, i = 0, r = this.state.ranks; i < r.length; i++) {
                    var o = r[i];
                    n.set(o.boat_id, o.speed)
                }
                for (var a = new Map, s = new Map, l = 0, c = this.state.ranks; l < c.length; l++) {
                    o = c[l];
                    a.set(o.boat_id, o.penaltyCount),
                    s.set(o.boat_id, o.protestActive)
                }
                return M.createElement("div", {
                    className: t.join(" ")
                }, this.state.positions.map((function(t) {
                    var i, r, o, l, c = t.boat_id, p = t.x_pixels, u = t.y_pixels, d = t.z_index, h = Object(H.f)(c), f = e.props.config.getTeam(h), g = null !== (i = n.get(c)) && void 0 !== i ? i : 0, v = Object(F.b)(g, 0) + " kn", m = (null !== (r = a.get(c)) && void 0 !== r ? r : 0) > 0, y = null !== (o = s.get(c)) && void 0 !== o && o, b = 80, w = [], x = M.createElement(Se, {
                        boat_id: c,
                        key: "BoatLabel",
                        height: 36,
                        teamConfig: f,
                        left: 2,
                        top: 0
                    });
                    w.push(x);
                    var k = 36;
                    if (m) {
                        var C = k + 4
                        , I = M.createElement(Pe, {
                            top: C,
                            key: "PenaltyLabel",
                            left: 2,
                            height: 30,
                            type: Te.Penalty
                        });
                        k = C + 30,
                        b += 30,
                        w.push(I)
                    }
                    if (y) {
                        var S = k + 4;
                        I = M.createElement(Pe, {
                            top: S,
                            key: "ProtestLabel",
                            left: 2,
                            height: 30,
                            type: Te.Protest
                        });
                        k = S + 30,
                        b += 30,
                        w.push(I)
                    }
                    var T = k + 4;
                    I = M.createElement(Ee, {
                        top: T,
                        key: "SpeedLabel",
                        left: 2,
                        height: 30,
                        speedTxt: v
                    });
                    k = T + 30,
                    b += 30,
                    w.push(I);
                    var R, E, L = (R = null !== (l = null == f ? void 0 : f.color) && void 0 !== l ? l : "",
                    E = {
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: b,
                        width: 2,
                        backgroundColor: R
                    },
                    M.createElement("div", {
                        className: "boatLabelElement",
                        style: E
                    })), P = {
                        left: p,
                        top: u - b,
                        zIndex: d,
                        pointerEvents: "auto",
                        position: "absolute"
                    };
                    return M.createElement("div", {
                        key: c,
                        style: P,
                        onClick: function() {
                            return e.props.onClick(c)
                        }
                    }, L, w)
                }
                )))
            }
            ,
            t.prototype.refreshUI = function() {
                var e = this;
                this.setState((function(t) {
                    return {
                        positions: e.props.canvasRenderer.getBoatLabelData(),
                        ranks: e.props.playbackController.getBoatRankings()
                    }
                }
                ))
            }
            ,
            t.prototype.getVisible = function() {
                return this.state.visible
            }
            ,
            t.prototype.setVisible = function(e) {
                this.setState({
                    visible: e
                }),
                console.log("settings visible " + this.state.visible)
            }
            ,
            t
        }(M.Component);
        var Me = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , Oe = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.fadeValue = 0,
                n.state = {
                    visible: !1,
                    positionAndValue: n.props.canvasRenderer.getDTLPosition()
                },
                n
            }
            return Me(t, e),
            t.prototype.render = function() {
                var e = this.props.canvasRenderer.getDTLPosition();
                this.fadeValue += this.props.canvasRenderer.getAdvantageLineEnabled() && e.DTLVisible ? .1 : -.1,
                this.fadeValue = Object(F.a)(this.fadeValue, 0, 1);
                var t = {
                    left: this.state.positionAndValue.x_pixels,
                    top: this.state.positionAndValue.y_pixels,
                    zIndex: this.state.positionAndValue.z_index,
                    pointerEvents: "auto",
                    position: "absolute",
                    opacity: this.fadeValue
                };
                return M.createElement("div", {
                    className: "dtlElement",
                    style: t
                }, Object(F.b)(this.state.positionAndValue.value, 1) + "m")
            }
            ,
            t.prototype.getVisible = function() {
                return this.state.visible
            }
            ,
            t.prototype.setVisible = function(e) {
                this.setState({
                    visible: e
                }),
                console.log("settings visible " + this.state.visible)
            }
            ,
            t.prototype.refreshUI = function() {
                var e = this
                , t = this.props.canvasRenderer.getDTLPosition();
                this.setState((function(n) {
                    return {
                        visible: e.props.canvasRenderer.getAdvantageLineEnabled(),
                        positionAndValue: t,
                        distance: t.value
                    }
                }
                ))
            }
            ,
            t
        }(M.Component)
        , De = (n(64),
        function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }())
        , Ae = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.state = {
                    visible: !1,
                    positionAndValue: n.props.canvasRenderer.getWindSpeedLabelData(),
                    lastVisibleTime: 0
                },
                n
            }
            return De(t, e),
            t.prototype.render = function() {
                var e = ["windpointLabels"];
                this.state.visible && e.push("show");
                for (var t = new Map, n = 0, i = this.state.positionAndValue; n < i.length; n++) {
                    var r = i[n];
                    t.set(r.buoy_id, r.speed)
                }
                return M.createElement("div", {
                    className: e.join(" ")
                }, this.state.positionAndValue.map((function(e) {
                    var t = e.buoy_id
                    , n = e.speed
                    , i = e.heading
                    , r = e.x_pixels
                    , o = e.y_pixels
                    , a = e.z_index
                    , s = []
                    , l = Object(F.b)(n, 0) + " kn" + "/" + (Object(F.b)(i, 0) + " °")
                    , c = M.createElement(Ee, {
                        top: -30,
                        key: "SpeedLabel",
                        left: -58,
                        height: 30,
                        speedTxt: l
                    });
                    s.push(c);
                    var p = function(e, t, n, i) {
                        var r = {
                            position: "absolute",
                            left: 0,
                            top: t,
                            height: n,
                            width: i,
                            backgroundColor: e
                        };
                        return M.createElement("div", {
                            className: "boatLabelElement",
                            style: r
                        })
                    }("#FFFFFF", 0, 40, 2)
                    , u = {
                        left: r,
                        top: o - 40,
                        zIndex: a,
                        pointerEvents: "auto",
                        position: "absolute"
                    };
                    return M.createElement("div", {
                        key: t,
                        style: u
                    }, p, s)
                }
                )))
            }
            ,
            t.prototype.getVisible = function() {
                return this.state.visible
            }
            ,
            t.prototype.setVisible = function(e) {
                this.setState({
                    visible: e
                }),
                console.log("settings visible " + this.state.visible)
            }
            ,
            t.prototype.refreshUI = function() {
                var e = this
                , t = this.props.canvasRenderer.getWindEnabled()
                , n = this.state.lastVisibleTime;
                if (!t && this.state.visible) {
                    var i = Date.now();
                    this.setState({
                        lastVisibleTime: i
                    }),
                    n = i
                }
                (t || Date.now() - n < 500) && this.setState((function(n) {
                    return {
                        visible: t,
                        positionAndValue: e.props.canvasRenderer.getWindSpeedLabelData()
                    }
                }
                ))
            }
            ,
            t
        }(M.Component);
        n(66);
        var Be, Ne = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }();
        !function(e) {
            e[e.None = 0] = "None",
            e[e.FPSOnly = 1] = "FPSOnly",
            e[e.All = 2] = "All"
        }(Be || (Be = {}));
        var Ve, Ue = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.state = {
                    fps: "",
                    frame: "",
                    sim: "",
                    scene: "",
                    render: "",
                    ui: "",
                    gpu: "",
                    deviceInfo: "",
                    mode: Be.None
                },
                n.keyFunciton = n.keyFunciton.bind(n),
                n
            }
            return Ne(t, e),
            t.prototype.render = function() {
                if (this.state.mode === Be.None)
                    return M.createElement("div", null);
                var e = this.state.mode === Be.All ? this.getRest() : void 0
                , t = ["devOverlay"];
                return this.state.mode === Be.FPSOnly && t.push("shrink"),
                M.createElement("div", {
                    className: t.join(" ")
                }, this.state.fps, e)
            }
            ,
            t.prototype.updateTimeValues = function(e, t, n, i, r, o) {
                var a;
                if (this.state.mode === Be.None)
                    return null === (a = o.instrumentation) || void 0 === a || a.dispose(),
                    void (o.instrumentation = void 0);
                void 0 === o.instrumentation && o.createInstrumentation();
                var s = o.instrumentation.gpuFrameTimeCounter;
                s.beginMonitoring;
                var l = s.average ? (1e-6 * s.average).toFixed(2) : "-"
                , c = s.current ? (1e-6 * s.current).toFixed(2) : "-"
                , p = s.min ? (1e-6 * s.min).toFixed(2) : "-"
                , u = s.max ? (1e-6 * s.max).toFixed(2) : "-";
                "-" === p && "-" !== u && (s._min = 1 / 0);
                e.getLastMS();
                var d = e.getAverageMS()
                , h = e.getMaxMS()
                , f = e.getMinMS();
                this.setState({
                    fps: "FPS avg : " + Object(F.b)(1e3 / d) + ", min: " + Object(F.b)(1e3 / h) + ", max: " + Object(F.b)(1e3 / f) + ", gpu: " + l,
                    frame: "Frame  (ms) avg : " + Object(F.b)(d) + ", min: " + Object(F.b)(f) + ", max: " + Object(F.b)(h),
                    render: "Render (ms) avg : " + Object(F.b)(t.getAverageMS()) + ", min: " + Object(F.b)(t.getMinMS()) + ", max: " + Object(F.b)(t.getMaxMS()),
                    scene: "Scene  (ms) avg : " + Object(F.b)(n.getAverageMS()) + ", min: " + Object(F.b)(n.getMinMS()) + ", max: " + Object(F.b)(n.getMaxMS()),
                    sim: "Sim    (ms) avg : " + Object(F.b)(i.getAverageMS()) + ", min: " + Object(F.b)(i.getMinMS()) + ", max: " + Object(F.b)(i.getMaxMS()),
                    ui: "UI     (ms) avg : " + Object(F.b)(r.getAverageMS()) + ", min: " + Object(F.b)(r.getMinMS()) + ", max: " + Object(F.b)(r.getMaxMS()),
                    gpu: "GPU    (ms) avg : " + l + ", min: " + p + ", max: " + u + ", cur: " + c,
                    deviceInfo: this.getDeviceInfo()
                })
            }
            ,
            t.prototype.componentDidMount = function() {
                document.addEventListener("keydown", this.keyFunciton, !1)
            }
            ,
            t.prototype.componentWillUnmount = function() {
                document.removeEventListener("keydown", this.keyFunciton, !1)
            }
            ,
            t.prototype.keyFunciton = function(e) {
                if (187 === e.keyCode)
                    switch (this.state.mode) {
                    case Be.None:
                        this.setState({
                            mode: Be.FPSOnly
                        });
                        break;
                    case Be.FPSOnly:
                        this.setState({
                            mode: Be.All
                        });
                        break;
                    case Be.All:
                        this.setState({
                            mode: Be.None
                        })
                    }
            }
            ,
            t.prototype.getRest = function() {
                return M.createElement("div", null, this.state.frame, M.createElement("br", null), this.state.render, M.createElement("br", null), this.state.scene, M.createElement("br", null), this.state.sim, M.createElement("br", null), this.state.ui, M.createElement("br", null), this.state.gpu, M.createElement("br", null), this.state.deviceInfo)
            }
            ,
            t.prototype.getDeviceInfo = function() {
                return _.browserName + " " + _.fullBrowserVersion + " " + _.osName + " " + _.osVersion + " " + (_.isMobile ? _.mobileVendor + " " + _.mobileModel : "")
            }
            ,
            t
        }(M.Component), je = (n(68),
        n.p + "cc83d715ba18f7f985417f0bab978195.svg"), We = n.p + "39ed7c384c9e104b2ca6b00af73c631e.svg", He = n.p + "7df0c9a50bca87e5f967e1f0e25bbe97.svg", ze = n.p + "bc268d76965cadf50f7ebe79894d589f.svg", Ge = n.p + "25dcc6767ec8f7502c4ad867a4f48c9f.svg", Ke = n.p + "c70fd83d68e4e4ec0dd03100bca15184.svg", Ye = n.p + "c1388356c07775ee9f42eda6c17eaf53.svg", qe = n.p + "0c58d6227059c46646dffb766057e2b5.svg", Xe = n.p + "8d9f6619b4ba50523e659872daa0a622.svg", Je = n.p + "8639683a499bee275b38699fc3354a15.svg", Qe = n.p + "5a3d23050ca35677ff2ebca7dc5e6ccb.svg", Ze = n.p + "5ab5d600d2e1415732e9661876e7406d.svg", $e = n.p + "dc58a42c7ea306210353f6b8e636e313.svg", et = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }();
        !function(e) {
            e[e.Wind = 0] = "Wind",
            e[e.AdvantageLine = 1] = "AdvantageLine",
            e[e.SpeedArrows = 2] = "SpeedArrows",
            e[e.BoatLabels = 3] = "BoatLabels",
            e[e.BoatTrails = 4] = "BoatTrails",
            e[e.RefocusCamera = 5] = "RefocusCamera",
            e[e.LaunchPopup = 6] = "LaunchPopup",
            e[e.AudioVideo = 7] = "AudioVideo",
            e[e.Graph = 8] = "Graph",
            e[e.Terrain = 9] = "Terrain",
            e[e.Water = 10] = "Water"
        }(Ve || (Ve = {}));
        var tt = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.state = {
                    activeButtons: n.getButtonStates()
                },
                n
            }
            return et(t, e),
            t.prototype.render = function() {
                this.props.visible && ["fadeable"].push("show");
                for (var e = [], t = 0, n = 0, i = this.props.buttons; n < i.length; n++) {
                    var r = i[n];
                    e.push(this.createSideButton(r, t)),
                    t += 1
                }
                return M.createElement("div", {
                    className: "optionsmenu"
                }, e)
            }
            ,
            t.prototype.refreshState = function() {
                this.setState({
                    activeButtons: this.getButtonStates()
                })
            }
            ,
            t.prototype.getButtonStates = function() {
                var e = this
                , t = new Map;
                return [Ve.Wind, Ve.AdvantageLine, Ve.SpeedArrows, Ve.BoatLabels, Ve.BoatTrails, Ve.RefocusCamera, Ve.LaunchPopup, Ve.AudioVideo, Ve.Graph, Ve.Terrain, Ve.Water].forEach((function(n) {
                    t.set(n, e.getButtonSelected(n))
                }
                )),
                t
            }
            ,
            t.prototype.getButtonSelected = function(e) {
                switch (e) {
                case Ve.Wind:
                    return this.props.canvasRenderer.getWindEnabled();
                case Ve.AdvantageLine:
                    return this.props.canvasRenderer.getAdvantageLineEnabled();
                case Ve.SpeedArrows:
                    return this.props.canvasRenderer.getSpeedArrowsEnabled();
                case Ve.Graph:
                    return this.props.engine.getGraphEnabled();
                case Ve.BoatLabels:
                    return console.log("getButtonSelected returning " + this.props.engine.getBoatLabelsEnabled()),
                    this.props.engine.getBoatLabelsEnabled();
                case Ve.BoatTrails:
                    return this.props.canvasRenderer.getBoatTrailsEnabled();
                case Ve.RefocusCamera:
                    return this.props.canvasRenderer.getFleetCameraEnabled();
                case Ve.LaunchPopup:
                    return !0;
                case Ve.AudioVideo:
                    return this.props.mediaController.getChannelIDPlaying() > 0;
                case Ve.Terrain:
                    return this.props.canvasRenderer.getTerrainEnabled();
                case Ve.Water:
                    return this.props.canvasRenderer.getWaterEnabled();
                default:
                    return !1
                }
            }
            ,
            t.prototype.setButtonSelected = function(e, t) {
                switch (e) {
                case Ve.Wind:
                    this.props.canvasRenderer.setWindEnabled(t),
                    this.props.engine.setWindOverlayEnabled(t);
                    break;
                case Ve.AdvantageLine:
                    this.props.canvasRenderer.setAdvantageLineEnabled(t);
                    break;
                case Ve.SpeedArrows:
                    this.props.canvasRenderer.setSpeedArrowsEnabled(t);
                    break;
                case Ve.BoatLabels:
                    this.props.engine.setBoatLabelsEnabled(t);
                    break;
                case Ve.BoatTrails:
                    this.props.canvasRenderer.setBoatTrailsEnabled(t);
                    break;
                case Ve.Graph:
                    this.props.engine.setGraphEnabled(t);
                    break;
                case Ve.RefocusCamera:
                    this.props.canvasRenderer.setFleetCameraEnabled();
                    break;
                case Ve.LaunchPopup:
                    void 0 !== this.props.onLaunchOptionsPopup && this.props.onLaunchOptionsPopup();
                    break;
                case Ve.AudioVideo:
                    void 0 !== this.props.onLaunchAudioVideoPopup && this.props.onLaunchAudioVideoPopup();
                    break;
                case Ve.Terrain:
                    this.props.canvasRenderer.setTerrainEnabled(t);
                    break;
                case Ve.Water:
                    this.props.canvasRenderer.setWaterEnabled(t);
                default:
                    return
                }
            }
            ,
            t.prototype.createSideButton = function(e, t) {
                var n, i, r, o = this, a = null !== (n = this.state.activeButtons.get(e)) && void 0 !== n && n;
                null !== (i = this.props.textEnabled) && void 0 !== i && i && (r = function(e, t) {
                    var n = t ? "(ON)" : "";
                    switch (e) {
                    case Ve.Wind:
                        return "Wind " + n;
                    case Ve.AdvantageLine:
                        return "Advantage line " + n;
                    case Ve.SpeedArrows:
                        return "Speed arrows " + n;
                    case Ve.BoatLabels:
                        return "Boat labels " + n;
                    case Ve.BoatTrails:
                        return "Boat trails " + n;
                    case Ve.Graph:
                        return "Graph " + n;
                    case Ve.AudioVideo:
                        return "Audio and Video";
                    case Ve.Terrain:
                        return "Terrain " + n;
                    case Ve.Water:
                        return "Water " + n;
                    default:
                        return
                    }
                }(e, a));
                return M.createElement(Z, {
                    svgSrc: nt(e, this.props.mediaController),
                    key: "" + t,
                    text: r,
                    onClick: function() {
                        var t = a;
                        void 0 !== t && o.setButtonSelected(e, !t),
                        o.refreshState()
                    },
                    getStyle: function(t, n) {
                        return {
                            margin: "5px",
                            width: "38px",
                            height: "38px",
                            borderRadius: "25px",
                            filter: a ? "brightness(100%)" : "brightness(50%)",
                            border: a ? "1px solid  #FFFFFFFF" : "1px solid  #00000000",
                            background: e === Ve.AudioVideo && a ? "#a9232a" : "#000000AA",
                            opacity: t ? .5 : 1
                        }
                    }
                })
            }
            ,
            t
        }(M.Component);
        function nt(e, t) {
            switch (e) {
            case Ve.Wind:
                return Ge;
            case Ve.AdvantageLine:
                return je;
            case Ve.SpeedArrows:
                return We;
            case Ve.BoatLabels:
                return He;
            case Ve.BoatTrails:
                return ze;
            case Ve.RefocusCamera:
                return Ke;
            case Ve.LaunchPopup:
                return Ye;
            case Ve.Graph:
                return Qe;
            case Ve.AudioVideo:
                switch (t.getMediaTypePlaying()) {
                case Pt.Audio:
                    return Xe;
                case Pt.Video:
                    return Je;
                default:
                    return qe
                }
            case Ve.Terrain:
                return Ze;
            case Ve.Water:
                return $e;
            default:
                return
            }
        }
        n(70);
        var it = n(31)
        , rt = n(34)
        , ot = n.n(rt)
        , at = n.p + "b74d9442a4e9618d1abb837dbfb097b6.svg"
        , st = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , lt = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.state = {
                    closeShown: !0
                },
                n.showClose = n.showClose.bind(n),
                n.hideClose = n.hideClose.bind(n),
                n
            }
            return st(t, e),
            t.prototype.render = function() {
                var e, t, n = this, i = null !== (t = null === (e = ot.a.parse(this.props.videoUrl)) || void 0 === e ? void 0 : e.id) && void 0 !== t ? t : "";
                return O.a.createElement("div", {
                    className: "video",
                    style: {
                        height: this.props.height,
                        width: this.props.width
                    },
                    onFocus: function() {
                        return console.log("focused")
                    },
                    onBlur: function() {
                        return console.log("blurred")
                    }
                }, O.a.createElement(Z, {
                    svgSrc: at,
                    onClick: function() {
                        n.props.onClose()
                    },
                    getStyle: function(e, t) {
                        return {
                            background: "rgba(0,0,0,0.2)",
                            top: "-0",
                            right: "0px",
                            width: "24px",
                            height: "24px",
                            filter: e ? "brightness(50%)" : "brightness(100%)",
                            position: "absolute",
                            pointerEvents: n.state.closeShown ? "auto" : "none",
                            zIndex: 30,
                            cursor: "pointer",
                            opacity: n.state.closeShown ? "1" : "0",
                            transition: "opacity 0.5s"
                        }
                    },
                    divClassName: "video-close"
                }), O.a.createElement(it.a, {
                    className: "youtube",
                    containerClassName: "embed-wrapper",
                    videoId: i,
                    opts: {
                        playerVars: {
                            autoplay: 1,
                            controls: 1,
                            iv_load_policy: 3,
                            modestbranding: 1,
                            fs: 1,
                            playsinline: 1
                        }
                    },
                    onReady: this.onReady,
                    onPause: this.showClose,
                    onPlay: this.hideClose,
                    onEnd: this.showClose,
                    onError: this.showClose
                }))
            }
            ,
            t.prototype.onReady = function(e) {
                e.target.playVideo()
            }
            ,
            t.prototype.showClose = function() {
                this.setState({
                    closeShown: !0
                })
            }
            ,
            t.prototype.hideClose = function() {
                this.setState({
                    closeShown: !1
                })
            }
            ,
            t
        }(O.a.Component)
        , ct = (n(83),
        n.p + "bc1b0517c07f1ad8f7dc9b71eb91509a.svg")
        , pt = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , ut = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.escFunction = n.escFunction.bind(n),
                n
            }
            return pt(t, e),
            t.prototype.render = function() {
                var e, t, n, i = this, r = {
                    position: "relative",
                    top: "50%",
                    left: "50%",
                    display: "block",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "#182F38",
                    padding: "15px",
                    width: null !== (e = this.props.width) && void 0 !== e ? e : "80%",
                    maxWidth: null !== (t = this.props.maxWidth) && void 0 !== t ? t : ""
                };
                return void 0 !== this.props.title && (n = M.createElement("div", {
                    style: {
                        top: "20px",
                        left: "24px",
                        height: "30px",
                        position: "absolute",
                        color: "#FFFFFF",
                        fontFamily: "Myriad-Regular",
                        fontSize: "24px",
                        zIndex: 30
                    }
                }, " ", this.props.title.toUpperCase())),
                M.createElement("div", {
                    style: {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        background: "#000000DD",
                        width: "100%",
                        height: "100%",
                        zIndex: 20
                    },
                    onClick: this.closeButtonPressed.bind(this)
                }, M.createElement("div", {
                    style: r,
                    onClick: this.ignoreClick.bind(this)
                }, n, M.createElement(Z, {
                    svgSrc: ct,
                    onClick: function() {
                        i.props.onClose()
                    },
                    getStyle: function(e, t) {
                        return {
                            top: "15px",
                            right: "15px",
                            width: "30px",
                            height: "30px",
                            filter: e ? "brightness(50%)" : "brightness(100%)",
                            position: "absolute",
                            pointerEvents: "auto",
                            zIndex: 30
                        }
                    }
                }), this.props.children))
            }
            ,
            t.prototype.componentDidMount = function() {
                document.addEventListener("keydown", this.escFunction, !1)
            }
            ,
            t.prototype.omponentWillUnmount = function() {
                document.removeEventListener("keydown", this.escFunction, !1)
            }
            ,
            t.prototype.closeButtonPressed = function() {
                this.props.onClose()
            }
            ,
            t.prototype.ignoreClick = function(e) {
                e.stopPropagation()
            }
            ,
            t.prototype.escFunction = function(e) {
                27 === e.keyCode && this.closeButtonPressed()
            }
            ,
            t
        }(M.Component)
        , dt = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , ht = function(e) {
            function t() {
                return null !== e && e.apply(this, arguments) || this
            }
            return dt(t, e),
            t.prototype.render = function() {
                return M.createElement(ut, {
                    maxWidth: "500px",
                    onClose: this.props.onClose
                }, M.createElement("div", {
                    className: "optionspopover"
                }, M.createElement(tt, {
                    buttons: [Ve.Wind, Ve.AdvantageLine, Ve.BoatLabels, Ve.BoatTrails, Ve.Terrain],
                    engine: this.props.engine,
                    mediaController: this.props.mediaController,
                    canvasRenderer: this.props.canvasRenderer,
                    visible: !0,
                    textEnabled: !0,
                    ref: this.props.engine.setSideMenuRef.bind(this.props.engine)
                })))
            }
            ,
            t
        }(M.Component)
        , ft = (n(85),
        n.p + "7b22e95aab7b850fa43a843e8e962031.svg")
        , gt = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , vt = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.state = {
                    audioChannels: n.props.mediaController.getAudioChannels(),
                    videoChannels: n.props.mediaController.getVideoChannels(),
                    playingChannelID: n.props.mediaController.getChannelIDPlaying()
                },
                n
            }
            return gt(t, e),
            t.prototype.render = function() {
                for (var e, t = [], n = new Map, i = 0, r = this.state.audioChannels.concat(this.state.videoChannels); i < r.length; i++) {
                    var o = r[i]
                    , a = o.teamID;
                    void 0 === n.get(a) && n.set(a, []),
                    null === (e = n.get(a)) || void 0 === e || e.push(o)
                }
                for (var s = 0, l = Array.from(n.keys()).sort((function(e, t) {
                    return e < t ? -1 : 1
                }
                )); s < l.length; s++) {
                    var c = l[s]
                    , p = this.props.config.getTeam(c)
                    , u = n.get(c);
                    void 0 !== u && u.length > 0 && t.push(this.createButtonGroup(p, u))
                }
                var d = [];
                return 0 === t.length && (d.push(M.createElement("p", {
                    className: "mediapopovermsg"
                }, "No audio or video is available for this race.")),
                d.push(M.createElement("p", {
                    className: "mediapopovermsg"
                }, "Please check back here during future races to listen to audio commentary or watch live video."))),
                M.createElement(ut, {
                    title: "LIVE MEDIA",
                    maxWidth: "700px",
                    onClose: this.props.onClose
                }, M.createElement("div", {
                    className: "mediapopover"
                }, d, t))
            }
            ,
            t.prototype.refreshState = function() {
                this.setState({
                    audioChannels: this.props.mediaController.getAudioChannels(),
                    videoChannels: this.props.mediaController.getVideoChannels(),
                    playingChannelID: this.props.mediaController.getChannelIDPlaying()
                })
            }
            ,
            t.prototype.buttonPressed = function(e) {
                this.props.mediaController.getChannelIDPlaying() === e.channelID ? this.props.mediaController.stopCurrentChannel() : (this.props.mediaController.playChannel(e.channelID),
                e.isVideo() && this.props.onClose()),
                this.setState({
                    playingChannelID: this.props.mediaController.getChannelIDPlaying()
                })
            }
            ,
            t.prototype.createButtonGroup = function(e, t) {
                for (var n, i = [], r = 0, o = t; r < o.length; r++) {
                    var a = o[r]
                    , s = this.createMediaButton(this.state.playingChannelID, a.channel, a.displayText);
                    void 0 !== s && i.push(s)
                }
                return n = void 0 !== e ? this.createTeamIndicator(e) : M.createElement("div", {
                    className: "medialabel"
                }, M.createElement("img", {
                    className: "mediaVELogo",
                    src: ft
                })),
                M.createElement("div", {
                    className: "mediabuttongroup",
                    key: null == e ? void 0 : e.team_id
                }, n, i)
            }
            ,
            t.prototype.createMediaButton = function(e, t, n) {
                var i, r = this, o = t.channelID === e, a = t.isEnabled();
                if (t.isAudio())
                    i = Xe;
                else {
                    if (!t.isVideo())
                        return;
                    i = Je
                }
                return M.createElement(Z, {
                    svgSrc: i,
                    key: "" + t.channelID,
                    text: n,
                    enabled: a,
                    selected: o,
                    divClassName: "mediaButton",
                    textClassName: "mediaText",
                    onClick: function() {
                        a && (r.buttonPressed(t),
                        r.refreshState())
                    },
                    getStyle: function(e, t) {
                        return {
                            margin: "5px",
                            width: "40px",
                            height: "40px",
                            flexShrink: 0,
                            borderRadius: "25px",
                            filter: a ? "brightness(100%)" : "brightness(50%)",
                            border: a ? "1px solid  #FFFFFFFF" : "1px solid  #00000000",
                            background: o ? "#a9232a" : "#000000AA",
                            opacity: e ? .5 : 1
                        }
                    }
                })
            }
            ,
            t.prototype.createTeamIndicator = function(e) {
                var t, n = e.flag_id, i = e.abbr, r = e.color;
                n.length > 0 ? t = q(n, {
                    width: 256 / 150 * 20,
                    height: 20
                }) : t = X(r, 15);
                var o = {
                    width: 50,
                    height: 20,
                    marginLeft: 10
                }
                , a = M.createElement("div", {
                    style: o
                }, i);
                return M.createElement("div", {
                    className: "medialabel"
                }, t, a)
            }
            ,
            t
        }(M.Component)
        , mt = (n(87),
        function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }())
        , yt = function(e) {
            function t(t) {
                return e.call(this, t) || this
            }
            return mt(t, e),
            t.prototype.render = function() {
                var e, t = !1 === this.props.enabled, n = this.props.className + (t ? "" : " cursor-pointer active-opacity"), i = {
                    opacity: t ? .5 : 1,
                    background: null !== (e = this.props.backgroundColor) && void 0 !== e ? e : ""
                };
                return M.createElement("div", {
                    className: n,
                    style: i,
                    onClick: this.handleClick.bind(this)
                }, this.props.children)
            }
            ,
            t.prototype.handleClick = function(e) {
                e.stopPropagation(),
                this.props.onClick()
            }
            ,
            t
        }(M.Component)
        , bt = n.p + "1df9e3b2cd7c26e5d4be7c72eee416a2.svg"
        , wt = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , xt = function(e) {
            function t(t) {
                return e.call(this, t) || this
            }
            return wt(t, e),
            t.prototype.render = function() {
                var e = bt
                , t = _.isMobile ? "30px" : "50px"
                , n = {
                    color: "#F9141B",
                    fontSize: t
                }
                , i = {
                    fontSize: t
                };
                return O.a.createElement(ut, {
                    title: "Next race has started",
                    maxWidth: "700px",
                    onClose: this.props.onClose
                }, O.a.createElement(yt, {
                    className: "nextracebutton",
                    enabled: !0,
                    onClick: this.onNextRaceClicked.bind(this)
                }, O.a.createElement("img", {
                    className: "livebuttonImg",
                    src: e
                }), O.a.createElement("div", {
                    className: "nextracebuttonwatch",
                    style: i
                }, "WATCH"), O.a.createElement("div", {
                    className: "nextracebuttonlive",
                    style: n
                }, "NEXT RACE")))
            }
            ,
            t.prototype.onNextRaceClicked = function() {
                this.props.onNextRace()
            }
            ,
            t
        }(O.a.Component)
        , kt = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }()
        , Ct = function(e) {
            function t(t) {
                var n = e.call(this, t) || this;
                return n.state = {
                    canvas_width: 0,
                    canvas_height: 0,
                    videoUrl: n.getVideoURL(),
                    optionsMenuVisible: !1,
                    nextRacePopupVisible: !1,
                    mediaMenuVisible: !1
                },
                n.updateWindowDimensions = n.updateWindowDimensions.bind(n),
                n
            }
            return kt(t, e),
            t.prototype.componentDidMount = function() {
                this.updateWindowDimensions(),
                window.addEventListener("resize", this.updateWindowDimensions)
            }
            ,
            t.prototype.componentWillUnmount = function() {
                window.removeEventListener("resize", this.updateWindowDimensions)
            }
            ,
            t.prototype.updateWindowDimensions = function() {
                var e = this.props.renderCanvas.clientWidth
                , t = this.props.renderCanvas.clientHeight;
                this.setState({
                    canvas_width: e,
                    canvas_height: t
                }),
                this.props.canvasRenderer.onWindowSizeChanged(e, t)
            }
            ,
            t.prototype.refreshVideo = function() {
                this.setState({
                    videoUrl: this.getVideoURL()
                })
            }
            ,
            t.prototype.refreshLiveRaceWaitingState = function() {
                this.setState({
                    nextRacePopupVisible: this.props.playbackController.isAnotherLiveRaceWaiting()
                })
            }
            ,
            t.prototype.render = function() {
                var e = this.renderHUD();
                return M.createElement("div", null, i.b ? M.createElement(Ue, {
                    ref: this.props.engine.setDevOverlayRef.bind(this.props.engine),
                    canvasRenderer: this.props.canvasRenderer
                }) : void 0, e)
            }
            ,
            t.prototype.renderHUD = function() {
                return i.c ? M.createElement("div", null) : _.isMobileOnly ? this.getHUDMobile() : this.getHUDDeskop()
            }
            ,
            t.prototype.getHUDMobile = function() {
                var e = this
                , t = this.isPortrait()
                , n = {};
                n = t ? {
                    marginTop: "10px",
                    marginLeft: "10px",
                    marginRight: "10px",
                    width: "50px"
                } : {
                    marginTop: "30px",
                    marginLeft: "10px",
                    marginRight: "10px",
                    width: "50px"
                };
                var i = [Ve.LaunchPopup, Ve.RefocusCamera];
                return this.isMediaButtonVisible() && i.push(Ve.AudioVideo),
                M.createElement("div", {
                    className: "root"
                }, M.createElement("div", {
                    className: "racinghud"
                }, M.createElement("div", {
                    className: "leaderboardMenu"
                }, M.createElement("div", {
                    style: n
                }, M.createElement(tt, {
                    buttons: i,
                    onLaunchOptionsPopup: function() {
                        e.setState({
                            optionsMenuVisible: !0
                        })
                    },
                    onLaunchAudioVideoPopup: function() {
                        e.setState({
                            mediaMenuVisible: !0
                        })
                    },
                    engine: this.props.engine,
                    mediaController: this.props.mediaController,
                    canvasRenderer: this.props.canvasRenderer,
                    visible: !0,
                    ref: this.props.engine.setSideMenuRef.bind(this.props.engine)
                })), M.createElement(te, {
                    config: this.props.config,
                    canvasRenderer: this.props.canvasRenderer,
                    renderCanvas: this.props.renderCanvas,
                    playbackController: this.props.playbackController,
                    ref: this.props.engine.setLeaderboardRef.bind(this.props.engine),
                    onClick: this.props.engine.onBoatLabelClicked.bind(this.props.engine)
                })), M.createElement("div", {
                    className: "spacer"
                }), M.createElement("div", {
                    id: "bottomWrapper"
                }, M.createElement("div", {
                    className: "videoAndRoundingTimer"
                }, this.getVideo(), M.createElement("div", {
                    className: "spacer"
                })), M.createElement(we, {
                    compactView: !t,
                    dataMode: this.props.dataMode,
                    playbackController: this.props.playbackController,
                    ref: this.props.engine.setControlBarRef.bind(this.props.engine),
                    graphVisibleFn: this.props.engine.getGraphEnabled.bind(this.props.engine)
                }))), M.createElement(_e, {
                    visible: this.props.engine.getBoatLabelsEnabled(),
                    config: this.props.config,
                    canvasRenderer: this.props.canvasRenderer,
                    playbackController: this.props.playbackController,
                    ref: this.props.engine.setBoatLabelsRef.bind(this.props.engine),
                    onClick: this.props.engine.onBoatLabelClicked.bind(this.props.engine)
                }), M.createElement(Oe, {
                    visible: this.props.engine.getDTLOverlayEnabled(),
                    canvasRenderer: this.props.canvasRenderer,
                    ref: this.props.engine.setDTLOverlayRef.bind(this.props.engine)
                }), M.createElement(Ae, {
                    visible: this.props.engine.getWindOverlayEnabled(),
                    canvasRenderer: this.props.canvasRenderer,
                    ref: this.props.engine.setWindSpeedsRef.bind(this.props.engine)
                }), this.state.optionsMenuVisible ? M.createElement(ht, {
                    engine: this.props.engine,
                    canvasRenderer: this.props.canvasRenderer,
                    mediaController: this.props.mediaController,
                    onClose: function() {
                        e.setState({
                            optionsMenuVisible: !1
                        })
                    }
                }) : void 0, this.state.mediaMenuVisible ? M.createElement(vt, {
                    ref: this.props.engine.setAVPopupRef.bind(this.props.engine),
                    config: this.props.config,
                    engine: this.props.engine,
                    mediaController: this.props.mediaController,
                    onClose: function() {
                        e.setState({
                            mediaMenuVisible: !1
                        })
                    }
                }) : void 0, this.state.nextRacePopupVisible ? M.createElement(xt, {
                    onClose: function() {
                        e.setState({
                            nextRacePopupVisible: !1
                        })
                    },
                    onNextRace: function() {
                        e.setState({
                            nextRacePopupVisible: !1
                        }),
                        e.props.playbackController.playNextRace()
                    }
                }) : void 0)
            }
            ,
            t.prototype.getHUDDeskop = function() {
                var e = this
                , t = [Ve.Wind, Ve.AdvantageLine, Ve.BoatLabels, Ve.BoatTrails, Ve.Terrain, Ve.RefocusCamera];
                return this.isMediaButtonVisible() ? t.push(Ve.AudioVideo) : t.push(Ve.Graph),
                M.createElement("div", null, M.createElement("div", {
                    className: "racinghud"
                }, M.createElement(te, {
                    renderCanvas: this.props.renderCanvas,
                    config: this.props.config,
                    canvasRenderer: this.props.canvasRenderer,
                    playbackController: this.props.playbackController,
                    ref: this.props.engine.setLeaderboardRef.bind(this.props.engine),
                    onClick: this.props.engine.onBoatLabelClicked.bind(this.props.engine)
                }), M.createElement("div", {
                    className: "spacer"
                }), M.createElement("div", {
                    className: "videoAndRoundingTimer"
                }, this.getVideo(), M.createElement("div", {
                    className: "spacer"
                })), M.createElement(we, {
                    compactView: !1,
                    dataMode: this.props.dataMode,
                    playbackController: this.props.playbackController,
                    ref: this.props.engine.setControlBarRef.bind(this.props.engine),
                    graphVisibleFn: this.props.engine.getGraphEnabled.bind(this.props.engine)
                })), M.createElement("div", {
                    className: "sidemenu"
                }, M.createElement(tt, {
                    buttons: t,
                    engine: this.props.engine,
                    mediaController: this.props.mediaController,
                    canvasRenderer: this.props.canvasRenderer,
                    visible: !0,
                    ref: this.props.engine.setSideMenuRef.bind(this.props.engine),
                    onLaunchAudioVideoPopup: function() {
                        e.setState({
                            mediaMenuVisible: !0
                        })
                    }
                })), M.createElement(_e, {
                    visible: this.props.engine.getBoatLabelsEnabled(),
                    config: this.props.config,
                    canvasRenderer: this.props.canvasRenderer,
                    playbackController: this.props.playbackController,
                    ref: this.props.engine.setBoatLabelsRef.bind(this.props.engine),
                    onClick: this.props.engine.onBoatLabelClicked.bind(this.props.engine)
                }), M.createElement(Ae, {
                    visible: this.props.engine.getWindOverlayEnabled(),
                    canvasRenderer: this.props.canvasRenderer,
                    ref: this.props.engine.setWindSpeedsRef.bind(this.props.engine)
                }), M.createElement(Oe, {
                    visible: this.props.engine.getDTLOverlayEnabled(),
                    canvasRenderer: this.props.canvasRenderer,
                    ref: this.props.engine.setDTLOverlayRef.bind(this.props.engine)
                }), this.state.mediaMenuVisible ? M.createElement(vt, {
                    ref: this.props.engine.setAVPopupRef.bind(this.props.engine),
                    engine: this.props.engine,
                    config: this.props.config,
                    mediaController: this.props.mediaController,
                    onClose: function() {
                        e.setState({
                            mediaMenuVisible: !1
                        })
                    }
                }) : void 0, this.state.nextRacePopupVisible ? M.createElement(xt, {
                    onClose: function() {
                        e.setState({
                            nextRacePopupVisible: !1
                        })
                    },
                    onNextRace: function() {
                        e.setState({
                            nextRacePopupVisible: !1
                        }),
                        e.props.playbackController.playNextRace()
                    }
                }) : void 0)
            }
            ,
            t.prototype.isPortrait = function() {
                return this.props.renderCanvas.clientWidth < this.props.renderCanvas.clientHeight
            }
            ,
            t.prototype.getVideoURL = function() {
                if (this.props.mediaController.getMediaTypePlaying() === Pt.Video)
                    return this.props.mediaController.getMediaURLPlaying()
            }
            ,
            t.prototype.getVideo = function() {
                var e = this;
                if (void 0 !== this.state.videoUrl) {
                    var t = this.state.videoUrl
                    , n = this.state.canvas_height
                    , i = this.state.canvas_width
                    , r = n
                    , o = 0
                    , a = this.isPortrait();
                    if (_.isMobileOnly ? (r -= 88,
                    r -= 5,
                    a ? (r -= 76,
                    r -= 97) : r -= 65) : (r -= 185,
                    r -= 126,
                    r -= 15),
                    a) {
                        var s = .4 * r;
                        (l = 16 * s / 9) < (c = .7 * i) ? (r = s,
                        o = l) : r = 9 * (o = c) / 16
                    } else {
                        var l, c;
                        (l = 16 * r / 9) < (c = .3 * i) ? o = l : (o = c,
                        r = 9 * c / 16)
                    }
                    return M.createElement(lt, {
                        videoUrl: t,
                        height: r,
                        width: o,
                        onClose: function() {
                            e.props.mediaController.stopCurrentChannel()
                        }
                    })
                }
            }
            ,
            t.prototype.isMediaButtonVisible = function() {
                return !!i.k || this.props.dataMode === g.Live
            }
            ,
            t
        }(M.Component)
        , It = (n(89),
        n.p + "4a31a4b0971a4c7c53f258ddf518b8f7.svg")
        , St = (n(91),
        function(e) {
            var t = e.width
            , n = e.percent
            , i = M.useState(0)
            , r = i[0]
            , o = i[1];
            return M.useEffect((function() {
                o(n * t)
            }
            )),
            M.createElement("div", null, M.createElement("div", {
                className: "progress-div",
                style: {
                    width: t
                }
            }, M.createElement("div", {
                style: {
                    width: r + "px"
                },
                className: "progress"
            })))
        }
        )
        , Tt = (n(93),
        function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }())
        , Rt = function(e) {
            function t(t) {
                var n = e.call(this, t) || this
                , i = n.props.raceFiles.length
                , r = i > 0 ? n.props.raceFiles[i - 1].eventTitle : "";
                return n.state = {
                    selectedEvent: r
                },
                n.escFunction = n.escFunction.bind(n),
                n
            }
            return Tt(t, e),
            t.prototype.render = function() {
                for (var e = this, t = [], n = "", i = [], r = function(r) {
                    var a = r >= o.props.raceFiles.length - 1
                    , s = o.props.raceFiles[r]
                    , l = M.createElement(yt, {
                        className: "racePickerButton",
                        key: s.raceTitle,
                        onClick: function() {
                            e.props.onRaceSelected(s.eventTitle, s.raceTitle, s.raceFileURL)
                        }
                    }, " ", s.raceTitle)
                    , c = o.state.selectedEvent === s.eventTitle;
                    if (n !== s.eventTitle) {
                        if (n = s.eventTitle,
                        i.length > 0) {
                            var p = M.createElement("div", {
                                className: "racePickerButtonRow",
                                key: s.eventTitle + "-buttons"
                            }, i);
                            t.push(p),
                            i = []
                        }
                        var u = M.createElement(yt, {
                            key: s.eventTitle,
                            className: "racePickerHeaderRow",
                            backgroundColor: c ? "#2C3F46" : "transparent",
                            onClick: function() {
                                e.setSelected(s.eventTitle)
                            }
                        }, " ", s.eventTitle);
                        t.push(u)
                    }
                    if (c && i.push(l),
                    i.length > 0 && a) {
                        var d = M.createElement("div", {
                            className: "racePickerButtonRow",
                            key: s.eventTitle + "-buttons"
                        }, i);
                        t.push(d),
                        i = []
                    }
                }, o = this, a = 0; a < this.props.raceFiles.length; a += 1)
                    r(a);
                var s, l = {
                    fontSize: _.isMobile ? "40px" : "50px"
                }, c = {};
                return _.isMobile && (c = {
                    width: "90%",
                    maxHeight: "80%"
                }),
                0 == t.length && (s = M.createElement("div", {
                    className: "racePickerText"
                }, "No previous races to view at this time.", M.createElement("br", null), M.createElement("br", null), "Check back here later to watch replays of races you've missed.")),
                M.createElement("div", {
                    className: "racePickerBackground",
                    onClick: this.closeButtonPressed.bind(this)
                }, M.createElement("div", {
                    className: "racePicker",
                    style: c
                }, M.createElement("div", {
                    className: "racePickerTitle",
                    style: l
                }, this.props.title), s, t))
            }
            ,
            t.prototype.setSelected = function(e) {
                this.setState({
                    selectedEvent: e
                })
            }
            ,
            t.prototype.closeButtonPressed = function() {
                this.props.onClose()
            }
            ,
            t.prototype.escFunction = function(e) {
                27 === e.keyCode && this.props.onClose()
            }
            ,
            t.prototype.componentDidMount = function() {
                document.addEventListener("keydown", this.escFunction, !1)
            }
            ,
            t.prototype.componentWillUnmount = function() {
                document.removeEventListener("keydown", this.escFunction, !1)
            }
            ,
            t
        }(M.Component)
        , Et = (n(95),
        function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }())
        , Lt = function(e) {
            function t(t) {
                return e.call(this, t) || this
            }
            return Et(t, e),
            t.prototype.render = function() {
                var e = function() {
                    var e = Object(_.deviceDetect)();
                    return console.log(JSON.stringify(e)),
                    O.a.createElement("div", {
                        className: "deviceinfopopover"
                    }, O.a.createElement("div", {
                        className: "deviceinfotext"
                    }, _.browserName + " " + _.fullBrowserVersion, O.a.createElement("br", null), _.osName + " " + _.osVersion, O.a.createElement("br", null), _.isMobile ? _.mobileVendor + " " + _.mobileModel : "", O.a.createElement("br", null)), O.a.createElement("br", null), O.a.createElement("div", null, "For the best experience, please download one of our ", O.a.createElement("a", {
                        href: "https://browsehappy.com/",
                        target: "_blank"
                    }, "supported browsers")), O.a.createElement("br", null))
                }();
                return O.a.createElement(ut, {
                    title: this.props.title,
                    maxWidth: "700px",
                    onClose: this.props.onClose
                }, O.a.createElement("div", {
                    className: "deviceinfopopover"
                }, this.props.message), e)
            }
            ,
            t
        }(O.a.Component);
        var Pt, Ft = function() {
            var e = function(t, n) {
                return (e = Object.setPrototypeOf || {
                    __proto__: []
                }instanceof Array && function(e, t) {
                    e.__proto__ = t
                }
                || function(e, t) {
                    for (var n in t)
                        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
                }
                )(t, n)
            };
            return function(t, n) {
                function i() {
                    this.constructor = t
                }
                e(t, n),
                t.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype,
                new i)
            }
        }(), _t = function(e) {
            function t(t) {
                var n, i, r, o = e.call(this, t) || this;
                return o.state = {
                    playbackEnabled: null !== (n = o.props.playbackEnabled) && void 0 !== n && n,
                    liveStatus: null !== (i = o.props.liveStatus) && void 0 !== i ? i : f.NotConnected,
                    loadingbarPercent: 0,
                    isLoading: !0,
                    racePickerVisible: !1,
                    deviceWarningVisible: null !== (r = o.props.showBrowserWarning) && void 0 !== r && r
                },
                o
            }
            return Ft(t, e),
            t.prototype.render = function() {
                var e = this
                , t = this.state.isLoading ? O.a.createElement(St, {
                    width: 308,
                    percent: this.state.loadingbarPercent
                }) : void 0
                , n = this.state.isLoading ? void 0 : this.getButtonRow()
                , i = this.state.racePickerVisible ? O.a.createElement(Rt, {
                    title: "PREVIOUS EVENTS",
                    raceFiles: this.props.playbackController.getRaceFiles(),
                    onClose: function() {
                        e.setState({
                            racePickerVisible: !1
                        })
                    },
                    onRaceSelected: this.onRaceSelected.bind(this)
                }) : void 0
                , r = this.state.deviceWarningVisible ? O.a.createElement(Lt, {
                    title: "BROWSER UNSUPPORTED",
                    message: "WARNING : Your web browser is not supported by Virtual Eye.  You may experience bugs or performance problems.",
                    onClose: function() {
                        e.setState({
                            deviceWarningVisible: !1
                        }),
                        e.props.engine.setBrowserCheckPerfomred(!0)
                    }
                }) : void 0;
                return O.a.createElement("div", {
                    className: "menuscreen"
                }, O.a.createElement("div", {
                    className: "centreContainer"
                }, O.a.createElement("div", {
                    className: "logoLoadingCol"
                }, O.a.createElement("img", {
                    className: "veLogo",
                    src: ft
                }), t), n), i, r)
            }
            ,
            t.prototype.updateStatus = function(e) {
                this.setState({
                    liveStatus: e
                })
            }
            ,
            t.prototype.updatePlaybackEnabled = function(e) {
                this.setState({
                    playbackEnabled: e
                })
            }
            ,
            t.prototype.setLoading = function(e) {
                this.setState({
                    isLoading: e
                })
            }
            ,
            t.prototype.setLoadingProgress = function(e) {
                this.setState({
                    loadingbarPercent: e
                })
            }
            ,
            t.prototype.onLiveClick = function() {
                this.state.liveStatus === f.Live && this.props.engine.onPlayLiveClicked()
            }
            ,
            t.prototype.onRecordedClick = function() {
                this.setState({
                    racePickerVisible: !0
                })
            }
            ,
            t.prototype.onRaceSelected = function(e, t, n) {
                this.setState({
                    racePickerVisible: !1
                }),
                this.props.playbackController.playRecordedData(n, e, t)
            }
            ,
            t.prototype.getStatusText = function() {
                switch (this.state.liveStatus) {
                case f.NotConnected:
                    return "Connecting ....";
                case f.Connected:
                    return "Checking ....";
                case f.ConectionActive:
                    return "No live racing presently";
                case f.WarpboxActive:
                    return "Live racing will start shortly";
                case f.Live:
                    return "Live racing happening now"
                }
                return ""
            }
            ,
            t.prototype.getButtonRow = function() {
                var e = this.state.liveStatus === f.Live
                , t = this.state.playbackEnabled
                , n = this.getStatusText()
                , i = e ? bt : It
                , r = _.isMobile ? "35px" : "50px"
                , o = e ? {
                    color: "#F9141B",
                    fontSize: r
                } : {
                    fontSize: r
                }
                , a = {
                    fontSize: r
                };
                return O.a.createElement("div", {
                    className: "buttonRow"
                }, O.a.createElement(yt, {
                    className: "livebutton",
                    enabled: e,
                    onClick: this.onLiveClick.bind(this)
                }, O.a.createElement("div", {
                    className: "buttonTextCol"
                }, O.a.createElement("div", {
                    className: "buttonTextRow"
                }, O.a.createElement("img", {
                    className: "livebuttonImg",
                    src: i
                }), O.a.createElement("div", {
                    className: "buttonTitleMed",
                    style: a
                }, "WATCH"), O.a.createElement("div", {
                    className: "buttonTitleBold",
                    style: o
                }, "LIVE")), O.a.createElement("div", {
                    className: "liveButtonSubtitle"
                }, n))), O.a.createElement(yt, {
                    className: "playbackbutton",
                    enabled: t,
                    onClick: this.onRecordedClick.bind(this)
                }, O.a.createElement("div", {
                    className: "buttonTextCol"
                }, O.a.createElement("div", {
                    className: "buttonTitleMed",
                    style: a
                }, "WATCH PREVIOUS"), O.a.createElement("div", {
                    className: "buttonSubtitle"
                }, "select to load previous events and races"))))
            }
            ,
            t
        }(O.a.Component);
        function Mt(e, t, n) {
            D.render(M.createElement(_t, {
                liveStatus: e.getLiveStatus(),
                ref: e.setMenuScreenRef.bind(e),
                engine: e,
                showBrowserWarning: e.showBrowserWarning(),
                playbackController: t
            }), n)
        }
        !function(e) {
            e[e.None = 0] = "None",
            e[e.Audio = 1] = "Audio",
            e[e.Video = 2] = "Video"
        }(Pt || (Pt = {}));
        var Ot, Dt = function() {
            function e(e, t) {
                var n, r = this;
                this.loading = !0,
                this.browserCheckPerformed = !1,
                this.liveStatus = f.NotConnected,
                this.boatLabelsVisible = !0,
                this.DTLOverlayVisible = !0,
                this.graphEnabled = !1,
                this.windArrowsVisible = !0,
                this.config = t,
                this.playController = e;
                var o = null !== (n = document.getElementById("root")) && void 0 !== n ? n : void 0;
                if (void 0 === o)
                    throw new Error("No root element");
                this.root = o,
                this.showLoading(0),
                this.timerId = setInterval((function() {
                    return r.refreshTimers()
                }
                ), 250),
                i.e && (_.isMobile = !0,
                _.isMobileOnly = !0),
                i.d && (_.isMobile = !0,
                _.isTablet = !0)
            }
            return e.prototype.getWindowSize = function() {
                return void 0 === this.rootViewRef || null === this.rootViewRef ? {
                    width: 0,
                    height: 0
                } : {
                    width: this.rootViewRef.state.canvas_width,
                    height: this.rootViewRef.state.canvas_height
                }
            }
            ,
            e.prototype.refreshTimers = function() {
                var e, t;
                null === (e = this.controlBarRef) || void 0 === e || e.setRoundingVisible(this.playController.getRoundingTimerVisible()),
                null === (t = this.controlBarRef) || void 0 === t || t.refreshTimers()
            }
            ,
            e.prototype.refreshWindSpeedOverlay = function() {
                var e;
                null === (e = this.windSpeedsRef) || void 0 === e || e.refreshUI()
            }
            ,
            e.prototype.refreshBoatLabels = function() {
                var e;
                null === (e = this.boatLabelsRef) || void 0 === e || e.refreshUI()
            }
            ,
            e.prototype.refreshDTLOverlay = function() {
                var e;
                null === (e = this.DTLOverlay) || void 0 === e || e.refreshUI()
            }
            ,
            e.prototype.refreshRankings = function(e) {
                var t;
                null === (t = this.leaderBoardRef) || void 0 === t || t.refreshRankings(e)
            }
            ,
            e.prototype.refreshLiveRaceWaiting = function() {
                var e, t;
                null === (e = this.leaderBoardRef) || void 0 === e || e.refreshLiveRaceWaitingState(),
                null === (t = this.rootViewRef) || void 0 === t || t.refreshLiveRaceWaitingState()
            }
            ,
            e.prototype.refreshControlBar = function() {
                var e;
                null === (e = this.controlBarRef) || void 0 === e || e.refreshState()
            }
            ,
            e.prototype.refreshSideMenu = function() {
                var e;
                null === (e = this.sideMenuRef) || void 0 === e || e.refreshState()
            }
            ,
            e.prototype.refreshAVControls = function() {
                var e, t;
                null === (e = this.sideMenuRef) || void 0 === e || e.refreshState(),
                null === (t = this.mediaPopupRef) || void 0 === t || t.refreshState()
            }
            ,
            e.prototype.refreshVideo = function() {
                this.rootViewRef.refreshVideo()
            }
            ,
            e.prototype.setDevOverlayValues = function(e, t, n, i, r, o) {
                var a;
                null === (a = this.devOverlay) || void 0 === a || a.updateTimeValues(e, t, n, i, r, o)
            }
            ,
            e.prototype.updatePlaybackStatus = function(e) {
                var t;
                null === (t = this.menuScreen) || void 0 === t || t.updatePlaybackEnabled(e)
            }
            ,
            Object.defineProperty(e.prototype, "loadingStatus", {
                get: function() {
                    return this.loading
                },
                enumerable: !1,
                configurable: !0
            }),
            e.prototype.showRaceScene = function(e, t, n, i) {
                this.loading = !1,
                this.renderer = t,
                function(e, t, n, i, r, o, a, s) {
                    D.render(M.createElement(Ct, {
                        ref: e.setRootRef.bind(e),
                        config: i,
                        dataMode: s,
                        renderCanvas: n,
                        canvasRenderer: o,
                        playbackController: r,
                        mediaController: a,
                        engine: e
                    }), t)
                }(this, this.root, e, this.config, this.playController, t, n, i)
            }
            ,
            e.prototype.showLoading = function(e) {
                this.loading = !0,
                void 0 !== this.menuScreen && null !== this.menuScreen ? (this.menuScreen.setLoading(this.loading),
                this.menuScreen.setLoadingProgress(e)) : Mt(this, this.playController, this.root)
            }
            ,
            e.prototype.showMenu = function() {
                this.loading = !1,
                void 0 !== this.menuScreen && null !== this.menuScreen ? this.menuScreen.setLoading(this.loading) : Mt(this, this.playController, this.root)
            }
            ,
            e.prototype.updateStatus = function(e) {
                var t;
                this.liveStatus = e,
                null === (t = this.menuScreen) || void 0 === t || t.updateStatus(e)
            }
            ,
            e.prototype.onBoatLabelClicked = function(e) {
                var t, n;
                null === (t = this.renderer) || void 0 === t || t.setBoatFocus(e),
                null === (n = this.sideMenuRef) || void 0 === n || n.refreshState()
            }
            ,
            e.prototype.onPlayLiveClicked = function() {
                this.playController.playLive(),
                this.showLoading(0)
            }
            ,
            e.prototype.onPlayRecordedRaceClicked = function() {
                var e = this.playController.getRaceFiles();
                0 !== e.length ? this.playController.playRecordedData(e[0].raceFileURL, e[0].eventTitle, e[0].raceTitle) : console.log("No race data")
            }
            ,
            e.prototype.getBoatLabelsEnabled = function() {
                return this.boatLabelsVisible
            }
            ,
            e.prototype.setBoatLabelsEnabled = function(e) {
                var t;
                this.boatLabelsVisible = e,
                null === (t = this.boatLabelsRef) || void 0 === t || t.setVisible(e)
            }
            ,
            e.prototype.getDTLValue = function() {
                return -1
            }
            ,
            e.prototype.getDTLOverlayEnabled = function() {
                return this.DTLOverlayVisible
            }
            ,
            e.prototype.setDTLOverlayEnabled = function(e) {
                var t;
                this.DTLOverlayVisible = e,
                null === (t = this.DTLOverlay) || void 0 === t || t.setVisible(e)
            }
            ,
            e.prototype.setWindOverlayEnabled = function(e) {
                this.windArrowsVisible = e
            }
            ,
            e.prototype.getWindOverlayEnabled = function() {
                return this.windArrowsVisible
            }
            ,
            e.prototype.getGraphEnabled = function() {
                return this.graphEnabled
            }
            ,
            e.prototype.setGraphEnabled = function(e) {
                this.graphEnabled = e;
                var t = document.getElementById("content1")
                , n = document.getElementById("content0")
                , i = document.getElementById("content2");
                t && (t.style.display = e ? "block" : "none"),
                n && (n.style.display = e ? "block" : "none"),
                i && (i.style.display = e ? "block" : "none"),
                setTimeout((function() {
                    i.style.display = "none"
                }
                ), 5e3),
                this.refreshControlBar()
            }
            ,
            e.prototype.onBackButtonClicked = function() {
                this.playController.loadMenu()
            }
            ,
            e.prototype.getLiveStatus = function() {
                return this.liveStatus
            }
            ,
            e.prototype.setRootRef = function(e) {
                this.rootViewRef = e
            }
            ,
            e.prototype.setWindSpeedsRef = function(e) {
                this.windSpeedsRef = e
            }
            ,
            e.prototype.setBoatLabelsRef = function(e) {
                this.boatLabelsRef = e
            }
            ,
            e.prototype.setDTLOverlayRef = function(e) {
                this.DTLOverlay = e
            }
            ,
            e.prototype.setLeaderboardRef = function(e) {
                this.leaderBoardRef = e
            }
            ,
            e.prototype.setRoundingTimerRef = function(e) {
                this.roundingTimerRef = e
            }
            ,
            e.prototype.setControlBarRef = function(e) {
                this.controlBarRef = e
            }
            ,
            e.prototype.setSideMenuRef = function(e) {
                this.sideMenuRef = e
            }
            ,
            e.prototype.setAVPopupRef = function(e) {
                this.mediaPopupRef = e
            }
            ,
            e.prototype.setMenuScreenRef = function(e) {
                var t, n;
                this.menuScreen = e,
                null === (t = this.menuScreen) || void 0 === t || t.setLoading(this.loading),
                null === (n = this.menuScreen) || void 0 === n || n.updateStatus(this.liveStatus)
            }
            ,
            e.prototype.setDevOverlayRef = function(e) {
                this.devOverlay = e
            }
            ,
            e.prototype.showBrowserWarning = function() {
                return !this.browserCheckPerformed && !this.isBrowserSupported()
            }
            ,
            e.prototype.setBrowserCheckPerfomred = function(e) {
                this.browserCheckPerformed = e
            }
            ,
            e.prototype.isBrowserSupported = function() {
                return _.isChrome || _.isSafari || _.isFirefox || _.isEdgeChromium || _.isOpera
            }
            ,
            e
        }(), At = n(14), Bt = function(e, t, n) {
            this.heading = e,
            this.heel = t,
            this.pitch = n
        }, Nt = n(4), Vt = function() {
            function e(e) {
                this.current_leg = -1,
                this.distance_to_leader = -1,
                this.rank = -1,
                this.coordIntep = new At.b,
                this.headingIntep = new Nt.a,
                this.heelInterp = new Nt.a,
                this.pitchInterp = new Nt.a,
                this.dtlInterp = new Nt.b,
                this.speedInterp = new Nt.b,
                this.elevInterp = new Nt.b,
                this.penaltyCountInterp = new Nt.c(Yt,0),
                this.protestInterp = new Nt.c(qt,!1),
                this.statusInterp = new Nt.c,
                this.sowInterp = new Nt.c,
                this.vmgInterp = new Nt.c,
                this.twsInterp = new Nt.c,
                this.twdInterp = new Nt.c,
                this.legInterp = new Nt.c,
                this.legProgressInterp = new Nt.b,
                this.rankInterp = new Nt.c,
                this.leftFoilState = new Nt.b,
                this.rightFoilState = new Nt.b,
                this.leftFoilPosition = new Nt.b,
                this.rightFoilPosition = new Nt.b,
                this.ruddleAngle = new Nt.a,
                this.foilMoveTime = 2,
                this.boatId = e,
                this.teamId = Object(H.f)(e),
                void 0 !== i.i && this.boatId === i.i && this.setLogging(!0)
            }
            return e.prototype.getPosition = function(e) {
                return this.coordIntep.getCoordForTime(e)
            }
            ,
            e.prototype.updatePosition = function(e, t) {
                this.coordIntep.addCoord(e, t)
            }
            ,
            e.prototype.getElevation = function(e) {
                return this.elevInterp.valForTime(e)
            }
            ,
            e.prototype.updateElevation = function(e, t) {
                this.elevInterp.addVal(e, t)
            }
            ,
            e.prototype.getHeading = function(e) {
                return this.headingIntep.valForTime(e)
            }
            ,
            e.prototype.getPitch = function(e) {
                return this.pitchInterp.valForTime(e)
            }
            ,
            e.prototype.getHeel = function(e) {
                return this.heelInterp.valForTime(e)
            }
            ,
            e.prototype.getRotation = function(e) {
                var t = this.headingIntep.valForTime(e)
                , n = this.heelInterp.valForTime(e)
                , i = this.pitchInterp.valForTime(e);
                if (void 0 !== t && void 0 !== n && void 0 !== i)
                    return new Bt(t,n,i)
            }
            ,
            e.prototype.updateRotation = function(e, t, n, i) {
                this.headingIntep.addVal(e, i),
                this.heelInterp.addVal(t, i),
                this.pitchInterp.addVal(n, i)
            }
            ,
            e.prototype.getPenaltyCount = function(e) {
                return this.penaltyCountInterp.valForTime(e)
            }
            ,
            e.prototype.updatePenaltyCount = function(e, t) {
                this.penaltyCountInterp.addVal(e, t)
            }
            ,
            e.prototype.getProtest = function(e) {
                return this.protestInterp.valForTime(e)
            }
            ,
            e.prototype.updateProtest = function(e, t) {
                this.protestInterp.addVal(e, t)
            }
            ,
            e.prototype.getStatus = function(e) {
                return this.statusInterp.valForTime(e)
            }
            ,
            e.prototype.updateStatus = function(e, t) {
                this.statusInterp.addVal(e, t)
            }
            ,
            e.prototype.updateDTL = function(e, t) {
                this.dtlInterp.addVal(e, t)
            }
            ,
            e.prototype.getDTL = function(e) {
                var t = this.dtlInterp.valForTime(e);
                if (void 0 !== t)
                    return Math.max(t, 0)
            }
            ,
            e.prototype.updateCurrentLeg = function(e, t) {
                this.legInterp.addVal(e, t)
            }
            ,
            e.prototype.getCurrentLeg = function(e) {
                return this.legInterp.valForTime(e)
            }
            ,
            e.prototype.updateLegProgress = function(e, t) {
                this.legProgressInterp.addVal(e, t)
            }
            ,
            e.prototype.getLegProgress = function(e) {
                return this.legProgressInterp.valForTime(e)
            }
            ,
            e.prototype.updateRank = function(e, t) {
                this.rankInterp.addVal(e, t)
            }
            ,
            e.prototype.getRank = function(e) {
                return this.rankInterp.valForTime(e)
            }
            ,
            e.prototype.updateSpeed = function(e, t) {
                this.speedInterp.addVal(e, t)
            }
            ,
            e.prototype.setFoilCurves = function(e, t, n, i) {
                var r = e.getMaxTime();
                if (e.addVal(n, i),
                r > 0) {
                    var o = i - r
                    , a = t.valForTime(r);
                    void 0 === a && (a = n);
                    Object(F.a)(o / this.foilMoveTime, 0, 1);
                    var s = 1 === n ? o / this.foilMoveTime : -o / this.foilMoveTime
                    , l = Object(F.a)(a + s, 0, 1);
                    t.addVal(l, i)
                }
            }
            ,
            e.prototype.updatePortFoil = function(e, t) {
                this.leftFoilPosition.addVal(e, t)
            }
            ,
            e.prototype.updateStbdFoil = function(e, t) {
                this.rightFoilPosition.addVal(e, t)
            }
            ,
            e.prototype.updateFoilState = function(e, t) {
                switch (e) {
                case 0:
                    this.setFoilCurves(this.leftFoilState, this.leftFoilPosition, 0, t),
                    this.setFoilCurves(this.rightFoilState, this.rightFoilPosition, 0, t);
                    break;
                case 1:
                    this.setFoilCurves(this.leftFoilState, this.leftFoilPosition, 1, t),
                    this.setFoilCurves(this.rightFoilState, this.rightFoilPosition, 0, t);
                    break;
                case 2:
                    this.setFoilCurves(this.leftFoilState, this.leftFoilPosition, 0, t),
                    this.setFoilCurves(this.rightFoilState, this.rightFoilPosition, 1, t);
                    break;
                case 3:
                    this.setFoilCurves(this.leftFoilState, this.leftFoilPosition, 1, t),
                    this.setFoilCurves(this.rightFoilState, this.rightFoilPosition, 1, t);
                    break;
                default:
                    this.setFoilCurves(this.leftFoilState, this.leftFoilPosition, 1, t),
                    this.setFoilCurves(this.rightFoilState, this.rightFoilPosition, 1, t)
                }
            }
            ,
            e.prototype.getLeftFoilPosition = function(e) {
                var t = this.leftFoilPosition.valForTime(e);
                return void 0 !== t ? t : 55
            }
            ,
            e.prototype.getRightFoilPosition = function(e) {
                var t = this.rightFoilPosition.valForTime(e);
                return void 0 !== t ? t : 55
            }
            ,
            e.prototype.getLeftFoilState = function(e) {
                var t = this.leftFoilState.valForTime(e);
                return void 0 !== t ? t : 0
            }
            ,
            e.prototype.getRightFoilState = function(e) {
                var t = this.rightFoilState.valForTime(e);
                return void 0 !== t ? t : 0
            }
            ,
            e.prototype.updateRudderAngle = function(e, t) {
                this.ruddleAngle.addVal(e, t)
            }
            ,
            e.prototype.getSpeed = function(e) {
                return this.speedInterp.valForTime(e)
            }
            ,
            e.prototype.getSow = function(e) {
                return this.sowInterp.valForTime(e)
            }
            ,
            e.prototype.updateSow = function(e, t) {
                this.sowInterp.addVal(e, t)
            }
            ,
            e.prototype.getVmg = function(e) {
                return this.vmgInterp.valForTime(e)
            }
            ,
            e.prototype.updateVmg = function(e, t) {
                this.vmgInterp.addVal(e, t)
            }
            ,
            e.prototype.getTws = function(e) {
                return this.twsInterp.valForTime(e)
            }
            ,
            e.prototype.updateTws = function(e, t) {
                this.twsInterp.addVal(e, t)
            }
            ,
            e.prototype.getTwd = function(e) {
                return this.twdInterp.valForTime(e)
            }
            ,
            e.prototype.updateTwd = function(e, t) {
                this.twdInterp.addVal(e, t)
            }
            ,
            e.prototype.clearHistory = function() {
                this.coordIntep.clear(),
                this.headingIntep.clear(),
                this.heelInterp.clear(),
                this.pitchInterp.clear()
            }
            ,
            e.prototype.hasMinimumSamples = function() {
                return this.coordIntep.hasMinimumSamples() && this.headingIntep.hasMinimumSamples() && this.heelInterp.hasMinimumSamples() && this.pitchInterp.hasMinimumSamples()
            }
            ,
            e.prototype.setLogging = function(e) {
                this.coordIntep.setLogging(e, "BOAT coord " + this.boatId + ":")
            }
            ,
            e
        }(), Ut = function() {
            function e(e, t) {
                this.coordIntepolator = new At.b(1),
                this.headingInterp = new Nt.a,
                this.stateInterp = new Nt.c,
                this.markId = e,
                this.model = t
            }
            return e.prototype.getLegNumber = function() {
                return this.markId - 100 * Math.trunc(this.markId / 100)
            }
            ,
            e.prototype.updatePosition = function(e, t) {
                this.coordIntepolator.addCoord(e, t)
            }
            ,
            e.prototype.updateRotation = function(e, t) {
                this.headingInterp.addVal(e, t)
            }
            ,
            e.prototype.updateState = function(e, t) {
                this.stateInterp.addVal(e, t)
            }
            ,
            e.prototype.updateLegVisiblility = function(e, t) {
                this.firstLegVisible = e,
                this.lastLegVisible = t
            }
            ,
            e.prototype.getMarkID = function() {
                return this.markId
            }
            ,
            e.prototype.getMarkNumber = function() {
                return Object(H.c)(this.markId)
            }
            ,
            e.prototype.getPosition = function(e) {
                return this.coordIntepolator.getCoordForTime(e)
            }
            ,
            e.prototype.getHeading = function(e) {
                return this.headingInterp.valForTime(e)
            }
            ,
            e.prototype.getStates = function(e) {
                return this.stateInterp.valForTime(e)
            }
            ,
            e.prototype.hasMinimumSamples = function() {
                return this.coordIntepolator.hasMinimumSamples() && this.headingInterp.hasMinimumSamples()
            }
            ,
            e.prototype.isVisibleForLeg = function(e) {
                return void 0 !== this.firstLegVisible && void 0 !== this.lastLegVisible && (e >= this.firstLegVisible && e <= this.lastLegVisible)
            }
            ,
            e
        }(), jt = n(23), Wt = n.n(jt), Ht = function() {
            function e() {
                this.windHeading = new Nt.a(1),
                this.upwindLaylineAngle = new Nt.a(1),
                this.downwindLaylineAngle = new Nt.a(1),
                this.windSpeed = new Nt.b(1)
            }
            return e.prototype.updateHeading = function(e, t) {
                this.windHeading.addVal(e, t)
            }
            ,
            e.prototype.updateWindSpeed = function(e, t) {
                this.windSpeed.addVal(e, t)
            }
            ,
            e.prototype.getWindSpeed = function(e) {
                if (void 0 !== this.windSpeed)
                    return this.windSpeed.valForTime(e)
            }
            ,
            e.prototype.updateUpwindAngle = function(e, t) {
                this.upwindLaylineAngle.addVal(e, t)
            }
            ,
            e.prototype.updateDownwindAngle = function(e, t) {
                this.downwindLaylineAngle.addVal(e, t)
            }
            ,
            e.prototype.getHeading = function(e) {
                if (void 0 !== this.windHeading)
                    return this.windHeading.valForTime(e)
            }
            ,
            e.prototype.getUpwindAngle = function(e) {
                if (void 0 !== this.upwindLaylineAngle)
                    return this.upwindLaylineAngle.valForTime(e)
            }
            ,
            e.prototype.getDownwindAngle = function(e) {
                if (void 0 !== this.downwindLaylineAngle)
                    return this.downwindLaylineAngle.valForTime(e)
            }
            ,
            e
        }(), zt = function() {
            function e(e) {
                this.boundaryPackets = new Nt.c,
                this.raceId = e
            }
            return e.prototype.updateBoundary = function(e) {
                this.boundaryPackets.addVal(e, e.time)
            }
            ,
            e.prototype.getBoundary = function(e) {
                return this.boundaryPackets.valForTime(e)
            }
            ,
            e
        }(), Gt = function() {
            function e(e, t) {
                this.coordIntepolator = new At.b,
                this.headingInterp = new Nt.a,
                this.windSpeed = new Nt.b,
                this.isOn = new Nt.c,
                this.Id = e,
                this.model = t
            }
            return e.prototype.updatePosition = function(e, t) {
                this.coordIntepolator.addCoord(e, t)
            }
            ,
            e.prototype.updateRotation = function(e, t) {
                this.headingInterp.addVal(e, t)
            }
            ,
            e.prototype.updateWindSpeed = function(e, t) {
                this.windSpeed.addVal(e, t)
            }
            ,
            e.prototype.getWindSpeed = function(e) {
                return this.windSpeed.valForTime(e)
            }
            ,
            e.prototype.updateIsOn = function(e, t) {
                this.isOn.addVal(e, t)
            }
            ,
            e.prototype.updateLegVisiblility = function(e, t) {
                this.firstLegVisible = e,
                this.lastLegVisible = t
            }
            ,
            e.prototype.getID = function() {
                return this.Id
            }
            ,
            e.prototype.getMarkNumber = function() {
                return Object(H.c)(this.Id)
            }
            ,
            e.prototype.getPosition = function(e) {
                return this.coordIntepolator.getCoordForTime(e)
            }
            ,
            e.prototype.getHeading = function(e) {
                return this.headingInterp.valForTime(e)
            }
            ,
            e.prototype.getIsOn = function(e) {
                return this.isOn.valForTime(e)
            }
            ,
            e.prototype.hasMinimumSamples = function() {
                return this.coordIntepolator.hasMinimumSamples() && this.headingInterp.hasMinimumSamples()
            }
            ,
            e.prototype.isVisibleForLeg = function(e) {
                return void 0 !== this.firstLegVisible && void 0 !== this.lastLegVisible && (e >= this.firstLegVisible && e <= this.lastLegVisible)
            }
            ,
            e
        }();
        !function(e) {
            e[e.RankByDTL = 0] = "RankByDTL",
            e[e.RankByRoundingTime = 1] = "RankByRoundingTime"
        }(Ot || (Ot = {}));
        var Kt, Yt = 10, qt = 10, Xt = function() {
            function e(e) {
                var t = this;
                this.rankings = [],
                this.boundaryCenterSet = !1,
                this.currentLeg = 0,
                this.roundingTimesByMarkId = new Map,
                this.firstRoundingTimesByMarkId = new Map,
                this.buoys = new Map,
                this.boats = new Map,
                this.raceStatusInterp = new Nt.c,
                this.windPoints = new Map,
                this.raceId = e,
                this.courseBoundary = new zt(e),
                this.packetCaster = new o.i,
                this.packetCaster.processBoat = function(e) {
                    t.addBoatPacket(e)
                }
                ,
                this.packetCaster.processBoatStats = function(e) {
                    t.addBoatStatsPacket(e)
                }
                ,
                this.packetCaster.processBuoy = function(e) {
                    t.addBuoyPacket(e)
                }
                ,
                this.packetCaster.processCourseInfo = function(e) {
                    t.addCourseInfoPacket(e)
                }
                ,
                this.packetCaster.processBoundary = function(e) {
                    t.addBoundaryPacket(e)
                }
                ,
                this.packetCaster.processRoundingTime = function(e) {
                    t.addRoundingTimePacket(e)
                }
                ,
                this.packetCaster.processWind = function(e) {
                    t.addWindPacket(e)
                }
                ,
                this.packetCaster.processWindpoint = function(e) {
                    t.addWindPointPacket(e)
                }
                ,
                this.packetCaster.processPenalty = function(e) {
                    t.addPenaltyPacket(e)
                }
            }
            return e.prototype.updateSim = function(e) {
                var t = this.simTime + e;
                this.simTime = Math.min(Math.max(this.minRaceTime, t), this.maxRaceTime),
                this.refreshSimState()
            }
            ,
            e.prototype.refreshSimState = function() {
                this.calculateRaceDistances(this.simTime),
                this.calculateRankings()
            }
            ,
            e.prototype.calculateAdvantageLine = function() {}
            ,
            e.prototype.setLegProgress = function(e) {
                var t = Math.floor(e)
                , n = Math.ceil(e)
                , i = e - t
                , r = this.getEarliestRoundingTimeForLeg(t)
                , o = this.getEarliestRoundingTimeForLeg(n);
                void 0 !== r && void 0 !== o && (this.simTime = r + i * (o - r))
            }
            ,
            e.prototype.getLegProgress = function() {
                var e = this.getEarliestRoundingTimeForLeg(this.currentLeg)
                , t = this.getEarliestRoundingTimeForLeg(this.currentLeg + 1);
                if (void 0 === e || void 0 === t) {
                    var n = this.getLeadingBoat();
                    if (void 0 === n)
                        return;
                    return n.getLegProgress(this.simTime)
                }
                return this.currentLeg + (this.simTime - e) / (t - e)
            }
            ,
            e.prototype.getLegProgressAtTime = function(e) {
                var t = this.getLeadingBoatAtTime(e)
                , n = null == t ? void 0 : t.getCurrentLeg(e);
                if (void 0 !== n && void 0 !== t) {
                    var i = this.getEarliestRoundingTimeForLeg(n)
                    , r = this.getEarliestRoundingTimeForLeg(n + 1);
                    return void 0 === i || void 0 === r ? t.getLegProgress(e) : n + (e - i) / (r - i)
                }
            }
            ,
            e.prototype.getLeadingBoatAtTime = function(e) {
                for (var t, n = Number.MAX_SAFE_INTEGER, i = 0, r = this.getBoatData(); i < r.length; i++) {
                    var o = r[i]
                    , a = o.getRank(e);
                    void 0 !== a && (a < n && (t = o,
                    n = a))
                }
                return t
            }
            ,
            e.prototype.getBoatData = function() {
                return Array.from(this.boats.values())
            }
            ,
            e.prototype.getBuoyData = function() {
                return Array.from(this.buoys.values())
            }
            ,
            e.prototype.getWindData = function() {
                return this.windData
            }
            ,
            e.prototype.getWindPointData = function() {
                return Array.from(this.windPoints.values())
            }
            ,
            e.prototype.getBoundary = function() {
                return this.courseBoundary
            }
            ,
            e.prototype.getLegPoints = function() {
                return this.legPoints
            }
            ,
            e.prototype.getBuoyDataForMarkId = function(e) {
                return this.buoys.get(e)
            }
            ,
            e.prototype.getNumLegs = function() {
                var e, t;
                return null !== (t = null === (e = this.courseInfo) || void 0 === e ? void 0 : e.numLegs) && void 0 !== t ? t : 0
            }
            ,
            e.prototype.getPortEntryTeamID = function() {
                for (var e = 0, t = Array.from(this.boats.keys()); e < t.length; e++) {
                    var n = t[e];
                    if (!Object(H.a)(n))
                        return Object(H.f)(n)
                }
            }
            ,
            e.prototype.getStarboardTeamID = function() {
                for (var e = 0, t = Array.from(this.boats.keys()); e < t.length; e++) {
                    var n = t[e];
                    if (Object(H.a)(n))
                        return Object(H.f)(n)
                }
            }
            ,
            e.prototype.hasMinimumData = function() {
                if (void 0 === this.courseInfo)
                    return !1;
                if (void 0 === this.minRaceTime || void 0 === this.maxRaceTime)
                    return !1;
                if (this.minRaceTime > this.maxRaceTime)
                    return !1;
                this.buoys.forEach((function(e) {
                    if (!e.hasMinimumSamples())
                        return !1
                }
                ));
                var e = !1;
                return this.boats.forEach((function(t) {
                    if (e = !0,
                    !t.hasMinimumSamples())
                        return !1
                }
                )),
                e
            }
            ,
            e.prototype.setSimTime = function(e) {
                this.simTime = e
            }
            ,
            e.prototype.getEarliestRoundingTimeForLeg = function(e) {
                if (0 === e)
                    return this.minRaceTime;
                if (void 0 !== this.courseInfo) {
                    if (e > this.courseInfo.numLegs + 1)
                        return this.maxRaceTime;
                    var t = this.firstRoundingTimesByMarkId.get(e - 1);
                    return void 0 === t && 1 === e ? this.raceStartTime : t
                }
            }
            ,
            e.prototype.getElapsedSecsForLeg = function(e) {
                var t = this.getEarliestRoundingTimeForLeg(e);
                if (void 0 !== this.simTime && void 0 !== t) {
                    var n = this.simTime - t;
                    if (!(n < 0))
                        return n
                }
            }
            ,
            e.prototype.getRankingMethod = function() {
                for (var e = !0, t = 0, n = this.getBoatData(); t < n.length; t++) {
                    if (n[t].current_leg < this.currentLeg) {
                        e = !1;
                        break
                    }
                }
                if (e)
                    return Ot.RankByDTL;
                var i = this.getElapsedSecsForLeg(this.currentLeg);
                return void 0 === i || i > 300 ? Ot.RankByDTL : Ot.RankByRoundingTime
            }
            ,
            e.prototype.getRaceStatus = function() {
                return this.raceStatusInterp.valForTime(this.simTime)
            }
            ,
            e.prototype.getLeadingBoat = function() {
                if (this.rankings.length > 0) {
                    var e = this.rankings[0].boat_id;
                    return this.boats.get(e)
                }
            }
            ,
            e.prototype.getBoat = function(e) {
                return this.boats.get(e)
            }
            ,
            e.prototype.hasTeam = function(e) {
                for (var t = 0, n = this.getBoatData(); t < n.length; t++) {
                    if (n[t].teamId === e)
                        return !0
                }
                return !1
            }
            ,
            e.prototype.addPacket = function(e) {
                if (Object(o.o)(e) && e.raceId !== this.raceId)
                    throw Error("Wrong race scene");
                Object(o.p)(e) && (e instanceof o.d && ((void 0 === this.minRaceTime || e.time + 4 < this.minRaceTime) && (this.minRaceTime = e.time + 4),
                (void 0 === this.maxRaceTime || e.time - 4 > this.maxRaceTime) && (this.maxRaceTime = e.time - 4)),
                this.lastPacketTime = e.time),
                this.packetCaster.processPacket(e)
            }
            ,
            e.prototype.addBoatPacket = function(e) {
                var t = this.boats.get(e.boatId);
                void 0 === t && (t = new Vt(e.boatId),
                this.boats.set(e.boatId, t),
                void 0 === t.getPenaltyCount(e.time) && t.updatePenaltyCount(0, e.time),
                void 0 === t.getProtest(e.time) && t.updateProtest(!1, e.time));
                var n = At.a.fromPacket(e);
                t.updatePosition(n, e.time),
                t.updateElevation(e.elevation, e.time),
                t.updateRotation(e.heading, e.heel, e.pitch, e.time),
                t.updateStatus(e.status, e.time),
                t.updateDTL(e.dtl, e.time);
                var i = 1.94384 * e.speed;
                if (t.updateSpeed(i, e.time),
                void 0 !== e.rank && t.updateRank(e.rank, e.time),
                void 0 !== e.currentLeg) {
                    t.updateCurrentLeg(e.currentLeg, e.time);
                    var r = new Jt(e.time,this.getLegPointsForTime.bind(this)).get(e.currentLeg);
                    if (void 0 !== r) {
                        var o = At.a.calcTPointOnLine(r.start, r.end, n)
                        , a = e.currentLeg + o;
                        t.updateLegProgress(a, e.time)
                    } else
                        t.updateLegProgress(e.currentLeg, e.time)
                }
                e.foilState,
                void 0 !== e.rudderAngle && t.updateRudderAngle(e.rudderAngle, e.time)
            }
            ,
            e.prototype.addBoatStatsPacket = function(e) {
                var t = e.time
                , n = this.boats.get(e.boatId);
                void 0 === n && (n = new Vt(e.boatId),
                this.boats.set(e.boatId, n),
                void 0 === n.getPenaltyCount(e.time) && n.updatePenaltyCount(0, t),
                void 0 === n.getProtest(e.time) && n.updateProtest(!1, t)),
                void 0 !== e.sow && n.updateSow(e.sow, t),
                void 0 !== e.vmg && n.updateVmg(e.vmg, t),
                void 0 !== e.tws && n.updateTws(e.tws, t),
                void 0 !== e.twd && n.updateTwd(e.twd, t),
                void 0 !== e.portFoilAngle && n.updatePortFoil(e.portFoilAngle, t),
                void 0 !== e.stbdFoilAngle && n.updateStbdFoil(e.stbdFoilAngle, t)
            }
            ,
            e.prototype.addWindPointPacket = function(e) {
                var t = At.a.fromPacket(e)
                , n = this.windPoints.get(e.id);
                void 0 === n && (n = new Gt(e.id,0),
                this.windPoints.set(e.id, n)),
                n.updatePosition(t, e.time),
                n.updateRotation(e.twd, e.time),
                n.updateWindSpeed(e.tws, e.time),
                n.updateIsOn(e.isOn, e.time)
            }
            ,
            e.prototype.addBuoyPacket = function(e) {
                var t = At.a.fromPacket(e)
                , n = this.buoys.get(e.markId);
                void 0 === n && (n = new Ut(e.markId,e.model),
                this.buoys.set(e.markId, n)),
                n.updatePosition(t, e.time),
                n.updateRotation(e.heading, e.time),
                n.updateState(e.states, e.time),
                n.updateLegVisiblility(e.firstLegBouyVisible, e.lastLegBouyVisisble)
            }
            ,
            e.prototype.addCourseInfoPacket = function(e) {
                if (e.raceId !== this.raceId)
                    throw Error("Wrong race scene");
                var t = new Date(1e3 * e.startTime);
                this.raceStartTime = 3600 * t.getUTCHours() + 60 * t.getUTCMinutes() + t.getUTCSeconds(),
                this.courseInfo = e,
                this.raceStatusInterp.addVal(e.raceStatus, this.lastPacketTime)
            }
            ,
            e.prototype.addBoundaryPacket = function(e) {
                if (this.raceId !== e.raceId)
                    throw Error("Wrong race scene");
                var t = e.getCenterPoint()
                , n = (new Wt.a).convertLatLngToUtm(t[0], t[1], 16)
                , i = new At.a(n.Easting,n.Northing);
                void 0 !== this.sceneCenterUTM && this.boundaryCenterSet || (this.boundaryCenterSet = !0,
                this.sceneCenterUTM = i,
                console.log("BoundarySceneCenterCoords: " + t[0] + ", " + t[1]),
                console.log("sceneCenter " + this.sceneCenterUTM)),
                this.courseBoundary.updateBoundary(e)
            }
            ,
            e.prototype.addRoundingTimePacket = function(e) {
                var t = this.roundingTimesByMarkId.get(e.markNumber);
                void 0 === t && (t = new Map,
                this.roundingTimesByMarkId.set(e.markNumber, t)),
                0 === e.time ? t.has(e.boatId) && t.delete(e.boatId) : t.set(e.boatId, e);
                for (var n = -1, i = 0, r = Array.from(t.values()); i < r.length; i++) {
                    var o = r[i];
                    (n < 0 || o.time < n) && (n = o.time)
                }
                this.firstRoundingTimesByMarkId.set(e.markNumber, n)
            }
            ,
            e.prototype.addWindPacket = function(e) {
                void 0 === this.windData && (this.windData = new Ht),
                this.windData.updateHeading(e.heading, e.time),
                this.windData.updateUpwindAngle(e.upwind_layline_angle, e.time),
                this.windData.updateDownwindAngle(e.downwind_layline_angle, e.time),
                this.windData.updateWindSpeed(e.speed, e.time)
            }
            ,
            e.prototype.addPenaltyPacket = function(e) {
                console.log("PENALTY : time " + e.time + " " + e.boatId + " count is " + e.numPenalties);
                var t = this.boats.get(e.boatId);
                void 0 === t && (t = new Vt(e.boatId),
                this.boats.set(e.boatId, t)),
                null == t || t.updatePenaltyCount(e.numPenalties, e.time),
                null == t || t.updateProtest(e.protest, e.time)
            }
            ,
            e.prototype.calculateRaceDistances = function(e) {
                var t;
                this.legPoints = new Jt(e,this.getLegPointsForTime.bind(this)),
                this.currentLeg = 0;
                for (var n = 0, i = this.getBoatData(); n < i.length; n++) {
                    var r = i[n];
                    r.distance_to_leader = null !== (t = r.getDTL(e)) && void 0 !== t ? t : 0;
                    var o = r.getCurrentLeg(e)
                    , a = r.getPosition(e);
                    if (void 0 !== o)
                        r.current_leg = o;
                    else {
                        if (void 0 === a)
                            continue;
                        if (r.current_leg = this.getLegForBoatAtTime(r.boatId, e),
                        0 === r.current_leg)
                            continue
                    }
                    var s = this.legPoints.get(r.current_leg);
                    void 0 !== a && void 0 !== s && (r.leg_t_dist = At.a.calcTPointOnLine(s.start, s.end, a)),
                    this.currentLeg < r.current_leg && (this.currentLeg = r.current_leg)
                }
            }
            ,
            e.prototype.getLegPointsForTime = function(e, t) {
                var n = this.getMarksForLeg(e).map((function(e) {
                    return e.getPosition(t)
                }
                )).filter((function(e) {
                    return void 0 !== e
                }
                ))
                , i = this.getMarksForLeg(e + 1).map((function(e) {
                    return e.getPosition(t)
                }
                )).filter((function(e) {
                    return void 0 !== e
                }
                ))
                , r = At.a.midPoint(n)
                , o = At.a.midPoint(i);
                if (void 0 !== r && void 0 !== o)
                    return {
                        start: r,
                        end: o
                    }
            }
            ,
            e.prototype.getMarksForLeg = function(e) {
                for (var t = [], n = 0, i = Array.from(this.buoys.values()); n < i.length; n++) {
                    var r = i[n];
                    r.getMarkNumber() === e - 1 && t.push(r)
                }
                return t
            }
            ,
            e.prototype.getLegForBoatAtTime = function(e, t) {
                for (var n = 0, i = 0, r = Array.from(this.roundingTimesByMarkId.values()); i < r.length; i++) {
                    var o = r[i].get(e);
                    void 0 !== o && (o.time < t && (n = Math.max(n, o.markNumber + 1)))
                }
                return n
            }
            ,
            e.prototype.calculateRankings = function() {
                for (var e, t, n, i, r, o, a = this, s = [], l = 0, c = this.getBoatData(); l < c.length; l++) {
                    var p = c[l]
                    , u = 0
                    , d = null !== (e = p.getPenaltyCount(this.simTime)) && void 0 !== e ? e : 0
                    , h = null !== (t = p.getProtest(this.simTime)) && void 0 !== t && t
                    , f = null !== (n = p.getStatus(this.simTime)) && void 0 !== n ? n : 0
                    , g = null !== (i = p.getSpeed(this.simTime)) && void 0 !== i ? i : 0
                    , v = this.getRoundingTime(this.currentLeg, p.boatId);
                    if (void 0 === v || v > this.simTime)
                        u = null !== (r = this.getElapsedSecsForLeg(this.currentLeg)) && void 0 !== r ? r : 0;
                    else {
                        var m = this.getEarliestRoundingTimeForLeg(this.currentLeg);
                        void 0 !== m && (u = v - m)
                    }
                    p.rank = null !== (o = p.getRank(this.simTime)) && void 0 !== o ? o : 0,
                    s.push({
                        rank: p.rank,
                        boat_id: p.boatId,
                        leg: p.current_leg,
                        dtl: p.distance_to_leader,
                        secsToLeader: u,
                        penaltyCount: d,
                        protestActive: h,
                        status: f,
                        speed: g
                    })
                }
                this.rankings = s.sort((function(e, t) {
                    if (e.rank > 0 && t.rank > 0 && e.rank !== t.rank)
                        return t.rank < e.rank ? 1 : -1;
                    if (e.leg !== t.leg)
                        return e.leg < t.leg ? 1 : -1;
                    if (e.leg >= 0 && t.leg >= 0) {
                        if (a.getRankingMethod() === Ot.RankByRoundingTime)
                            return e.secsToLeader < t.secsToLeader ? -1 : 1;
                        if (e.dtl < t.dtl)
                            return -1;
                        if (e.dtl > t.dtl)
                            return 1
                    }
                    var n = Object(H.f)(e.boat_id)
                    , i = Object(H.f)(t.boat_id);
                    return n > i ? 1 : n < i ? -1 : 0
                }
                ));
                for (var y = 0; y < this.rankings.length; y += 1) {
                    var b = this.rankings[y];
                    0 === b.rank && b.leg > 0 && (b.rank = y + 1)
                }
            }
            ,
            e.prototype.getRoundingTime = function(e, t) {
                var n, i, r = null === (n = this.roundingTimesByMarkId.get(e - 1)) || void 0 === n ? void 0 : n.get(t);
                return null !== (i = null == r ? void 0 : r.time) && void 0 !== i ? i : void 0
            }
            ,
            e
        }(), Jt = function() {
            function e(e, t) {
                this.map = new Map,
                this.time = e,
                this.getLegPointsForTime = t
            }
            return e.prototype.get = function(e) {
                var t;
                return this.map.has(e) ? t = this.map.get(e) : void 0 !== (t = this.getLegPointsForTime(e, this.time)) && this.map.set(e, t),
                t
            }
            ,
            e.prototype.set = function(e, t) {
                this.map.set(e, t)
            }
            ,
            e
        }(), Qt = (n(97),
        n(35)), Zt = function() {
            return (Zt = Object.assign || function(e) {
                for (var t, n = 1, i = arguments.length; n < i; n++)
                    for (var r in t = arguments[n])
                        Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
                return e
            }
            ).apply(this, arguments)
        }, $t = function(e, t, n, i) {
            return new (n || (n = Promise))((function(r, o) {
                function a(e) {
                    try {
                        l(i.next(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function s(e) {
                    try {
                        l(i.throw(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function l(e) {
                    var t;
                    e.done ? r(e.value) : (t = e.value,
                    t instanceof n ? t : new n((function(e) {
                        e(t)
                    }
                    ))).then(a, s)
                }
                l((i = i.apply(e, t || [])).next())
            }
            ))
        }, en = function(e, t) {
            var n, i, r, o, a = {
                label: 0,
                sent: function() {
                    if (1 & r[0])
                        throw r[1];
                    return r[1]
                },
                trys: [],
                ops: []
            };
            return o = {
                next: s(0),
                throw: s(1),
                return: s(2)
            },
            "function" == typeof Symbol && (o[Symbol.iterator] = function() {
                return this
            }
            ),
            o;
            function s(o) {
                return function(s) {
                    return function(o) {
                        if (n)
                            throw new TypeError("Generator is already executing.");
                        for (; a; )
                            try {
                                if (n = 1,
                                i && (r = 2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i),
                                0) : i.next) && !(r = r.call(i, o[1])).done)
                                    return r;
                                switch (i = 0,
                                r && (o = [2 & o[0], r.value]),
                                o[0]) {
                                case 0:
                                case 1:
                                    r = o;
                                    break;
                                case 4:
                                    return a.label++,
                                    {
                                        value: o[1],
                                        done: !1
                                    };
                                case 5:
                                    a.label++,
                                    i = o[1],
                                    o = [0];
                                    continue;
                                case 7:
                                    o = a.ops.pop(),
                                    a.trys.pop();
                                    continue;
                                default:
                                    if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                        a = 0;
                                        continue
                                    }
                                    if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                        a.label = o[1];
                                        break
                                    }
                                    if (6 === o[0] && a.label < r[1]) {
                                        a.label = r[1],
                                        r = o;
                                        break
                                    }
                                    if (r && a.label < r[2]) {
                                        a.label = r[2],
                                        a.ops.push(o);
                                        break
                                    }
                                    r[2] && a.ops.pop(),
                                    a.trys.pop();
                                    continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e],
                                i = 0
                            } finally {
                                n = r = 0
                            }
                        if (5 & o[0])
                            throw o[1];
                        return {
                            value: o[0] ? o[1] : void 0,
                            done: !0
                        }
                    }([o, s])
                }
            }
        }, tn = function() {
            function e(e, t, n, i) {
                this.data = e,
                this.boatData = t,
                this.raceScene = n,
                this.teams = i,
                this.unit = "kn"
            }
            return e.prototype.initGraph = function() {
                var e, t;
                return $t(this, void 0, void 0, (function() {
                    function n() {
                        return {
                            width: window.innerWidth + 15,
                            height: .25 * window.innerHeight
                        }
                    }
                    function i() {
                        var e, t;
                        return $t(this, void 0, void 0, (function() {
                            var n, i, r, l, c, p, u, d = this;
                            return en(this, (function(g) {
                                switch (g.label) {
                                case 0:
                                    return n = document.getElementById("dropd").value,
                                    [4, a[1][n].valHistory.map((function(e) {
                                        return (e[1] - o) / 60
                                    }
                                    ))];
                                case 1:
                                    return i = g.sent(),
                                    [4, a[1][n].valHistory.map((function(e) {
                                        return e[0]
                                    }
                                    ))];
                                case 2:
                                    return r = g.sent(),
                                    [4, s[1][n].valHistory.map((function(e) {
                                        return e[0]
                                    }
                                    ))];
                                case 3:
                                    switch (l = g.sent(),
                                    c = [i, r, l],
                                    n) {
                                    case "headingIntep":
                                    case "rightFoilPosition":
                                    case "leftFoilPosition":
                                    case "heelInterp":
                                    case "pitchInterp":
                                    case "twdInterp":
                                        this.unit = "deg";
                                        break;
                                    case "twsInterp":
                                    case "vmgInterp":
                                    case "speedInterp":
                                        this.unit = "kn"
                                    }
                                    return p = {
                                        label: null === (e = h.getTeam(a[1].teamId)) || void 0 === e ? void 0 : e.abbr,
                                        stroke: f.getTeamColour(a[0]),
                                        fill: f.getTeamColour(a[0]) + "33",
                                        value: function(e, t) {
                                            return t.toFixed(2) + d.unit
                                        }
                                    },
                                    u = {
                                        label: null === (t = h.getTeam(s[1].teamId)) || void 0 === t ? void 0 : t.abbr,
                                        stroke: f.getTeamColour(s[0]),
                                        fill: f.getTeamColour(s[0]) + "33",
                                        value: function(e, t) {
                                            return t.toFixed(2) + d.unit
                                        }
                                    },
                                    m.setData(c, !1),
                                    m.delSeries(2),
                                    m.delSeries(1),
                                    m.addSeries(p, 1),
                                    m.addSeries(u, 2),
                                    m.redraw(),
                                    [2]
                                }
                            }
                            ))
                        }
                        ))
                    }
                    var r, o, a, s, l, c, p, u, d, h, f, g, v, m, y, b, w = this;
                    return en(this, (function(x) {
                        switch (x.label) {
                        case 0:
                            for ('<select id="dropd" name="dropd" style="text-align: right;color: white;background: none;border: none;font-size: 20px;font-family: "myriad-regular";-webkit-appearance: none;">        <option value="speedInterp">Speed</option>        <option value="headingIntep">Heading</option>        <option value="rightFoilPosition">Right Foil Position</option>        <option value="leftFoilPosition">Left Foil Position</option>        <option value="heelInterp">Heel</option>        <option value="pitchInterp">Pitch</option>        <option value="twdInterp">TWD</option>        <option value="twsInterp">TWS</option>        <option value="vmgInterp">VMG</option>        </select>',
                            "<em>Click and drag to zoom in. Double click to zoom out. </em>",
                            b = 0; b < 3; b++)
                                (r = document.createElement("div" + b)).id = "content" + b,
                                r.className = "note" + b,
                                document.body.appendChild(r),
                                document.getElementsByClassName("footer")[0].parentNode.insertBefore(r, document.getElementsByClassName("footer")[0]);
                            return document.getElementById("content0").innerHTML += '<select id="dropd" name="dropd" style="text-align: right;color: white;background: none;border: none;font-size: 20px;font-family: "myriad-regular";-webkit-appearance: none;">        <option value="speedInterp">Speed</option>        <option value="headingIntep">Heading</option>        <option value="rightFoilPosition">Right Foil Position</option>        <option value="leftFoilPosition">Left Foil Position</option>        <option value="heelInterp">Heel</option>        <option value="pitchInterp">Pitch</option>        <option value="twdInterp">TWD</option>        <option value="twsInterp">TWS</option>        <option value="vmgInterp">VMG</option>        </select>',
                            document.getElementById("content2").innerHTML += "<em>Click and drag to zoom in. Double click to zoom out. </em>",
                            document.getElementById("dropd").addEventListener("change", i),
                            o = this.data.raceStartTime,
                            [4, this.boatData.next().value];
                        case 1:
                            return a = x.sent(),
                            [4, this.boatData.next().value];
                        case 2:
                            return s = x.sent(),
                            l = [[a], [s]],
                            [4, a[1].speedInterp.valHistory.map((function(e) {
                                return (e[1] - o) / 60
                            }
                            ))];
                        case 3:
                            return c = x.sent(),
                            [4, a[1].speedInterp.valHistory.map((function(e) {
                                return e[0]
                            }
                            ))];
                        case 4:
                            return p = x.sent(),
                            [4, s[1].speedInterp.valHistory.map((function(e) {
                                return e[0]
                            }
                            ))];
                        case 5:
                            for (u = x.sent(),
                            d = [c, p, u],
                            h = this.teams,
                            f = this.raceScene,
                            window.addEventListener("resize", (function(e) {
                                if (window.innerHeight < 590) {
                                    for (var t = document.getElementsByClassName("u-wrap"), i = 0; i < t.length; i++)
                                        t[i].style.paddingLeft = "65px";
                                    var r = document.getElementsByClassName("slider");
                                    for (i = 0; i < r.length; i++)
                                        r[i].style.marginLeft = "75px";
                                    m.setSize(n())
                                } else {
                                    for (t = document.getElementsByClassName("u-wrap"),
                                    i = 0; i < t.length; i++)
                                        t[i].style.paddingLeft = "0px";
                                    for (r = document.getElementsByClassName("slider"),
                                    i = 0; i < r.length; i++)
                                        r[i].style.marginLeft = "15px";
                                    m.setSize(n())
                                }
                            }
                            )),
                            g = Zt(Zt({
                                title: ""
                            }, n()), {
                                scales: {
                                    x: {
                                        time: !1
                                    },
                                    test: {}
                                },
                                hooks: {
                                    drawSeries: [function(e, t) {
                                        var n = e.ctx
                                        , i = e.bbox
                                        , r = l[t - 1][0];
                                        w.boatData,
                                        r[1].legInterp.valHistory.forEach((function(t, a) {
                                            var s = e.valToPos((t[1] - o) / 60, "x", !0);
                                            n.beginPath(),
                                            n.strokeStyle = w.raceScene.getTeamColour(r[0]),
                                            n.setLineDash([8, 8]),
                                            n.lineWidth = 3,
                                            n.moveTo(s, 0),
                                            n.lineTo(s, i.top + i.height),
                                            n.stroke()
                                        }
                                        ))
                                    }
                                    ],
                                    setSeries: [function(e, t) {
                                        e.series.forEach((function(e, n) {
                                            e.width = n == t ? 2 : 1
                                        }
                                        ))
                                    }
                                    ]
                                },
                                focus: {
                                    alpha: .3
                                },
                                cursor: {
                                    focus: {
                                        prox: 20
                                    }
                                },
                                axes: [{
                                    stroke: "white",
                                    gap: -5
                                }, {
                                    show: !0,
                                    font: "12px Myriad-Regular",
                                    gap: 1,
                                    stroke: "white"
                                }],
                                series: [{
                                    value: function(e, t) {
                                        return n = t,
                                        i = Math.floor(n),
                                        (r = Math.round(60 * (n - i))) < 10 ? i + ":0" + r : i + ":" + r;
                                        var n, i, r
                                    },
                                    label: "Time",
                                    stroke: "red",
                                    fill: "rgba(255,0,0,0.1)"
                                }, {
                                    label: null === (e = this.teams.getTeam(a[1].teamId)) || void 0 === e ? void 0 : e.abbr,
                                    stroke: this.raceScene.getTeamColour(a[0]),
                                    fill: this.raceScene.getTeamColour(a[0]) + "33",
                                    value: function(e, t) {
                                        return t.toFixed(2) + w.unit
                                    }
                                }, {
                                    label: null === (t = this.teams.getTeam(s[1].teamId)) || void 0 === t ? void 0 : t.abbr,
                                    stroke: this.raceScene.getTeamColour(s[0]),
                                    fill: this.raceScene.getTeamColour(s[0]) + "33",
                                    value: function(e, t) {
                                        return t.toFixed(2) + w.unit
                                    }
                                }]
                            }),
                            v = document.getElementById("content1"),
                            m = new Qt.a(g,d,v),
                            this.graph = m,
                            v.style.display = "none",
                            window.dispatchEvent(new Event("resize")),
                            y = document.getElementsByClassName("u-legend"),
                            b = 0; b < y.length; b++)
                                y[b].style.transform = "translateY(-30vh)",
                                y[b].style.color = "white",
                                y[b].style.textAlign = "right",
                                y[b].style.float = "right",
                                y[b].style.width = "max-content";
                            return [2]
                        }
                    }
                    ))
                }
                ))
            }
            ,
            e.prototype.dispose = function() {
                document.getElementById("content1").remove(),
                this.graph.destroy()
            }
            ,
            e.prototype.redraw = function() {
                this.graph.destroy();
                document.getElementById("content1")
            }
            ,
            e
        }(), nn = function() {
            function e() {
                this.timingHistory = []
            }
            return e.prototype.start = function() {
                this.startTime = performance.now()
            }
            ,
            e.prototype.stop = function() {
                var e = performance.now()
                , t = void 0 !== this.startTime ? e - this.startTime : 0;
                for (this.timingHistory.push(t); this.timingHistory.length > 60; )
                    this.timingHistory.shift()
            }
            ,
            e.prototype.reset = function() {
                this.startTime = void 0,
                this.timingHistory = []
            }
            ,
            e.prototype.getLastMS = function() {
                return 0 === this.timingHistory.length ? 0 : this.timingHistory[this.timingHistory.length - 1]
            }
            ,
            e.prototype.getAverageMS = function() {
                return 0 === this.timingHistory.length ? 0 : this.timingHistory.reduce((function(e, t) {
                    return e + t
                }
                ), 0) / this.timingHistory.length
            }
            ,
            e.prototype.getMaxMS = function() {
                return 0 === this.timingHistory.length ? 0 : Math.max.apply(Math, this.timingHistory)
            }
            ,
            e.prototype.getMinMS = function() {
                return 0 === this.timingHistory.length ? 0 : Math.min.apply(Math, this.timingHistory)
            }
            ,
            e
        }(), rn = function(e, t, n, i) {
            return new (n || (n = Promise))((function(r, o) {
                function a(e) {
                    try {
                        l(i.next(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function s(e) {
                    try {
                        l(i.throw(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function l(e) {
                    var t;
                    e.done ? r(e.value) : (t = e.value,
                    t instanceof n ? t : new n((function(e) {
                        e(t)
                    }
                    ))).then(a, s)
                }
                l((i = i.apply(e, t || [])).next())
            }
            ))
        }, on = function(e, t) {
            var n, i, r, o, a = {
                label: 0,
                sent: function() {
                    if (1 & r[0])
                        throw r[1];
                    return r[1]
                },
                trys: [],
                ops: []
            };
            return o = {
                next: s(0),
                throw: s(1),
                return: s(2)
            },
            "function" == typeof Symbol && (o[Symbol.iterator] = function() {
                return this
            }
            ),
            o;
            function s(o) {
                return function(s) {
                    return function(o) {
                        if (n)
                            throw new TypeError("Generator is already executing.");
                        for (; a; )
                            try {
                                if (n = 1,
                                i && (r = 2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i),
                                0) : i.next) && !(r = r.call(i, o[1])).done)
                                    return r;
                                switch (i = 0,
                                r && (o = [2 & o[0], r.value]),
                                o[0]) {
                                case 0:
                                case 1:
                                    r = o;
                                    break;
                                case 4:
                                    return a.label++,
                                    {
                                        value: o[1],
                                        done: !1
                                    };
                                case 5:
                                    a.label++,
                                    i = o[1],
                                    o = [0];
                                    continue;
                                case 7:
                                    o = a.ops.pop(),
                                    a.trys.pop();
                                    continue;
                                default:
                                    if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                        a = 0;
                                        continue
                                    }
                                    if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                        a.label = o[1];
                                        break
                                    }
                                    if (6 === o[0] && a.label < r[1]) {
                                        a.label = r[1],
                                        r = o;
                                        break
                                    }
                                    if (r && a.label < r[2]) {
                                        a.label = r[2],
                                        a.ops.push(o);
                                        break
                                    }
                                    r[2] && a.ops.pop(),
                                    a.trys.pop();
                                    continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e],
                                i = 0
                            } finally {
                                n = r = 0
                            }
                        if (5 & o[0])
                            throw o[1];
                        return {
                            value: o[0] ? o[1] : void 0,
                            done: !0
                        }
                    }([o, s])
                }
            }
        }, an = function() {
            function e() {
                this.races = []
            }
            return e.prototype.loadFile = function(e) {
                return rn(this, void 0, void 0, (function() {
                    var t = this;
                    return on(this, (function(n) {
                        return this.races = [],
                        [2, fetch(e).then((function(e) {
                            if (!e.ok)
                                throw Error(e.statusText);
                            return e.text()
                        }
                        )).then((function(e) {
                            for (var n = [], i = 0, r = e.split(/\r?\n/); i < r.length; i++) {
                                var o = r[i];
                                o.startsWith("DataFile") && n.length > 0 && (t.addEntry(n),
                                n = []),
                                n.push(o)
                            }
                            t.addEntry(n)
                        }
                        ))]
                    }
                    ))
                }
                ))
            }
            ,
            e.prototype.getEntryForRaceName = function(e) {
                for (var t = 0, n = this.races; t < n.length; t++) {
                    var i = n[t];
                    if (i.raceNameA.toLowerCase() === e.toLowerCase())
                        return i
                }
            }
            ,
            e.prototype.addEntry = function(e) {
                var t = new sn(e);
                t.isValid() ? this.races.push(t) : console.log("WARNING Discarding lines: " + e)
            }
            ,
            e
        }(), sn = function() {
            function e(e) {
                this.dataFile = "",
                this.race = "",
                this.raceNameA = "",
                this.raceNameB = "";
                for (var t = 0, n = e; t < n.length; t++) {
                    var i = n[t].split("=", 2);
                    if (i.length < 2)
                        return;
                    var r = i[0].trim()
                    , o = i[1].trim();
                    switch (r) {
                    case "DataFile":
                        this.dataFile = o;
                        break;
                    case "Race":
                    case "RaceNameA":
                        this.raceNameA = o;
                        break;
                    case "RaceNameB":
                        this.raceNameB = o;
                        break;
                    case "RaceInfoA":
                    case "RaceInfoB":
                    case "RaceInfoC":
                    case "Date":
                    case "DayOfWeek":
                    case "Time":
                    case "Y1":
                        break;
                    default:
                        console.log("WARNING Unknown entry, ignoring " + r + " " + o)
                    }
                }
            }
            return e.prototype.isValid = function() {
                return void 0 !== this.dataFile
            }
            ,
            e
        }(), ln = function(e, t, n, i) {
            return new (n || (n = Promise))((function(r, o) {
                function a(e) {
                    try {
                        l(i.next(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function s(e) {
                    try {
                        l(i.throw(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function l(e) {
                    var t;
                    e.done ? r(e.value) : (t = e.value,
                    t instanceof n ? t : new n((function(e) {
                        e(t)
                    }
                    ))).then(a, s)
                }
                l((i = i.apply(e, t || [])).next())
            }
            ))
        }, cn = function(e, t) {
            var n, i, r, o, a = {
                label: 0,
                sent: function() {
                    if (1 & r[0])
                        throw r[1];
                    return r[1]
                },
                trys: [],
                ops: []
            };
            return o = {
                next: s(0),
                throw: s(1),
                return: s(2)
            },
            "function" == typeof Symbol && (o[Symbol.iterator] = function() {
                return this
            }
            ),
            o;
            function s(o) {
                return function(s) {
                    return function(o) {
                        if (n)
                            throw new TypeError("Generator is already executing.");
                        for (; a; )
                            try {
                                if (n = 1,
                                i && (r = 2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i),
                                0) : i.next) && !(r = r.call(i, o[1])).done)
                                    return r;
                                switch (i = 0,
                                r && (o = [2 & o[0], r.value]),
                                o[0]) {
                                case 0:
                                case 1:
                                    r = o;
                                    break;
                                case 4:
                                    return a.label++,
                                    {
                                        value: o[1],
                                        done: !1
                                    };
                                case 5:
                                    a.label++,
                                    i = o[1],
                                    o = [0];
                                    continue;
                                case 7:
                                    o = a.ops.pop(),
                                    a.trys.pop();
                                    continue;
                                default:
                                    if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                        a = 0;
                                        continue
                                    }
                                    if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                        a.label = o[1];
                                        break
                                    }
                                    if (6 === o[0] && a.label < r[1]) {
                                        a.label = r[1],
                                        r = o;
                                        break
                                    }
                                    if (r && a.label < r[2]) {
                                        a.label = r[2],
                                        a.ops.push(o);
                                        break
                                    }
                                    r[2] && a.ops.pop(),
                                    a.trys.pop();
                                    continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e],
                                i = 0
                            } finally {
                                n = r = 0
                            }
                        if (5 & o[0])
                            throw o[1];
                        return {
                            value: o[0] ? o[1] : void 0,
                            done: !0
                        }
                    }([o, s])
                }
            }
        }, pn = function() {
            function e() {
                this.matches = []
            }
            return e.prototype.loadFile = function(e) {
                return ln(this, void 0, void 0, (function() {
                    var t = this;
                    return cn(this, (function(n) {
                        return this.matches = [],
                        [2, fetch(e).then((function(e) {
                            if (!e.ok)
                                throw Error(e.statusText);
                            return e.text()
                        }
                        )).then((function(e) {
                            for (var n = 0, i = e.split(/\r?\n/); n < i.length; n++) {
                                var r = i[n];
                                if (0 !== r.trim().length)
                                    try {
                                        var o = new un(r);
                                        t.matches.push(o)
                                    } catch (e) {
                                        console.log(e)
                                    }
                            }
                        }
                        ))]
                    }
                    ))
                }
                ))
            }
            ,
            e.prototype.getMatchInfo = function(e) {
                for (var t = 0, n = this.matches; t < n.length; t++) {
                    var i = n[t];
                    if (i.matchIndex === e)
                        return i
                }
            }
            ,
            e
        }(), un = function(e) {
            var t = e.split(";", 4);
            if (t.length < 4)
                throw Error("Error : not enough info, ignoring " + e);
            if (this.matchIndex = Number(t[0]),
            this.matchIndex === Number.NaN)
                throw Error("Error : raceID is not a number " + this.matchIndex + ", ignoring " + e);
            this.eventCode = t[1].trim(),
            this.eventName = t[2].trim(),
            this.raceName = t[3].trim()
        }, dn = function(e, t, n, i) {
            return new (n || (n = Promise))((function(r, o) {
                function a(e) {
                    try {
                        l(i.next(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function s(e) {
                    try {
                        l(i.throw(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function l(e) {
                    var t;
                    e.done ? r(e.value) : (t = e.value,
                    t instanceof n ? t : new n((function(e) {
                        e(t)
                    }
                    ))).then(a, s)
                }
                l((i = i.apply(e, t || [])).next())
            }
            ))
        }, hn = function(e, t) {
            var n, i, r, o, a = {
                label: 0,
                sent: function() {
                    if (1 & r[0])
                        throw r[1];
                    return r[1]
                },
                trys: [],
                ops: []
            };
            return o = {
                next: s(0),
                throw: s(1),
                return: s(2)
            },
            "function" == typeof Symbol && (o[Symbol.iterator] = function() {
                return this
            }
            ),
            o;
            function s(o) {
                return function(s) {
                    return function(o) {
                        if (n)
                            throw new TypeError("Generator is already executing.");
                        for (; a; )
                            try {
                                if (n = 1,
                                i && (r = 2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i),
                                0) : i.next) && !(r = r.call(i, o[1])).done)
                                    return r;
                                switch (i = 0,
                                r && (o = [2 & o[0], r.value]),
                                o[0]) {
                                case 0:
                                case 1:
                                    r = o;
                                    break;
                                case 4:
                                    return a.label++,
                                    {
                                        value: o[1],
                                        done: !1
                                    };
                                case 5:
                                    a.label++,
                                    i = o[1],
                                    o = [0];
                                    continue;
                                case 7:
                                    o = a.ops.pop(),
                                    a.trys.pop();
                                    continue;
                                default:
                                    if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                        a = 0;
                                        continue
                                    }
                                    if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                        a.label = o[1];
                                        break
                                    }
                                    if (6 === o[0] && a.label < r[1]) {
                                        a.label = r[1],
                                        r = o;
                                        break
                                    }
                                    if (r && a.label < r[2]) {
                                        a.label = r[2],
                                        a.ops.push(o);
                                        break
                                    }
                                    r[2] && a.ops.pop(),
                                    a.trys.pop();
                                    continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e],
                                i = 0
                            } finally {
                                n = r = 0
                            }
                        if (5 & o[0])
                            throw o[1];
                        return {
                            value: o[0] ? o[1] : void 0,
                            done: !0
                        }
                    }([o, s])
                }
            }
        }, fn = function() {
            function e() {
                this.websocketUrl = "",
                this.eventIds = [],
                this.liveEventId = "",
                this.audioChannels = [],
                this.videoChannels = []
            }
            return e.loadFromFile = function(t) {
                return dn(this, void 0, void 0, (function() {
                    return hn(this, (function(n) {
                        return [2, fetch(t).then((function(e) {
                            return e.json()
                        }
                        )).then((function(t) {
                            var n = new e;
                            return n.deserialize(t),
                            n
                        }
                        )).catch((function(e) {
                            console.log(e)
                        }
                        ))]
                    }
                    ))
                }
                ))
            }
            ,
            e.prototype.deserialize = function(e) {
                for (var t = 0, n = Object.keys(this); t < n.length; t++) {
                    var i = n[t];
                    if (e.hasOwnProperty(i)) {
                        if ("audioChannels" === i) {
                            for (var r = [], o = 0, a = e[i]; o < a.length; o++) {
                                var s = a[o];
                                (u = new gn).deserialize(s),
                                r.push(u)
                            }
                            this.audioChannels = r;
                            continue
                        }
                        if ("videoChannels" === i) {
                            for (var l = [], c = 0, p = e[i]; c < p.length; c++) {
                                var u;
                                s = p[c];
                                (u = new vn).deserialize(s),
                                l.push(u)
                            }
                            this.videoChannels = l;
                            continue
                        }
                        this[i] = e[i]
                    }
                }
            }
            ,
            e.prototype.getAudioButtonText = function(e) {
                for (var t = 0, n = this.audioChannels; t < n.length; t++) {
                    var i = n[t];
                    if (i.channel === String(e))
                        return i.buttonText
                }
            }
            ,
            e.prototype.getAudioButtonURL = function(e) {
                for (var t = 0, n = this.audioChannels; t < n.length; t++) {
                    var i = n[t];
                    if (i.channel === String(e))
                        return i.url
                }
            }
            ,
            e.prototype.getVideoButtonText = function(e) {
                for (var t = 0, n = this.videoChannels; t < n.length; t++) {
                    var i = n[t];
                    if (i.channel === String(e))
                        return i.buttonText
                }
            }
            ,
            e.prototype.getVideoButtonURL = function(e) {
                for (var t = 0, n = this.videoChannels; t < n.length; t++) {
                    var i = n[t];
                    if (i.channel === String(e))
                        return i.url
                }
            }
            ,
            e.prototype.getVideoStreamType = function(e) {
                for (var t = 0, n = this.videoChannels; t < n.length; t++) {
                    var i = n[t];
                    if (i.channel === String(e))
                        return i.getStreamType()
                }
            }
            ,
            e
        }(), gn = function() {
            function e() {
                this.channel = "",
                this.team = "",
                this.buttonText = "",
                this.url = ""
            }
            return e.prototype.deserialize = function(e) {
                for (var t = 0, n = Object.keys(this); t < n.length; t++) {
                    var i = n[t];
                    this[i] = e[i]
                }
            }
            ,
            e
        }();
        !function(e) {
            e[e.Unknown = 0] = "Unknown",
            e[e.OBPort = 1] = "OBPort",
            e[e.OBStarboard = 2] = "OBStarboard",
            e[e.Live = 3] = "Live"
        }(Kt || (Kt = {}));
        var vn = function() {
            function e() {
                this.channel = "",
                this.streamID = "",
                this.buttonText = "",
                this.url = ""
            }
            return e.prototype.deserialize = function(e) {
                for (var t = 0, n = Object.keys(this); t < n.length; t++) {
                    var i = n[t];
                    this[i] = e[i]
                }
            }
            ,
            e.prototype.getStreamType = function() {
                return "OBPORT" === this.streamID.trim().toUpperCase() ? Kt.OBPort : "OBSTARBOARD" === this.streamID.trim().toUpperCase() ? Kt.OBStarboard : "LIVE" === this.streamID.trim().toUpperCase() ? Kt.Live : Kt.Unknown
            }
            ,
            e
        }()
        , mn = function(e, t, n, i) {
            return new (n || (n = Promise))((function(r, o) {
                function a(e) {
                    try {
                        l(i.next(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function s(e) {
                    try {
                        l(i.throw(e))
                    } catch (e) {
                        o(e)
                    }
                }
                function l(e) {
                    var t;
                    e.done ? r(e.value) : (t = e.value,
                    t instanceof n ? t : new n((function(e) {
                        e(t)
                    }
                    ))).then(a, s)
                }
                l((i = i.apply(e, t || [])).next())
            }
            ))
        }
        , yn = function(e, t) {
            var n, i, r, o, a = {
                label: 0,
                sent: function() {
                    if (1 & r[0])
                        throw r[1];
                    return r[1]
                },
                trys: [],
                ops: []
            };
            return o = {
                next: s(0),
                throw: s(1),
                return: s(2)
            },
            "function" == typeof Symbol && (o[Symbol.iterator] = function() {
                return this
            }
            ),
            o;
            function s(o) {
                return function(s) {
                    return function(o) {
                        if (n)
                            throw new TypeError("Generator is already executing.");
                        for (; a; )
                            try {
                                if (n = 1,
                                i && (r = 2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i),
                                0) : i.next) && !(r = r.call(i, o[1])).done)
                                    return r;
                                switch (i = 0,
                                r && (o = [2 & o[0], r.value]),
                                o[0]) {
                                case 0:
                                case 1:
                                    r = o;
                                    break;
                                case 4:
                                    return a.label++,
                                    {
                                        value: o[1],
                                        done: !1
                                    };
                                case 5:
                                    a.label++,
                                    i = o[1],
                                    o = [0];
                                    continue;
                                case 7:
                                    o = a.ops.pop(),
                                    a.trys.pop();
                                    continue;
                                default:
                                    if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                        a = 0;
                                        continue
                                    }
                                    if (3 === o[0] && (!r || o[1] > r[0] && o[1] < r[3])) {
                                        a.label = o[1];
                                        break
                                    }
                                    if (6 === o[0] && a.label < r[1]) {
                                        a.label = r[1],
                                        r = o;
                                        break
                                    }
                                    if (r && a.label < r[2]) {
                                        a.label = r[2],
                                        a.ops.push(o);
                                        break
                                    }
                                    r[2] && a.ops.pop(),
                                    a.trys.pop();
                                    continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e],
                                i = 0
                            } finally {
                                n = r = 0
                            }
                        if (5 & o[0])
                            throw o[1];
                        return {
                            value: o[0] ? o[1] : void 0,
                            done: !0
                        }
                    }([o, s])
                }
            }
        }
        , bn = function() {
            function e(e, t) {
                var n, r;
                if (this.eventRaceDats = new Map,
                this.eventMatchInfo = new Map,
                this.raceDataLookup = new Map,
                this.raceDataMode = g.None,
                this.eventName = "",
                this.raceName = "",
                this.playbackRate = 1,
                this.scrubbing = !1,
                this.lastDashboardSendTime = -1,
                this.lastDashboardSimTime = -1,
                this.dbInterval = -1,
                this.currentRaceId = 0,
                this.anotherLiveRaceWaiting = !1,
                this.dataLoaded = !1,
                this.sceneLoaded = !1,
                this.audioPlayer = new Audio,
                this.appconfig = e,
                this.raceconfig = t,
                this.uiEngine = new Dt(this,e),
                this.renderCanvas = null !== (n = document.getElementById("renderCanvas")) && void 0 !== n ? n : void 0,
                void 0 === this.renderCanvas)
                    throw new Error("No render canvas");
                null === (r = this.renderCanvas.parentElement) || void 0 === r || r.addEventListener("wheel", (function(e) {
                    e.preventDefault()
                }
                )),
                i.b && (this.framerateTimer = new nn,
                this.renderTimer = new nn,
                this.sceneTimer = new nn,
                this.simTimer = new nn,
                this.uiTimer = new nn)
            }
            return e.prototype.updateStatus = function(e) {
                this.uiEngine.updateStatus(e)
            }
            ,
            e.prototype.dataPacket = function(e) {
                if (Object(o.o)(e)) {
                    var t = this.getRaceData(e.raceId);
                    t.addPacket(e),
                    0 != this.currentRaceId && e.raceId != this.currentRaceId && t.hasMinimumData() && (this.anotherLiveRaceWaiting || (this.anotherLiveRaceWaiting = !0,
                    this.uiEngine.refreshLiveRaceWaiting())),
                    this.raceDataMode === g.Live && !1 === this.dataLoaded && t.hasMinimumData() && (this.dataLoaded = !0,
                    this.currentRaceId = t.raceId,
                    this.anotherLiveRaceWaiting = !1,
                    this.readLiveRaceConfigInfo(this.currentRaceId),
                    this.setRaceTimeProgress(1),
                    this.startRaceScene(t.raceId),
                    this.showRaceSceneIfReady())
                } else
                    i.k || e instanceof o.c && (this.latestAudioPacket = e,
                    this.uiEngine.refreshAVControls())
            }
            ,
            e.prototype.playRecordedData = function(e, t, n) {
                var i = this;
                this.raceDataMode = g.Playback,
                this.eventName = t,
                this.raceName = n,
                this.uiEngine.showLoading(0),
                this.dataLoaded = !1,
                this.playbackRate = 0;
                var r = new b;
                r.loadFile(e).then((function() {
                    for (var e, t = 0, n = r.dataPackets; t < n.length; t++) {
                        var a = n[t];
                        Object(o.o)(a) && (void 0 === e ? e = a.raceId : e !== a.raceId && console.log("Warning : more than one raceID in file, will show the first race first")),
                        i.dataPacket(a)
                    }
                    void 0 !== e ? (i.dataLoaded = !0,
                    i.currentRaceId = e,
                    i.anotherLiveRaceWaiting = !1,
                    i.startRaceScene(e),
                    i.setRaceTimeProgress(0),
                    i.showRaceSceneIfReady()) : console.log("Error: Failed to load data")
                }
                ))
            }
            ,
            e.prototype.playLive = function(e) {
                void 0 === e && (e = 1),
                this.raceDataMode = g.Live,
                this.setPlaybackRate(e)
            }
            ,
            e.prototype.playNextRace = function() {
                var e;
                this.anotherLiveRaceWaiting ? (this.raceDataLookup.delete(this.currentRaceId),
                this.currentRaceId = 0,
                null === (e = this.currentRaceScene) || void 0 === e || e.resetScene(),
                this.anotherLiveRaceWaiting = !1,
                this.raceDataMode = g.None,
                this.dataLoaded = !1,
                this.sceneLoaded = !1,
                this.eventRaceDats.clear(),
                this.playLive()) : this.loadMenu()
            }
            ,
            e.prototype.loadMenu = function() {
                var e, t = this;
                null != this.graph && (this.uiEngine.setGraphEnabled(!1),
                this.graph.dispose()),
                (this.raceDataMode === g.Playback || this.anotherLiveRaceWaiting) && this.raceDataLookup.delete(this.currentRaceId),
                this.currentRaceId = 0,
                null === (e = this.currentRaceScene) || void 0 === e || e.resetScene(),
                this.anotherLiveRaceWaiting = !1,
                this.raceDataMode = g.None,
                this.dataLoaded = !1,
                this.sceneLoaded = !1,
                this.eventRaceDats.clear(),
                this.eventMatchInfo.clear(),
                this.uiEngine.showLoading(0);
                var n = this.raceconfig.eventIds.length
                , i = 1 / (2 * n + 1)
                , r = i;
                this.uiEngine.showLoading(r);
                for (var o = function() {
                    r += i,
                    t.uiEngine.showLoading(r),
                    t.eventRaceDats.size < n || t.eventMatchInfo.size < n || setTimeout((function() {
                        t.uiEngine.updatePlaybackStatus(!0),
                        t.uiEngine.showMenu()
                    }
                    ), 1e3)
                }, a = function(e) {
                    var n = new an;
                    n.loadFile(s.appconfig.raceDataSubUrl + "/" + e + "/RacesList.dat").then((function() {
                        t.eventRaceDats.set(e, n),
                        o()
                    }
                    )).catch((function(i) {
                        console.log(i),
                        t.eventRaceDats.set(e, n),
                        o()
                    }
                    ));
                    var i = new pn;
                    i.loadFile(s.appconfig.raceDataSubUrl + "/" + e + "/MatchInfoTitles.txt").then((function() {
                        t.eventMatchInfo.set(e, i),
                        o()
                    }
                    )).catch((function(n) {
                        console.log(n),
                        t.eventMatchInfo.set(e, i),
                        o()
                    }
                    ))
                }, s = this, l = 0, c = this.raceconfig.eventIds; l < c.length; l++) {
                    a(c[l])
                }
                this.postInMenuMessage(),
                this.dbInterval = setInterval((function() {
                    return t.postInMenuMessage()
                }
                ), 1e3)
            }
            ,
            e.prototype.getRaceFiles = function() {
                for (var e = [], t = 0, n = this.raceconfig.eventIds; t < n.length; t++) {
                    var i = n[t]
                    , r = this.eventRaceDats.get(i);
                    if (void 0 !== r) {
                        var o = this.eventMatchInfo.get(i);
                        if (void 0 !== o)
                            for (var a = 0, s = o.matches; a < s.length; a++) {
                                var l = s[a]
                                , c = r.getEntryForRaceName(l.raceName);
                                if (void 0 !== c) {
                                    var p = this.appconfig.raceDataSubUrl + "/" + i + "/" + c.dataFile;
                                    e.push({
                                        eventTitle: l.eventName,
                                        raceTitle: l.raceName,
                                        raceFileURL: p
                                    })
                                }
                            }
                    }
                }
                return e
            }
            ,
            e.prototype.getPlaybackRate = function() {
                return this.playbackRate
            }
            ,
            e.prototype.setPlaybackRate = function(e) {
                this.playbackRate = e
            }
            ,
            e.prototype.skipToLatest = function() {
                var e = this.getCurrentRaceData();
                void 0 !== e && e.setSimTime(e.maxRaceTime)
            }
            ,
            e.prototype.skipToStart = function() {
                var e = this.getCurrentRaceData();
                void 0 !== e && e.setSimTime(e.minRaceTime)
            }
            ,
            e.prototype.setScrubbingActive = function(e) {
                this.scrubbing = e,
                e || (this.scene_last_updated_ms = performance.now())
            }
            ,
            e.prototype.getRaceTimeProgress = function() {
                var e = this.getCurrentRaceData();
                if (void 0 === e)
                    return console.log("Warning : No scene active"),
                    0;
                if (void 0 === e.minRaceTime || void 0 === e.maxRaceTime || void 0 === e.simTime)
                    return 0;
                var t = e.maxRaceTime - e.minRaceTime;
                return (e.simTime - e.minRaceTime) / t
            }
            ,
            e.prototype.setRaceTimeProgress = function(e) {
                var t;
                if (e < 0 || e > 1)
                    console.log("Warning : invalid scrub value");
                else {
                    var n = this.getCurrentRaceData();
                    if (void 0 !== n) {
                        var i = n.maxRaceTime - n.minRaceTime
                        , r = n.minRaceTime + e * i;
                        n.setSimTime(r),
                        this.scene_last_updated_ms = performance.now(),
                        n.refreshSimState(),
                        null === (t = this.currentRaceScene) || void 0 === t || t.refreshScene(n)
                    } else
                        console.log("Warning : No scene active")
                }
            }
            ,
            e.prototype.getCurrentLeg = function() {
                var e = this.getCurrentRaceData();
                return void 0 === e ? (console.log("Warning : No scene active"),
                -1) : e.currentLeg
            }
            ,
            e.prototype.getNumLegs = function() {
                var e = this.getCurrentRaceData();
                return void 0 === e ? (console.log("Warning : No scene active"),
                -1) : e.getNumLegs()
            }
            ,
            e.prototype.setLegProgress = function(e) {
                var t, n = this.getCurrentRaceData();
                void 0 !== n ? (n.setLegProgress(e),
                this.scene_last_updated_ms = performance.now(),
                n.refreshSimState(),
                null === (t = this.currentRaceScene) || void 0 === t || t.refreshScene(n)) : console.log("Warning : No scene active")
            }
            ,
            e.prototype.getLegProgress = function() {
                var e = this.getCurrentRaceData();
                if (void 0 !== e)
                    return e.getLegProgress();
                console.log("Warning : No scene active")
            }
            ,
            e.prototype.getMinMaxLegProgress = function() {
                var e = this.getCurrentRaceData();
                if (void 0 !== e) {
                    if (this.raceDataMode === g.Playback)
                        return {
                            min: 0,
                            max: e.getNumLegs() + 2
                        };
                    var t = e.getLegProgressAtTime(e.minRaceTime)
                    , n = e.getLegProgressAtTime(e.maxRaceTime);
                    if (void 0 !== t && void 0 !== n)
                        return {
                            min: t,
                            max: n
                        }
                }
            }
            ,
            e.prototype.getDisplayTime = function() {
                var e, t, n = this.getCurrentRaceData();
                return void 0 === n || void 0 === n.raceStartTime || void 0 === n.simTime ? "" : (n.raceStartTime > n.simTime ? (t = "-",
                e = n.raceStartTime - n.simTime) : (t = "",
                e = n.simTime - n.raceStartTime),
                "" + t + F.c(e))
            }
            ,
            e.prototype.getBoatRankings = function() {
                var e = this.getCurrentRaceData();
                return void 0 === e ? [] : e.rankings
            }
            ,
            e.prototype.getRoundingTimer = function() {
                var e = this.getCurrentRaceData();
                if (void 0 === e)
                    return "";
                var t = e.getElapsedSecsForLeg(e.currentLeg);
                return void 0 === t ? "" : F.d(t)
            }
            ,
            e.prototype.getRoundingTimerVisible = function() {
                var e = this.getCurrentRaceData();
                return void 0 !== e && e.getRankingMethod() === Ot.RankByRoundingTime
            }
            ,
            e.prototype.getRaceStatus = function() {
                var e = this.getCurrentRaceData();
                if (void 0 === e)
                    return 0;
                var t = e.getRaceStatus();
                return void 0 === t ? 0 : t
            }
            ,
            e.prototype.getRaceStatusString = function() {
                var e = this.getCurrentLeg()
                , t = this.getNumLegs();
                switch (this.getRaceStatus()) {
                case 0:
                case 1:
                    return 0 === e ? "Pre-start" : e > t ? "Finished" : "Racing";
                case 2:
                    return "Postponed";
                case 3:
                    return "Abandoned";
                case 5:
                    return "Finished";
                default:
                    return ""
                }
            }
            ,
            e.prototype.getBoatStatusString = function(e, t) {
                switch (e) {
                case 0:
                    return t ? "FIN" : "-";
                case 1:
                    return "DNS";
                case 2:
                    return "DNF";
                case 3:
                    return "RTD";
                case 4:
                    return "OCS";
                case 5:
                    return "DSQ";
                default:
                    return "ERR"
                }
            }
            ,
            e.prototype.getEventName = function() {
                return this.eventName
            }
            ,
            e.prototype.getRaceName = function() {
                return this.raceName
            }
            ,
            e.prototype.isAnotherLiveRaceWaiting = function() {
                return this.anotherLiveRaceWaiting
            }
            ,
            e.prototype.getAudioChannels = function() {
                var e, t = [], n = this.getCurrentRaceData();
                if (void 0 !== n && void 0 !== this.latestAudioPacket)
                    for (var i = 0, r = this.latestAudioPacket.channels; i < r.length; i++) {
                        var o = r[i];
                        if ((!(o.teamID > 0) || n.hasTeam(o.teamID)) && o.isAudio()) {
                            var a = null !== (e = this.raceconfig.getAudioButtonText(o.channelID)) && void 0 !== e ? e : "";
                            t.push({
                                channel: o,
                                displayText: a,
                                teamID: o.teamID
                            })
                        }
                    }
                return t
            }
            ,
            e.prototype.getVideoChannels = function() {
                var e, t, n, i, r = [];
                if (void 0 !== this.getCurrentRaceData() && void 0 !== this.latestAudioPacket)
                    for (var o = 0, a = this.latestAudioPacket.channels; o < a.length; o++) {
                        var s = a[o];
                        if (s.isVideo()) {
                            var l = null !== (e = this.raceconfig.getVideoButtonText(s.channelID)) && void 0 !== e ? e : ""
                            , c = void 0;
                            switch (null !== (t = this.raceconfig.getVideoStreamType(s.channelID)) && void 0 !== t ? t : Kt.Unknown) {
                            case Kt.OBPort:
                                c = null === (n = this.getCurrentRaceData()) || void 0 === n ? void 0 : n.getPortEntryTeamID();
                                break;
                            case Kt.OBStarboard:
                                c = null === (i = this.getCurrentRaceData()) || void 0 === i ? void 0 : i.getStarboardTeamID();
                                break;
                            case Kt.Live:
                                c = 0
                            }
                            void 0 !== c && (s.teamID = c,
                            r.push({
                                channel: s,
                                displayText: l,
                                teamID: c
                            }))
                        }
                    }
                return r
            }
            ,
            e.prototype.getChannelIDPlaying = function() {
                var e, t;
                return null !== (t = null === (e = this.currentlyPlayingChannel) || void 0 === e ? void 0 : e.channelID) && void 0 !== t ? t : -1
            }
            ,
            e.prototype.playChannel = function(e) {
                var t, n, i, r = this;
                this.stopCurrentChannel();
                var o = null === (t = this.latestAudioPacket) || void 0 === t ? void 0 : t.getChannel(e);
                if (this.currentlyPlayingChannel = o,
                this.uiEngine.refreshAVControls(),
                void 0 !== o) {
                    var a = this.getMediaURLPlaying();
                    if (void 0 !== a)
                        return null !== (n = o.isAudio()) && void 0 !== n && n ? (this.audioPlayer.src = a,
                        this.audioPlayer.onerror = function() {
                            console.log("Failed to play url " + a),
                            r.stopCurrentChannel()
                        }
                        ,
                        void this.audioPlayer.play()) : void (null !== (i = o.isVideo()) && void 0 !== i && i && this.uiEngine.refreshVideo())
                }
            }
            ,
            e.prototype.getMediaURLPlaying = function() {
                if (void 0 !== this.currentlyPlayingChannel) {
                    var e;
                    if (this.currentlyPlayingChannel.isAudio())
                        return void 0 === (e = this.raceconfig.getAudioButtonURL(this.currentlyPlayingChannel.channelID)) && console.log("Can't find url for channel " + this.currentlyPlayingChannel.channelID),
                        e;
                    if (this.currentlyPlayingChannel.isVideo())
                        return void 0 === (e = this.raceconfig.getVideoButtonURL(this.currentlyPlayingChannel.channelID)) && console.log("Can't find url for channel " + this.currentlyPlayingChannel.channelID),
                        e
                }
            }
            ,
            e.prototype.getMediaTypePlaying = function() {
                var e, t, n, i;
                return null !== (t = null === (e = this.currentlyPlayingChannel) || void 0 === e ? void 0 : e.isAudio()) && void 0 !== t && t ? Pt.Audio : null !== (i = null === (n = this.currentlyPlayingChannel) || void 0 === n ? void 0 : n.isVideo()) && void 0 !== i && i ? Pt.Video : Pt.None
            }
            ,
            e.prototype.stopCurrentChannel = function() {
                this.currentlyPlayingChannel = void 0,
                this.uiEngine.refreshAVControls(),
                this.uiEngine.refreshVideo(),
                this.audioPlayer.pause()
            }
            ,
            e.prototype.getRaceData = function(e) {
                var t = this.raceDataLookup.get(e);
                return void 0 === t && (t = new Xt(e),
                this.raceDataLookup.set(e, t)),
                t
            }
            ,
            e.prototype.getCurrentRaceData = function() {
                return this.raceDataLookup.get(this.currentRaceId)
            }
            ,
            e.prototype.readLiveRaceConfigInfo = function(e) {
                var t, n, i, r, o = Object(H.d)(e), a = this.raceconfig.liveEventId, s = this.eventMatchInfo.get(a);
                this.eventName = null !== (n = null === (t = null == s ? void 0 : s.getMatchInfo(o)) || void 0 === t ? void 0 : t.eventName) && void 0 !== n ? n : "Live Event",
                this.raceName = null !== (r = null === (i = null == s ? void 0 : s.getMatchInfo(o)) || void 0 === i ? void 0 : i.raceName) && void 0 !== r ? r : "Race " + Object(H.e)(e)
            }
            ,
            e.prototype.startRaceScene = function(e) {
                mn(this, void 0, void 0, (function() {
                    var t, i, r, o, a, s, l, c, p = this;
                    return yn(this, (function(u) {
                        switch (u.label) {
                        case 0:
                            return t = Promise.all([n.e(0), n.e(5)]).then(n.bind(null, 148)),
                            i = Promise.all([n.e(0), n.e(4), n.e(3)]).then(n.bind(null, 361)),
                            [4, t];
                        case 1:
                            return r = u.sent(),
                            [4, i];
                        case 2:
                            return o = u.sent().RaceScene,
                            clearInterval(this.dbInterval),
                            a = {
                                limitDeviceRatio: 1.5,
                                powerPreference: "high-performance"
                            },
                            (s = new r.Engine(this.renderCanvas,!0,a,!0)).runRenderLoop((function() {
                                p.renderLoop()
                            }
                            )),
                            l = this.uiEngine.getWindowSize(),
                            this.getRaceData(e),
                            void 0 === this.currentRaceScene ? (c = new o(s,this.appconfig,l.width,l.height),
                            this.currentRaceScene = c) : c = this.currentRaceScene,
                            this.sceneLoaded = !1,
                            c.onLoaded = function() {
                                p.sceneLoaded = !0,
                                p.showRaceSceneIfReady()
                            }
                            ,
                            [2]
                        }
                    }
                    ))
                }
                ))
            }
            ,
            e.prototype.showRaceSceneIfReady = function() {
                var e = 0;
                this.dataLoaded && (e += .3333),
                this.sceneLoaded && (e += .3333),
                void 0 !== this.currentRaceScene && (e += .3333),
                this.dataLoaded && this.sceneLoaded && void 0 !== this.currentRaceScene ? (this.raceDataMode === g.Playback ? this.setPlaybackRate(1) : this.raceDataMode === g.Live && this.skipToLatest(),
                i.k && this.devCreateAudioVideoData(),
                this.uiEngine.loadingStatus && (this.uiEngine.showRaceScene(this.renderCanvas, this.currentRaceScene, this, this.raceDataMode),
                this.raceDataMode === g.Playback && (this.graph = new tn(this.getRaceData(this.currentRaceId),this.getRaceData(this.currentRaceId).boats.entries(),this.currentRaceScene,this.appconfig),
                this.graph.initGraph()))) : this.uiEngine.showLoading(e)
            }
            ,
            e.prototype.renderLoop = function() {
                var e, t, n, r, o, a, s, l, c, p, u = this.currentRaceScene, d = this.getCurrentRaceData();
                if (void 0 !== u && void 0 !== d) {
                    if (!this.scrubbing) {
                        void 0 === this.scene_last_updated_ms && (this.scene_last_updated_ms = performance.now());
                        var h = performance.now()
                        , f = (h - this.scene_last_updated_ms) / 1e3
                        , g = this.playbackRate * f;
                        null === (e = this.simTimer) || void 0 === e || e.start(),
                        d.updateSim(g),
                        null === (t = this.simTimer) || void 0 === t || t.stop(),
                        null === (n = this.sceneTimer) || void 0 === n || n.start(),
                        u.updateScene(f, d),
                        null === (r = this.sceneTimer) || void 0 === r || r.stop(),
                        this.scene_last_updated_ms = h
                    }
                    null === (o = this.renderTimer) || void 0 === o || o.start(),
                    u.scene.render(),
                    null === (a = this.renderTimer) || void 0 === a || a.stop(),
                    null === (s = this.uiTimer) || void 0 === s || s.start(),
                    this.uiEngine.getBoatLabelsEnabled() && this.uiEngine.refreshBoatLabels(),
                    this.uiEngine.getDTLOverlayEnabled() && this.uiEngine.refreshDTLOverlay(),
                    this.uiEngine.refreshWindSpeedOverlay(),
                    this.uiEngine.refreshRankings(d.rankings),
                    null === (l = this.uiTimer) || void 0 === l || l.stop(),
                    null === (c = this.framerateTimer) || void 0 === c || c.stop(),
                    i.b && this.uiEngine.setDevOverlayValues(this.framerateTimer, this.renderTimer, this.sceneTimer, this.simTimer, this.uiTimer, u),
                    null === (p = this.framerateTimer) || void 0 === p || p.start(),
                    this.sendDashboardUpdate(d)
                }
            }
            ,
            e.prototype.sendDashboardUpdate = function(e) {
                var t = this
                , n = Date.now();
                if (n - this.lastDashboardSendTime > 500 && e.simTime !== this.lastDashboardSimTime) {
                    this.lastDashboardSendTime = n;
                    var i = e.simTime;
                    this.lastDashboardSimTime = i;
                    var r = {
                        raceStatus: this.getRaceStatusString(),
                        totalLegs: e.getNumLegs(),
                        raceName: this.getRaceName(),
                        raceId: e.raceId,
                        liveRace: this.raceDataMode === g.Live,
                        boatData: e.getBoatData().map((function(e) {
                            var n, r, o = e.boatId, a = e.teamId, s = null !== (r = null === (n = t.currentRaceScene) || void 0 === n ? void 0 : n.getTeamColour(o)) && void 0 !== r ? r : "#FFFFFF", l = e.getDTL(i), c = e.getStatus(i), p = t.getNumLegs(), u = e.getCurrentLeg(i), d = void 0 !== u && u > p, h = t.getBoatStatusString(null != c ? c : 0, d);
                            return "ERR" === h && (h = "-"),
                            {
                                teamId: a,
                                teamColour: s,
                                currentLeg: u,
                                dtl: l,
                                status: h,
                                penalties: e.getPenaltyCount(i),
                                protesting: e.getProtest(i),
                                sog: e.getSpeed(i),
                                vmg: e.getVmg(i),
                                tws: e.getTws(i),
                                twd: e.getTwd(i),
                                heading: e.getHeading(i),
                                pitch: e.getPitch(i),
                                roll: e.getHeel(i),
                                height: e.getElevation(i),
                                portFoilAngle: e.getLeftFoilPosition(i),
                                stbdFoilAngle: e.getRightFoilPosition(i)
                            }
                        }
                        ))
                    };
                    window.parent.postMessage(r, "*")
                }
            }
            ,
            e.prototype.postInMenuMessage = function() {
                window.parent.postMessage({
                    inMenu: !0
                }, "*")
            }
            ,
            e.prototype.devCreateAudioVideoData = function() {
                var e;
                if (i.k) {
                    var t = new o.a;
                    t.teamID = 0,
                    t.buttonID = 0,
                    t.channelID = 255,
                    t.state = o.b.AudioEnabled;
                    var n = new o.a;
                    n.teamID = 0,
                    n.buttonID = 0,
                    n.channelID = 254,
                    n.state = o.b.VideoEnabled;
                    for (var r = [t, n], a = this.getCurrentRaceData(), s = 0, l = null !== (e = null == a ? void 0 : a.getBoatData()) && void 0 !== e ? e : []; s < l.length; s++) {
                        var c = l[s]
                        , p = new o.a;
                        p.teamID = c.teamId,
                        p.buttonID = 0,
                        p.channelID = c.teamId,
                        p.state = o.b.AudioEnabled,
                        r.push(p);
                        var u = new o.a;
                        u.teamID = c.teamId,
                        u.buttonID = 0,
                        u.channelID = 100 + (Object(H.a)(c.boatId) ? 2 : 1),
                        u.state = o.b.VideoEnabled,
                        r.push(u)
                    }
                    r[5].state = o.b.VideoDisabled;
                    var d = new o.c;
                    d.nChannels = r.length,
                    d.channels = r,
                    this.latestAudioPacket = d
                }
            }
            ,
            e
        }();
        n(99);
        r.a({
            dsn: "https://a8f785c19a264324be88a6632ee64bac@o427964.ingest.sentry.io/5372825",
            environment: function(e) {
                if (e.indexOf("localhost") > -1 || e.indexOf("127.0.0.1") > -1)
                    return "development";
                if (e.indexOf("sailingtest.virtualeye.tv") > -1)
                    return "ac_beta";
                if (e.indexOf("cloudfront.net") > -1)
                    return "production";
                return console.log("Warning : can't infer sentry env from " + e + " or nodeEnv production"),
                "unknown"
            }(document.location.href)
        }),
        T.loadFromFile("appconfig.json").then((function(e) {
            var t = e.raceConfigUrl;
            void 0 !== i.j && (t = i.j),
            fn.loadFromFile(t).then((function(t) {
                !function(e, t) {
                    var n = new C
                    , r = new bn(e,t);
                    if (void 0 !== i.h)
                        return void r.playRecordedData("testraces/" + i.h, "Test Event", "Test Race");
                    if (void 0 !== i.g)
                        return n.attachRacingListener(r),
                        n.playRecordedData("testraces/" + i.g, i.f),
                        r.updateStatus(f.Live),
                        void r.playLive(i.f);
                    n.attachLiveStatusListener(r),
                    n.attachRacingListener(r);
                    var o = t.websocketUrl;
                    void 0 !== i.l && (o = i.l);
                    n.connectLive(o),
                    n.playLiveData(),
                    r.loadMenu()
                }(e, t)
            }
            ))
        }
        )),
        window.addEventListener("load", (function e(t) {
            window.removeEventListener(t.type, e, !1);
            var n = document.createElement("canvas");
            document.body.appendChild(n);
            var i = n.getContext("webgl", {
                powerPreference: "high-performance"
            }) || n.getContext("experimental-webgl", {
                powerPreference: "high-performance"
            });
            requestAnimationFrame((function() {
                var e;
                null === (e = i.getExtension("WEBGL_lose_context")) || void 0 === e || e.loseContext(),
                document.body.removeChild(n)
            }
            ))
        }
        ), !1)
    }
    ]);
};
exports.overwriteInitJs = overwriteInitJs;
