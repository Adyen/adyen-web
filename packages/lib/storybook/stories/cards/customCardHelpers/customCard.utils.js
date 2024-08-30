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

        if (!component.isValid) return component.showValidation();

        clearSFMarkup();

        if (contextArgs.force3DS2Redirect && !contextArgs.useSessions) {
            startPayment(component); // If we're not using sessions AND we want to force a 3DS2 redirect
        } else {
            window.customCard.submit(); // for all other cases use the regular submit flow
        }
    });

    document.querySelector(parent).appendChild(payBtn);

    return payBtn;
};

const startPayment = component => {
    const allow3DS2 = paymentsConfig.authenticationData.attemptAuthentication || 'never';

    makePayment(component.data, {
        amount: { value: contextArgs.amount, currency: getCurrency(contextArgs.countryCode) },
        // Force a native flow, if possible
        authenticationData: {
            attemptAuthentication: allow3DS2,
            // Comment out below if you want to force the redirect/MDFlow
            threeDSRequestData: {
                nativeThreeDS: 'preferred'
            }
        },
        origin: null // overwrite origin to force 3DS2 redirect
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
        component.handleAction(result.action);
    } else {
        switch (result.resultCode) {
            case 'Authorised':
            case 'Refused':
                handleFinalState(result, component);
                break;
            default:
        }
    }
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
