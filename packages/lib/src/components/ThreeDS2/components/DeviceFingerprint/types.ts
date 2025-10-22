import {
    ThreeDS2FlowObject,
    FingerPrintData,
    ThreeDS2DeviceFingerprintConfiguration,
    FingerprintResolveData,
    LegacyFingerprintResolveData
} from '../../types';
import { ActionHandledReturnObject } from '../../../../types/global-types';
import { ErrorObject } from '../../../../core/Errors/types';
import { AnalyticsEvent } from '../../../../core/Analytics/AnalyticsEvent';

export interface DoFingerprint3DS2Props extends FingerPrintData {
    onCompleteFingerprint: (resolveObject: ThreeDS2FlowObject) => void;
    onErrorFingerprint: (rejectObject: ThreeDS2FlowObject) => void;
    showSpinner: boolean;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    onFormSubmit: (msg: string) => void;
}

export interface DoFingerprint3DS2State {
    base64URLencodedData: string;
}

export interface PrepareFingerprint3DS2Props extends ThreeDS2DeviceFingerprintConfiguration {
    onComplete: (data: LegacyFingerprintResolveData | FingerprintResolveData) => void;
    onSubmitAnalytics: (aObj: AnalyticsEvent) => void;
    environment?: string;
    _environmentUrls?: {
        api?: string;
        analytics?: string;
        cdn?: {
            images?: string;
            translations?: string;
        };
    };
}

export interface PrepareFingerprint3DS2State {
    status?: 'init' | 'retrievingFingerPrint' | 'complete';
    fingerPrintData?: FingerPrintData | ErrorObject;
}
