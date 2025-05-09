import { createSession } from './checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE } from '../config/commonConfig';
import { handleError, handleFinalState } from './checkout-handlers';
import getCurrency from '../utils/get-currency';
import Checkout from '../../src/core/core';
import { AdyenCheckout } from '../../src/core/AdyenCheckout';

import type { AdyenCheckoutProps, ShopperDetails } from '../stories/types';

async function createSessionsCheckout(checkoutProps: AdyenCheckoutProps, shopperDetails?: ShopperDetails): Promise<Checkout> {
    const { showPayButton, countryCode, shopperLocale, amount, sessionData, ...restCheckoutProps } = checkoutProps;

    const session = await createSession({
        amount: {
            currency: getCurrency(countryCode),
            value: Number(amount)
        },
        shopperLocale,
        countryCode,
        reference: 'ABC123',
        returnUrl: RETURN_URL,
        shopperReference: SHOPPER_REFERENCE,
        shopperEmail: 'shopper.ctp1@adyen.com',
        ...(shopperDetails && { ...shopperDetails }),
        ...sessionData
    });

    return AdyenCheckout({
        clientKey: process.env.CLIENT_KEY,
        environment: process.env.CLIENT_ENV as any,
        countryCode,
        session,
        showPayButton,

        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },

        onPaymentCompleted(result, element) {
            console.log('onPaymentCompleted', result, element);
            handleFinalState(result, element);
        },

        onPaymentFailed(result, element) {
            console.log('onPaymentFailed', result, element);
            handleFinalState(result, element);
        },

        onError: (error, component) => {
            handleError(error, component);
        },

        ...restCheckoutProps
    });
}

export { createSessionsCheckout };
