import { AdyenCheckout } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import '../../style.scss';

import { countryCode } from '../../services/commonConfig';
import { handleAdditionalDetails, showResult } from '../../handlers';

import { getSearchParameters } from '../../../../../playground/src/utils';

async function handleRedirectResult(redirectResult) {
    window.checkout = await AdyenCheckout({
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        environment: process.env.__CLIENT_ENV__,
        onAdditionalDetails: handleAdditionalDetails,
        onPaymentCompleted: result => {
            document.querySelector('#result-container ').innerHTML = '';

            showResult(result.resultCode, false);
        },
        onPaymentFailed: result => {
            document.querySelector('#result-container ').innerHTML = '';

            showResult(result.resultCode, true);
        },
        onError: result => {
            document.querySelector('#result-container ').innerHTML = JSON.stringify(result, null, '\t');
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
