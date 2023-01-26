import { ERROR_MESSAGES, ERRORS, CHALLENGE_WINDOW_SIZES, DEFAULT_CHALLENGE_WINDOW_SIZE } from '../config';
import { getOrigin } from '../../../utils/getOrigin';
import base64 from '../../../utils/base64';
import { ChallengeData, ThreeDS2Token, FingerPrintData, ResultObject } from '../types';
import { pick } from '../../internal/SecuredFields/utils';

export interface FingerprintResolveData {
    data: {
        [key: string]: string;
        paymentData: string;
    };
}

export interface ChallengeResolveData {
    data: {
        details: {
            [key: string]: string;
        };
    };
}

export interface ErrorCodeObject {
    errorCode: string;
    message: string;
}

export const decodeAndParseToken = (token: string): ThreeDS2Token => {
    const decodedToken = base64.decode(token);
    try {
        return decodedToken && JSON.parse(decodedToken);
    } catch (e) {
        throw new Error('Could not decode token');
    }
};

/**
 * Performs JSON.stringify on passed object & and base64 encodes result
 * @param obj -
 * @returns encoded result
 */
export const encodeObject = obj => {
    if (!obj || !Object.keys(obj).length) {
        throw new Error('No (populated) data object to encode');
    }
    return base64.encode(JSON.stringify(obj));
};

/**
 * Accepts a size string for the challenge window & returns it if it is valid else returns a default value
 * @param sizeStr - the size string to check the validity of
 * @returns a valid size string
 */
export const validateChallengeWindowSize = (sizeStr: string): string => {
    const sizeString = sizeStr.length === 1 ? `0${sizeStr}` : sizeStr;
    const hasSize = Object.prototype.hasOwnProperty.call(CHALLENGE_WINDOW_SIZES, sizeString);
    return hasSize ? sizeString : DEFAULT_CHALLENGE_WINDOW_SIZE;
};

/**
 * Accepts a size string for the challenge window & returns the corresponding array of w/h values
 * @param sizeStr -
 */
export const getChallengeWindowSize = (sizeStr: string): string[] => CHALLENGE_WINDOW_SIZES[validateChallengeWindowSize(sizeStr)];

/**
 *  prepareChallengeData
 *
 *  Requires an object containing the challenge parameters:
 *  @param token - challengeToken string received from /submitThreeDS2Fingerprint, /details or /payments call: contains acsTransID, acsURL, messageVersion,
 *     threeDSNotificationURL and threeDSServerTransID
 *  @param size - one of five possible challenge window sizes
 */
export const prepareChallengeData = ({ token, size }): ChallengeData => {
    const decodedChallengeToken = decodeAndParseToken(token);
    const { acsTransID, acsURL, messageVersion, threeDSNotificationURL, threeDSServerTransID } = decodedChallengeToken;
    const notificationURLOrigin = getOrigin(threeDSNotificationURL);

    return {
        acsURL,
        cReqData: {
            acsTransID,
            messageVersion,
            threeDSServerTransID,
            messageType: 'CReq',
            challengeWindowSize: validateChallengeWindowSize(size)
        },
        iframeSizeArr: getChallengeWindowSize(size),
        postMessageDomain: notificationURLOrigin
    };
};

/**
 *  prepareFingerPrintData
 *
 *  Requires an object containing the fingerprint parameters:
 *  @param token - fingerprintToken string received from /payments call: contains threeDSMethodNotificationURL, threeDSMethodUrl and
 *     threeDSServerTransID
 *  @param notificationURL - the URL that the final notification is expected to be postMessaged from.
 *
 *  NOTE: we don't expect merchants to alter the default by passing in a notificationURL of their own via props;
 *  and if 3DS2 is being done via createFromAction or handleAction we won't accept it.
 *  But if the merchant is using checkout.create('threeDS2DeviceFingerprint') we still support the fact that they might want to set their own
 *  notificationURL (aka threeDSMethodNotificationURL)
 */
