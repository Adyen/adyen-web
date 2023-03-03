import { makePayment, makeDetailsCall } from '../services';

export function handleResponse(response, component) {
    if (response.action) {
        component.handleAction(response.action);
    } else if (response.resultCode) {
        alert(response.resultCode);
    }
}

export function handleError(obj) {
    console.error(obj);
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
    return makeDetailsCall(details.data)
        .then(response => {
            component.setStatus('ready');
            handleResponse(response, component);
        })
        .catch(error => {
            throw Error(error);
        });
}
