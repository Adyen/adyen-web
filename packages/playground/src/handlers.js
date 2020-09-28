import { makePayment, makeDetailsCall } from './services';

let storedPaymentData;

export function handleResponse(response, component) {
    const type = component.data.paymentMethod ? component.data.paymentMethod.type : component.constructor.name;
    console.log('type=', type, 'response=', response);

    if (response.action) {
        storedPaymentData = response.paymentData; // for when response.resultCode: 'AuthenticationNotRequired'
        component.handleAction(response.action);
    } else if (response.resultCode) {
        alert(response.resultCode);

        if (response.resultCode === 'AuthenticationFinished') {
            console.log('### handlers::handleResponse:: AuthenticationFinished make details call');

            const detailsObj = {
                data: {
                    // Don't work
                    //                    details: response.threeDS2Result, // "missing payment data error"
                    //                    details: { 'threeds2.challengeResult': response.threeDS2Result.authenticationValue }, // "internal error"
                    //                    details: { 'threeds2.challengeResult': btoa('transStatus: Y') }, // "internal error"
                    //                    details: { 'threeds2.challengeResult': btoa('transStatus: "Y"') }, // "internal error"
                    //                    details: { 'threeds2.challengeResult': btoa('{transStatus: "Y"}') }, // "internal error"
                    // All below, work:
                    //                    details: { 'threeds2.challengeResult': btoa('{"transStatus":"Y"}') }, // needs to be an object with both key & value in inverted commas
                    //                    details: response.threeDS2Result.authenticationValue,
                    //                    details: btoa('transStatus: Y'),
                    //                    details: '',
                    //                    details: {
                    //                        'threeds2.challengeResult': 'eyJ0cmFuc1N0YXR1cyI6IlkifQ==' // encoded {"transStatus":"Y"}
                    //                    },
                    // Sending no details property also works
                    paymentData: response.paymentData,
                    threeDSAuthenticationOnly: false
                }
            };
            handleAdditionalDetails(detailsObj, component, false);
        }
    }
}

export function handleChange(state, component) {
    console.group(`onChange - ${state.data.paymentMethod.type}`);
    console.log('isValid', state.isValid);
    console.log('data', state.data);
    console.log('node', component._node);
    console.log('state', state);
    console.groupEnd();
}

export function handleError(obj) {
    // SecuredField related errors should not go straight to console.error
    if (obj.type === 'card') {
        console.log('### Card::onError:: obj=', obj);
    } else {
        console.error(obj);
    }
}

export function handleSubmit(state, component) {
    component.setStatus('loading');

    return makePayment(state.data)
        .then(response => {
            component.setStatus('ready');
            handleResponse(response, component);
        })
        .catch(error => {
            throw Error(error);
        });
}

export function handleAdditionalDetails(details, component) {
    // component.setStatus('processing');

    console.log('### handlers::handleAdditionalDetails:: details', details);

    return makeDetailsCall(details.data)
        .then(response => {
            component.setStatus('ready');
            handleResponse(response, component);
        })
        .catch(error => {
            throw Error(error);
        });
}
