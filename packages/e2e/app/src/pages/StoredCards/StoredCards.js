import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';

const initCheckout = async () => {
    window.checkout = await AdyenCheckout({
        amount,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: 'test',
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        ...window.mainConfiguration
    });

    const storedCardData = {
        brand: 'visa',
        expiryMonth: '03',
        expiryYear: '2030',
        holderName: 'Checkout Shopper PlaceHolder',
        id: '8415611088427239',
        lastFour: '1111',
        name: 'VISA',
        networkTxReference: '059172561886790',
        supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
        type: 'scheme',
        storedPaymentMethodId: '8415611088427239',
        ...window.cardConfig
    };

    // Credit card with installments
    window.storedCard = checkout.create('card', storedCardData).mount('.stored-card-field');
};

initCheckout();
