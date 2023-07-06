import { h } from 'preact';
import UIElement from '../UIElement';
import PrepareFingerprint from './components/DeviceFingerprint';
import { ErrorCodeObject } from './components/utils';
import callSubmit3DS2Fingerprint from './callSubmit3DS2Fingerprint';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';
import { ActionHandledReturnObject, AnalyticsModule } from '../types';
import { THREEDS2_FINGERPRINT_ERROR } from './config';
import { ANALYTICS_ACTION_ERROR, ANALYTICS_API_ERROR, ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA } from '../../core/Analytics/constants';
import { ThreeDS2AnalyticsObject } from './types';

export interface ThreeDS2DeviceFingerprintProps {
    dataKey: string;
    token: string;
    notificationURL: string;
    onError: (error?: string | ErrorCodeObject) => void;
    paymentData: string;
    showSpinner: boolean;
    type: string;
    useOriginalFlow?: boolean;
    loadingContext?: string;
    clientKey?: string;
    elementRef?: UIElement;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    analytics?: AnalyticsModule;
}

class ThreeDS2DeviceFingerprint extends UIElement<ThreeDS2DeviceFingerprintProps> {
    public static type = 'threeDS2Fingerprint';

    public static defaultProps = {
        dataKey: 'fingerprintResult',
        type: 'IdentifyShopper'
    };

    private callSubmit3DS2Fingerprint = callSubmit3DS2Fingerprint.bind(this); // New 3DS2 flow

    protected submitAnalytics = (aObj: ThreeDS2AnalyticsObject) => {
        this.props.analytics.createAnalyticsAction({ action: aObj.action, data: { component: ThreeDS2DeviceFingerprint.type, ...aObj } });
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
            this.props.onError({
                errorCode: ThreeDS2DeviceFingerprint.defaultProps.dataKey,
                message: 'No paymentData received. Fingerprinting cannot proceed'
            });

            // TODO - check logs to see if this *ever* happens
            this.submitAnalytics({
                action: ANALYTICS_ACTION_ERROR,
                code: ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_FINGERPRINT_ERROR}: Missing 'paymentData' property from threeDS2 action`
            });

            return null;
        }

        /**
         * this.props.useOriginalFlow indicates the old 3DS2 flow.
         * It means the call to create this component came from the old 'threeDS2Fingerprint' action and upon completion should call the /details endpoint
         * instead of the new /submitThreeDS2Fingerprint endpoint
         */
        return (
            <PrepareFingerprint
                {...this.props}
                onComplete={this.props.useOriginalFlow ? this.onComplete : this.callSubmit3DS2Fingerprint}
                onSubmitAnalytics={this.submitAnalytics}
                isMDFlow={this.props.paymentData.length < 15}
            />
        );
    }
}

export default ThreeDS2DeviceFingerprint;
