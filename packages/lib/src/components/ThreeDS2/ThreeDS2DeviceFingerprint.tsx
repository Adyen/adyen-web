import { h } from 'preact';
import UIElement from '../UIElement';
import DeviceFingerprint from './components/DeviceFingerprint';
import { ErrorObject } from './components/utils';
import fetchJSONData from '../../utils/fetch-json-data';
import { PaymentAction } from '../../types';

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
        // TODO for testing - force the /details route
        // super.onComplete(state);
        // return;
        // TODO --

        // Handle call to new endpoint: perhaps called /submitThreeDS2Fingerprint
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
            console.log('\n### ThreeDS2DeviceFingerprint::submitThreeDS2Fingerprint::response:: data', data);
            /**
             * Frictionless (no challenge) flow
             */
            if (data.resultCode === 'AuthenticationFinished') {
                const detailsObj = {
                    data: {
                        // All below, work:
                        //                    details: { 'threeds2.challengeResult': btoa('{"transStatus":"Y"}') }, // needs to be an object with both key & value in inverted commas
                        //                    details: response.threeDS2Result.authenticationValue,
                        //                    details: btoa('transStatus: Y'),
                        //                    details: '',
                        //                    details: { 'threeds2.challengeResult': 'eyJ0cmFuc1N0YXR1cyI6IlkifQ==' },// encoded {"transStatus":"Y"}
                        // Sending no details property also works

                        // Actual code
                        paymentData: data.paymentData,
                        threeDSAuthenticationOnly: false
                    }
                };

                return super.onComplete(detailsObj);
            }

            /**
             * Challenge flow
             */
            if (data.action?.subtype === 'challenge') {
                console.log('### ThreeDS2DeviceFingerprint::submitThreeDS2Fingerprint::response:: challenge flow:: this=', this);
                console.log('### ThreeDS2DeviceFingerprint::handle response:: challenge flow:: this.props=', this.props);

                this.props.elementRef.handleAction(data.action);
                return;
            }

            /**
             * Redirect (we thought we could do 3DS2 but it turns out we can't)
             */
            if (data.resultCode === 'RedirectShopper') {
                this.handleAction(data.action);
            }
        });
    }

    render() {
        console.log('\n### ThreeDS2DeviceFingerprint::render:: this.props=', this.props);
        return <DeviceFingerprint {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2DeviceFingerprint;
