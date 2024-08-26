import paymentsConfig from '../../../config/paymentsConfig';
import { makePayment } from '../../../helpers/checkout-api-calls';
import getCurrency from '../../../utils/get-currency';
import { handleFinalState } from '../../../helpers/checkout-handlers';

let contextArgs;
let container;

// So the util functions can access the story's context and container
export const setUpUtils = (pContextArgs, pContainer) => {
    contextArgs = pContextArgs;
    container = pContainer;
};

export const createPayButton = (parent, component, attribute) => {
    const payBtn = document.createElement('button');

    payBtn.textContent = 'Pay';
    payBtn.name = 'pay';
    payBtn.classList.add('adyen-checkout__button', 'js-components-button--one-click', `js-${attribute}`);

    payBtn.addEventListener('click', e => {
        e.preventDefault();
        startPayment(component);
    });

    document.querySelector(parent).appendChild(payBtn);

    return payBtn;
};

const startPayment = component => {
    if (!component.isValid) return component.showValidation();

    const allow3DS2 = paymentsConfig.authenticationData.attemptAuthentication || 'never';

    makePayment(component.data, {
        amount: { value: contextArgs.amount, currency: getCurrency(contextArgs.countryCode) },
        authenticationData: {
            attemptAuthentication: allow3DS2,
            // comment out below if you want to force MDFlow
            threeDSRequestData: {
                nativeThreeDS: 'preferred'
            }
        }
    })
        .then(result => {
            handlePaymentResult(result, component);
        })
        .catch(error => {
            throw Error(error);
        });
};

const handlePaymentResult = (result, component) => {
    console.log('Result: ', result);

    if (result.action) {
        threeDS2(result, component);
    } else {
        clearSFMarkup();

        switch (result.resultCode) {
            case 'Authorised':
            case 'Refused':
                handleFinalState(result, component);
                break;
            default:
        }
    }
};

const threeDS2 = (result, component) => {
    clearSFMarkup();

    component.handleAction(result.action);
};

const clearSFMarkup = () => {
    if (globalThis.customCard) {
        const sfNode = container.current; // equivalent to: document.querySelector('.secured-fields');
        // Clear the contents of the .secured-fields div
        while (sfNode.firstChild) {
            sfNode.removeChild(sfNode.firstChild);
        }
    }
};
