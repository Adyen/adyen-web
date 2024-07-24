import { makePayment, makeDetailsCall } from './services';

export function handleChange(state, component) {
    console.group(`onChange - ${state.data.paymentMethod.type}`);
    console.log('isValid', state.isValid);
    console.log('data', state.data);
    console.log('node', component._node);
    console.log('state', state);
    console.groupEnd();
}

export function handleOnPaymentCompleted(result, element) {
    alert(`onPaymentCompleted - ${result?.resultCode}`);
    console.log('onPaymentCompleted', result, element);
}

export function handleOnPaymentFailed(result, element) {
    alert(`onPaymentFailed - ${result?.resultCode}`);
    console.log('onPaymentFailed', result, element);
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
