let myCSF1HideCVC = false;

export function setCCErrors(pCallbackObj) {
    const sfNode = pCallbackObj.rootNode.querySelector(`[data-cse="${pCallbackObj.fieldType}"]`);
    const errorNode = sfNode.parentNode.querySelector('.pm-form-label__error-text');

    if (pCallbackObj.error !== '') {
        errorNode.style.display = 'block';
        errorNode.innerText = pCallbackObj.errorI18n;

        // Add error classes
        setErrorClasses(sfNode, true);
    } else if (pCallbackObj.error === '') {
        errorNode.style.display = 'none';
        errorNode.innerText = '';

        // Remove error classes
        setErrorClasses(sfNode, false);
    }
}

export function setFocus(pCallbackObj) {
    const sfNode = pCallbackObj.rootNode.querySelector(`[data-cse="${pCallbackObj.fieldType}"]`);

    setFocusClasses(sfNode, pCallbackObj.focus);
}

export function onBrand(pCallbackObj) {
    pCallbackObj.rootNode.querySelector('img').setAttribute('src', pCallbackObj.brandImageUrl);

    let labelNode;

    if (pCallbackObj.cvcPolicy === 'hidden' && !myCSF1HideCVC) {
        myCSF1HideCVC = true;
        labelNode = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
        labelNode.style.display = 'none';
    }

    if (myCSF1HideCVC && pCallbackObj.cvcPolicy !== 'hidden') {
        // explicitly set to false
        myCSF1HideCVC = false;

        labelNode = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
        labelNode.style.display = 'block';
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
