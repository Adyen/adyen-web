let isValidPan = false;

const holderEl = document.querySelector('.secured-fields-si');
const endDigitsEl = document.querySelector('.end-digits');
const panEl = document.querySelector('.pan');
const expDateEl = document.querySelector('.pm-input-field-si.exp-date');
const cvcEl = document.querySelector('.pm-input-field-si.cvc');

export const styles_si = {
    base: {
        fontSize: '14px'
    },
    validated: {
        color: 'blue'
    }
};

const switchToEndDigitsView = function (endDigits) {
    if (endDigits) {
        endDigitsEl.innerText = endDigits;
    }

    if (styles_si && styles_si.validated && styles_si.validated.color) {
        endDigitsEl.style.color = styles_si.validated.color;
    }

    endDigitsEl.style.display = 'block';

    panEl.style.display = 'none';

    expDateEl.style.display = 'block';
    cvcEl.style.display = 'block';

    // Set focus on next screen redraw
    setTimeout(() => {
        window.customCardSi.setFocusOn('encryptedExpiryDate');
    }, 0);
};

const switchToPanView = function () {
    panEl.style.display = 'block';

    expDateEl.style.display = 'none';
    cvcEl.style.display = 'none';

    endDigitsEl.style.display = 'none';

    window.customCardSi.setFocusOn('encryptedCardNumber');
};

endDigitsEl.addEventListener('click', e => {
    switchToPanView();
});

export function onConfigSuccess_si(pCallbackObj) {
    document.querySelector('.secured-fields-si').style.display = 'block';
    document.querySelector('.card-input-si_spinner').style.display = 'none';

    // Allow time for screen to redraw after spinner is hidden
    setTimeout(() => {
        window.customCardSi.setFocusOn('encryptedCardNumber');
    }, 100);
}

export function onFieldValid_si(pCallbackObj) {
    if (pCallbackObj.fieldType === 'encryptedCardNumber') {
        isValidPan = pCallbackObj.valid;

        if (pCallbackObj.valid) {
            switchToEndDigitsView(pCallbackObj.endDigits);
        } else {
            endDigitsEl.innerText = '';
        }
    }
}

export function onError_si(pCallbackObj) {
    if (pCallbackObj.error === 'originKeyError') {
        document.querySelector('.secured-fields-si').style.display = 'block';
        document.querySelector('.card-input-si_spinner').style.display = 'none';
        return;
    }
    if (pCallbackObj.error !== '') {
        // Add error classes
        setErrorClasses(holderEl, true);
    } else if (pCallbackObj.error === '') {
        // Remove error classes
        setErrorClasses(holderEl, false);
    }
}

export function onFocus_si(pCallbackObj) {
    if (pCallbackObj.fieldType === 'encryptedCardNumber' && !pCallbackObj.focus && isValidPan) {
        switchToEndDigitsView();
    }
}

export function onBrand_si(pCallbackObj) {
    const holderDiv = document.querySelector('.secured-fields-si');
    holderDiv.querySelector('#pmImageSi').setAttribute('src', pCallbackObj.brandImageUrl);
}

const setErrorClasses = function (pNode, pSetErrors) {
    if (pSetErrors) {
        if (pNode.className.indexOf('pm-input-field--error') === -1) {
            pNode.className += ' pm-input-field--error';
        }
        return;
    }

    // Remove errors
    if (pNode.className.indexOf('pm-input-field--error') > -1) {
        const newClassName = pNode.className.replace('pm-input-field--error', '');
        pNode.className = newClassName.trim();
    }
};
