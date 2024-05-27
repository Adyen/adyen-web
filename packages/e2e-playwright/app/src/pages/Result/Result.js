import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import '../../style.scss';

import { showResult } from '../../handlers';

import { getSearchParameters } from '../../../../../playground/src/utils';

async function handleRedirectResult(redirectResult, sessionId) {
    window.checkout = await AdyenCheckout({
        session: { id: sessionId },
        clientKey: process.env.__CLIENT_KEY__,
        environment: process.env.__CLIENT_ENV__,

        // Called for: Authorised (Success), Received (Expired)
        onPaymentCompleted: result => {
            document.querySelector('#result-container ').innerHTML = '';

            let isError = false;
            if (result.resultCode === 'Refused' || result.resultCode === 'Cancelled') {
                isError = true;
            }

            showResult(result.resultCode, isError);
        },

        onError: result => {
            document.querySelector('#result-container ').innerHTML = JSON.stringify(result, null, '\t');
        }
    });

    checkout.submitDetails({ details: { redirectResult } });
}

const { redirectResult, sessionId } = getSearchParameters(window.location.search);

if (!redirectResult) {
    window.location.href = '/';
} else {
    await handleRedirectResult(redirectResult, sessionId);
}
