function q(t, n) {
    const e = te();
    return (
        (q = function (i, c) {
            return (i = i - 309), e[i];
        }),
        q(t, n)
    );
}
(function (t, n) {
    const e = q,
        i = t();
    for (;;)
        try {
            if (
                -parseInt(e(319)) / 1 +
                    -parseInt(e(324)) / 2 +
                    -parseInt(e(309)) / 3 +
                    parseInt(e(337)) / 4 +
                    parseInt(e(336)) / 5 +
                    (-parseInt(e(333)) / 6) * (parseInt(e(343)) / 7) +
                    (-parseInt(e(326)) / 8) * (-parseInt(e(340)) / 9) ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(te, 505308);
function te() {
    const t = [
        'random',
        '506067NtiDfR',
        'getRandomValues',
        'length',
        'floor',
        'padStart',
        '1482790yWcsMV',
        'No platform Authenticator available on device.',
        '114504HGjufl',
        'Adyen Passkey Test',
        'direct',
        'required',
        'toString',
        'location',
        'platform',
        '1404012VSpVKQ',
        'map',
        'crypto',
        '3283655NfoQva',
        '3414880axnmAp',
        'public-key',
        'replace',
        '603eCJRae',
        'Adyen',
        'subtle',
        '21kNQGse',
        '43938ebDaOa',
        'from',
        'PublicKeyCredential',
        'hostname',
        'preferred',
        'digest',
        'fromCharCode',
        'join',
        'encode'
    ];
    return (
        (te = function () {
            return t;
        }),
        te()
    );
}
const Qe = async () => {
    const t = q;
    if (!window.PublicKeyCredential) throw new Error('Browser does not support WebAuthn.');
    if (!(await window[t(311)].isUserVerifyingPlatformAuthenticatorAvailable())) throw new Error(t(325));
};
async function Ge(t, n) {
    try {
        await Qe();
    } catch (e) {
        return { type: n, message: e.toString() };
    }
    return t();
}
const re = t => {
    const n = q,
        e = t[n(339)](/-/g, '+')[n(339)](/_/g, '/'),
        i = atob(e),
        c = new Uint8Array(i[n(321)]);
    for (let d = 0; d < i[n(321)]; d++) c[d] = i.charCodeAt(d);
    return c;
};
async function Fe(t) {
    const n = q,
        e = new TextEncoder(),
        i = e[n(317)](t),
        c = await crypto[n(342)][n(314)]('SHA-256', i);
    return Array[n(310)](new Uint8Array(c))
        [n(334)](_ => _[n(330)](16)[n(323)](2, '0'))
        [n(316)]('');
}
const Ee = ae;
function ne() {
    const t = [
        '61736eCOdla',
        'Navigator.credentials retrieval error',
        'Navigator.credentials creation error',
        'Error capturing Risk Signals',
        '4092xwtRFc',
        '125IqGpRG',
        '7120146TLseUm',
        '191742WItSAK',
        '10RimdbB',
        '5404077tIhIlq',
        '10eCfIpg',
        '63dwDuKD',
        '1772IKXoiD',
        '101902wKdlbf',
        '17451516bggjbn'
    ];
    return (
        (ne = function () {
            return t;
        }),
        ne()
    );
}
function ae(t, n) {
    const e = ne();
    return (
        (ae = function (i, c) {
            return (i = i - 264), e[i];
        }),
        ae(t, n)
    );
}
(function (t, n) {
    const e = ae,
        i = t();
    for (;;)
        try {
            if (
                (parseInt(e(269)) / 1) * (parseInt(e(272)) / 2) +
                    (-parseInt(e(278)) / 3) * (-parseInt(e(271)) / 4) +
                    (-parseInt(e(264)) / 5) * (parseInt(e(266)) / 6) +
                    (-parseInt(e(270)) / 7) * (parseInt(e(274)) / 8) +
                    -parseInt(e(268)) / 9 +
                    (-parseInt(e(267)) / 10) * (parseInt(e(265)) / 11) +
                    parseInt(e(273)) / 12 ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(ne, 451938);
const N = { CREDENTIAL_CREATION_ERROR: Ee(276), CREDENTIAL_RETRIEVAL_ERROR: Ee(275), RISK_SIGNALS_ERROR: Ee(277) };
(function (t, n) {
    const e = V,
        i = t();
    for (;;)
        try {
            if (
                parseInt(e(293)) / 1 +
                    (parseInt(e(296)) / 2) * (parseInt(e(298)) / 3) +
                    -parseInt(e(295)) / 4 +
                    (-parseInt(e(291)) / 5) * (parseInt(e(290)) / 6) +
                    (-parseInt(e(300)) / 7) * (parseInt(e(301)) / 8) +
                    -parseInt(e(297)) / 9 +
                    parseInt(e(292)) / 10 ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(oe, 803885);
function V(t, n) {
    const e = oe();
    return (
        (V = function (i, c) {
            return (i = i - 289), e[i];
        }),
        V(t, n)
    );
}
const Je = async t => {
    const n = V;
    try {
        const e = $e(t);
        return await navigator[n(302)][n(299)]({ publicKey: e });
    } catch (e) {
        return { type: N.CREDENTIAL_RETRIEVAL_ERROR, message: e[n(289)]() };
    }
};
function oe() {
    const t = [
        '12745thlfae',
        '15248860tlIfcg',
        '474676mNkvuT',
        'public-key',
        '1027500JMAubC',
        '4pfsyNt',
        '1569249JLgXLF',
        '1074771AMkdIO',
        'get',
        '7gtfZdC',
        '6831208fofTXS',
        'credentials',
        'internal',
        'toString',
        '1476bzlksf'
    ];
    return (
        (oe = function () {
            return t;
        }),
        oe()
    );
}
const $e = t => {
    const { challenge: n, allowCredentials: e, rpId: i, timeout: c } = t,
        d = re(n);
    let _ = [];
    if (
        (e &&
            (_ = e.map(v => {
                const k = V;
                return { id: re(v.id), type: k(294), transports: [k(303)] };
            })),
        i && d)
    )
        return { challenge: d, allowCredentials: _, rpId: i, timeout: c };
    throw new Error('Could not convert PublicKeyCredentialRequestOptionsDTO into required webAuthn type: PublicKeyCredentialRequestOptions.');
};
(function (t, n) {
    const e = se,
        i = t();
    for (;;)
        try {
            if (
                parseInt(e(405)) / 1 +
                    parseInt(e(395)) / 2 +
                    -parseInt(e(404)) / 3 +
                    (-parseInt(e(400)) / 4) * (-parseInt(e(410)) / 5) +
                    (parseInt(e(409)) / 6) * (-parseInt(e(413)) / 7) +
                    (parseInt(e(401)) / 8) * (-parseInt(e(408)) / 9) +
                    parseInt(e(412)) / 10 ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(xe, 264857);
const ei = { deviceID: 0.55, osVersion: 0.2, userTimeZoneOffset: 0.1, language: 0.1, screenDimensions: 0.05 },
    ii = { deviceID: 0.55, osVersion: 0.15, userTimeZoneOffset: 0.1, language: 0.05, screenDimensions: 0.15 },
    ti = (t, n) => {
        const e = se;
        let i = 0,
            c = [],
            d = ei;
        return (
            t[e(398)] && (d = ii),
            (i += d[e(407)]),
            Array[e(397)](Object[e(402)](n))[e(411)](_ => {
                const v = e;
                JSON.stringify(n[_]) === JSON.stringify(t[_]) ? (i += d[_]) : c[v(406)]('Stored ' + _ + v(403) + _ + v(399));
            }),
            { score: parseFloat(i[e(396)](2)), errors: c }
        );
    };
function se(t, n) {
    const e = xe();
    return (
        (se = function (i, c) {
            return (i = i - 395), e[i];
        }),
        se(t, n)
    );
}
function xe() {
    const t = [
        'forEach',
        '10567950baiXLu',
        '1131221vzAuvl',
        '725536maVKHA',
        'toFixed',
        'from',
        'isMobile',
        ' signal.',
        '248NtqUTo',
        '1407224RQFlpp',
        'keys',
        ' signal does not match generated ',
        '1095222MFkpzG',
        '124430NWLZhy',
        'push',
        'deviceID',
        '27PnrUHy',
        '18oTulYP',
        '7940BlhhrF'
    ];
    return (
        (xe = function () {
            return t;
        }),
        xe()
    );
}
var Se = be;
(function (t, n) {
    for (var e = be, i = t(); ; )
        try {
            var c =
                parseInt(e(206)) / 1 +
                -parseInt(e(218)) / 2 +
                parseInt(e(213)) / 3 +
                (-parseInt(e(212)) / 4) * (parseInt(e(207)) / 5) +
                (-parseInt(e(215)) / 6) * (parseInt(e(200)) / 7) +
                -parseInt(e(201)) / 8 +
                parseInt(e(204)) / 9;
            if (c === n) break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(ce, 985573);
typeof globalThis !== Se(214) || typeof window !== Se(214) || (typeof global !== Se(214) ? global : typeof self < 'u');
function ce() {
    var t = [
        '31785552hgLCFD',
        'hasOwnProperty',
        '419632fzgzGy',
        '1715eSVCTT',
        'function',
        'length',
        'prototype',
        'call',
        '15324nCEwsI',
        '2260842NSKxyS',
        'undefined',
        '3761238BOCVYI',
        'get',
        'defineProperty',
        '2316004bvDpTn',
        'forEach',
        'keys',
        'apply',
        'default',
        '__esModule',
        'getOwnPropertyDescriptor',
        '7JsppmU',
        '4963944Yfcnzv',
        'construct',
        'constructor'
    ];
    return (
        (ce = function () {
            return t;
        }),
        ce()
    );
}
function be(t, n) {
    var e = ce();
    return (
        (be = function (i, c) {
            i = i - 195;
            var d = e[i];
            return d;
        }),
        be(t, n)
    );
}
var G = { exports: {} },
    ri = G.exports,
    Ve;
function ni() {
    return (
        Ve ||
            ((Ve = 1),
            (function (t, n) {
                (function (e, i) {
                    var c = '1.0.40',
                        d = '',
                        _ = '?',
                        v = 'function',
                        k = 'undefined',
                        C = 'object',
                        T = 'string',
                        Oe = 'major',
                        a = 'model',
                        s = 'name',
                        r = 'type',
                        o = 'vendor',
                        x = 'version',
                        I = 'architecture',
                        M = 'console',
                        l = 'mobile',
                        p = 'tablet',
                        g = 'smarttv',
                        R = 'wearable',
                        he = 'embedded',
                        me = 500,
                        Y = 'Amazon',
                        U = 'Apple',
                        Ae = 'ASUS',
                        Te = 'BlackBerry',
                        X = 'Browser',
                        Z = 'Chrome',
                        je = 'Edge',
                        Q = 'Firefox',
                        z = 'Google',
                        Ne = 'Huawei',
                        _e = 'LG',
                        ge = 'Microsoft',
                        Ce = 'Motorola',
                        B = 'Opera',
                        K = 'Samsung',
                        De = 'Sharp',
                        J = 'Sony',
                        ve = 'Xiaomi',
                        Ie = 'Zebra',
                        Pe = 'Facebook',
                        qe = 'Chromium OS',
                        Me = 'Mac OS',
                        Ue = ' Browser',
                        Ye = function (w, f) {
                            var u = {};
                            for (var m in w) f[m] && f[m].length % 2 === 0 ? (u[m] = f[m].concat(w[m])) : (u[m] = w[m]);
                            return u;
                        },
                        $ = function (w) {
                            for (var f = {}, u = 0; u < w.length; u++) f[w[u].toUpperCase()] = w[u];
                            return f;
                        },
                        ze = function (w, f) {
                            return typeof w === T ? D(f).indexOf(D(w)) !== -1 : !1;
                        },
                        D = function (w) {
                            return w.toLowerCase();
                        },
                        Xe = function (w) {
                            return typeof w === T ? w.replace(/[^\d\.]/g, d).split('.')[0] : i;
                        },
                        ye = function (w, f) {
                            if (typeof w === T) return (w = w.replace(/^\s\s*/, d)), typeof f === k ? w : w.substring(0, me);
                        },
                        L = function (w, f) {
                            for (var u = 0, m, O, E, h, b, S; u < f.length && !b; ) {
                                var ke = f[u],
                                    Le = f[u + 1];
                                for (m = O = 0; m < ke.length && !b && ke[m]; )
                                    if (((b = ke[m++].exec(w)), b))
                                        for (E = 0; E < Le.length; E++)
                                            (S = b[++O]),
                                                (h = Le[E]),
                                                typeof h === C && h.length > 0
                                                    ? h.length === 2
                                                        ? typeof h[1] == v
                                                            ? (this[h[0]] = h[1].call(this, S))
                                                            : (this[h[0]] = h[1])
                                                        : h.length === 3
                                                          ? typeof h[1] === v && !(h[1].exec && h[1].test)
                                                              ? (this[h[0]] = S ? h[1].call(this, S, h[2]) : i)
                                                              : (this[h[0]] = S ? S.replace(h[1], h[2]) : i)
                                                          : h.length === 4 && (this[h[0]] = S ? h[3].call(this, S.replace(h[1], h[2])) : i)
                                                    : (this[h] = S || i);
                                u += 2;
                            }
                        },
                        ee = function (w, f) {
                            for (var u in f)
                                if (typeof f[u] === C && f[u].length > 0) {
                                    for (var m = 0; m < f[u].length; m++) if (ze(f[u][m], w)) return u === _ ? i : u;
                                } else if (ze(f[u], w)) return u === _ ? i : u;
                            return f.hasOwnProperty('*') ? f['*'] : w;
                        },
                        Ze = {
                            '1.0': '/8',
                            1.2: '/1',
                            1.3: '/3',
                            '2.0': '/412',
                            '2.0.2': '/416',
                            '2.0.3': '/417',
                            '2.0.4': '/419',
                            '?': '/'
                        },
                        Be = {
                            ME: '4.90',
                            'NT 3.11': 'NT3.51',
                            'NT 4.0': 'NT4.0',
                            2e3: 'NT 5.0',
                            XP: ['NT 5.1', 'NT 5.2'],
                            Vista: 'NT 6.0',
                            7: 'NT 6.1',
                            8: 'NT 6.2',
                            8.1: 'NT 6.3',
                            10: ['NT 6.4', 'NT 10.0'],
                            RT: 'ARM'
                        },
                        Ke = {
                            browser: [
                                [
                                    /\b(?:crmo|crios)\/([\w\.]+)/i
                                    // Chrome for Android/iOS
                                ],
                                [x, [s, 'Chrome']],
                                [
                                    /edg(?:e|ios|a)?\/([\w\.]+)/i
                                    // Microsoft Edge
                                ],
                                [x, [s, 'Edge']],
                                [
                                    // Presto based
                                    /(opera mini)\/([-\w\.]+)/i,
                                    // Opera Mini
                                    /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
                                    // Opera Mobi/Tablet
                                    /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i
                                    // Opera
                                ],
                                [s, x],
                                [
                                    /opios[\/ ]+([\w\.]+)/i
                                    // Opera mini on iphone >= 8.0
                                ],
                                [x, [s, B + ' Mini']],
                                [
                                    /\bop(?:rg)?x\/([\w\.]+)/i
                                    // Opera GX
                                ],
                                [x, [s, B + ' GX']],
                                [
                                    /\bopr\/([\w\.]+)/i
                                    // Opera Webkit
                                ],
                                [x, [s, B]],
                                [
                                    // Mixed
                                    /\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i
                                    // Baidu
                                ],
                                [x, [s, 'Baidu']],
                                [
                                    /\b(?:mxbrowser|mxios|myie2)\/?([-\w\.]*)\b/i
                                    // Maxthon
                                ],
                                [x, [s, 'Maxthon']],
                                [
                                    /(kindle)\/([\w\.]+)/i,
                                    // Kindle
                                    /(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,
                                    // Lunascape/Maxthon/Netfront/Jasmine/Blazer/Sleipnir
                                    // Trident based
                                    /(avant|iemobile|slim(?:browser|boat|jet))[\/ ]?([\d\.]*)/i,
                                    // Avant/IEMobile/SlimBrowser/SlimBoat/Slimjet
                                    /(?:ms|\()(ie) ([\w\.]+)/i,
                                    // Internet Explorer
                                    // Blink/Webkit/KHTML based                                         // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
                                    /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio|(?=comodo_)?dragon)\/([-\w\.]+)/i,
                                    // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ//Vivaldi/DuckDuckGo/Klar/Helio/Dragon
                                    /(heytap|ovi|115)browser\/([\d\.]+)/i,
                                    // HeyTap/Ovi/115
                                    /(weibo)__([\d\.]+)/i
                                    // Weibo
                                ],
                                [s, x],
                                [
                                    /quark(?:pc)?\/([-\w\.]+)/i
                                    // Quark
                                ],
                                [x, [s, 'Quark']],
                                [
                                    /\bddg\/([\w\.]+)/i
                                    // DuckDuckGo
                                ],
                                [x, [s, 'DuckDuckGo']],
                                [
                                    /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i
                                    // UCBrowser
                                ],
                                [x, [s, 'UC' + X]],
                                [
                                    /microm.+\bqbcore\/([\w\.]+)/i,
                                    // WeChat Desktop for Windows Built-in Browser
                                    /\bqbcore\/([\w\.]+).+microm/i,
                                    /micromessenger\/([\w\.]+)/i
                                    // WeChat
                                ],
                                [x, [s, 'WeChat']],
                                [
                                    /konqueror\/([\w\.]+)/i
                                    // Konqueror
                                ],
                                [x, [s, 'Konqueror']],
                                [
                                    /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i
                                    // IE11
                                ],
                                [x, [s, 'IE']],
                                [
                                    /ya(?:search)?browser\/([\w\.]+)/i
                                    // Yandex
                                ],
                                [x, [s, 'Yandex']],
                                [
                                    /slbrowser\/([\w\.]+)/i
                                    // Smart Lenovo Browser
                                ],
                                [x, [s, 'Smart Lenovo ' + X]],
                                [
                                    /(avast|avg)\/([\w\.]+)/i
                                    // Avast/AVG Secure Browser
                                ],
                                [[s, /(.+)/, '$1 Secure ' + X], x],
                                [
                                    /\bfocus\/([\w\.]+)/i
                                    // Firefox Focus
                                ],
                                [x, [s, Q + ' Focus']],
                                [
                                    /\bopt\/([\w\.]+)/i
                                    // Opera Touch
                                ],
                                [x, [s, B + ' Touch']],
                                [
                                    /coc_coc\w+\/([\w\.]+)/i
                                    // Coc Coc Browser
                                ],
                                [x, [s, 'Coc Coc']],
                                [
                                    /dolfin\/([\w\.]+)/i
                                    // Dolphin
                                ],
                                [x, [s, 'Dolphin']],
                                [
                                    /coast\/([\w\.]+)/i
                                    // Opera Coast
                                ],
                                [x, [s, B + ' Coast']],
                                [
                                    /miuibrowser\/([\w\.]+)/i
                                    // MIUI Browser
                                ],
                                [x, [s, 'MIUI' + Ue]],
                                [
                                    /fxios\/([\w\.-]+)/i
                                    // Firefox for iOS
                                ],
                                [x, [s, Q]],
                                [
                                    /\bqihoobrowser\/?([\w\.]*)/i
                                    // 360
                                ],
                                [x, [s, '360']],
                                [
                                    /\b(qq)\/([\w\.]+)/i
                                    // QQ
                                ],
                                [[s, /(.+)/, '$1Browser'], x],
                                [/(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i],
                                [[s, /(.+)/, '$1' + Ue], x],
                                [
                                    // Oculus/Sailfish/HuaweiBrowser/VivoBrowser/PicoBrowser
                                    /samsungbrowser\/([\w\.]+)/i
                                    // Samsung Internet
                                ],
                                [x, [s, K + ' Internet']],
                                [
                                    /metasr[\/ ]?([\d\.]+)/i
                                    // Sogou Explorer
                                ],
                                [x, [s, 'Sogou Explorer']],
                                [
                                    /(sogou)mo\w+\/([\d\.]+)/i
                                    // Sogou Mobile
                                ],
                                [[s, 'Sogou Mobile'], x],
                                [
                                    /(electron)\/([\w\.]+) safari/i,
                                    // Electron-based App
                                    /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
                                    // Tesla
                                    /m?(qqbrowser|2345(?=browser|chrome|explorer))\w*[\/ ]?v?([\w\.]+)/i
                                    // QQ/2345
                                ],
                                [s, x],
                                [
                                    /(lbbrowser|rekonq)/i,
                                    // LieBao Browser/Rekonq
                                    /\[(linkedin)app\]/i
                                    // LinkedIn App for iOS & Android
                                ],
                                [s],
                                [
                                    /ome\/([\w\.]+) \w* ?(iron) saf/i,
                                    // Iron
                                    /ome\/([\w\.]+).+qihu (360)[es]e/i
                                    // 360
                                ],
                                [x, s],
                                [
                                    // WebView
                                    /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i
                                    // Facebook App for iOS & Android
                                ],
                                [[s, Pe], x],
                                [
                                    /(Klarna)\/([\w\.]+)/i,
                                    // Klarna Shopping Browser for iOS & Android
                                    /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
                                    // Kakao App
                                    /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
                                    // Naver InApp
                                    /safari (line)\/([\w\.]+)/i,
                                    // Line App for iOS
                                    /\b(line)\/([\w\.]+)\/iab/i,
                                    // Line App for Android
                                    /(alipay)client\/([\w\.]+)/i,
                                    // Alipay
                                    /(twitter)(?:and| f.+e\/([\w\.]+))/i,
                                    // Twitter
                                    /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i
                                    // Chromium/Instagram/Snapchat
                                ],
                                [s, x],
                                [
                                    /\bgsa\/([\w\.]+) .*safari\//i
                                    // Google Search Appliance on iOS
                                ],
                                [x, [s, 'GSA']],
                                [
                                    /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i
                                    // TikTok
                                ],
                                [x, [s, 'TikTok']],
                                [
                                    /headlesschrome(?:\/([\w\.]+)| )/i
                                    // Chrome Headless
                                ],
                                [x, [s, Z + ' Headless']],
                                [
                                    / wv\).+(chrome)\/([\w\.]+)/i
                                    // Chrome WebView
                                ],
                                [[s, Z + ' WebView'], x],
                                [
                                    /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i
                                    // Android Browser
                                ],
                                [x, [s, 'Android ' + X]],
                                [
                                    /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i
                                    // Chrome/OmniWeb/Arora/Tizen/Nokia
                                ],
                                [s, x],
                                [
                                    /version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i
                                    // Mobile Safari
                                ],
                                [x, [s, 'Mobile Safari']],
                                [
                                    /version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i
                                    // Safari & Safari Mobile
                                ],
                                [x, s],
                                [
                                    /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i
                                    // Safari < 3.0
                                ],
                                [s, [x, ee, Ze]],
                                [/(webkit|khtml)\/([\w\.]+)/i],
                                [s, x],
                                [
                                    // Gecko based
                                    /(navigator|netscape\d?)\/([-\w\.]+)/i
                                    // Netscape
                                ],
                                [[s, 'Netscape'], x],
                                [
                                    /(wolvic|librewolf)\/([\w\.]+)/i
                                    // Wolvic/LibreWolf
                                ],
                                [s, x],
                                [
                                    /mobile vr; rv:([\w\.]+)\).+firefox/i
                                    // Firefox Reality
                                ],
                                [x, [s, Q + ' Reality']],
                                [
                                    /ekiohf.+(flow)\/([\w\.]+)/i,
                                    // Flow
                                    /(swiftfox)/i,
                                    // Swiftfox
                                    /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,
                                    // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
                                    /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
                                    // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
                                    /(firefox)\/([\w\.]+)/i,
                                    // Other Firefox-based
                                    /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
                                    // Mozilla
                                    // Other
                                    /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
                                    // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Obigo/Mosaic/Go/ICE/UP.Browser
                                    /(links) \(([\w\.]+)/i
                                    // Links
                                ],
                                [s, [x, /_/g, '.']],
                                [
                                    /(cobalt)\/([\w\.]+)/i
                                    // Cobalt
                                ],
                                [s, [x, /master.|lts./, '']]
                            ],
                            cpu: [
                                [
                                    /(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i
                                    // AMD64 (x64)
                                ],
                                [[I, 'amd64']],
                                [
                                    /(ia32(?=;))/i
                                    // IA32 (quicktime)
                                ],
                                [[I, D]],
                                [
                                    /((?:i[346]|x)86)[;\)]/i
                                    // IA32 (x86)
                                ],
                                [[I, 'ia32']],
                                [
                                    /\b(aarch64|arm(v?8e?l?|_?64))\b/i
                                    // ARM64
                                ],
                                [[I, 'arm64']],
                                [
                                    /\b(arm(?:v[67])?ht?n?[fl]p?)\b/i
                                    // ARMHF
                                ],
                                [[I, 'armhf']],
                                [
                                    // PocketPC mistakenly identified as PowerPC
                                    /windows (ce|mobile); ppc;/i
                                ],
                                [[I, 'arm']],
                                [
                                    /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i
                                    // PowerPC
                                ],
                                [[I, /ower/, d, D]],
                                [
                                    /(sun4\w)[;\)]/i
                                    // SPARC
                                ],
                                [[I, 'sparc']],
                                [
                                    /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
                                    // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
                                ],
                                [[I, D]]
                            ],
                            device: [
                                [
                                    //////////////////////////
                                    // MOBILES & TABLETS
                                    /////////////////////////
                                    // Samsung
                                    /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
                                ],
                                [a, [o, K], [r, p]],
                                [
                                    /\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
                                    /samsung[- ]((?!sm-[lr])[-\w]+)/i,
                                    /sec-(sgh\w+)/i
                                ],
                                [a, [o, K], [r, l]],
                                [
                                    // Apple
                                    /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i
                                    // iPod/iPhone
                                ],
                                [a, [o, U], [r, l]],
                                [
                                    /\((ipad);[-\w\),; ]+apple/i,
                                    // iPad
                                    /applecoremedia\/[\w\.]+ \((ipad)/i,
                                    /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
                                ],
                                [a, [o, U], [r, p]],
                                [/(macintosh);/i],
                                [a, [o, U]],
                                [
                                    // Sharp
                                    /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
                                ],
                                [a, [o, De], [r, l]],
                                [
                                    // Honor
                                    /(?:honor)([-\w ]+)[;\)]/i
                                ],
                                [a, [o, 'Honor'], [r, l]],
                                [
                                    // Huawei
                                    /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
                                ],
                                [a, [o, Ne], [r, p]],
                                [/(?:huawei)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i],
                                [a, [o, Ne], [r, l]],
                                [
                                    // Xiaomi
                                    /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
                                    // Xiaomi POCO
                                    /\b; (\w+) build\/hm\1/i,
                                    // Xiaomi Hongmi 'numeric' models
                                    /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
                                    // Xiaomi Hongmi
                                    /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
                                    // Xiaomi Redmi
                                    /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,
                                    // Xiaomi Redmi 'numeric' models
                                    /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i
                                    // Xiaomi Mi
                                ],
                                [
                                    [a, /_/g, ' '],
                                    [o, ve],
                                    [r, l]
                                ],
                                [
                                    /oid[^\)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i,
                                    // Redmi Pad
                                    /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i
                                    // Mi Pad tablets
                                ],
                                [
                                    [a, /_/g, ' '],
                                    [o, ve],
                                    [r, p]
                                ],
                                [
                                    // OPPO
                                    /; (\w+) bui.+ oppo/i,
                                    /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
                                ],
                                [a, [o, 'OPPO'], [r, l]],
                                [/\b(opd2\d{3}a?) bui/i],
                                [a, [o, 'OPPO'], [r, p]],
                                [
                                    // Vivo
                                    /vivo (\w+)(?: bui|\))/i,
                                    /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
                                ],
                                [a, [o, 'Vivo'], [r, l]],
                                [
                                    // Realme
                                    /\b(rmx[1-3]\d{3})(?: bui|;|\))/i
                                ],
                                [a, [o, 'Realme'], [r, l]],
                                [
                                    // Motorola
                                    /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
                                    /\bmot(?:orola)?[- ](\w*)/i,
                                    /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
                                ],
                                [a, [o, Ce], [r, l]],
                                [/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
                                [a, [o, Ce], [r, p]],
                                [
                                    // LG
                                    /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
                                ],
                                [a, [o, _e], [r, p]],
                                [
                                    /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
                                    /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
                                    /\blg-?([\d\w]+) bui/i
                                ],
                                [a, [o, _e], [r, l]],
                                [
                                    // Lenovo
                                    /(ideatab[-\w ]+)/i,
                                    /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
                                ],
                                [a, [o, 'Lenovo'], [r, p]],
                                [
                                    // Nokia
                                    /(?:maemo|nokia).*(n900|lumia \d+)/i,
                                    /nokia[-_ ]?([-\w\.]*)/i
                                ],
                                [
                                    [a, /_/g, ' '],
                                    [o, 'Nokia'],
                                    [r, l]
                                ],
                                [
                                    // Google
                                    /(pixel c)\b/i
                                    // Google Pixel C
                                ],
                                [a, [o, z], [r, p]],
                                [
                                    /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i
                                    // Google Pixel
                                ],
                                [a, [o, z], [r, l]],
                                [
                                    // Sony
                                    /droid.+; (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
                                ],
                                [a, [o, J], [r, l]],
                                [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
                                [
                                    [a, 'Xperia Tablet'],
                                    [o, J],
                                    [r, p]
                                ],
                                [
                                    // OnePlus
                                    / (kb2005|in20[12]5|be20[12][59])\b/i,
                                    /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
                                ],
                                [a, [o, 'OnePlus'], [r, l]],
                                [
                                    // Amazon
                                    /(alexa)webm/i,
                                    /(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,
                                    // Kindle Fire without Silk / Echo Show
                                    /(kf[a-z]+)( bui|\)).+silk\//i
                                    // Kindle Fire HD
                                ],
                                [a, [o, Y], [r, p]],
                                [
                                    /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i
                                    // Fire Phone
                                ],
                                [
                                    [a, /(.+)/g, 'Fire Phone $1'],
                                    [o, Y],
                                    [r, l]
                                ],
                                [
                                    // BlackBerry
                                    /(playbook);[-\w\),; ]+(rim)/i
                                    // BlackBerry PlayBook
                                ],
                                [a, o, [r, p]],
                                [
                                    /\b((?:bb[a-f]|st[hv])100-\d)/i,
                                    /\(bb10; (\w+)/i
                                    // BlackBerry 10
                                ],
                                [a, [o, Te], [r, l]],
                                [
                                    // Asus
                                    /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
                                ],
                                [a, [o, Ae], [r, p]],
                                [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
                                [a, [o, Ae], [r, l]],
                                [
                                    // HTC
                                    /(nexus 9)/i
                                    // HTC Nexus 9
                                ],
                                [a, [o, 'HTC'], [r, p]],
                                [
                                    /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
                                    // HTC
                                    // ZTE
                                    /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
                                    /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i
                                    // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
                                ],
                                [o, [a, /_/g, ' '], [r, l]],
                                [
                                    // TCL
                                    /droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i
                                ],
                                [a, [o, 'TCL'], [r, p]],
                                [
                                    // itel
                                    /(itel) ((\w+))/i
                                ],
                                [[o, D], a, [r, ee, { tablet: ['p10001l', 'w7001'], '*': 'mobile' }]],
                                [
                                    // Acer
                                    /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
                                ],
                                [a, [o, 'Acer'], [r, p]],
                                [
                                    // Meizu
                                    /droid.+; (m[1-5] note) bui/i,
                                    /\bmz-([-\w]{2,})/i
                                ],
                                [a, [o, 'Meizu'], [r, l]],
                                [
                                    // Ulefone
                                    /; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i
                                ],
                                [a, [o, 'Ulefone'], [r, l]],
                                [
                                    // Energizer
                                    /; (energy ?\w+)(?: bui|\))/i,
                                    /; energizer ([\w ]+)(?: bui|\))/i
                                ],
                                [a, [o, 'Energizer'], [r, l]],
                                [
                                    // Cat
                                    /; cat (b35);/i,
                                    /; (b15q?|s22 flip|s48c|s62 pro)(?: bui|\))/i
                                ],
                                [a, [o, 'Cat'], [r, l]],
                                [
                                    // Smartfren
                                    /((?:new )?andromax[\w- ]+)(?: bui|\))/i
                                ],
                                [a, [o, 'Smartfren'], [r, l]],
                                [
                                    // Nothing
                                    /droid.+; (a(?:015|06[35]|142p?))/i
                                ],
                                [a, [o, 'Nothing'], [r, l]],
                                [
                                    // MIXED
                                    /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno|micromax|advan)[-_ ]?([-\w]*)/i,
                                    // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron/Infinix/Tecno/Micromax/Advan
                                    /; (imo) ((?!tab)[\w ]+?)(?: bui|\))/i,
                                    // IMO
                                    /(hp) ([\w ]+\w)/i,
                                    // HP iPAQ
                                    /(asus)-?(\w+)/i,
                                    // Asus
                                    /(microsoft); (lumia[\w ]+)/i,
                                    // Microsoft Lumia
                                    /(lenovo)[-_ ]?([-\w]+)/i,
                                    // Lenovo
                                    /(jolla)/i,
                                    // Jolla
                                    /(oppo) ?([\w ]+) bui/i
                                    // OPPO
                                ],
                                [o, a, [r, l]],
                                [
                                    /(imo) (tab \w+)/i,
                                    // IMO
                                    /(kobo)\s(ereader|touch)/i,
                                    // Kobo
                                    /(archos) (gamepad2?)/i,
                                    // Archos
                                    /(hp).+(touchpad(?!.+tablet)|tablet)/i,
                                    // HP TouchPad
                                    /(kindle)\/([\w\.]+)/i,
                                    // Kindle
                                    /(nook)[\w ]+build\/(\w+)/i,
                                    // Nook
                                    /(dell) (strea[kpr\d ]*[\dko])/i,
                                    // Dell Streak
                                    /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
                                    // Le Pan Tablets
                                    /(trinity)[- ]*(t\d{3}) bui/i,
                                    // Trinity Tablets
                                    /(gigaset)[- ]+(q\w{1,9}) bui/i,
                                    // Gigaset Tablets
                                    /(vodafone) ([\w ]+)(?:\)| bui)/i
                                    // Vodafone
                                ],
                                [o, a, [r, p]],
                                [
                                    /(surface duo)/i
                                    // Surface Duo
                                ],
                                [a, [o, ge], [r, p]],
                                [
                                    /droid [\d\.]+; (fp\du?)(?: b|\))/i
                                    // Fairphone
                                ],
                                [a, [o, 'Fairphone'], [r, l]],
                                [
                                    /(u304aa)/i
                                    // AT&T
                                ],
                                [a, [o, 'AT&T'], [r, l]],
                                [
                                    /\bsie-(\w*)/i
                                    // Siemens
                                ],
                                [a, [o, 'Siemens'], [r, l]],
                                [
                                    /\b(rct\w+) b/i
                                    // RCA Tablets
                                ],
                                [a, [o, 'RCA'], [r, p]],
                                [
                                    /\b(venue[\d ]{2,7}) b/i
                                    // Dell Venue Tablets
                                ],
                                [a, [o, 'Dell'], [r, p]],
                                [
                                    /\b(q(?:mv|ta)\w+) b/i
                                    // Verizon Tablet
                                ],
                                [a, [o, 'Verizon'], [r, p]],
                                [
                                    /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i
                                    // Barnes & Noble Tablet
                                ],
                                [a, [o, 'Barnes & Noble'], [r, p]],
                                [/\b(tm\d{3}\w+) b/i],
                                [a, [o, 'NuVision'], [r, p]],
                                [
                                    /\b(k88) b/i
                                    // ZTE K Series Tablet
                                ],
                                [a, [o, 'ZTE'], [r, p]],
                                [
                                    /\b(nx\d{3}j) b/i
                                    // ZTE Nubia
                                ],
                                [a, [o, 'ZTE'], [r, l]],
                                [
                                    /\b(gen\d{3}) b.+49h/i
                                    // Swiss GEN Mobile
                                ],
                                [a, [o, 'Swiss'], [r, l]],
                                [
                                    /\b(zur\d{3}) b/i
                                    // Swiss ZUR Tablet
                                ],
                                [a, [o, 'Swiss'], [r, p]],
                                [
                                    /\b((zeki)?tb.*\b) b/i
                                    // Zeki Tablets
                                ],
                                [a, [o, 'Zeki'], [r, p]],
                                [
                                    /\b([yr]\d{2}) b/i,
                                    /\b(dragon[- ]+touch |dt)(\w{5}) b/i
                                    // Dragon Touch Tablet
                                ],
                                [[o, 'Dragon Touch'], a, [r, p]],
                                [
                                    /\b(ns-?\w{0,9}) b/i
                                    // Insignia Tablets
                                ],
                                [a, [o, 'Insignia'], [r, p]],
                                [
                                    /\b((nxa|next)-?\w{0,9}) b/i
                                    // NextBook Tablets
                                ],
                                [a, [o, 'NextBook'], [r, p]],
                                [
                                    /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i
                                    // Voice Xtreme Phones
                                ],
                                [[o, 'Voice'], a, [r, l]],
                                [
                                    /\b(lvtel\-)?(v1[12]) b/i
                                    // LvTel Phones
                                ],
                                [[o, 'LvTel'], a, [r, l]],
                                [
                                    /\b(ph-1) /i
                                    // Essential PH-1
                                ],
                                [a, [o, 'Essential'], [r, l]],
                                [
                                    /\b(v(100md|700na|7011|917g).*\b) b/i
                                    // Envizen Tablets
                                ],
                                [a, [o, 'Envizen'], [r, p]],
                                [
                                    /\b(trio[-\w\. ]+) b/i
                                    // MachSpeed Tablets
                                ],
                                [a, [o, 'MachSpeed'], [r, p]],
                                [
                                    /\btu_(1491) b/i
                                    // Rotor Tablets
                                ],
                                [a, [o, 'Rotor'], [r, p]],
                                [
                                    /(shield[\w ]+) b/i
                                    // Nvidia Shield Tablets
                                ],
                                [a, [o, 'Nvidia'], [r, p]],
                                [
                                    /(sprint) (\w+)/i
                                    // Sprint Phones
                                ],
                                [o, a, [r, l]],
                                [
                                    /(kin\.[onetw]{3})/i
                                    // Microsoft Kin
                                ],
                                [
                                    [a, /\./g, ' '],
                                    [o, ge],
                                    [r, l]
                                ],
                                [
                                    /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i
                                    // Zebra
                                ],
                                [a, [o, Ie], [r, p]],
                                [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
                                [a, [o, Ie], [r, l]],
                                [
                                    ///////////////////
                                    // SMARTTVS
                                    ///////////////////
                                    /smart-tv.+(samsung)/i
                                    // Samsung
                                ],
                                [o, [r, g]],
                                [/hbbtv.+maple;(\d+)/i],
                                [
                                    [a, /^/, 'SmartTV'],
                                    [o, K],
                                    [r, g]
                                ],
                                [
                                    /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i
                                    // LG SmartTV
                                ],
                                [
                                    [o, _e],
                                    [r, g]
                                ],
                                [
                                    /(apple) ?tv/i
                                    // Apple TV
                                ],
                                [o, [a, U + ' TV'], [r, g]],
                                [
                                    /crkey/i
                                    // Google Chromecast
                                ],
                                [
                                    [a, Z + 'cast'],
                                    [o, z],
                                    [r, g]
                                ],
                                [
                                    /droid.+aft(\w+)( bui|\))/i
                                    // Fire TV
                                ],
                                [a, [o, Y], [r, g]],
                                [
                                    /\(dtv[\);].+(aquos)/i,
                                    /(aquos-tv[\w ]+)\)/i
                                    // Sharp
                                ],
                                [a, [o, De], [r, g]],
                                [
                                    /(bravia[\w ]+)( bui|\))/i
                                    // Sony
                                ],
                                [a, [o, J], [r, g]],
                                [
                                    /(mitv-\w{5}) bui/i
                                    // Xiaomi
                                ],
                                [a, [o, ve], [r, g]],
                                [
                                    /Hbbtv.*(technisat) (.*);/i
                                    // TechniSAT
                                ],
                                [o, a, [r, g]],
                                [
                                    /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
                                    // Roku
                                    /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i
                                    // HbbTV devices
                                ],
                                [
                                    [o, ye],
                                    [a, ye],
                                    [r, g]
                                ],
                                [
                                    /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i
                                    // SmartTV from Unidentified Vendors
                                ],
                                [[r, g]],
                                [
                                    ///////////////////
                                    // CONSOLES
                                    ///////////////////
                                    /(ouya)/i,
                                    // Ouya
                                    /(nintendo) ([wids3utch]+)/i
                                    // Nintendo
                                ],
                                [o, a, [r, M]],
                                [
                                    /droid.+; (shield) bui/i
                                    // Nvidia
                                ],
                                [a, [o, 'Nvidia'], [r, M]],
                                [
                                    /(playstation [345portablevi]+)/i
                                    // Playstation
                                ],
                                [a, [o, J], [r, M]],
                                [
                                    /\b(xbox(?: one)?(?!; xbox))[\); ]/i
                                    // Microsoft Xbox
                                ],
                                [a, [o, ge], [r, M]],
                                [
                                    ///////////////////
                                    // WEARABLES
                                    ///////////////////
                                    /\b(sm-[lr]\d\d[05][fnuw]?s?)\b/i
                                    // Samsung Galaxy Watch
                                ],
                                [a, [o, K], [r, R]],
                                [
                                    /((pebble))app/i
                                    // Pebble
                                ],
                                [o, a, [r, R]],
                                [
                                    /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i
                                    // Apple Watch
                                ],
                                [a, [o, U], [r, R]],
                                [
                                    /droid.+; (glass) \d/i
                                    // Google Glass
                                ],
                                [a, [o, z], [r, R]],
                                [/droid.+; (wt63?0{2,3})\)/i],
                                [a, [o, Ie], [r, R]],
                                [
                                    ///////////////////
                                    // XR
                                    ///////////////////
                                    /droid.+; (glass) \d/i
                                    // Google Glass
                                ],
                                [a, [o, z], [r, R]],
                                [
                                    /(pico) (4|neo3(?: link|pro)?)/i
                                    // Pico
                                ],
                                [o, a, [r, R]],
                                [
                                    /; (quest( \d| pro)?)/i
                                    // Oculus Quest
                                ],
                                [a, [o, Pe], [r, R]],
                                [
                                    ///////////////////
                                    // EMBEDDED
                                    ///////////////////
                                    /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i
                                    // Tesla
                                ],
                                [o, [r, he]],
                                [
                                    /(aeobc)\b/i
                                    // Echo Dot
                                ],
                                [a, [o, Y], [r, he]],
                                [
                                    ////////////////////
                                    // MIXED (GENERIC)
                                    ///////////////////
                                    /droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i
                                    // Android Phones from Unidentified Vendors
                                ],
                                [a, [r, l]],
                                [
                                    /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i
                                    // Android Tablets from Unidentified Vendors
                                ],
                                [a, [r, p]],
                                [
                                    /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i
                                    // Unidentifiable Tablet
                                ],
                                [[r, p]],
                                [
                                    /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i
                                    // Unidentifiable Mobile
                                ],
                                [[r, l]],
                                [
                                    /(android[-\w\. ]{0,9});.+buil/i
                                    // Generic Android Device
                                ],
                                [a, [o, 'Generic']]
                            ],
                            engine: [
                                [
                                    /windows.+ edge\/([\w\.]+)/i
                                    // EdgeHTML
                                ],
                                [x, [s, je + 'HTML']],
                                [
                                    /(arkweb)\/([\w\.]+)/i
                                    // ArkWeb
                                ],
                                [s, x],
                                [
                                    /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i
                                    // Blink
                                ],
                                [x, [s, 'Blink']],
                                [
                                    /(presto)\/([\w\.]+)/i,
                                    // Presto
                                    /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna|servo)\/([\w\.]+)/i,
                                    // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna/Servo
                                    /ekioh(flow)\/([\w\.]+)/i,
                                    // Flow
                                    /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
                                    // KHTML/Tasman/Links
                                    /(icab)[\/ ]([23]\.[\d\.]+)/i,
                                    // iCab
                                    /\b(libweb)/i
                                ],
                                [s, x],
                                [
                                    /rv\:([\w\.]{1,9})\b.+(gecko)/i
                                    // Gecko
                                ],
                                [x, s]
                            ],
                            os: [
                                [
                                    // Windows
                                    /microsoft (windows) (vista|xp)/i
                                    // Windows (iTunes)
                                ],
                                [s, x],
                                [
                                    /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i
                                    // Windows Phone
                                ],
                                [s, [x, ee, Be]],
                                [
                                    /windows nt 6\.2; (arm)/i,
                                    // Windows RT
                                    /windows[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
                                    /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i
                                ],
                                [
                                    [x, ee, Be],
                                    [s, 'Windows']
                                ],
                                [
                                    // iOS/macOS
                                    /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
                                    // iOS
                                    /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
                                    /cfnetwork\/.+darwin/i
                                ],
                                [
                                    [x, /_/g, '.'],
                                    [s, 'iOS']
                                ],
                                [
                                    /(mac os x) ?([\w\. ]*)/i,
                                    /(macintosh|mac_powerpc\b)(?!.+haiku)/i
                                    // Mac OS
                                ],
                                [
                                    [s, Me],
                                    [x, /_/g, '.']
                                ],
                                [
                                    // Mobile OSes
                                    /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i
                                    // Android-x86/HarmonyOS
                                ],
                                [x, s],
                                [
                                    // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS/OpenHarmony
                                    /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish|openharmony)[-\/ ]?([\w\.]*)/i,
                                    /(blackberry)\w*\/([\w\.]*)/i,
                                    // Blackberry
                                    /(tizen|kaios)[\/ ]([\w\.]+)/i,
                                    // Tizen/KaiOS
                                    /\((series40);/i
                                    // Series 40
                                ],
                                [s, x],
                                [
                                    /\(bb(10);/i
                                    // BlackBerry 10
                                ],
                                [x, [s, Te]],
                                [
                                    /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i
                                    // Symbian
                                ],
                                [x, [s, 'Symbian']],
                                [
                                    /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i
                                    // Firefox OS
                                ],
                                [x, [s, Q + ' OS']],
                                [
                                    /web0s;.+rt(tv)/i,
                                    /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i
                                    // WebOS
                                ],
                                [x, [s, 'webOS']],
                                [
                                    /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i
                                    // watchOS
                                ],
                                [x, [s, 'watchOS']],
                                [
                                    // Google Chromecast
                                    /crkey\/([\d\.]+)/i
                                    // Google Chromecast
                                ],
                                [x, [s, Z + 'cast']],
                                [
                                    /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i
                                    // Chromium OS
                                ],
                                [[s, qe], x],
                                [
                                    // Smart TVs
                                    /panasonic;(viera)/i,
                                    // Panasonic Viera
                                    /(netrange)mmh/i,
                                    // Netrange
                                    /(nettv)\/(\d+\.[\w\.]+)/i,
                                    // NetTV
                                    // Console
                                    /(nintendo|playstation) ([wids345portablevuch]+)/i,
                                    // Nintendo/Playstation
                                    /(xbox); +xbox ([^\);]+)/i,
                                    // Microsoft Xbox (360, One, X, S, Series X, Series S)
                                    // Other
                                    /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
                                    // Joli/Palm
                                    /(mint)[\/\(\) ]?(\w*)/i,
                                    // Mint
                                    /(mageia|vectorlinux)[; ]/i,
                                    // Mageia/VectorLinux
                                    /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
                                    // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
                                    /(hurd|linux) ?([\w\.]*)/i,
                                    // Hurd/Linux
                                    /(gnu) ?([\w\.]*)/i,
                                    // GNU
                                    /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
                                    // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
                                    /(haiku) (\w+)/i
                                    // Haiku
                                ],
                                [s, x],
                                [
                                    /(sunos) ?([\w\.\d]*)/i
                                    // Solaris
                                ],
                                [[s, 'Solaris'], x],
                                [
                                    /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
                                    // Solaris
                                    /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
                                    // AIX
                                    /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
                                    // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX/SerenityOS
                                    /(unix) ?([\w\.]*)/i
                                    // UNIX
                                ],
                                [s, x]
                            ]
                        },
                        y = function (w, f) {
                            if ((typeof w === C && ((f = w), (w = i)), !(this instanceof y))) return new y(w, f).getResult();
                            var u = typeof e !== k && e.navigator ? e.navigator : i,
                                m = w || (u && u.userAgent ? u.userAgent : d),
                                O = u && u.userAgentData ? u.userAgentData : i,
                                E = f ? Ye(Ke, f) : Ke,
                                h = u && u.userAgent == m;
                            return (
                                (this.getBrowser = function () {
                                    var b = {};
                                    return (
                                        (b[s] = i),
                                        (b[x] = i),
                                        L.call(b, m, E.browser),
                                        (b[Oe] = Xe(b[x])),
                                        h && u && u.brave && typeof u.brave.isBrave == v && (b[s] = 'Brave'),
                                        b
                                    );
                                }),
                                (this.getCPU = function () {
                                    var b = {};
                                    return (b[I] = i), L.call(b, m, E.cpu), b;
                                }),
                                (this.getDevice = function () {
                                    var b = {};
                                    return (
                                        (b[o] = i),
                                        (b[a] = i),
                                        (b[r] = i),
                                        L.call(b, m, E.device),
                                        h && !b[r] && O && O.mobile && (b[r] = l),
                                        h &&
                                            b[a] == 'Macintosh' &&
                                            u &&
                                            typeof u.standalone !== k &&
                                            u.maxTouchPoints &&
                                            u.maxTouchPoints > 2 &&
                                            ((b[a] = 'iPad'), (b[r] = p)),
                                        b
                                    );
                                }),
                                (this.getEngine = function () {
                                    var b = {};
                                    return (b[s] = i), (b[x] = i), L.call(b, m, E.engine), b;
                                }),
                                (this.getOS = function () {
                                    var b = {};
                                    return (
                                        (b[s] = i),
                                        (b[x] = i),
                                        L.call(b, m, E.os),
                                        h &&
                                            !b[s] &&
                                            O &&
                                            O.platform &&
                                            O.platform != 'Unknown' &&
                                            (b[s] = O.platform.replace(/chrome os/i, qe).replace(/macos/i, Me)),
                                        b
                                    );
                                }),
                                (this.getResult = function () {
                                    return {
                                        ua: this.getUA(),
                                        browser: this.getBrowser(),
                                        engine: this.getEngine(),
                                        os: this.getOS(),
                                        device: this.getDevice(),
                                        cpu: this.getCPU()
                                    };
                                }),
                                (this.getUA = function () {
                                    return m;
                                }),
                                (this.setUA = function (b) {
                                    return (m = typeof b === T && b.length > me ? ye(b, me) : b), this;
                                }),
                                this.setUA(m),
                                this
                            );
                        };
                    (y.VERSION = c),
                        (y.BROWSER = $([s, x, Oe])),
                        (y.CPU = $([I])),
                        (y.DEVICE = $([a, o, r, M, l, g, p, R, he])),
                        (y.ENGINE = y.OS = $([s, x])),
                        t.exports && (n = t.exports = y),
                        (n.UAParser = y);
                    var P = typeof e !== k && (e.jQuery || e.Zepto);
                    if (P && !P.ua) {
                        var ie = new y();
                        (P.ua = ie.getResult()),
                            (P.ua.get = function () {
                                return ie.getUA();
                            }),
                            (P.ua.set = function (w) {
                                ie.setUA(w);
                                var f = ie.getResult();
                                for (var u in f) P.ua[u] = f[u];
                            });
                    }
                })(typeof window == 'object' ? window : ri);
            })(G, G.exports)),
        G.exports
    );
}
var He = ni();
(function (t, n) {
    const e = A,
        i = t();
    for (;;)
        try {
            if (
                parseInt(e(307)) / 1 +
                    (-parseInt(e(309)) / 2) * (-parseInt(e(293)) / 3) +
                    (parseInt(e(308)) / 4) * (parseInt(e(298)) / 5) +
                    (-parseInt(e(305)) / 6) * (parseInt(e(300)) / 7) +
                    parseInt(e(296)) / 8 +
                    parseInt(e(306)) / 9 +
                    -parseInt(e(299)) / 10 ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(ue, 318763);
function A(t, n) {
    const e = ue();
    return (
        (A = function (i, c) {
            return (i = i - 293), e[i];
        }),
        A(t, n)
    );
}
const We = () => ({ osVersion: si(), userTimeZoneOffset: ci(), language: xi(), screenDimensions: bi() }),
    ai = () => {
        const t = A;
        return crypto[t(302)]();
    };
function ue() {
    const t = [
        'height',
        '513660FvOYAz',
        '7407990XZkEyb',
        '622034GXplYs',
        'getOS',
        'randomUUID',
        'width',
        'screen',
        '30aAcplO',
        '3646143qOKcxx',
        '304037NIupIH',
        '8QqnbDN',
        '946906qRoPmh',
        '3pBKYFu',
        'getTimezoneOffset',
        'mobile',
        '926328yDUGRB'
    ];
    return (
        (ue = function () {
            return t;
        }),
        ue()
    );
}
const oi = () => {
        const t = A,
            n = new He.UAParser(),
            { type: e } = n.getDevice();
        return e === t(295);
    },
    si = () => {
        const t = A,
            n = new He.UAParser(),
            { version: e } = n[t(301)]();
        return e;
    },
    xi = () => navigator.language || '',
    ci = () => /* @__PURE__ */ new Date()[A(294)](),
    bi = () => {
        const t = A,
            n = { height: 0, width: 0 };
        return (n[t(297)] = window[t(304)][t(297)]), (n[t(303)] = window[t(304)].width), n;
    };
(function (t, n) {
    const e = F,
        i = t();
    for (;;)
        try {
            if (
                (parseInt(e(116)) / 1) * (parseInt(e(106)) / 2) +
                    parseInt(e(113)) / 3 +
                    parseInt(e(104)) / 4 +
                    -parseInt(e(118)) / 5 +
                    (parseInt(e(108)) / 6) * (-parseInt(e(105)) / 7) +
                    parseInt(e(117)) / 8 +
                    (-parseInt(e(114)) / 9) * (parseInt(e(111)) / 10) ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(le, 899281);
function le() {
    const t = [
        '252baLHYI',
        'getItem',
        'setItem',
        '110ByRpwl',
        'parse',
        '1609887jiVhfo',
        '407601nqzIip',
        'stringify',
        '1xUfoZQ',
        '12756264kNWpuE',
        '7883655KYVIbC',
        '3053964osiGse',
        '6398lvmvoq',
        '235852QPrGlt',
        'Device ID provided does not match any Device ID in storage.'
    ];
    return (
        (le = function () {
            return t;
        }),
        le()
    );
}
function F(t, n) {
    const e = le();
    return (
        (F = function (i, c) {
            return (i = i - 104), e[i];
        }),
        F(t, n)
    );
}
const ui = (t, n) => {
        const e = F,
            i = btoa(JSON[e(115)](n));
        localStorage[e(110)](t, i);
    },
    li = t => {
        const n = F,
            e = localStorage[n(109)](t);
        if (!e) throw new Error(n(107));
        return JSON[n(112)](atob(e));
    };
(function (t, n) {
    const e = H,
        i = t();
    for (;;)
        try {
            if (
                (-parseInt(e(198)) / 1) * (parseInt(e(199)) / 2) +
                    (-parseInt(e(196)) / 3) * (-parseInt(e(208)) / 4) +
                    (-parseInt(e(200)) / 5) * (-parseInt(e(202)) / 6) +
                    parseInt(e(206)) / 7 +
                    parseInt(e(197)) / 8 +
                    (parseInt(e(203)) / 9) * (parseInt(e(201)) / 10) +
                    -parseInt(e(195)) / 11 ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(pe, 601988);
function pe() {
    const t = [
        'message',
        'RISK_SIGNALS_ERROR',
        '1197931kKoOhK',
        'No device ID provided',
        '656jAFXfw',
        '3642551EkKPod',
        '2406oyDYhH',
        '4719616hYprFf',
        '457DZcyiQ',
        '1678neuzXk',
        '7755WkPAbR',
        '10XUzktg',
        '282mgCTls',
        '3159378QFtutR'
    ];
    return (
        (pe = function () {
            return t;
        }),
        pe()
    );
}
function H(t, n) {
    const e = pe();
    return (
        (H = function (i, c) {
            return (i = i - 195), e[i];
        }),
        H(t, n)
    );
}
const pi = async t => {
        const n = H;
        try {
            !t && (t = ai());
            const e = We(),
                i = { deviceId: t, ...e },
                c = await Fe(t);
            return ui(c, { isMobile: oi(), ...e }), i;
        } catch (e) {
            return { type: N[n(205)], message: e.toString() };
        }
    },
    di = async t => {
        const n = H;
        if (!t) return { type: N[n(205)], message: n(207) };
        try {
            const e = await Fe(t),
                i = li(e),
                c = We(),
                d = ti(i, c);
            return { deviceId: t, ...c, confidenceScore: d };
        } catch (e) {
            return { type: N[n(205)], message: e[n(204)] };
        }
    };
(function (t, n) {
    const e = W,
        i = t();
    for (;;)
        try {
            if (
                (parseInt(e(454)) / 1) * (-parseInt(e(456)) / 2) +
                    (-parseInt(e(465)) / 3) * (-parseInt(e(459)) / 4) +
                    (parseInt(e(466)) / 5) * (parseInt(e(452)) / 6) +
                    (-parseInt(e(451)) / 7) * (parseInt(e(457)) / 8) +
                    -parseInt(e(460)) / 9 +
                    -parseInt(e(455)) / 10 +
                    (-parseInt(e(462)) / 11) * (-parseInt(e(453)) / 12) ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(de, 110139);
const wi = async t => {
    const n = W;
    try {
        const e = fi(t);
        return await navigator[n(458)][n(461)]({ publicKey: e });
    } catch (e) {
        return { type: N[n(464)], message: e.toString() };
    }
};
function W(t, n) {
    const e = de();
    return (
        (W = function (i, c) {
            return (i = i - 451), e[i];
        }),
        W(t, n)
    );
}
function de() {
    const t = [
        '10zukWVT',
        'pubKeyCredParams',
        '7JTHhFN',
        '143400KmihBt',
        '24LqnglW',
        '186356PmpgIh',
        '1533120SMAHiP',
        '2DHxjzs',
        '892856oldwxV',
        'credentials',
        '648652XApNMB',
        '690327anscIe',
        'create',
        '2354847HThDJW',
        'Could not convert PublicKeyCredentialCreationOptionsDTO into required webAuthn type: PublicKeyCredentialCreationOptions.',
        'CREDENTIAL_CREATION_ERROR',
        '3pqUmBa'
    ];
    return (
        (de = function () {
            return t;
        }),
        de()
    );
}
const fi = t => {
    const n = W,
        { challenge: e, rp: i, timeout: c, user: d, authenticatorSelection: _ } = t,
        v = re(e),
        k = t[n(467)] ?? null,
        C = { ...d, id: re(d.id) },
        T = { authenticatorAttachment: _.authenticatorAttachment ?? null };
    if (v && k && C && T) return { challenge: v, rp: i, pubKeyCredParams: k, user: C, timeout: c, authenticatorSelection: T };
    throw new Error(n(463));
};
(function (t, n) {
    const e = j,
        i = t();
    for (;;)
        try {
            if (
                (parseInt(e(381)) / 1) * (-parseInt(e(384)) / 2) +
                    -parseInt(e(387)) / 3 +
                    (-parseInt(e(383)) / 4) * (parseInt(e(375)) / 5) +
                    (-parseInt(e(376)) / 6) * (parseInt(e(386)) / 7) +
                    (parseInt(e(385)) / 8) * (-parseInt(e(378)) / 9) +
                    -parseInt(e(380)) / 10 +
                    (parseInt(e(379)) / 11) * (parseInt(e(377)) / 12) ===
                n
            )
                break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(we, 870176);
function we() {
    const t = [
        '155355fGVTIr',
        '131046GGetwl',
        '77837892FtyypY',
        '9KoHkqu',
        '11KsmEbO',
        '4943990pdChxQ',
        '1yUBfKR',
        'CREDENTIAL_CREATION_ERROR',
        '116aMkvri',
        '2664706QXNZdF',
        '8949288vwzFUR',
        '63sIJdrl',
        '4719822IfAkfG'
    ];
    return (
        (we = function () {
            return t;
        }),
        we()
    );
}
function j(t, n) {
    const e = we();
    return (
        (j = function (i, c) {
            return (i = i - 375), e[i];
        }),
        j(t, n)
    );
}
const hi = {
    captureRiskSignalsEnrollment: async function (t) {
        return pi(t || null);
    },
    captureRiskSignalsAuthentication: async function (t) {
        return di(t);
    },
    createCredentialForEnrollment: async function (t) {
        return Ge(() => wi(t), N[j(382)]);
    },
    authenticateWithCredential: async function (t) {
        return Ge(() => Je(t), N[j(382)]);
    }
};
function fe() {
    var t = ['450219BOKFYZ', '302868DpTzSI', '927672hdVQkl', '733900gtRWFn', '411000IwTINg', '263596TUqBXi', '537978sBIgSw'];
    return (
        (fe = function () {
            return t;
        }),
        fe()
    );
}
function Re(t, n) {
    var e = fe();
    return (
        (Re = function (i, c) {
            i = i - 132;
            var d = e[i];
            return d;
        }),
        Re(t, n)
    );
}
(function (t, n) {
    for (var e = Re, i = t(); ; )
        try {
            var c =
                parseInt(e(134)) / 1 +
                parseInt(e(133)) / 2 +
                -parseInt(e(136)) / 3 +
                -parseInt(e(137)) / 4 +
                parseInt(e(132)) / 5 +
                -parseInt(e(138)) / 6 +
                -parseInt(e(135)) / 7;
            if (c === n) break;
            i.push(i.shift());
        } catch {
            i.push(i.shift());
        }
})(fe, 158620);
export { hi as AdyenPasskey };
