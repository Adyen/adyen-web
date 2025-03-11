let hideCVC = false;
let optionalCVC = false;
let hideDate = false;
let optionalDate = false;
let isDualBranding = false;

function setAttributes(el, attrs) {
    for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function setLogosActive(rootNode, mode) {
    const imageHolder = rootNode.querySelector('.pm-image');
    const dualBrandingImageHolder = rootNode.querySelector('.pm-image-dual');

    switch (mode) {
        case 'dualBranding_notValid':
            Object.assign(imageHolder.style, { display: 'none' });
            Object.assign(dualBrandingImageHolder.style, { display: 'block', 'pointer-events': 'none', opacity: 0.5 });
            break;

        case 'dualBranding_valid':
            Object.assign(imageHolder.style, { display: 'none' });
            Object.assign(dualBrandingImageHolder.style, { display: 'block', 'pointer-events': 'auto', opacity: 1 });
            break;

        default:
            // reset
            Object.assign(imageHolder.style, { display: 'block' });
            Object.assign(dualBrandingImageHolder.style, { display: 'none' });
    }
}

export const styles = {
    //    base: {
    //        caretColor: 'red'
    //    },
    error: {
        color: 'red'
    },
    validated: {
        color: 'green',
        fontWeight: 'bold'
        //        background: 'blue'
    },
    placeholder: {
        color: '#d8d8d8'
    }
};

export function onConfigSuccess(pCallbackObj) {
    /**
     * Set the UI to it's starting state
     */
    document.querySelector('.card-input__spinner__holder').style.display = 'none';

    pCallbackObj.rootNode.style.display = 'block';

    pCallbackObj.rootNode.querySelector('.pm-image-dual').style.display = 'none';

    setLogosActive(pCallbackObj.rootNode);

    /**
     * Set focus on first element
     */
    setTimeout(() => {
        // Allow time for screen to redraw after spinner is hidden
        globalThis.customCard.setFocusOn('encryptedCardNumber');
    }, 100);

    // globalThis.customCard.updateStyles({
    //     base: {
    //         color: '#000'
    //         //            fontSize: '18px',
    //         //            lineHeight: '18px'
    //     },
    //     error: {
    //         color: 'orange'
    //     },
    //     validated: {
    //         color: 'blue',
    //         fontWeight: 'bold'
    //     },
    //     placeholder: {
    //         color: 'green'
    //     }
    // });
}

export function setCCErrors(pCallbackObj) {
    if (!pCallbackObj.rootNode) return;

    const sfNode = pCallbackObj.rootNode.querySelector(`[data-cse="${pCallbackObj.fieldType}"]`);
    const errorNode = sfNode.parentNode.querySelector('.pm-form-label__error-text');

    if (errorNode.innerText === '' && pCallbackObj.error === '') return;

    if (pCallbackObj.error !== '') {
        errorNode.style.display = 'block';
        errorNode.innerText = pCallbackObj.errorI18n;

        // Add error classes
        setErrorClasses(sfNode, true);
        return;
    }

    // Else: error === ''
    errorNode.style.display = 'none';
    errorNode.innerText = '';

    // Remove error classes
    setErrorClasses(sfNode, false);
}

export function setFocus(pCallbackObj) {
    const sfNode = pCallbackObj.rootNode.querySelector(`[data-cse="${pCallbackObj.fieldType}"]`);
    setFocusClasses(sfNode, pCallbackObj.focus);
}

export function onBrand(pCallbackObj) {
    /**
     * If not in dual branding mode - add card brand to first image element
     */
    if (!isDualBranding) {
        const brandLogo1 = pCallbackObj.rootNode.querySelector('.pm-image-1');
        setAttributes(brandLogo1, {
            src: pCallbackObj.brandImageUrl,
            alt: pCallbackObj.brand
        });
    }

    /**
     * Deal with showing/hiding CVC field
     */
    const cvcNode = pCallbackObj.rootNode.querySelector('.pm-form-label--cvc');

    if (pCallbackObj.cvcPolicy === 'hidden' && !hideCVC) {
        hideCVC = true;
        cvcNode.style.display = 'none';
    }

    if (hideCVC && pCallbackObj.cvcPolicy !== 'hidden') {
        hideCVC = false;
        cvcNode.style.display = 'block';
    }

    // Optional cvc fields
    if (pCallbackObj.cvcPolicy === 'optional' && !optionalCVC) {
        optionalCVC = true;
        if (cvcNode) cvcNode.querySelector('.pm-form-label__text').innerText = 'Security code (optional):';
    }

    if (optionalCVC && pCallbackObj.cvcPolicy !== 'optional') {
        optionalCVC = false;
        if (cvcNode) cvcNode.querySelector('.pm-form-label__text').innerText = 'Security code';
    }

    /**
     * Deal with showing/hiding date field(s)
     */
    const dateNode = pCallbackObj.rootNode.querySelector('.pm-form-label--exp-date');
    const monthNode = pCallbackObj.rootNode.querySelector('.pm-form-label--exp-month');
    const yearNode = pCallbackObj.rootNode.querySelector('.pm-form-label--exp-year');

    if (pCallbackObj.expiryDatePolicy === 'hidden' && !hideDate) {
        hideDate = true;
        if (dateNode) dateNode.style.display = 'none';
        if (monthNode) monthNode.style.display = 'none';
        if (yearNode) yearNode.style.display = 'none';
    }

    if (hideDate && pCallbackObj.expiryDatePolicy !== 'hidden') {
        hideDate = false;
        if (dateNode) dateNode.style.display = 'block';
        if (monthNode) monthNode.style.display = 'block';
        if (yearNode) yearNode.style.display = 'block';
    }

    // Optional date fields
    if (pCallbackObj.expiryDatePolicy === 'optional' && !optionalDate) {
        optionalDate = true;
        if (dateNode) dateNode.querySelector('.pm-form-label__text').innerText = 'Expiry date (optional):';
        if (monthNode) monthNode.querySelector('.pm-form-label__text').innerText = 'Expiry month (optional):';
        if (yearNode) yearNode.querySelector('.pm-form-label__text').innerText = 'Expiry year (optional):';
    }

    if (optionalDate && pCallbackObj.expiryDatePolicy !== 'optional') {
        optionalDate = false;
        if (dateNode) dateNode.querySelector('.pm-form-label__text').innerText = 'Expiry date:';
        if (monthNode) monthNode.querySelector('.pm-form-label__text').innerText = 'Expiry month:';
        if (yearNode) yearNode.querySelector('.pm-form-label__text').innerText = 'Expiry year:';
    }
}

function dualBrandListener(e) {
    globalThis.customCard.dualBrandingChangeHandler(e);
}

function resetDualBranding(rootNode) {
    isDualBranding = false;

    setLogosActive(rootNode);

    const brandLogo1 = rootNode.querySelector('.pm-image-dual-1');
    brandLogo1.removeEventListener('click', dualBrandListener);

    const brandLogo2 = rootNode.querySelector('.pm-image-dual-2');
    brandLogo2.removeEventListener('click', dualBrandListener);
}

/**
 * Implementing dual branding
 */
function onDualBrand(pCallbackObj) {
    const brandLogo1 = pCallbackObj.rootNode.querySelector('.pm-image-dual-1');
    const brandLogo2 = pCallbackObj.rootNode.querySelector('.pm-image-dual-2');

    isDualBranding = true;

    const supportedBrands = pCallbackObj.supportedBrandsRaw;

    /**
     * Set first brand icon (and, importantly also add alt &/or data-value attrs); and add event listener
     */
    setAttributes(brandLogo1, {
        src: supportedBrands[0].brandImageUrl,
        alt: supportedBrands[0].brand,
        'data-value': supportedBrands[0].brand
    });

    brandLogo1.addEventListener('click', dualBrandListener);

    /**
     * Set second brand icon (and, importantly also add alt &/or data-value attrs); and add event listener
     */
    setAttributes(brandLogo2, {
        src: supportedBrands[1].brandImageUrl,
        alt: supportedBrands[1].brand,
        'data-value': supportedBrands[1].brand
    });
    brandLogo2.addEventListener('click', dualBrandListener);
}

export function onBinLookup(pCallbackObj) {
    /**
     * Dual branded result...
     */
    if (pCallbackObj.supportedBrandsRaw?.length > 1) {
        onDualBrand(pCallbackObj);
        return;
    }

    /**
     * ...else - binLookup 'reset' result or binLookup result with only one brand
     */
    resetDualBranding(pCallbackObj.rootNode);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onChange(state, component) {
    /**
     * If we're in a dual branding scenario & the number field becomes valid or is valid and become invalid
     * - set the brand logos to the required 'state'
     */
    if (isDualBranding) {
        const mode = state.valid.encryptedCardNumber ? 'dualBranding_valid' : 'dualBranding_notValid';

        const holder = document.querySelector('.secured-fields') || document.querySelector('.secured-fields-1');

        setLogosActive(holder, mode);
    }
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

const setFocusClasses = function (pNode, pSetFocus) {
    if (pSetFocus) {
        if (pNode.className.indexOf('pm-input-field--focus') === -1) {
            pNode.className += ' pm-input-field--focus';
        }
        return;
    }

    // Remove focus
    if (pNode.className.indexOf('pm-input-field--focus') > -1) {
        const newClassName = pNode.className.replace('pm-input-field--focus', '');
        pNode.className = newClassName.trim();
    }
};
