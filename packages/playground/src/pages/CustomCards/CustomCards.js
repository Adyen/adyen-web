import { AdyenCheckout, CustomCard } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';

import { makePayment, makeDetailsCall } from '../../services';
import { styles, setFocus, onBrand, onConfigSuccess, onBinLookup, onChange, setCCErrors } from './customCards.config';
import { styles_si, onConfigSuccess_si, onFieldValid_si, onBrand_si, onError_si, onFocus_si } from './customCards-si.config';
import { fancyStyles, fancyChangeBrand, fancyErrors, fancyFieldValid, fancyFocus } from './customCards-fancy.config';
import { materialStyles, materialFocus, handleMaterialError, onMaterialFieldValid } from './customCards-material.config';
import { shopperLocale, countryCode, environmentUrlsOverride } from '../../config/commonConfig';
import paymentsConfig from '../../config/paymentsConfig';
import '../../../config/polyfills';
import '../../style.scss';
import './customCards.style.scss';

const showOtherExamples = true; // For testing: set to false to only instantiate the basic form of CustomCard

window.paymentData = {};
const cardText = document.querySelector('.sf-text');

const createMaterialLabelListener = () => {
    const materialLabels = document.getElementsByClassName('material-input-label');
    const labels = Array.from(materialLabels);

    labels.forEach(label => {
        label.addEventListener('click', e => {
            e.preventDefault();
            // e.target.
            const nextCustomCardType = e.target.nextElementSibling.dataset.cse;
            materialDesignCustomCard.setFocusOn(nextCustomCardType);
        });
    });
};

const onAdditionalDetails = retrievedData => {
    makeDetailsCall(retrievedData.data).then(result => {
        handlePaymentResult(result);
    });
};

// HIDE ADDITIONAL SF EXAMPLES
if (showOtherExamples === false) {
    const extraSFs = Array.prototype.slice.call(document.querySelectorAll('.extra-sf'));
    extraSFs.forEach(elem => {
        elem.style.display = 'none';
    });
}
// - END

const configObj = {
    clientKey: process.env.__CLIENT_KEY__,
    countryCode,
    locale: shopperLocale,
    //        environment: 'http://localhost:8080/checkoutshopper/',
    environment: 'test',
    ...environmentUrlsOverride,
    onChange: handleOnChange,
    onAdditionalDetails,
    onError: console.error,
    onEnterKeyPressed: (activeEl, component) => {
        window.payBtn.focus();
        window.payBtn.click();
    },
    risk: {
        enabled: true, // Means that "riskdata" will then show up in the data object sent to the onChange event
        // Also accessible via checkout.modules.risk.data
        node: '.merchant-checkout__form', // Element that DF iframe is briefly added to
        onComplete: handleOnRiskData,
        onError: console.error
    },
    translations: {
        'en-US': {
            'creditCard.cvcField.placeholder.3digits': 'digits 3',
            'creditCard.cvcField.placeholder.4digits': 'digits 4',
            'creditCard.encryptedCardNumber.aria.label': 'number label'
        }
    }
};

const initCheckout = async () => {
    window.checkout = await AdyenCheckout(configObj);

    // SECURED FIELDS
    window.customCard = new CustomCard(window.checkout, {
        type: 'card',
        brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'cartebancaire', 'synchrony_plcc'],
        styles,
        minimumExpiryDate: '09/21',
        challengeWindowSize: '03',
        onConfigSuccess,
        onBrand,
        onBinValue: cbObj => {
            if (cbObj.encryptedBin) {
                console.log('onBinValue', cbObj);
            }
        },
        onFocus: setFocus,
        onBinLookup,
        onChange,
        onValidationError: errors => {
            errors.forEach(setCCErrors);
        }

        // brandsConfiguration: {
        //     synchrony_plcc: {
        //         icon: 'http://localhost:3000/test_images/smartmoney.png'
        //     },
        //     bcmc: {
        //         icon: 'http://localhost:3000/test_images/bcmc.png'
        //     },
        //     maestro: {
        //         icon: 'http://localhost:3000/test_images/maestro.png'
        //     }
        // }
    }).mount('.secured-fields');

    window.payBtn = createPayButton('.secured-fields', window.customCard, 'customcard');

    window.customCardSi =
        showOtherExamples &&
        new CustomCard(window.checkout, {
            type: 'card',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            styles: styles_si,
            trimTrailingSeparator: true,
            onConfigSuccess: onConfigSuccess_si,
            onFieldValid: onFieldValid_si,
            onBrand: onBrand_si,
            onError: onError_si,
            onFocus: onFocus_si,
            placeholders: { cardNumber: 'add card number', expiryDate: 'mm/yy', securityCodeThreeDigits: '123', securityCodeFourDigits: '1234' }
        }).mount('.secured-fields-si');

    window.fancyCustomCard =
        showOtherExamples &&
        new CustomCard(window.checkout, {
            type: 'card',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            styles: fancyStyles,
            autoFocus: false,
            placeholders: { cardNumber: 'add card number', expiryDate: 'mm/yy', securityCodeThreeDigits: '123', securityCodeFourDigits: '1234' },
            onFieldValid: fancyFieldValid,
            onBrand: fancyChangeBrand,
            onError: fancyErrors,
            onFocus: fancyFocus
        }).mount('.fancy-secured-fields');
};

