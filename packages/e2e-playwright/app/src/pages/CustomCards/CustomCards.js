import { AdyenCheckout, CustomCard } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { handleSubmit, handleAdditionalDetails, handlePaymentCompleted, showAuthorised } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
import './customcards.style.scss';
import { setFocus, onBrand, onConfigSuccess, onBinLookup, onChange } from './customCards.config';
import { makePayment } from '../../services';

const initCheckout = async () => {
    // window.TextEncoder = null; // Comment in to force use of "compat" version
    window.checkout = await AdyenCheckout({
        amount,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        _environmentUrls: {
            cdn: {
                translations: '/'
            }
        },
        environment: 'test',
        showPayButton: true,
        onPaymentCompleted: handlePaymentCompleted,
        ...window.mainConfiguration
    });

    window.customCard = new CustomCard(checkout, {
        type: 'card',
        brands: ['mc', 'visa', 'synchrony_plcc'],
        onConfigSuccess,
        onBrand,
        onFocus: setFocus,
        onBinLookup,
        onChange,
        ...window.cardConfig
    }).mount('.secured-fields');

    createPayButton('.secured-fields', window.customCard, 'customCardRegular');

    window.customCardSeparate = new CustomCard(checkout, {
        type: 'card',
        brands: ['mc', 'visa', 'synchrony_plcc'],
        onConfigSuccess,
        onBrand,
        onFocus: setFocus,
        onBinLookup,
        onChange,
        ...window.cardConfig
    }).mount('.secured-fields-2');

    createPayButton('.secured-fields-2', window.customCardSeparate, 'customCardSeparate');

    function createPayButton(parent, component, attribute) {
        const payBtn = document.createElement('button');

        payBtn.textContent = 'Pay';
        payBtn.name = `pay-${attribute}`;
        payBtn.setAttribute('data-testid', `pay-${attribute}`);
        payBtn.classList.add('adyen-checkout__button', 'js-components-button--one-click', `js-pay-${attribute}`);

        payBtn.addEventListener('click', async e => {
            e.preventDefault();

            console.log('### CustomCards::createPayButton:: click attribut', attribute);

            if (!component.isValid) return component.showValidation();

            // formatData
            const paymentMethod = {
                type: 'scheme',
                ...component.state.data
            };
            component.state.data = { paymentMethod };

            const response = await makePayment(component.state.data);
            component.setStatus('ready');

            if (response.action) {
                component.handleAction(response.action, window.actionConfigObject || {});
            } else if (response.resultCode) {
                component.remove();
                showAuthorised();
            }
        });

        document.querySelector(parent).appendChild(payBtn);

        return payBtn;
    }
};

initCheckout();
