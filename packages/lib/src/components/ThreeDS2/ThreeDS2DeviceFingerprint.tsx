import { h } from 'preact';
import UIElement from '../UIElement';
import DeviceFingerprint from './components/DeviceFingerprint';
import { ErrorObject } from './components/utils';
import callSubmit3DS2Fingerprint from './callSubmit3DS2Fingerprint';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';

export interface ThreeDS2DeviceFingerprintProps {
    dataKey: string;
    token: string;
    notificationURL: string;
    onError: (error?: string | ErrorObject) => void;
    paymentData: string;
    showSpinner: boolean;
    type: string;
    useOriginalFlow?: boolean;
    loadingContext?: string;
    clientKey?: string;
    elementRef?: UIElement;
}

class ThreeDS2DeviceFingerprint extends UIElement<ThreeDS2DeviceFingerprintProps> {
    public static type = 'threeDS2Fingerprint';

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
        // existy used because threeds2InMDFlow will send empty string for paymentData and we should be allowed to proceed with this
        if (!existy(this.props.paymentData)) {
            this.props.onError({
                errorCode: ThreeDS2DeviceFingerprint.defaultProps.dataKey,
                message: 'No paymentData received. Fingerprinting cannot proceed'
            });
            return null;
        }

        /**
         * this.props.useOriginalFlow indicates the old 3DS2 flow.
         * It means the call to create this component came from the old 'threeDS2Fingerprint' action and upon completion should call the /details endpoint
         * instead of the new /submitThreeDS2Fingerprint endpoint
         */
        return <DeviceFingerprint {...this.props} onComplete={this.props.useOriginalFlow ? this.onComplete : this.callSubmit3DS2Fingerprint} />;
    }
}

export default ThreeDS2DeviceFingerprint;
