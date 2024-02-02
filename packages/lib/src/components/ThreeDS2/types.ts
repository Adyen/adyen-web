import { ICore } from '../../core/types';
import { ErrorCodeObject } from './components/utils';
import UIElement from '../internal/UIElement';
import { ActionHandledReturnObject, AnalyticsModule } from '../../types/global-types';
import Language from '../../language';

export interface ThreeDS2DeviceFingerprintConfiguration {
    core: ICore;
    dataKey?: string;
    token?: string;
    notificationURL?: string;
    onError?: (error?: string | ErrorCodeObject) => void;
    paymentData?: string;
    showSpinner: boolean;
    type?: string;
    isMDFlow?: boolean;
    loadingContext?: string;
    clientKey?: string;
    elementRef?: UIElement;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    modules?: { analytics: AnalyticsModule };
}

export interface ThreeDS2ChallengeConfiguration {
    core: ICore;
    token?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: string | ErrorCodeObject) => void;
    paymentData?: string;
    size?: string;
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';
    type?: string;
    loadingContext?: string;
    isMDFlow?: boolean;
    i18n?: Language;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    modules?: { analytics: AnalyticsModule };
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
