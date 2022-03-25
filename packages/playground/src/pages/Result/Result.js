import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { getSearchParameters } from '../../utils';
import '../../../config/polyfills';
import '../../style.scss';

async function handleRedirectResult(redirectResult, sessionId) {
    window.checkout = await AdyenCheckout({
        session: { id: sessionId },
        clientKey: process.env.__CLIENT_KEY__,
        environment: process.env.__CLIENT_ENV__,
        onPaymentCompleted: result => {
            console.log('onPaymentCompleted', result);
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
