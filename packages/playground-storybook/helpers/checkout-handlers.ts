import { makePayment, makeDetailsCall, getPaymentMethods } from './checkout-api-calls';
import UIElement from '@adyen/adyen-web/dist/types/components/UIElement';
import { amount, shopperLocale } from '../config/commonConfig';
import Core from '@adyen/adyen-web/dist/types/core';

function displayResultMessage(isAuthorized: boolean, resultCode: string): void {
    const image = document.createElement('img');
    image.setAttribute(
        'src',
        isAuthorized
            ? 'https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.gif'
            : 'https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.gif'
    );
    image.setAttribute('height', '100');
    image.style.display = 'flex';
    image.style.margin = 'auto auto 30px';

    const resultText = document.createElement('div');
    resultText.setAttribute('data-testid', 'result-message');
    resultText.style.textAlign = 'center';
    resultText.textContent = resultCode;

    const container = document.getElementById('component-field');
    container.appendChild(image);
    container.appendChild(resultText);
}

export function handleFinalState(result: any, component: UIElement): void {
    // why?
    localStorage.removeItem('storedPaymentData');

    const isDropin = component.props.isDropin;
    const isAuthorized = result.resultCode === 'Authorised' || result.resultCode === 'Received';

    if (isDropin) {
        if (isAuthorized) {
            component.setStatus('success');
        } else {
            component.setStatus('error');
        }
        return;
    }

    component.unmount();
    displayResultMessage(isAuthorized, result.resultCode);
}

export async function handleResponse(response, component, checkout) {
    const type = component.data.paymentMethod ? component.data.paymentMethod.type : component.constructor.name;
    console.log('\ntype=', type, 'response=', response);

    if (response.action) {
        // demo only - store paymentData & order -> why?
        localStorage.setItem('storedPaymentData', response.action.paymentData);
        component.handleAction(response.action);
        return;
    }

    if (response.order && response.order?.remainingAmount?.value > 0) {
        const order = {
            orderData: response.order.orderData,
            pspReference: response.order.pspReference
        };

        const orderPaymentMethods = await getPaymentMethods({ order, amount, shopperLocale });
        checkout.update({
            paymentMethodsResponse: orderPaymentMethods,
            order,
            amount: response.order.remainingAmount
        });
        return;
    }

    handleFinalState(response, component);
}

export function handleChange(state: any, component: UIElement) {
    console.groupCollapsed(`onChange - ${state.data.paymentMethod.type}`);
    console.log('isValid', state.isValid);
    console.log('data', state.data);
    console.log('node', component._node);
    console.log('state', state);
    console.groupEnd();
}

export function handleError(error, component) {
    // SecuredField related errors should not go straight to console.error
    if (error.type === 'card') {
        console.log('### Card::onError:: obj=', error);
    } else {
        console.error(error.name, error.message, error.stack, component);
    }
}

export async function handleSubmit(state: any, component: UIElement, checkout: Core) {
    component.setStatus('loading');
    const response = await makePayment(state.data);
    component.setStatus('ready');
    await handleResponse(response, component, checkout);
}

export async function handleAdditionalDetails(details, component: UIElement, checkout: Core) {
    component.setStatus('loading');
    const response = await makeDetailsCall(details.data);
    component.setStatus('ready');
    await handleResponse(response, component, checkout);
}