export const prepareFingerPrintData = ({ token, notificationURL }): FingerPrintData => {
    const decodedFingerPrintToken = decodeAndParseToken(token);
    const { threeDSMethodNotificationURL, threeDSMethodUrl: threeDSMethodURL, threeDSServerTransID } = decodedFingerPrintToken;
    const receivedNotificationURL = notificationURL || threeDSMethodNotificationURL;
    const notificationURLOrigin = getOrigin(receivedNotificationURL);

    return {
        threeDSServerTransID,
        threeDSMethodURL,
        threeDSMethodNotificationURL: receivedNotificationURL,
        postMessageDomain: notificationURLOrigin
    };
};

export const createFingerprintResolveData = (dataKey: string, resultObj: ResultObject, paymentData: string): FingerprintResolveData => ({
    data: {
        [dataKey]: encodeObject({ threeDSCompInd: resultObj.threeDSCompInd }),
        paymentData
    }
});

// Old 3DS2 flow
export const createOldFingerprintResolveData = (dataKey: string, resultObj: ResultObject, paymentData: string): any => ({
    data: {
        details: { 'threeds2.fingerprint': encodeObject(resultObj) },
        paymentData
    }
});

export const createChallengeResolveData = (dataKey: string, transStatus: string, authorisationToken: string): ChallengeResolveData => ({
    data: {
        details: { [dataKey]: encodeObject({ transStatus, authorisationToken }) }
    }
});

// Needed for old 3DS2 flow & threeds2InMDFlow
export const createOldChallengeResolveData = (dataKey: string, transStatus: string, authorisationToken: string): any => ({
    data: {
        details: { 'threeds2.challengeResult': encodeObject({ transStatus }) },
        paymentData: authorisationToken
    }
});

export const handleErrorCode = (errorCode: string, errorDescription?: string): ErrorCodeObject => {
    const unknownMessage = ERROR_MESSAGES[ERRORS.UNKNOWN];
    const message = ERROR_MESSAGES[errorCode] || errorDescription || unknownMessage;
    return { errorCode, message };
};

/**
 *
 * Takes a string and encodes it as a base64url string
 * (https://en.wikipedia.org/wiki/Base64#URL_applications)
 * (See also https://tools.ietf.org/html/rfc7515)
 *
 * @example
 * ```
 * const jsonStr = JSON.stringify( {name:'john', surname:'smith'} );
 * const base64url = encodeBase64URL(jsonStr);
 * ```
 *
 * @param dataStr - data, as a string, to be encoded
 *
 * @returns base64URL - a base64url encoded string
 */
export const encodeBase64URL = (dataStr: string): string => {
    const base64Data = window.btoa(dataStr);
    let base64url = base64Data.split('=')[0]; // Remove any trailing '='s

    base64url = base64url.replace(/\+/g, '-'); // 62nd char of encoding
    base64url = base64url.replace(/\//g, '_'); // 63rd char of encoding

    return base64url;
};

const fingerprintFlowPropsDropin = ['elementRef'];

/**
 *  Must contain all props needed for the challenge stage since, in the new 3DS2 flow, the fingerprint component will be the "component" reference
 *  if the /submitThreeDS2Fingerprint response dictates we "handleAction" to create a challenge
 */
const fingerprintFlowProps = ['createFromAction', 'onAdditionalDetails'];

/**
 * Add props specifically needed for the type of 3DS2 flow: fingerprint or challenge
 *
 * @param actionSubtype - 3DS2 flow type: fingerprint or challenge
 * @param props - object from which to extract particular properties
 */
export const get3DS2FlowProps = (actionSubtype, props) => {
    if (actionSubtype === 'fingerprint') {
        // elementRef exists when the fingerprint component is created from the Dropin
        const fingerprintProps = props.elementRef ? fingerprintFlowPropsDropin : fingerprintFlowProps;
        const rtnObj = pick(fingerprintProps).from(props);
        rtnObj.showSpinner = !props.isDropin;
        rtnObj.statusType = 'loading';
        return rtnObj;
    }

    // Challenge
    return {
        statusType: 'custom',
        i18n: props.i18n
    };
};
