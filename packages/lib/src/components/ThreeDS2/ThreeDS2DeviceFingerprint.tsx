import { h } from 'preact';
import UIElement from '../UIElement';
import DeviceFingerprint from './components/DeviceFingerprint';
import { ErrorObject } from './components/utils';
import fetchJSONData from '../../utils/fetch-json-data';
import { PaymentAction } from '../../types';

export interface ThreeDS2DeviceFingerprintElementProps {
    dataKey: string;
    fingerprintToken: string;
    notificationURL: string;
    onError: (error?: string | ErrorObject) => void;
    paymentData: string;
    showSpinner: boolean;
    type: string;

    loadingContext?: string;
    clientKey?: string;
}

class ThreeDS2DeviceFingerprintElement extends UIElement<ThreeDS2DeviceFingerprintElementProps> {
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
        super.onComplete(state);
        return;
        // TODO --

        // Handle call to new endpoint
        fetchJSONData(
            {
                // https://checkoutshopper-test.adyen.com/checkoutshopper/v1/[NEW_ENDPOINT_FOR_DETAILS_TYPE_CALL_WITHOUT_CREDENTIALS]?token=test_Q3STEQGHDNHB7F6LJQWENOGQ4Q4ZPWZ3
                path: `v1/bin/binLookup?token=${this.props.clientKey}`,
                loadingContext: this.props.loadingContext,
                method: 'POST',
                contentType: 'application/json'
            },
            {
                ...state.data
            }
        ).then(data => {
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
            if (data.resultCode === 'ChallengeShopper') {
                // Actual code
                // this.handleAction(data.action);

                // TODO mock code - first need to make a genuine /details call. Then halt the process and paste the token and paymentData below. Then redo the payment
                const mockActionResponse = {
                    type: 'threeDS2Challenge',
                    token:
                        'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6IjAxOTgxODUxLWVlZGMtNDBkYy04OTdmLTRjNGE3YmNhZGUwOSIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0RvdkwyeHZZMkZzYUc5emREb3pNREl3LkFpdG1nQmtmSW8tRkJQYU9LMTFDZlQ0Q2p6UmxpUXRwUkJzNVpfaVVTYmsiLCJ0aHJlZURTU2VydmVyVHJhbnNJRCI6IjEyMmU0NmMwLWY5NzMtNDc5Ny1hMGEzLTFjNzJiYjA0NWU5ZSJ9',
                    paymentData:
                        'Ab02b4c0!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'
                } as PaymentAction;

                this.handleAction(mockActionResponse);
                //--
            }
        });
    }

    render() {
        return <DeviceFingerprint {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2DeviceFingerprintElement;
