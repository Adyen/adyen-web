import { AdyenCheckout, CustomCard } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { handleSubmit, handleAdditionalDetails } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
import './customcards.style.scss';
import { setFocus, onBrand, onConfigSuccess, onBinLookup, onChange } from './customCards.config';

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

        payBtn.addEventListener('click', e => {
            e.preventDefault();

            console.log('### CustomCards::createPayButton:: click attribut', attribute);

            if (!component.isValid) return component.showValidation();

            // formatData
            const paymentMethod = {
                type: 'scheme',
                ...component.state.data
            };
            component.state.data = { paymentMethod };

            handleSubmit(component.state, component);
        });

        document.querySelector(parent).appendChild(payBtn);

        return payBtn;
    }
};

initCheckout();
