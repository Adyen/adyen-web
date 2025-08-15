import { AdyenCheckout, Card } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import '../../../config/polyfills';
import '../../style.scss';
import { makeDetailsCall, makePayment } from '../../services';
import { shopperLocale, countryCode } from '../../config/commonConfig';
import { handleOnPaymentCompleted, handleOnPaymentFailed } from '../../handlers';

(async () => {
    const checkout = await AdyenCheckout({
        countryCode,
        locale: shopperLocale,
        environment: 'test',
        clientKey: process.env.__CLIENT_KEY__,
        onSubmit: async (state, component, actions) => {
            try {
                const { action, order, resultCode, donationToken } = await makePayment(state.data);

                if (!resultCode) actions.reject();

                const checkbox = document.getElementById('useCreateFromAction');
                const useCreateFromAction = checkbox.checked;

                if (useCreateFromAction) {
                    if (action) {
                        window.checkout.createFromAction(action).mount('.threeds-field');
                    }
                } else {
                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });
                }
            } catch (error) {
                console.error('## onSubmit - critical error', error);
                actions.reject();
            }
        },
        onAdditionalDetails: async (state, element, actions) => {
            try {
                const { resultCode, action, order, donationToken } = await makeDetailsCall(state.data);

                console.log('### ThreeDS::onAdditionalDetails:: actions', actions);

                if (!resultCode) actions.reject();

                actions.resolve({
                    resultCode,
                    action,
                    order,
                    donationToken
                });
            } catch (error) {
                console.error('## onAdditionalDetails - critical error', error);
                actions.reject();
            }
        },
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed
    });
    window.checkout = checkout;
    window.card = new Card(checkout, { brands: ['mc', 'visa', 'maestro'] }).mount('.card-field');
})();
