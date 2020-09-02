import { setCCErrors, setFocus } from './utils';

export const onLoad = (/* pCallbackObj */) => {
    // const elTime = new Date().getTime() - startTime;
    // if (window.console && window.console.log) {
    //     window.console.log('@@@ index::onLoad:: elapsedTime=', elTime);
    //     window.console.log('\n@@@ index::onLoad:: iframes loaded - but not necessarily initiated pCallbackObj=', pCallbackObj);
    // }
};

export const onConfigSuccess = pCallbackObj => {
    // const elTime = new Date().getTime() - startTime;
    //            if(window.console && window.console.log){
    //                window.console.log('@@@ index::onConfigSuccess:: elapsedTime=',elTime);
    //                    window.console.log( '\n@@@ index::onConfigSuccess:: iframes loaded and ready! pCallbackObj=', pCallbackObj );
    //            }

    if (pCallbackObj.type === 'card') {
        window.myCard1 && window.myCard1.setFocusOnFrame('encryptedCardNumber');

        //                myCard1.updateStyles({
        //                    base: {
        //                        color: '#000',
        //                        fontSize: '18px',
        //                        lineHeight: '18px'
        //                    },
        //                    error: {
        //                        color: 'orange'
        //                    },
        //                    validated: {
        //                        color: 'blue',
        //                        fontWeight: 'bold'
        //                    },
        //                    placeholder: {
        //                        color: 'green'
        //                    }
        //                });

        //                    pDebugRef( 'card', 'encryptedCardNumber', true );

        // const rootNode = document.querySelector('#adyenPaymentDivCard1');
        // const error = 'incomplete field';

        //                var errObj = {rootNode,
        //                    fieldType: 'encryptedCardNumber',
        //                    error}
        //                setCCErrors(errObj);
        //
        //                errObj = {rootNode,
        //                    fieldType: 'encryptedExpiryDate',
        //                    error}
        //                setCCErrors(errObj);
        //
        //                errObj = {rootNode,
        //                    fieldType: 'encryptedSecurityCode',
        //                    error}
        //                setCCErrors(errObj);
    }

    //            if(pCallbackObj.type === 'bcmc'){
    //                pDebugRef( 'bcmc', 'encryptedCardNumber', true );
    //            }

    //            setTimeout(() => {
    //                myCard1.destroy();
    //            }, 5000);
};

export const onAllValid = pCallbackObj => {
    if (window.console && window.console.log) {
        window.console.log('\n@@@ index::onAllValid:: pCallbackObj=', pCallbackObj);
    }

    window.rootNode = pCallbackObj.rootNode;

    const payBtn = pCallbackObj.rootNode.nextElementSibling;
    if (!payBtn || payBtn.getAttribute('type') !== 'button') {
        return;
    }

    if (pCallbackObj.allValid) {
        payBtn.style['pointer-events'] = 'auto';
        payBtn.style.opacity = '1';
        payBtn.removeAttribute('disabled');
    } else {
        payBtn.style['pointer-events'] = 'none';
        payBtn.style.opacity = '0.3';
        payBtn.setAttribute('disabled', 'true');
    }
};

export const onFieldValid = pCallbackObj => {
    if (window.console && window.console.log) {
        window.console.log('\n@@@ index::onFieldValid:: pCallbackObj=', pCallbackObj);
    }
};

export const onBrand = pCallbackObj => {
    if (window.console && window.console.log) {
        window.console.log('\n@@@ index::onBrand:: pCallbackObj=', pCallbackObj);
    }

    cardBrand = pCallbackObj.brand;

    //TODO --- CHANGE VALUES FOR IE TESTING
    pCallbackObj.rootNode
        .querySelector('.pm-image')
        .querySelector('img')
        .setAttribute('src', 'http://localhost:8080/checkoutshopper/images/logos/' + cardBrand + '.svg');
    //    pCallbackObj.rootNode.querySelector('.pm-image').querySelector('img').setAttribute('src', 'http://192.168.20.55:8080/checkoutshopper/images/logos/' + cardBrand + '.svg');
    //TODO ---

    if (pCallbackObj.hideCVC) {
        if (!window.hideCVC) {
            window.hideCVC = true;

            if (window.console && window.console.log) {
                window.console.log('@@@ index::onBrand:: HIDE CVC FIELD!!!');
            }

            // const elem = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
            //  elem.style.display = 'none';
        }
    }

    if (window.hideCVC && pCallbackObj.hideCVC === false) {
        // if explicitly been set to false

        window.hideCVC = false;

        if (window.console && window.console.log) {
            window.console.log('@@@ index::onBrand:: SHOW CVC FIELD!!!');
        }

        // const elem = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
        // elem.style.display = 'block';
    }
};

export const onError = pCallbackObj => {
    if (window.console && window.console.log) {
        window.console.log('\n@@@ index::onError:: pCallbackObj=', pCallbackObj);
    }

    setCCErrors(pCallbackObj);
};

export const onFocus = pCallbackObj => {
    //            if(window.console && window.console.log){
    //                window.console.log('\n@@@ index:: onFocus:: pCallbackObj=',pCallbackObj);
    //            }
    setFocus(pCallbackObj);
};

export const onBinValue = pCallbackObj => {
    if (pCallbackObj.binValue.indexOf('encrypted') > -1) {
        window.console.log('\n@@@ index:: onBinValue:: pCallbackObj=', pCallbackObj);
    }
};

export const onAutoComplete = pCallbackObj => {
    //            if(window.console && window.console.log){
    //                window.console.log('\n@@@ index:: onAutoComplete:: pCallbackObj=',pCallbackObj);
    //            }

    if (pCallbackObj.name === 'cc-name') {
        pCallbackObj.rootNode.querySelector('.pm-input-field-name').value = pCallbackObj.value;
    }
};
