import { h } from 'preact';
import UIElement from '../UIElement';
import PrepareFingerprint from './components/DeviceFingerprint';
import { ErrorCodeObject } from './components/utils';
import callSubmit3DS2Fingerprint from './callSubmit3DS2Fingerprint';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';
import { ActionHandledReturnObject } from '../types';
import { TxVariants } from '../tx-variants';
import { ICore } from '../../core/types';

export interface ThreeDS2DeviceFingerprintProps {
    core: ICore;
    dataKey: string;
    token: string;
    notificationURL: string;
    onError: (error?: string | ErrorCodeObject) => void;
    paymentData: string;
    showSpinner: boolean;
    type: string;
    isMDFlow?: boolean;
    loadingContext?: string;
    clientKey?: string;
    elementRef?: UIElement;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
}

class ThreeDS2DeviceFingerprint extends UIElement<ThreeDS2DeviceFingerprintProps> {
    public static type = TxVariants.threeDS2Fingerprint;

    public static defaultProps = {
        dataKey: 'fingerprintResult',
        type: 'IdentifyShopper'
    };

    private callSubmit3DS2Fingerprint = callSubmit3DS2Fingerprint.bind(this); // New 3DS2 flow

    onComplete(state) {
        super.onComplete(state);
        this.unmount(); // re. fixing issue around back to back fingerprinting calls
    }

    render() {
        /**
         * In the regular components (aka "native") flow we can't proceed because something has gone wrong with the payment if paymentData is missing from the threeDS2 action.
         * In the MDFlow the paymentData is always present (albeit an empty string, which is why we use 'existy' since we should be allowed to proceed with this)
         */
        if (!existy(this.props.paymentData)) {
            this.props.onError({
                errorCode: ThreeDS2DeviceFingerprint.defaultProps.dataKey,
                message: 'No paymentData received. Fingerprinting cannot proceed'
            });
            return null;
        }

        /**
         * this.props.isMDFlow indicates a threeds2InMDFlow process. It means the action to create this component came from the threeds2InMDFlow process
         * and upon completion should call the passed onComplete callback (instead of the /submitThreeDS2Fingerprint endpoint for the regular, "native" flow)
         */
        return <PrepareFingerprint {...this.props} onComplete={this.props.isMDFlow ? this.onComplete : this.callSubmit3DS2Fingerprint} />;
    }
}

export default ThreeDS2DeviceFingerprint;
