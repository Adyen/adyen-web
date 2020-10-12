import { h } from 'preact';
import UIElement from '../UIElement';
import DeviceFingerprint from './components/DeviceFingerprint';
import { ErrorObject } from './components/utils';
import fetchJSONData from '../../utils/fetch-json-data';

export interface ThreeDS2DeviceFingerprintProps {
    dataKey: string;
    token: string;
    notificationURL: string;
    onError: (error?: string | ErrorObject) => void;
    paymentData: string;
    showSpinner: boolean;
    type: string;

    loadingContext?: string;
    clientKey?: string;
    elementRef?: UIElement;
}

class ThreeDS2DeviceFingerprint extends UIElement<ThreeDS2DeviceFingerprintProps> {
    public static type = 'threeDS2Fingerprint';

    public static defaultProps = {
        dataKey: 'threeds2.fingerprint',
        type: 'IdentifyShopper'
    };

    /**
     * Fingerprint, onComplete, calls a new endpoint which behaves like the /details endpoint but doesn't require the same credentials
     */
    onComplete(state): void {
        fetchJSONData(
            {
                path: `v1/submitThreeDS2Fingerprint?token=${this.props.clientKey}`,
                loadingContext: this.props.loadingContext,
                method: 'POST',
                contentType: 'application/json'
            },
            {
                fingerprintResult: state.data.details[this.props.dataKey],
                clientKey: this.props.clientKey,
                paymentData: state.data.paymentData
            }
        ).then(data => {
            /**
             * Frictionless (no challenge) flow
             */
            if (data.action?.type === 'authenticationFinished') {
                const detailsObj = {
                    data: {
                        // Sending no details property should work - BUT currently doesn't in the new flow
                        details: { 'threeds2.challengeResult': btoa('{"transStatus":"Y"}') },
                        paymentData: data.action.paymentData,
                        threeDSAuthenticationOnly: false
                    }
                };

                return super.onComplete(detailsObj);
            }

            /**
             * Challenge flow
             */
            if (data.action?.type === 'threeDS2') {
                return this.props.elementRef.handleAction(data.action);
            }

            /**
             * Redirect (usecase: we thought we could do 3DS2 but it turns out we can't)
             */
            if (data.action?.type === 'redirect') {
                data.action.paymentMethodType = 'scheme';
                return this.props.elementRef.handleAction(data.action);
            }
        });
    }

    render() {
        return <DeviceFingerprint {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2DeviceFingerprint;
