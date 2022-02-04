const b64DecodeUnicode = str =>
    /**
     * The "Unicode Problem" Since DOMStrings are 16-bit-encoded strings:
     * In most browsers calling window.btoa on a Unicode string will cause
     * a Character Out Of Range exception if a character exceeds the range
     * of a 8-bit ASCII-encoded character.
     * This method solves the problem
     */
    decodeURIComponent(Array.prototype.map.call(window.atob(str), c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`).join(''));

/**
 * @internal
 */
const base64 = {
    decode: pData => {
        if (!base64.isBase64(pData)) {
            return false;
        }

        if (base64.isBase64(pData)) {
            return b64DecodeUnicode(pData);
        }

        return false;
    },

    encode: pData => window.btoa(pData),

    isBase64: pDataStr => {
        if (!pDataStr) {
            return false;
        }

        if (pDataStr.length % 4) {
            return false;
        }

        return window.btoa(window.atob(pDataStr)) === pDataStr;
    }
};

export default base64;
