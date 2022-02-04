function isIE() {
    const ua = navigator.userAgent;

    const msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    const trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        const rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    const edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

const __IS_ANDROID = typeof navigator !== 'undefined' && /(android)/i.test(navigator.userAgent);
const __IS_IE = typeof navigator !== 'undefined' && isIE();
const __IS_IOS = typeof navigator !== 'undefined' && /iphone|ipod|ipad/i.test(navigator.userAgent);
const __IS_FIREFOX = typeof navigator !== 'undefined' && /(firefox)/i.test(navigator.userAgent);
const __IS_SAFARI = typeof navigator !== 'undefined' && /(safari)/i.test(navigator.userAgent) && !/(chrome)/i.test(navigator.userAgent);

export default {
    __IS_ANDROID,
    __IS_IE,
    __IS_IOS,
    __IS_FIREFOX,
    __IS_SAFARI
};
