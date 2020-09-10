import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { makePayment, makeDetailsCall, getOriginKey } from '../../services';
import { styles, placeholders, ariaLabels, setCCErrors, setFocus, onBrand, onConfigSuccess } from './securedFields.config';
import { styles_si, onConfigSuccess_si, onFieldValid_si, onBrand_si, onError_si, onFocus_si } from './securedFields-si.config';
import { fancyStyles, fancyChangeBrand, fancyErrors, fancyFieldValid, fancyFocus } from './securedFields-fancy.config';
import { materialStyles, materialFocus, handleMaterialError, onMaterialFieldValid } from './securedFields-material.config';
import { shopperLocale } from '../../config/commonConfig';
import paymentsConfig from '../../config/paymentsConfig';
import '../../../config/polyfills';
import '../../style.scss';
import './securedFields.style.scss';

window.paymentData = {};
const cardText = document.querySelector('.sf-text');

const createMaterialLabelListener = () => {
    const materialLabels = document.getElementsByClassName('material-input-label');
    const labels = Array.from(materialLabels);

    labels.forEach(label => {
        label.addEventListener('click', e => {
            e.preventDefault();
            // e.target.
            const nextSecuredFieldType = e.target.nextElementSibling.dataset.cse;
            materialDesignSecuredFields.setFocusOn(nextSecuredFieldType);
        });
    });
};

getOriginKey().then(originKey => {
    window.checkout = new AdyenCheckout({
        originKey,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        //        environment: 'http://localhost:8080/checkoutshopper/',
        environment: 'test',
        onChange: handleOnChange,
        //        onValid: handleOnValid,
        onError: console.error,
        risk: {
            enabled: true, // Means that "riskdata" will then show up in the data object sent to the onChange event
            // Also accessible via checkout.modules.risk.data
            node: '.merchant-checkout__form', // Element that DF iframe is briefly added to
            //            onComplete: handleOnRiskData,
            onError: console.error
        }
    });

    // SECURED FIELDS
    window.securedFields = checkout
        .create('securedfields', {
            type: 'card',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            styles,
            placeholders,
            ariaLabels,
            onConfigSuccess,
            onBrand,
            onBinValue: cbObj => {
                //                console.log('onBinValue', cbObj);
            },
            onError: setCCErrors,
            onFocus: setFocus
            //            onFieldValid: obj => {
            //                console.log('### SecuredFields::onFieldValid:: obj=', obj);
            //            }
        })
        .mount('.secured-fields');

    createPayButton('.secured-fields', window.securedFields, 'securedfields');

    // COMMENT IN TO HIDE ADDITIONAL SF EXAMPLES
    //    const extraSFs = Array.prototype.slice.call(document.querySelectorAll('.extra-sf'));
    //    extraSFs.forEach(elem => {
    //        elem.style.display = 'none';
    //    });
    //    return;
    // - END

    window.securedFieldsSi = checkout
        .create('securedfields', {
            type: 'card',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            styles: styles_si,
            trimTrailingSeparator: true,
            onConfigSuccess: onConfigSuccess_si,
            onFieldValid: onFieldValid_si,
            onBrand: onBrand_si,
            onError: onError_si,
            onFocus: onFocus_si
        })
        .mount('.secured-fields-si');

    window.fancySecuredFields = checkout
        .create('securedfields', {
            type: 'card',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            styles: fancyStyles,
            ariaLabels,
            autoFocus: false,
            onFieldValid: fancyFieldValid,
            onBrand: fancyChangeBrand,
            onError: fancyErrors,
            onFocus: fancyFocus
        })
        .mount('.fancy-secured-fields');

    window.materialDesignSecuredFields = checkout
        .create('securedfields', {
            type: 'card',
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
            styles: materialStyles,
            placeholders: {
                encryptedCardNumber: '',
                encryptedExpiryDate: '',
                encryptedSecurityCode: ''
            },
            onFocus: materialFocus,
            onError: handleMaterialError,
            onChange: console.log,
            onBinValue: console.log,
            onFieldValid: onMaterialFieldValid,
            onConfigSuccess: createMaterialLabelListener
        })
        .mount('.material-secured-fields-container');
});

const handle3DS2ComponentResponse = retrievedData => {
    console.log('handle3DS2ComponentResponse data=', retrievedData);

    makeDetailsCall(retrievedData.data).then(result => {
        handlePaymentResult(result);
    });
};

const threeDS2 = result => {
    const cardButton = document.querySelector('.js-securedfields');

    const { authentication, details, paymentData, resultCode } = result;
    const fingerprintToken = authentication['threeds2.fingerprintToken'] || '';
    const challengeToken = authentication['threeds2.challengeToken'] || '';
    window.paymentData = paymentData;

    if (window.securedFields) {
        window.securedFields.unmount();

        const sfNode = document.querySelector('.secured-fields');
        while (sfNode.firstChild) {
            sfNode.removeChild(sfNode.firstChild);
        }
    }

    if (cardButton) {
        cardButton.remove();
    }

    cardText.innerText = resultCode;

    if (resultCode === 'IdentifyShopper') {
        const threeds2DeviceFingerprint = checkout
            .create('threeDS2DeviceFingerprint', {
                fingerprintToken,
                paymentData,
                onComplete: handle3DS2ComponentResponse,
                onError: console.error
            })
            .mount('.secured-fields');

        window.threeDS2DeviceFingerprint = threeds2DeviceFingerprint;
    }

    if (resultCode === 'ChallengeShopper') {
        const threeDS2Challenge = checkout
            .create('threeDS2Challenge', {
                challengeToken,
                size: '02', // optional, defaults to '01'
                paymentData,
                onComplete: handle3DS2ComponentResponse,
                onError: console.error
            })
            .mount('.secured-fields');

        window.threeDS2Challenge = threeDS2Challenge;
    }
};

function handleOnChange(state) {
    if (!state.data || !state.data.paymentMethod) return;
    const type = state.data.type || state.data.paymentMethod.type;
    console.log(`${type} Component handleOnChange isValid:${state.isValid} state=`, state);
}

function handleOnValid(state) {
    if (!state.data || !state.data.paymentMethod) return;
    const type = state.data.type || state.data.paymentMethod.type;
    console.log(`${type} Component handleOnValid. state.data=`, state.data);
}

function handleOnRiskData(riskData) {
    console.log('handleOnRiskData riskData=', riskData);
}

function handlePaymentResult(result) {
    console.log('Result: ', result);

    switch (result.resultCode) {
        case 'RedirectShopper':
            window.location = result.redirect.url;
            break;
        case 'IdentifyShopper':
        case 'ChallengeShopper':
            threeDS2(result);
            break;
        case 'Authorised':
            cardText.innerText = result.resultCode;
            document.querySelector('.secured-fields').style.display = 'none';
            break;
        case 'Refused':
            cardText.innerText = result.resultCode;
            break;
    }
}

function startPayment(component) {
    if (!component.isValid) return component.showValidation();

    const allow3DS2 = paymentsConfig.additionalData.allow3DS2 || false;

    const riskdata = checkout.modules.risk.data;

    makePayment(component.data, { additionalData: { riskdata, allow3DS2 } })
        .then(result => {
            handlePaymentResult(result);
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
