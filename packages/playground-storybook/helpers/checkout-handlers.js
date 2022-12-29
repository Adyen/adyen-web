import { makePayment, makeDetailsCall } from './checkout-api-calls';

export function handleResponse(response, component) {
    const type = component.data.paymentMethod ? component.data.paymentMethod.type : component.constructor.name;
    console.log('\ntype=', type, 'response=', response);

    if (response.action) {
        component.handleAction(response.action);
    } else if (response.resultCode) {
        alert(response.resultCode);
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

    return makeDetailsCall(details.data)
        .then(response => {
            component.setStatus('ready');
            handleResponse(response, component);
        })
        .catch(error => {
            throw Error(error);
        });
}
