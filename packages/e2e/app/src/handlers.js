import { makePayment, makeDetailsCall } from './services';

export function handleResponse(response, component) {
    if (response.action) {
        component.handleAction(response.action, window.actionConfigObject || {});
    } else if (response.resultCode) {
        alert(response.resultCode);
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

export async function handleSubmit(state, component, actions) {
    try {
        const { action, order, resultCode, donationToken } = await makePayment(state.data);

        if (!resultCode) actions.reject();

        actions.resolve({
            resultCode,
            action,
            order,
            donationToken
        });
    } catch (error) {
        console.error('## onSubmit - critical error', error);
        actions.reject();
    }
}

export async function handleAdditionalDetails(state, component, actions) {
    try {
        const { resultCode, action, order, donationToken } = await makeDetailsCall(state.data);

        if (!resultCode) actions.reject();

        actions.resolve({
            resultCode,
            action,
            order,
            donationToken
        });
    } catch (error) {
        console.error('## onAdditionalDetails - critical error', error);
        actions.reject();
    }
}

export function handlePaymentCompleted(data, component) {
    component.remove();
    alert(data.resultCode);
}
