import UIElement from '../UIElement';
import fetchJSONData from '../../utils/fetch-json-data';

/**
 * ThreeDS2DeviceFingerprint, onComplete, calls a new, internal, endpoint which behaves like the /details endpoint but doesn't require the same credentials
 */
export default function callSubmit3DS2Fingerprint(state) {
    // TODO for testing - force the /details route
    // UIElement.prototype.onComplete.call(state);
    // return;
    // TODO --

    // Handle call to new endpoint
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

        // elementRef exists when the fingerprint component is created from the Dropin
        const actionHandler = this.props.elementRef ?? this;

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

            return UIElement.prototype.onComplete.call(this, detailsObj);
        }

        /**
         * Challenge flow
         */
        if (data.action?.type === 'threeDS2') {
            return actionHandler.handleAction(data.action);
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
            // return actionHandler.handleAction(mockResp.action);

            data.action.paymentMethodType = 'scheme';
            return actionHandler.handleAction(data.action);
        }
    });
}
