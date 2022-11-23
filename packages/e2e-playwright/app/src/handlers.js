import { makePayment, makeDetailsCall } from './services';

function removeComponent(component) {
    component.remove();
}

function showAuthorised() {
    const resultElement = document.getElementById('result-message');
    resultElement.classList.remove('hide');
    resultElement.innerText = 'Authorised';
}

export function handleResponse(response, component) {
    if (response.action) {
        component.handleAction(response.action, window.actionConfigObject || {});
    } else if (response.resultCode) {
        component.remove();
        showAuthorised();
    }
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
    return makeDetailsCall(details.data)
        .then(response => {
            component.setStatus('ready');
            handleResponse(response, component);
        })
        .catch(error => {
            throw Error(error);
        });
}
