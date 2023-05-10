import { ThreeDS2FlowObject, FingerPrintData } from '../../types';
import { ThreeDS2DeviceFingerprintProps } from '../../ThreeDS2DeviceFingerprint';
import { FingerprintResolveData } from '../utils';
import { ActionHandledReturnObject } from '../../../types';
import { ErrorObject } from '../../../../core/Errors/types';

export interface DoFingerprint3DS2Props extends FingerPrintData {
    onCompleteFingerprint: (resolveObject: ThreeDS2FlowObject) => void;
    onErrorFingerprint: (rejectObject: ThreeDS2FlowObject) => void;
    showSpinner: boolean;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    onSubmitAnalytics: (w) => void;
}

export interface DoFingerprint3DS2State {
    base64URLencodedData: string;
}

export interface PrepareFingerprint3DS2Props extends ThreeDS2DeviceFingerprintProps {
    onComplete: (data: FingerprintResolveData) => void;
    onSubmitAnalytics: (w) => void;
    isMDFlow: boolean;
}

export interface PrepareFingerprint3DS2State {
    status?: string;
    fingerPrintData?: FingerPrintData | ErrorObject;
}
