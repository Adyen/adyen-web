import { ERROR_MESSAGES, ERRORS, CHALLENGE_WINDOW_SIZES } from '../config';
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
        threeDSAuthenticationOnly: boolean;
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
    return hasSize ? sizeString : '01';
};

/**
 * Accepts a size string for the challenge window & returns the corresponding array of w/h values
 * @param sizeStr -
 */
export const getChallengeWindowSize = (sizeStr: string): string[] => CHALLENGE_WINDOW_SIZES[validateChallengeWindowSize(sizeStr)];

/**
 *  prepareChallengeData
 *  @param value - requires an object containing the challenge parameters
 *  - token - challengeToken string received from payments call containing acsTransID, acsURL, messageVerison, expected postMessage URL and threeDSServerTransID
 *  - size - one of five possible challenge window sizes
 *  - notificationURL - the URL notifications are expected to be postMessaged from
 */
export const prepareChallengeData = ({ token, size, notificationURL }): ChallengeData => {
    const decodedChallengeToken = decodeAndParseToken(token);
    const { acsTransID, acsURL, messageVersion, threeDSNotificationURL, threeDSServerTransID } = decodedChallengeToken;
    const receivedNotificationURL = notificationURL || threeDSNotificationURL;
    const notificationURLOrigin = getOrigin(receivedNotificationURL);

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
 *   requires an object containing the challenge parameters
 *  @param token - fingerprintToken string received from payments call, containing
 *  methodNotificationURL, methodURL and threeDSServerTransID
 *  @param notificationURL - the URL notifications are expected to be postMessaged from
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

export const createResolveData = (dataKey: string, result: string, paymentData: string, authenticateOnly: boolean): ResolveData => ({
    data: {
        details: { [dataKey]: result },
        paymentData,
        threeDSAuthenticationOnly: authenticateOnly // needed if going to /details and not new endpoint
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

// const fingerprintSpecificProps = ['createFromAction'];
//
// const challengeSpecificProps = ['challengeWindowSize'];
//
// export const getSpecificProps = (props, subsetArray) => {
//     return subsetArray.reduce((acc, item) => {
//         // return { ...acc, ...(props[item] && { [item]: props[item] }) }; // exclude prop if not defined
//         acc[item] = props[item]; // include prop but with undefined value, if not defined
//         return acc;
//     }, {});
// };

export const get3DS2Props = (actionSubtype, props) => {
    const isFingerprint = actionSubtype === 'fingerprint';

    // const propsArray = isFingerprint ? fingerprintSpecificProps : challengeSpecificProps;
    // const rtnObj = getSpecificProps(props, propsArray);

    let rtnObj;

    if (isFingerprint) {
        rtnObj = pick('createFromAction').from(props);
        rtnObj.showSpinner = !props.isDropin;
        rtnObj.statusType = 'loading';
    }

    if (!isFingerprint) {
        rtnObj = pick('challengeWindowSize').from(props);
        rtnObj.size = '05';
        rtnObj.statusType = 'custom';
    }

    return rtnObj;
};
