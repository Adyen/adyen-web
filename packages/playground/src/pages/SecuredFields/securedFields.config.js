let hideCVC = false;
let isDualBranding = false;

function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function setLogosActive(rootNode, mode) {
    const imageHolder = rootNode.querySelector('.pm-image');

    switch (mode) {
        case 'dualBranding_notValid':
            Object.assign(imageHolder.style, { 'pointer-events': 'none', opacity: 0.5 });
            break;

        case 'dualBranding_valid':
            Object.assign(imageHolder.style, { 'pointer-events': 'auto', opacity: 1 });
            break;

        default:
            // reset
            Object.assign(imageHolder.style, { 'pointer-events': 'none', opacity: 1 });
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
    pCallbackObj.rootNode.querySelector('#pmImage2').style.display = 'none';

    setLogosActive(pCallbackObj.rootNode);

    /**
     * Set focus on first element
     */
    setTimeout(() => {
        // Allow time for screen to redraw after spinner is hidden
        window.securedFields.setFocusOn('encryptedCardNumber');
    }, 100);

    //    window.securedFields.updateStyles({
    //        base: {
    //            color: '#000',
    ////            fontSize: '18px',
    ////            lineHeight: '18px'
    //        },
    //        error: {
    //            color: 'orange'
    //        },
    //        validated: {
    //            color: 'blue',
    //            fontWeight: 'bold'
    //        },
    //        placeholder: {
    //            color: 'green'
    //        }
    //    });
}

export function setCCErrors(pCallbackObj) {
    if (pCallbackObj.error === 'originKeyError') {
        document.querySelector('.card-input__spinner__holder').style.display = 'none';
        pCallbackObj.rootNode.style.display = 'block';
        return;
    }

    if (!pCallbackObj.rootNode) return;

    const sfNode = pCallbackObj.rootNode.querySelector(`[data-cse="${pCallbackObj.fieldType}"]`);
    const errorNode = sfNode.parentNode.querySelector('.pm-form-label__error-text');

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
    console.log('### securedFields.config::onBrand:: pCallbackObj', pCallbackObj);
    console.log('### securedFields.config::onBrand:: isDualBranding', isDualBranding);

    /**
     * If not in dual branding mode - add card brand to first image element
     */
    if (!isDualBranding) {
        const brandLogo1 = pCallbackObj.rootNode.querySelector('#pmImage');
        setAttributes(brandLogo1, {
            src: pCallbackObj.brandImageUrl,
            alt: pCallbackObj.brand,
            'data-value': pCallbackObj.brand
        });

        // Ensure holder is in correct state
        setLogosActive(pCallbackObj.rootNode);
    }

    /**
     * Deal with showing/hiding CVC field
     */
    let labelNode;

    if (pCallbackObj.cvcPolicy === 'hidden' && !hideCVC) {
        hideCVC = true;
        labelNode = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
        labelNode.style.display = 'none';
    }

    if (hideCVC && pCallbackObj.cvcPolicy !== 'hidden') {
        // explicitly set to false
        hideCVC = false;

        labelNode = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
        labelNode.style.display = 'block';
    }
}

function dualBrandListener(e) {
    securedFields.dualBrandingChangeHandler(e);
}

function resetDualBranding(rootNode) {
    isDualBranding = false;

    setLogosActive(rootNode);

    const brandLogo1 = rootNode.querySelector('#pmImage');
    brandLogo1.removeEventListener('click', dualBrandListener);

    const brandLogo2 = rootNode.querySelector('#pmImage2');
    brandLogo2.removeEventListener('click', dualBrandListener);
    brandLogo2.style.display = 'none';
}

/**
 * Implementing dual branding
 */
function onDualBrand(pCallbackObj) {
    console.log('### securedFields.config::onDualBrand:: pCallbackObj', pCallbackObj);

    const brandLogo1 = pCallbackObj.rootNode.querySelector('#pmImage');
    const brandLogo2 = pCallbackObj.rootNode.querySelector('#pmImage2');

    isDualBranding = true;

    /**
     * Set first brand icon (and, importantly also add alt &/or data-value attrs); and add event listener
     */
    setAttributes(brandLogo1, {
        src: pCallbackObj.supportedBrandsRaw[0].brandImageUrl,
        alt: pCallbackObj.supportedBrandsRaw[0].brand,
        'data-value': pCallbackObj.supportedBrandsRaw[0].brand
    });

    brandLogo1.addEventListener('click', dualBrandListener);

    /**
     * Set second brand icon (and, importantly also add alt &/or data-value attrs); and add event listener
     */
    brandLogo2.style.display = 'inline';
    setAttributes(brandLogo2, {
        src: pCallbackObj.supportedBrandsRaw[1].brandImageUrl,
        alt: pCallbackObj.supportedBrandsRaw[1].brand,
        'data-value': pCallbackObj.supportedBrandsRaw[1].brand
    });
    brandLogo2.addEventListener('click', dualBrandListener);

    /**
     *  If card number already valid e.g. from 'paste' event (in which case the onFieldValid callback will be called before the onBinLookup callback)
     *  - make the logos active
     */
    const mode = securedFields.state.valid.encryptedCardNumber ? 'dualBranding_valid' : 'dualBranding_notValid';
    setLogosActive(pCallbackObj.rootNode, mode);
}

export function onBinLookup(pCallbackObj) {
    console.log('### SecuredFields::onBinLookup:: pCallbackObj', pCallbackObj);

    /**
     * Dual branded result...
     */
    if (pCallbackObj.supportedBrandsRaw?.length > 1) {
        console.log('### SecuredFields::onBinLookup:: DUAL BRANDING');
        onDualBrand(pCallbackObj);
        return;
    }

    /**
     * ...else - binLookup 'reset' result or binLookup result with only one brand
     */
    if (pCallbackObj.isReset) {
        console.log('### SecuredFields::onBinLookup:: RESET');
    } else {
        console.log('### SecuredFields::onBinLookup:: RESULT BUT NO DUAL BRANDING');
    }

    resetDualBranding(pCallbackObj.rootNode);
}

export function onFieldValid(pCallbackObj) {
    /**
     * If we're in a dual branding scenario & the number field becomes valid or is valid and become invalid
     * - set the brand logos to the required 'state'
     */
    if (pCallbackObj.fieldType === 'encryptedCardNumber' && isDualBranding) {
        const mode = pCallbackObj.valid ? 'dualBranding_valid' : 'dualBranding_notValid';
        setLogosActive(pCallbackObj.rootNode, mode);
    }
}

const setErrorClasses = function(pNode, pSetErrors) {
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

const setFocusClasses = function(pNode, pSetFocus) {
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
