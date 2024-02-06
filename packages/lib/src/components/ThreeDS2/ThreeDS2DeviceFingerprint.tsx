import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PrepareFingerprint from './components/DeviceFingerprint';
import callSubmit3DS2Fingerprint from './callSubmit3DS2Fingerprint';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';
import { TxVariants } from '../tx-variants';
import { ThreeDS2DeviceFingerprintConfiguration } from './types';
import AdyenCheckoutError, { API_ERROR } from '../../core/Errors/AdyenCheckoutError';

class ThreeDS2DeviceFingerprint extends UIElement<ThreeDS2DeviceFingerprintConfiguration> {
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
            this.props.onError(new AdyenCheckoutError(API_ERROR, `No paymentData received. 3DS2 Fingerprint cannot proceed`));
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
