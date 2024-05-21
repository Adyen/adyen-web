import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import '../../style.scss';

// import { countryCode } from '../../services/commonConfig';
import { showResult } from '../../handlers';

import { getSearchParameters } from '../../../../../playground/src/utils';

async function handleRedirectResult(redirectResult, sessionId) {
    console.log('### Result::handleRedirectResult:: redirectResult', redirectResult);
    console.log('### Result::handleRedirectResult:: sessionId', sessionId);

    window.checkout = await AdyenCheckout({
        session: { id: sessionId },
        // countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        environment: process.env.__CLIENT_ENV__,
        // onAdditionalDetails: handleAdditionalDetails,

        // Called for: Authorised (Success), Received (Expired)
        onPaymentCompleted: result => {
            document.querySelector('#result-container ').innerHTML = '';

            console.log('onPaymentCompleted', result);

            showResult(result.resultCode, false);
        },

        // Called for: Refused (Failed), Cancelled (Cancelled)
        // onPaymentFailed: result => {
        //     document.querySelector('#result-container ').innerHTML = '';
        //
        //     showResult(result.resultCode, true);
        // },
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
