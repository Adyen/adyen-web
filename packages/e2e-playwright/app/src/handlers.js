import { makePayment, makeDetailsCall, createOrder } from './services';

export function showAuthorised(message = 'Authorised') {
    const resultElement = document.getElementById('result-message');
    resultElement.classList.remove('hide');
    resultElement.innerText = message;
}

export function showResult(message, isError) {
    const resultElement = document.getElementById('result-message');
    resultElement.classList.remove('hide');
    if (isError) {
        resultElement.classList.add('error');
    }
    resultElement.innerText = message;
}

export function handleError(obj) {
    const resultElement = document.getElementById('result-message');
    resultElement.classList.remove('hide');
    resultElement.classList.add('error');
    resultElement.innerText = obj;

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
    showAuthorised();
}

export function handleOrderRequest(resolve, reject, data) {
    return createOrder(data)
        .then(response => {
            resolve(response);
        })
        .catch(error => {
            reject(error);
        });
}
