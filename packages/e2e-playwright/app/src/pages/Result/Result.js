import { AdyenCheckout } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';

import { countryCode } from '../../services/commonConfig';
import { handleAdditionalDetails } from '../../handlers';

import { getSearchParameters } from '../../../../../playground/src/utils';

async function handleRedirectResult(redirectResult) {
    window.checkout = await AdyenCheckout({
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        environment: process.env.__CLIENT_ENV__,
        onAdditionalDetails: handleAdditionalDetails,
        onPaymentCompleted: (result, element) => {
            console.log('onPaymentCompleted', result, element);
            document.querySelector('#result-container ').innerHTML = JSON.stringify(result, null, '\t');
        },
        onPaymentFailed: (result, element) => {
            console.log('onPaymentFailed', result, element);
            document.querySelector('#result-container').innerHTML = JSON.stringify(result, null, '\t');
        },
        onError: obj => {
            console.log('checkout level merchant defined onError handler obj=', obj);
        }
    });

    checkout.submitDetails({ details: { redirectResult } });
}

const { redirectResult } = getSearchParameters(window.location.search);

if (!redirectResult) {
    window.location.href = '/';
} else {
    await handleRedirectResult(redirectResult);
}
