import UIElement from '../internal/UIElement';
import { ActionHandledReturnObject, AnalyticsModule } from '../../types/global-types';
import Language from '../../language';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { Analytics3DS2Errors } from '../../core/Analytics/constants';
import { UIElementProps } from '../internal/UIElement/types';

interface ThreeDS2Configuration extends UIElementProps {
    dataKey?: string;
    environment?: string;
    isMDFlow?: boolean;
    loadingContext?: string;
    modules?: { analytics: AnalyticsModule };
    notificationURL?: string;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    onError?: (error: AdyenCheckoutError, element?: UIElement) => void;
    paymentData?: string;
    token?: string;
    type?: string;
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';
}

export interface ThreeDS2DeviceFingerprintConfiguration extends ThreeDS2Configuration {
    clientKey?: string;
    elementRef?: UIElement;
    showSpinner: boolean;
}

export interface ThreeDS2ChallengeConfiguration extends ThreeDS2Configuration {
    i18n?: Language;
    size?: string;
}

/**
 * See
 * https://docs.adyen.com/checkout/3d-secure/api-reference#threeds2result
 * Indicates whether a transaction was authenticated, or whether additional verification is required.
 */
export type ResultValue = 'Y' | 'N' | 'U' | 'A' | 'C' | 'R';

export interface CReqData {
    acsTransID: string;
    messageVersion: string;
    threeDSServerTransID: string;
    messageType: string;
    challengeWindowSize: string;
}

export interface ChallengeData {
    acsURL: string;
    cReqData: CReqData;
    iframeSizeArr: string[];
    postMessageDomain: string;
}

export interface ResultObject {
    threeDSCompInd?: ResultValue; // Fingerprint
    // Challenge
    transStatus?: ResultValue;
    errorCode?: string;
    errorDescription?: string;
}

export interface ThreeDS2FlowObject {
    result: ResultObject;
    type: 'ChallengeShopper' | 'IdentifyShopper' | 'challengeResult' | 'fingerPrintResult';
    errorCode?: string;
    threeDSServerTransID?: string;
}

export interface PostMsgParseErrorObject {
    type?: string;
    comment?: string;
    extraInfo?: string;
    eventDataRaw?: string;
}

// One token fits all - Fingerprint & Challenge
export interface ThreeDS2Token {
    acsTransID?: string;
    acsURL?: string;
    messageVersion?: string;
    threeDSNotificationURL?: string;
    threeDSServerTransID?: string;
    threeDSMethodNotificationURL?: string;
    threeDSMethodUrl?: string;
}

export interface FingerPrintData {
    threeDSServerTransID: string;
    threeDSMethodURL: string;
    threeDSMethodNotificationURL: string;
    postMessageDomain: string;
}

export type ThreeDS2FingerprintResponse = {
    type: 'action' | 'completed';
    action?: CheckoutRedirectAction | CheckoutThreeDS2Action;
    details?: Record<string, string>;
};

type CheckoutRedirectAction = {
    type: 'redirect';
    data: Record<string, string>;
    method: string;
    paymentData: string;
};

type CheckoutThreeDS2Action = {
    type: 'threeDS2';
    token: string;
    subtype: string;
    authorisationToken: string;
};

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
    errorCode: string | Analytics3DS2Errors;
    message: string;
}
