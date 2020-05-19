import AdyenCheckout from '~';
import '../../config/polyfills';
import '../style.scss';
import '../utils';
import { handleChange, handleSubmit } from '../events';
import { getOriginKey } from '../services';

getOriginKey()
    .then(originKey => {
        window.originKey = originKey;
    })
    .then(() => {
        window.checkout = new AdyenCheckout({
            locale: 'en-US',
            environment: 'test',
            originKey: window.originKey,
            clientKey: process.env.__CLIENT_KEY__,
            onChange: handleChange,
            onSubmit: handleSubmit,
            showPayButton: true
        });

        const paymentMethodType = 'plastix';

        window.giftcard = checkout.create('giftcard', { type: paymentMethodType, pinRequired: true }).mount('#genericgiftcard-container');

        window.giftcardResult = checkout
            .create('giftcard', {
                paymentMethodType,
                lastFour: '1234',
                deductedAmount: { value: 2000, currencyCode: 'EUR' },
                remainingBalance: { value: 0, currencyCode: 'EUR' }
            })
            .mount('#genericgiftcard-result-container');
    });
