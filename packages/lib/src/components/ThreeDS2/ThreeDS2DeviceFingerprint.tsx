import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PrepareFingerprint from './components/DeviceFingerprint';
import callSubmit3DS2Fingerprint from './callSubmit3DS2Fingerprint';
import { existy } from '../../utils/commonUtils';
import { TxVariants } from '../tx-variants';
import { ThreeDS2DeviceFingerprintConfiguration } from './types';
import AdyenCheckoutError, { API_ERROR } from '../../core/Errors/AdyenCheckoutError';
import { ANALYTICS_ERROR_TYPE, Analytics3DS2Errors, ANALYTICS_RENDERED_STR, Analytics3DS2Events } from '../../core/Analytics/constants';
import { SendAnalyticsObject } from '../../core/Analytics/types';
import { THREEDS2_ERROR, THREEDS2_FINGERPRINT, THREEDS2_FINGERPRINT_ERROR, THREEDS2_FULL } from './constants';
import { ActionHandledReturnObject } from '../../types/global-types';

class ThreeDS2DeviceFingerprint extends UIElement<ThreeDS2DeviceFingerprintConfiguration> {
    public static type = TxVariants.threeDS2Fingerprint;

    public static defaultProps = {
        dataKey: 'fingerprintResult',
        type: THREEDS2_FINGERPRINT
    };

    private callSubmit3DS2Fingerprint = callSubmit3DS2Fingerprint.bind(this); // New 3DS2 flow

    protected submitAnalytics = (aObj: SendAnalyticsObject) => {
        if (aObj.type === ANALYTICS_RENDERED_STR) return; // suppress the rendered event (it will have the same timestamp as the "threeDSMethodData sent" event)

        super.submitAnalytics(aObj);
    };

    protected onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        this.submitAnalytics({
            type: THREEDS2_FULL,
            message: rtnObj.actionDescription,
            subtype: Analytics3DS2Events.FINGERPRINT_IFRAME_LOADED
        });
        super.onActionHandled(rtnObj);
    };

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

            // TODO - check logs to see if this *ever* happens
            this.submitAnalytics({
                type: THREEDS2_ERROR,
                code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA,
                errorType: ANALYTICS_ERROR_TYPE.apiError,
                message: `${THREEDS2_FINGERPRINT_ERROR}: Missing 'paymentData' property from threeDS2 action`
            });

            return null;
        }

        /**
         * this.props.isMDFlow indicates the action to create this component came from the 3DS2InMDFlow process and upon completion should call the
         * passed onComplete callback (as defined in the 3DS2InMDFlow) instead of the /submitThreeDS2Fingerprint endpoint for the regular, "native" flow
         */
        return (
            <PrepareFingerprint
                {...this.props}
                onComplete={this.props.isMDFlow ? this.onComplete : this.callSubmit3DS2Fingerprint}
                onSubmitAnalytics={this.submitAnalytics}
                isMDFlow={this.props.paymentData.length < 15}
                onActionHandled={this.onActionHandled}
            />
        );
    }
}

export default ThreeDS2DeviceFingerprint;
