import { DecodeObject } from '../components/types';

export const NOT_BASE64_ERROR = 'not base64';
export const BASE64_MALFORMED_URI_ERROR = 'malformed URI sequence';

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
    decode: (pData: string): DecodeObject => {
        if (!base64.isBase64(pData)) {
            return {
                success: false,
                error: NOT_BASE64_ERROR
            };
        }

        try {
            const data = b64DecodeUnicode(pData);
            return {
                success: true,
                data
            };
        } catch (e) {
            return {
                success: false,
                error: BASE64_MALFORMED_URI_ERROR
            };
        }
    },

    encode: pData => window.btoa(pData),

    isBase64: pDataStr => {
        if (!pDataStr) {
            return false;
        }

        if (pDataStr.length % 4) {
            return false;
        }

        try {
            return window.btoa(window.atob(pDataStr)) === pDataStr;
        } catch (e) {
            return false;
        }
    }
};

export default base64;
