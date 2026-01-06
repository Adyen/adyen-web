import UIElement from '../internal/UIElement';
import type { ActionHandledReturnObject } from '../../types/global-types';
import Language from '../../language';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import type { StatusFromAction, UIElementProps } from '../internal/UIElement/types';
import { ErrorEventCode } from '../../core/Analytics/events/AnalyticsErrorEvent';
import type { IAnalytics } from '../../core/Analytics/Analytics';
import type { AdditionalDetailsActions, AdditionalDetailsData, ICore } from '../../core/types';
import type { Resources } from '../../core/Context/Resources';
import type { CardConfiguration } from '../Card/types';

/**
 * Defines the size of the challenge Component
 *
 * 01: [250px, 400px]
 * 02: [390px, 400px]
 * 03: [500px, 600px]
 * 04: [600px, 400px]
 * 05: [100%, 100%]
 *
 * @defaultValue '02'
 *
 * - merchant set config option
 */
export type ChallengeWindowSize = '01' | '02' | '03' | '04' | '05';

interface ThreeDS2Configuration extends UIElementProps {
    dataKey?: string;
    environment?: string;
    isMDFlow?: boolean;
    loadingContext?: string;
    modules?: { analytics: IAnalytics };
    notificationURL?: string;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    onError?: (error: AdyenCheckoutError, element?: UIElement) => void;
    paymentData?: string;
    token?: string;
    type?: string;
    challengeWindowSize?: ChallengeWindowSize;
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

export interface LegacyFingerprintResolveData {
    data: {
        details: {
            [key: string]: string;
        };
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

export interface LegacyChallengeResolveData {
    data: {
        details: {
            [key: string]: string;
        };
        paymentData: string;
    };
}

export interface ErrorCodeObject {
    errorCode: string | ErrorEventCode;
    message: string;
}

export type ThreeDS2FlowProps = {
    statusType: StatusFromAction;
    showSpinner?: boolean;
    elementRef?: UIElement;
    i18n?: Language;
};

export type ThreeDS2ConfigProps = {
    // Props common to both flows
    readonly core: ICore;
    readonly token: string;
    readonly paymentData: string;
    readonly onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    readonly onComplete?: (state: LegacyChallengeResolveData | ChallengeResolveData, component: UIElement) => void;
    readonly onAdditionalDetails?: (state: AdditionalDetailsData, component: UIElement, actions: AdditionalDetailsActions) => void;
    readonly onError?: (error: AdyenCheckoutError, element?: UIElement) => void;
    readonly isDropin?: boolean;
    readonly loadingContext?: string;
    readonly clientKey: string;
    readonly paymentMethodType: string;
    readonly challengeWindowSize?: ChallengeWindowSize;
    readonly isMDFlow?: boolean;
    readonly modules?: {
        readonly analytics?: IAnalytics;
        readonly resources?: Resources;
    };

    // Props unique to a particular flow
    readonly showSpinner?: boolean;
    readonly statusType?: StatusFromAction;
    readonly elementRef?: UIElement;
    readonly i18n?: Language;
};

export type ThreeDS2ActionProps = CardConfiguration & Pick<ThreeDS2ConfigProps, 'isMDFlow'>;
