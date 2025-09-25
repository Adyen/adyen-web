import { AdyenCheckout } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';

import { getSearchParameters } from '../../utils';
import '../../../config/polyfills';
import '../../style.scss';
import { environmentUrlsOverride } from '../../config/commonConfig';

async function handleRedirectResult(redirectResult, sessionId) {
    window.checkout = await AdyenCheckout({
        session: { id: sessionId },
        clientKey: process.env.__CLIENT_KEY__,
        environment: process.env.__CLIENT_ENV__,
        ...environmentUrlsOverride,
        onPaymentCompleted: (result, element) => {
            console.log('onPaymentCompleted', result, element);
            document.querySelector('#result-container > pre').innerHTML = JSON.stringify(result, null, '\t');
        },
        onPaymentFailed: (result, element) => {
            console.log('onPaymentFailed', result, element);
            document.querySelector('#result-container > pre').innerHTML = JSON.stringify(result, null, '\t');
        },
        onError: obj => {
            console.log('checkout level merchant defined onError handler obj=', obj);
        }
    });

    checkout.submitDetails({ details: { redirectResult } });
}

const { redirectResult, sessionId } = getSearchParameters(window.location.search);

if (!redirectResult) {
    window.location.href = '/';
} else {
    handleRedirectResult(redirectResult, sessionId);
}
