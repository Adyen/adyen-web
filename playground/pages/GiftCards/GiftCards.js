import AdyenCheckout from '../../../src';
import { handleChange, handleSubmit } from '../../handlers';
import { getOriginKey } from '../../services';
import '../../../config/polyfills';
import '../../utils';
import '../../style.scss';

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
