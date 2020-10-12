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
            console.log('### ThreeDS2DeviceFingerprint::submitThreeDS2Fingerprint::response:: this=', this);
            console.log('### ThreeDS2DeviceFingerprint::handle response:: this.props=', this.props);
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

                console.log('### ThreeDS2DeviceFingerprint::authenticationFinished FLOW:: detailsObj=', detailsObj);

                return super.onComplete(detailsObj);
            }

            /**
             * Challenge flow
             */
            if (data.action?.type === 'threeDS2') {
                console.log('### ThreeDS2DeviceFingerprint::submitThreeDS2Fingerprint::response:: challenge FLOW:: data.action=', data.action);
                this.props.elementRef.handleAction(data.action);
                return;
            }

            /**
             * Redirect (usecase: we thought we could do 3DS2 but it turns out we can't)
             */
            if (data.action?.type === 'redirect') {
                // const mockResp = {
                //     action: {
                //         url: 'http://localhost:8080/hpp/3d/validate.shtml',
                //         data: {
                //             MD:
                //                 'cjB2TkVqMExNYW15YllEbENPVkdLUT09Ib1P567557ierPQNrQvJ3gIiGFE5E-R45_r5U-POj8psyfwnao9T-8iKxbFDpj7KNS06wDc380xxQsK-cuip5ANhkKuFyw9WHtX0GzLdf0cbbqRcG8JuFgQqz7bruyPOb5o2U2TBBjgykRQB4Etkn3HHe8aBadteXmlkjYQUagQO-x5wkaXoU-xpX3zFdbyPSp4yM4zeRNaIwnzxT6RerlTcXwfE9Sgn3qLpYPxYLuHTY4WVLraCKBdUe3zceSJPM5dsJHd4XSdqHQVX_NVwPOsB7GTqalU7YzKlz8A_l89v6bL-t8M1uOZmwhHFfP7KutlBHEx0VE2pjWoxswreuqqKn3JdB-jHOQ',
                //             PaReq:
                //                 'eNpVUttygjAQ/RXbDyAXQIVZM5NKZ+qD1rH43GHCjlILaIAqfn0TBG3ztGfPXs8G4r1GjD5QNRoFLLGqkh2OsnT2HAaBO6bcCwKfUnfqR88C1nKDJwE/qKusLARzqMOBDNCka7VPilpAok4vi5XwOOOuB6SHkKNeRCLGql7nuVSnJtOopVJlU9RAbiwUSY5iKz/l/Cm0oUNVIB0DXbRuhc+nQAYAjf4W+7o+hoScz2cnSVssHFXmBIilgDyGWzfWqkypS5aK9/hwXX3JdhUd/FUsz8vrjm1k92ZAbASkSY2CU04ZZXzEaOj5IaVAOj8kuZ1BvG43I8apQ12z780FR9tJ3oDhLPXXBUZ1jYVqRTCxuwwI8HIsCzQRRt27DeQx+PzNaqxqo5cXsMmY0fuzaneErZIZadyubw+A2FTSH5L0BzfWv4/wC9DcryI=',
                //             TermUrl: 'http://localhost:8080/checkoutshopper/demo/dropin.shtml'
                //         },
                //         method: 'POST',
                //         type: 'redirect',
                //         paymentMethodType: 'scheme'
                //     }
                // };
                // this.props.elementRef.handleAction(mockResp.action);

                data.action.paymentMethodType = 'scheme';
                this.props.elementRef.handleAction(data.action);
            }
        });
    }

    render() {
        console.log('\n### ThreeDS2DeviceFingerprint::render:: this.props=', this.props);
        return <DeviceFingerprint {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2DeviceFingerprint;
