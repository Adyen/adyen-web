import { createSession } from './checkout-api-calls';
import { RETURN_URL, SHOPPER_REFERENCE, STORYBOOK_ENVIRONMENT_URLS } from '../config/commonConfig';
import { handleError, handleFinalState } from './checkout-handlers';
import getCurrency from '../utils/get-currency';
import Checkout from '../../src/core/core';
import { AdyenCheckout } from '../../src/core/AdyenCheckout';

import type { AdyenCheckoutProps, ShopperDetails } from '../stories/types';

async function createSessionsCheckout(
    checkoutProps: Omit<AdyenCheckoutProps, 'srConfig'> & {
        srConfig?: { showPanel: boolean; moveFocus: boolean };
    },
    shopperDetails?: ShopperDetails
): Promise<Checkout> {
    const {
        showPayButton,
        countryCode,
        shopperLocale,
        amount,
        sessionData,
        srConfig = { showPanel: false, moveFocus: true },
        ...restCheckoutProps
    } = checkoutProps;

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

        _environmentUrls: STORYBOOK_ENVIRONMENT_URLS,
        srConfig,
        ...restCheckoutProps
    });
}

export { createSessionsCheckout };
