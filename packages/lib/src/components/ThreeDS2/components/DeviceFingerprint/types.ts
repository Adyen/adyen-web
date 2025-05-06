import { ThreeDS2FlowObject, FingerPrintData, ThreeDS2DeviceFingerprintConfiguration, FingerprintResolveData } from '../../types';
import { ActionHandledReturnObject } from '../../../../types/global-types';
import { EnhancedAnalyticsObject } from '../../../../core/Analytics/types';
import { ErrorObject } from '../../../../core/Errors/types';

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
    onComplete: (data: FingerprintResolveData) => void;
    onSubmitAnalytics: (aObj: EnhancedAnalyticsObject) => void;
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
