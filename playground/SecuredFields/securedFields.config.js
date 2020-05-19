let myCSF1HideCVC = false;

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

export const placeholders = {
    encryptedCardNumber: '9999 9999 9999 9999',
    encryptedExpiryDate: 'mm/dd',
    encryptedSecurityCode: '1234'
};

export const ariaLabels = {
    lang: 'en-GB',
    encryptedCardNumber: {
        label: 'Credit or debit card number field'
        //        iframeTitle: 'Iframe for credit card number field',
        //        placeholder: 'enter credit card number',
        //        error: "credit card number is in error"
    },
    encryptedExpiryDate: {
        label: 'Credit or debit card expiration date field'
    },
    encryptedSecurityCode: {
        label: 'Credit or debit card 3 or 4 digit security code field'
    }
};

export function onConfigSuccess(pCallbackObj) {
    document.querySelector('.secured-fields').style.display = 'block';
    document.querySelector('.card-input__spinner__holder').style.display = 'none';

    setTimeout(() => {
        // Allow time for screen to redraw after spinner is hidden
        window.securedFields.setFocusOn('encryptedCardNumber');
    }, 100);
    //
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
        document.querySelector('.secured-fields').style.display = 'block';
        document.querySelector('.card-input__spinner__holder').style.display = 'none';
        return;
    }

    const sfNode = pCallbackObj.rootNode.querySelector(`[data-cse="${pCallbackObj.fieldType}"]`);
    const errorNode = sfNode.parentNode.querySelector('.pm-form-label__error-text');

    if (pCallbackObj.error !== '') {
        errorNode.style.display = 'block';
        errorNode.innerText = pCallbackObj.i18n;

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
    const holderDiv = document.querySelector('.secured-fields');
    holderDiv.querySelector('#pmImage').setAttribute('src', pCallbackObj.brandImageUrl);

    let labelNode;

    if (pCallbackObj.hideCVC && !myCSF1HideCVC) {
        myCSF1HideCVC = true;
        labelNode = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
        labelNode.style.display = 'none';
    }

    if (myCSF1HideCVC && pCallbackObj.hideCVC === false) {
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

//export const materialStyles = {
//    base: {
//        fontFamily: 'Roboto, sans-serif',
//        padding: '8px 8px 8px 10px'
//    }
//};
//
//const setMaterialClass = (pNode, setOrRemove, classToSet) => {
//    if (setOrRemove) {
//        if (pNode.className.indexOf(classToSet) === -1) {
//            pNode.className += ` ${classToSet}`;
//        }
//        return;
//    }
//
//    // Remove focus
//    if (pNode.className.indexOf(classToSet > -1)) {
//        const newClassName = pNode.className.replace(classToSet, '');
//        pNode.className = newClassName.trim();
//    }
//};
//
//export const materialFocus = focusObject => {
//    const sfNode = focusObject.rootNode.querySelector(`[data-cse="${focusObject.fieldType}"]`);
//    const label = sfNode.previousElementSibling;
//    setMaterialClass(sfNode, focusObject.focus, 'pm-input-field-mat--focus');
//    setMaterialClass(label, focusObject.focus, 'material-input-label--focus');
//};
//
//export const handleMaterialError = errorObject => {
//    const sfNode = errorObject.rootNode && errorObject.rootNode.querySelector(`[data-cse="${errorObject.fieldType}"]`);
//    if(!sfNode) return;
//
//    const label = sfNode.previousElementSibling;
//
//    if (errorObject.error.length > 0) {
//        setMaterialClass(sfNode, true, 'pm-input-field-mat--error');
//        setMaterialClass(label, true, 'material-input-label--error');
//    } else {
//        setMaterialClass(sfNode, false, 'pm-input-field-mat--error');
//        setMaterialClass(label, false, 'material-input-label--error');
//    }
//};
//
//export const onMaterialFieldValid = validObject => {
//    const sfNode = validObject.rootNode.querySelector(`[data-cse="${validObject.fieldType}"]`);
//    const label = sfNode.previousElementSibling;
//
//    if (validObject.valid) {
//        setMaterialClass(sfNode, true, 'pm-input-field-mat--valid');
//        setMaterialClass(label, true, 'material-input-label--valid');
//    } else {
//        setMaterialClass(sfNode, false, 'pm-input-field-mat--valid');
//        setMaterialClass(label, false, 'material-input-label--valid');
//    }
//};
