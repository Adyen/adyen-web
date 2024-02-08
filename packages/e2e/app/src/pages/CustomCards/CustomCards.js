import { AdyenCheckout, CustomCard } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { handleSubmit, handleAdditionalDetails } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
import './customcards.style.scss';
import { setFocus, onBrand, onConfigSuccess, onBinLookup, onChange } from './customCards.config';
import { makePayment } from '@adyen/adyen-web-playwright/app/src/services';

const initCheckout = async () => {
    // window.TextEncoder = null; // Comment in to force use of "compat" version
    window.checkout = await AdyenCheckout({
        amount,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: 'test',
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        ...window.mainConfiguration
    });

    window.securedFields = new CustomCard(checkout, {
        type: 'card',
        brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'cartebancaire'],
        onConfigSuccess,
        onBrand,
        onFocus: setFocus,
        onBinLookup,
        onChange,
        ...window.cardConfig
    }).mount('.secured-fields');

    createPayButton('.secured-fields', window.securedFields, 'securedfields');

    window.securedFields2 = new CustomCard(checkout, {
            //            type: 'card',// Deliberately exclude to ensure a default value is set
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'cartebancaire'],
            onConfigSuccess,
            onBrand,
            onFocus: setFocus,
            onBinLookup,
            onChange,
            ...window.cardConfig
        })
        .mount('.secured-fields-2');

    createPayButton('.secured-fields-2', window.securedFields2, 'securedfields2');

    function createPayButton(parent, component, attribute) {
        const payBtn = document.createElement('button');

        payBtn.textContent = 'Pay';
        payBtn.name = 'pay';
        payBtn.classList.add('adyen-checkout__button', 'js-components-button--one-click', `js-${attribute}`);

        payBtn.addEventListener('click', async e => {
            e.preventDefault();

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
                alert(response.resultCode);
            }
        });

        document.querySelector(parent).appendChild(payBtn);

        return payBtn;
    }
};

initCheckout();
