import { ERROR_MESSAGES, ERRORS, CHALLENGE_WINDOW_SIZES, DEFAULT_CHALLENGE_WINDOW_SIZE } from '../config';
import { getOrigin } from '../../../utils/getOrigin';
import base64 from '../../../utils/base64';
import { ChallengeData, ThreeDS2Token, FingerPrintData, ResultObject } from '../types';
import { pick } from '../../internal/SecuredFields/utils';

export interface ResolveData {
    data: {
        details: {
            [key: string]: string;
        };
        paymentData: string;
    };
}

export interface ErrorObject {
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
 * @param value - requires an object containing the result parameters
 * @param type - either 'IdentifyShopper' or 'ChallengeShopper'
 * @returns encoded result
 */
export const encodeResult = (result: ResultObject, type: string): string => {
    const { threeDSCompInd, transStatus } = result;
    if (!threeDSCompInd && !transStatus) {
        throw new Error('No threeDS2 request details found');
    }

    switch (type) {
        case 'IdentifyShopper':
            return base64.encode(JSON.stringify({ threeDSCompInd }));
        case 'ChallengeShopper':
            return base64.encode(JSON.stringify({ transStatus }));
        default:
            throw new Error('No data available to create a result');
    }
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
 *  @token - challengeToken string received from /submitThreeDS2Fingerprint, /details or /payments call: contains acsTransID, acsURL, messageVersion, threeDSNotificationURL and threeDSServerTransID
 *  @size - one of five possible challenge window sizes
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
 *  @param token - fingerprintToken string received from /payments call: contains threeDSMethodNotificationURL, threeDSMethodUrl and threeDSServerTransID
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

export const createResolveData = (dataKey: string, result: string, paymentData: string): ResolveData => ({
    data: {
        details: { [dataKey]: result },
        paymentData
    }
});

export const handleErrorCode = (errorCode: string): ErrorObject => {
    const unknownMessage = ERROR_MESSAGES[ERRORS.UNKNOWN];
    const message = ERROR_MESSAGES[errorCode] || unknownMessage;
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
const fingerprintFlowProps = ['createFromAction', 'onAdditionalDetails', 'challengeWindowSize'];

const challengeFlowProps = ['challengeWindowSize'];

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
    const rtnObj = pick(challengeFlowProps).from(props);
    rtnObj.statusType = 'custom';
    return rtnObj;
};