initCheckout();

// Clear placeholders for material design example
configObj.translations = {
    'en-US': {
        'creditCard.numberField.placeholder': '',
        'creditCard.expiryDateField.placeholder': '',
        'creditCard.cvcField.placeholder.3digits': '',
        'creditCard.cvcField.placeholder.4digits': ''
    }
};

const initCheckout2 = async () => {
    window.checkout = await AdyenCheckout(configObj);

    window.materialDesignCustomCard =
        showOtherExamples &&
        new CustomCard(window.checkout, {
            type: 'card',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            styles: materialStyles,
            onFocus: materialFocus,
            onError: handleMaterialError,
            onFieldValid: onMaterialFieldValid,
            onConfigSuccess: createMaterialLabelListener
        }).mount('.material-secured-fields-container');
};

initCheckout2();

const threeDS2 = (result, component) => {
    const cardButton = document.querySelector('.js-securedfields');

    if (window.customCard) {
        const sfNode = document.querySelector('.secured-fields');
        while (sfNode.firstChild) {
            sfNode.removeChild(sfNode.firstChild);
        }
    }

    if (cardButton) {
        cardButton.remove();
    }

    cardText.innerText += ' - 3DS2';

    component.handleAction(result.action);
};

function handleOnChange(state) {
    // if (!state.data || !state.data.paymentMethod) return;
    //    const type = state.data.type || state.data.paymentMethod.type;
    //    console.log(`${type} Component handleOnChange isValid:${state.isValid} state=`, state);
}

function handleOnRiskData(riskData) {
    //    console.log('handleOnRiskData riskData=', riskData);
}

function handlePaymentResult(result, component) {
    console.log('Result: ', result);

    if (result.action) {
        threeDS2(result, component);
    } else {
        switch (result.resultCode) {
            case 'Authorised':
                cardText.innerText += ' - ' + result.resultCode;
                document.querySelector('.secured-fields').style.display = 'none';
                break;
            case 'Refused':
                cardText.innerText += ' - ' + result.resultCode;
                break;
            default:
        }
    }
}

function startPayment(component) {
    if (!component.isValid) return component.showValidation();

    const allow3DS2 = paymentsConfig.authenticationData.attemptAuthentication || 'never';

    const riskdata = checkout.modules.risk.data;

    makePayment(component.data, {
        additionalData: { riskdata },
        authenticationData: {
            attemptAuthentication: allow3DS2,
            // comment out below if you want to force MDFlow
            threeDSRequestData: {
                nativeThreeDS: 'preferred'
            }
        }
    })
        .then(result => {
            handlePaymentResult(result, component);
        })
        .catch(error => {
            throw Error(error);
        });
}

function createPayButton(parent, component, attribute) {
    const payBtn = document.createElement('button');

    payBtn.textContent = 'Pay';
    payBtn.name = 'pay';
    payBtn.classList.add('adyen-checkout__button', 'js-components-button--one-click', `js-${attribute}`);

    payBtn.addEventListener('click', e => {
        e.preventDefault();
        startPayment(component);
    });

    document.querySelector(parent).appendChild(payBtn);

    return payBtn;
}
