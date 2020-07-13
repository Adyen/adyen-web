import csf from '../../../src/components/internal/SecuredFields/lib/index';
import '../../../config/polyfills';
import '../../style.scss';
import '../../utils';

window._b$dl = false;

/**
 * Steps to make payment (against http://localhost:8080/backoffice):
 *  - Got to TestMerchant WS user at http://localhost:8080/backoffice/
 *  - Generate originKey for http://localhost:8011 (or whichever IP address you are running this code at)
 *  - Paste originKey into originKeyMaster property below
 *  - Access the CSE file (from backoffice go to the library location for the "Hosted Client-Side Encryption") and copy the public key from near the bottom of the file
 *  - Paste the public key into the corresponding position in the local temp CSE file e.g. tempCse_v24_expanded_noDf_noPlugins.js
 *  - Paste the publicKeyToken section of the originKey into the top of the local temp CSE file
 */

/**
 * SecuredFields from localhost:8011
 * - needs SF_ENV set in Components
 * - .env setup for local (or test)
 * - below settings will make payment when tempCse_v24_...js has correct key & token from localhost:8080
 */
const originKeyMaster = 'ghf'; // Doesn't actually matter - since we hardcode the origin in the localhost:8011 securedFields file
const loadingContextMaster = 'http://localhost:8011/';
const paymentsURL = 'http://localhost:8011/payments';

/**
 * SecuredFields from localhost:8080 (backoffice)
 * - NO SF_ENV set in Components
 * - .env setup for local (or test)
 */
//const originKeyMaster = 'pub.v2.9915834835780790.aHR0cDovL2xvY2FsaG9zdDozMDIw.SXD6QhfK6HzqFxU95FkUlweUv6_r5IVDoNDpXZGcbj4';//3020
//const loadingContextMaster = 'http://localhost:8080/checkoutshopper/';
//const paymentsURL = 'http://localhost:8011/payments';

/**
 * SecuredFields from Test server
 * - NO SF_ENV set in Components
 * - .env setup for test
 */
//const originKeyMaster = 'pub.v2.8714289145368445.aHR0cDovL2xvY2FsaG9zdDozMDIw.gQ1Kiz6ONmR6PekFDfFtUL4UoXBLq-S_pD-uKggE-9s';//Test
//const loadingContextMaster = 'https://checkoutshopper-test.adyen.com/checkoutshopper/';
//const paymentsURL = 'http://localhost:3020/payments';

// IE - Needs retested
// const loadingContextMaster = 'http://172.17.126.252:8011/';// works across localhost & IE VM - but not offline

let globalType, globalRootNode;

const startTime = new Date().getTime();

let cardBrand = '';

let myCSF1HideCVC = false;

// QUICK WAY TO SHOW OR HIDE SF EXAMPLES
const showCard = true;
const showKCPCard = true;
const showStoredCard = true;
const showACH = true;
const showGiftCard = true;
const showSepa = true;

///////////// SET UP checkoutSecuredFields ////////////////////////////

const sfStyle = {
    base: {
        color: '#000',
        fontSize: '14px',
        lineHeight: '14px'
        //                caretColor: 'red'
        //                textAlign : 'center',
        //                padding : '0 0 0 420px'
    },
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

// NOTE: If setting a placeholder to be empty, there is a strange issue in Chrome whereby the input field then doesn't take its styling
// and any typed text will be in the placeholder styled color.
// To fix this - set a space as the placeholder character OR pass nothing but style the placeholder to be the desired text color
const placeholders = {
    encryptedCardNumber: 'Custom number placeholder',
    encryptedExpiryDate: 'mm/yy',
    encryptedExpiryMonth: 'mm',
    encryptedExpiryYear: 'yy',
    encryptedSecurityCode: '9999'
    //            encryptedPin: '12'
};

const ariaLabels = {
    lang: 'en-GB',
    encryptedCardNumber: {
        label: 'Custom aria number label',
        iframeTitle: 'Iframe for credit card number field',
        error: 'Ongeldig kaartnummer'
    },
    encryptedExpiryDate: {
        label: 'Custom aria expiry date label',
        iframeTitle: 'Iframe for expiry date field'
    },
    encryptedSecurityCode: {
        label: 'Custom aria security code label'
    }
    //            encryptedExpiryMonth: {
    //                label: 'Custom aria expiry month label',
    //            }
};

const onLoad = function(pCallbackObj) {
    const elTime = new Date().getTime() - startTime;
    //            if(window.console && window.console.log){
    //                window.console.log('@@@ index::onLoad:: elapsedTime=',elTime);
    //                window.console.log( '\n@@@ index::onLoad:: iframes loaded - but not necessarily initiated pCallbackObj=',pCallbackObj );
    //            }
};

const onConfigSuccess = function(pCallbackObj, pDebugRef) {
    const elTime = new Date().getTime() - startTime;
    //            if(window.console && window.console.log){
    //                window.console.log('@@@ index::onConfigSuccess:: elapsedTime=',elTime);
    //                    window.console.log( '\n@@@ index::onConfigSuccess:: iframes loaded and ready! pCallbackObj=', pCallbackObj );
    //            }

    if (pCallbackObj.type === 'card') {
        myCard1 && myCard1.setFocusOnFrame('encryptedCardNumber');

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

        const rootNode = document.querySelector('#adyenPaymentDivCard1');
        const error = 'incomplete field';

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

    //            setTimeout(()=>{
    //                myCard1.destroy();
    //            }, 5000);
};

const onAllValid = function(pCallbackObj) {
    if (window.console && window.console.log) {
        window.console.log('\n@@@ index::onAllValid:: pCallbackObj=', pCallbackObj);
    }

    globalRootNode = pCallbackObj.rootNode;

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

const onFieldValid = function(pCallbackObj) {
    if (window.console && window.console.log) {
        window.console.log('\n@@@ index::onFieldValid:: pCallbackObj=', pCallbackObj);
    }
};

const onBrand = function(pCallbackObj) {
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
        if (!myCSF1HideCVC) {
            myCSF1HideCVC = true;

            if (window.console && window.console.log) {
                window.console.log('@@@ index::onBrand:: HIDE CVC FIELD!!!');
            }

            const elem = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
            //  elem.style.display = 'none';
        }
    }

    if (myCSF1HideCVC && pCallbackObj.hideCVC === false) {
        // if explicitly been set to false

        myCSF1HideCVC = false;

        if (window.console && window.console.log) {
            window.console.log('@@@ index::onBrand:: SHOW CVC FIELD!!!');
        }

        const elem = pCallbackObj.rootNode.getElementsByClassName('pm-form-label--cvc')[0];
        // elem.style.display = 'block';
    }
};

const onError = function(pCallbackObj) {
    if (window.console && window.console.log) {
        window.console.log('\n@@@ index::onError:: pCallbackObj=', pCallbackObj);
    }

    setCCErrors(pCallbackObj);
};

const onFocus = function(pCallbackObj) {
    //            if(window.console && window.console.log){
    //                window.console.log('\n@@@ index:: onFocus:: pCallbackObj=',pCallbackObj);
    //            }
    setFocus(pCallbackObj);
};

const onBinValue = function(pCallbackObj) {
    if (pCallbackObj.binValue.indexOf('encrypted') > -1) {
        window.console.log('\n@@@ index:: onBinValue:: pCallbackObj=', pCallbackObj);
    }
};

const onAutoComplete = function(pCallbackObj) {
    //            if(window.console && window.console.log){
    //                window.console.log('\n@@@ index:: onAutoComplete:: pCallbackObj=',pCallbackObj);
    //            }

    if (pCallbackObj.name === 'cc-name') {
        pCallbackObj.rootNode.querySelector('.pm-input-field-name').value = pCallbackObj.value;
    }
};

// #config & #init
const csfCardConfig = {
    rootNode: '#adyenPaymentDivCard1',

    type: 'card',
    //            type: 'bcmc',// Single, 'branded' card - cardGroupTypes shouldn't be included - but if they are they will be ignored

    cardGroupTypes: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'forbrugsforeningen', 'elo', 'diners', 'hiper'],
    //            cardGroupTypes: ['visa'],// Can also create a single, 'branded' card field by leaving type as 'card' and placing one txVariant on the cardGroupTypes array
    //            cardGroupTypes: ['mc', 'mir'],

    iframeUIConfig: {
        sfStyles: sfStyle,
        placeholders: placeholders,
        ariaLabels: ariaLabels
    },

    // IF THE CSF ISN'T SERVED AS AN ASSET I.E. LOADED FROM AN ADYEN SERVER IN A PRE-COMPILED FORM
    // THEN SPECIFY A loadingContext SO IT CAN:
    // - DETERMINE THE CORRECT origin FOR postMessages
    // - DETERMINE THE CORRECT LOCATION TO LOAD THE iframe CONTENT FROM
    // ALTERNATIVELY ENSURE THAT window._a$checkoutshopperUrl IS SET (TO THE VALUE THAT loadingContext WOULD BE)

    // TODO Quick local testing
    loadingContext: loadingContextMaster,
    originKey: originKeyMaster,

    // Against localhost:8080 - also comment out iframeSrc line ("FOR QUICK LOCAL TESTING") in configCls.js
    // Use the above originKey to make it work
    // Use the originKey below to force the ERROR WHERE THE IFRAME HTML LOADS BUT DOESN'T CONFIGURE
    //            loadingContext: 'http://localhost:8080/checkoutshopper/', //'http://localhost:8080/checkoutshopper/', 'http://localhost:8011'
    //            originKey: 'pub.v2.9915633537748224.aHR0cDovL2xvY2FsaG9zdDozMDAw.oqQEMZn_KIas3E4_u89J-g8tgRsiXfuZxrArbRFhSdQ',// TestMerchant, localhost:3000 - against localhost:8080

    // Use this originKey with the localhost:8080 loadingContext above, TO FORCE THE "500 INTERNAL SERVER ERROR" WHERE THE IFRAME HTML DOESN'T LOAD
    //            originKey: 'pub.v2.8714289145368445.aHR0cDovL2xvY2FsaG9zdDo4MDEx.tF7_eAV1SvY_5vJItbEqWLDEqtIbaR12iJomrNF1beI',// TestMerchantCheckout, localhost:8011 - against test

    //---------------------------

    //TODO Quick local testing IE
    //            loadingContext:  'http://172.17.126.252:8011',// works across localhost & IE VM - but not offline
    //            originKey: 'pub.v2.9915579926493551.aHR0cDovLzE3Mi4xNy4xMjYuMjUyOjgwMTE.0Pl2e5fjuuEw-dCrXDmx-vFmuAlv1CCJK28XHKtqvJA',// http://172.17.126.252:8011 // works across localhost & IE VM - but not offline
    //---------------------------

    // Against Test - also comment out iframeSrc line ("FOR QUICK LOCAL TESTING") in configCls.js & provokeAV.js
    // NOTE: Also need to edit the .env file to comment in the Test related vars - if you want to make a payment
    //            loadingContext:  'https://checkoutshopper-test.adyen.com/checkoutshopper/',
    //            originKey: 'pub.v2.8714289145368445.aHR0cDovL2xvY2FsaG9zdDo4MDEx.tF7_eAV1SvY_5vJItbEqWLDEqtIbaR12iJomrNF1beI',// http://localhost:8011 loading SF from https://checkoutshopper-test.adyen.com/checkoutshopper/
    //            originKey: 'pub.v2.8714289145368445.aHR0cDovL2xvY2FsaG9zdDo4MDExLw.QzyVOTyR4OCvFvfuJqZTVUVk5OyRIDf5W8HtIwzl90I',// http://localhost:8011/
    //---------------------------

    autoFocus: true,
    showWarnings: false,
    allowedDOMAccess: true,
    keypadFix: true,
    // trimTrailingSeparator: false,
    callbacks: {
        onLoad: onLoad,
        onConfigSuccess: onConfigSuccess,
        onFieldValid: onFieldValid,
        onAllValid: onAllValid,
        onBrand: onBrand,
        onError: onError,
        onFocus: onFocus,
        onBinValue: onBinValue,
        onAutoComplete
    }
};

let myCard1;
if (showCard) {
    myCard1 = new csf(csfCardConfig);
    window.mycsf = myCard1;

    //            setTimeout(()=>{
    //                myCard1.isValidated('encryptedCardNumber');
    //                setCCErrors({fieldType:'encryptedCardNumber', error:'hasError', rootNode:document.body});
    //            },3000)

    //        setTimeout(()=>{
    //            myCard1.brandsFromBinLookup({ cardGroups: ['maestro'] });
    //        },5000)
} else {
    document.querySelector('#adyenPaymentDivCard1').style.display = 'none';
    document.querySelector('#payBtn-card').style.display = 'none';
}

// KCP card
const csfCardConfig2 = { ...csfCardConfig };
csfCardConfig2.rootNode = '#adyenPaymentDivCardKCP';
csfCardConfig2.isKCP = true;
//        csfCardConfig2.callbacks.onBrand = () => {};
let myKCPCard;
if (showKCPCard) {
    myKCPCard = new csf(csfCardConfig2);
} else {
    document.querySelector('#adyenPaymentDivCardKCP').style.display = 'none';
    document.querySelector('#payBtn-kcp').style.display = 'none';
}

// Stored card
const csfCardConfig3 = { ...csfCardConfig };
csfCardConfig3.rootNode = '#adyenPaymentDivCard2';
csfCardConfig3.type = 'vpay';
csfCardConfig2.callbacks.onBrand = () => {};
let myStoredCard;
if (showStoredCard) {
    myStoredCard = new csf(csfCardConfig3);
} else {
    document.querySelector('#adyenPaymentDivCard2').style.display = 'none';
    document.querySelector('#payBtn-card2').style.display = 'none';
}

const achConfig = {
    rootNode: '#adyenPaymentDivACH',
    type: 'ach',
    originKey: originKeyMaster,
    iframeUIConfig: {
        sfStyles: sfStyle
    },
    loadingContext: loadingContextMaster,
    showWarnings: false,
    allowedDOMAccess: true,
    keypadFix: true,
    callbacks: {
        onLoad: () => {},
        onConfigSuccess: () => {
            console.log('### index::onConfigSuccess:: ACH');
        },
        onFieldValid: obj => {
            console.log('### index::onFieldValid:: obj=', obj);
        },
        onAllValid,
        onError,
        onFocus
    }
};
let myAch;
if (showACH) {
    myAch = new csf(achConfig);
} else {
    document.querySelector('#adyenPaymentDivACH').style.display = 'none';
    document.querySelector('#payBtn-ach').style.display = 'none';
}

// Gift Card
const giftCardPlaceholders = { ...placeholders };
giftCardPlaceholders.encryptedCardNumber = '4444 3333 2222 1111';

const giftCardConfig = {
    rootNode: '#adyenPaymentDivGiftCard',
    type: 'giftcard',
    originKey: originKeyMaster,
    iframeUIConfig: {
        sfStyles: sfStyle,
        placeholders: giftCardPlaceholders
    },
    loadingContext: loadingContextMaster,
    showWarnings: false,
    allowedDOMAccess: true,
    keypadFix: true,
    callbacks: {
        onLoad: () => {},
        onConfigSuccess: () => {
            console.log('### index::onConfigSuccess:: GIFT CARD');
        },
        onFieldValid: obj => {
            console.log('### index::onFieldValid:: obj=', obj);
        },
        onAllValid,
        onError,
        onFocus
    }
};
let myGiftCard;
if (showGiftCard) {
    myGiftCard = new csf(giftCardConfig);
} else {
    document.querySelector('#adyenPaymentDivGiftCard').style.display = 'none';
    document.querySelector('#payBtn-giftcard').style.display = 'none';
}

//        setTimeout(()=>{
//            myGiftCard.isValidated('encryptedCardNumber');
//            setCCErrors({fieldType:'encryptedCardNumber', error:'hasError', rootNode:document.body.querySelector('#adyenPaymentDivGiftCard')});
//        },3000)

// Sepa
const sepaConfig = {
    rootNode: '#adyenPaymentDivSepa',
    type: 'sepa',
    originKey: originKeyMaster,
    iframeUIConfig: {
        sfStyles: sfStyle,
        placeholders: placeholders
    },
    loadingContext: loadingContextMaster,
    showWarnings: false,
    allowedDOMAccess: true,
    keypadFix: true,
    callbacks: {
        onLoad: () => {},
        onConfigSuccess: () => {
            console.log('### index::onConfigSuccess:: SEPA');
        },
        onFieldValid: obj => {
            console.log('### index::onFieldValid:: obj=', obj);
        },
        onAllValid,
        onError: () => {}
    }
};
let myIban;
if (showSepa) {
    myIban = new csf(sepaConfig);
} else {
    document.querySelector('#adyenPaymentDivSepa').style.display = 'none';
    document.querySelector('#payBtn-sepa').style.display = 'none';
}

//-------- end SET UP checkoutSecuredFields -------------------

// ENSURES initiateCardPayment WORKS
globalType = csfCardConfig.type;
if (csfCardConfig.cardGroupTypes.length === 1) {
    globalType = csfCardConfig.cardGroupTypes[0];
}
//--

const setCCErrors = function(pCallbackObj) {
    const holderDiv = pCallbackObj.rootNode.querySelector('[data-cse="' + pCallbackObj.fieldType + '"]');

    const errorNode = holderDiv.parentNode.querySelector('.pm-form-label__error-text');

    if (errorNode && pCallbackObj.error !== '') {
        errorNode.style.display = 'block';
        errorNode.innerText = pCallbackObj.error;

        // Add error classes
        setErrorClasses(holderDiv, true);
    } else if (errorNode && pCallbackObj.error === '') {
        errorNode.style.display = 'none';
        errorNode.innerText = '';

        // Remove error classes
        setErrorClasses(holderDiv, false);
    }
};

const setFocus = function(pCallbackObj) {
    const holderDiv = pCallbackObj.rootNode.querySelector('[data-cse="' + pCallbackObj.fieldType + '"]');

    setFocusClasses(holderDiv, pCallbackObj.focus);
};

const setErrorClasses = function(pNode, pSetErrors) {
    if (pSetErrors) {
        if (pNode.className.indexOf('pm-input-field--error') === -1) {
            pNode.className += ' pm-input-field--error';
        }
        return;
    }

    let newClassName;

    // Remove errors
    if (pNode.className.indexOf('pm-input-field--error') > -1) {
        newClassName = pNode.className.replace('pm-input-field--error', '');
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

    let newClassName;

    // Remove focus
    if (pNode.className.indexOf('pm-input-field--focus') > -1) {
        newClassName = pNode.className.replace('pm-input-field--focus', '');
        pNode.className = newClassName.trim();
    }
};

window.initiateCardPayment = function(pCardType = '') {
    const cardType = pCardType.length ? pCardType + ' ' : pCardType;

    const requestObj = {
        amount: {
            currency: 'USD',
            value: 1000
        },
        reference: 'ABC 123',
        paymentMethod: {
            type: 'scheme',
            encryptedCardNumber: globalRootNode.querySelector('#' + globalType + '-encrypted-encryptedCardNumber').value,
            encryptedExpiryMonth: globalRootNode.querySelector('#' + globalType + '-encrypted-encryptedExpiryMonth').value,
            encryptedExpiryYear: globalRootNode.querySelector('#' + globalType + '-encrypted-encryptedExpiryYear').value,
            encryptedSecurityCode: globalRootNode.querySelector('#' + globalType + '-encrypted-encryptedSecurityCode').value
        },
        returnUrl: 'http://localhost:3000/verify.php',
        merchantAccount: 'TestMerchant'
    };

    if (pCardType === 'KCP') {
        // TODO - switch to encryptedPassword once localhost:8080 can handle it
        requestObj.paymentMethod.encryptedPin = globalRootNode.querySelector('#' + globalType + '-encrypted-encryptedPassword').value;
        requestObj.paymentMethod.taxNumber = globalRootNode.querySelector('.pm-input-dob-field').value;
    }

    if (window.console && window.console.log) {
        window.console.log('@@@ index::initiateCardPayment:: requestObj=', requestObj);
        console.log('### index::initiateCardPayment:: rootNode = ', globalRootNode.getAttribute('id'));
    }

    submitPaymentRequest(requestObj, cardType + 'Card');

    createRequestUI();
};

window.initiateACHPayment = function() {
    const requestObj = {
        amount: {
            currency: 'USD',
            value: 1000
        },
        reference: 'ACH test',
        paymentMethod: {
            type: 'ach',
            ownerName: 'John Smith',
            encryptedBankAccountNumber: document.querySelector('#' + 'ach' + '-encrypted-encryptedBankAccountNumber').value,
            encryptedBankLocationId: document.querySelector('#' + 'ach' + '-encrypted-encryptedBankLocationId').value
        },
        billingAddress: {
            houseNumberOrName: '50',
            street: 'Test Street',
            city: 'Amsterdam',
            stateOrProvince: 'NY',
            postalCode: '12010',
            country: 'US'
        },
        returnUrl: 'http://localhost:3000/verify.php',
        merchantAccount: 'TestMerchant'
    };

    if (window.console && window.console.log) {
        window.console.log('@@@ index::initiateACHPayment:: requestObj=', requestObj);
    }

    submitPaymentRequest(requestObj, 'Ach');

    createRequestUI();
};

const submitPaymentRequest = function(requestObj, typeStr) {
    const options = {
        method: 'POST',
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'text/html; charset=utf-8',
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: JSON.stringify(requestObj)
    };

    return fetch(paymentsURL, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            return console.warn(`Service at ${paymentsURL} is not available`);
        })
        .then(data => {
            window.console.log('@@@ index::/payments success:: data=', data);

            let resultTxt,
                htmlStr,
                resultType,
                reason = '';

            if (data) {
                if (data.resultCode) {
                    reason = data.refusalReason ? `("${data.refusalReason}")` : '';

                    resultTxt = `${data.resultCode} ${reason}  --pspRef: ${data.pspReference}`;
                    resultType = 'Result';
                }

                if (data.errorCode) {
                    resultTxt = data.errorType + ' error. Message: ' + data.message;
                    resultType = 'Error';
                }

                htmlStr = `<div><h4>${typeStr}</h4><b>${resultType}: </b> ${resultTxt}</div>`;
                globalRootNode.innerHTML = htmlStr;
                globalRootNode.style.opacity = 1;

                const payBtn = globalRootNode.nextElementSibling;
                if (!payBtn || payBtn.getAttribute('type') !== 'button') {
                    return;
                }

                payBtn.style.display = 'none';
            }
        })
        .catch(e => {
            console.warn(`Call to ${paymentsURL} failed. Error= ${e}`);
        });
};

const createRequestUI = function() {
    globalRootNode.style.opacity = 0.3;
    globalRootNode.style['pointer-events'] = 'none';

    const payBtn = globalRootNode.nextElementSibling;
    if (!payBtn || payBtn.getAttribute('type') !== 'button') {
        return;
    }

    const htmlStr = `<div class="adyen-checkout__spinner__wrapper adyen-checkout__spinner__wrapper--inline">
                            <div class="adyen-checkout__spinner adyen-checkout__spinner--medium" style="border: 3px solid #FFF;border-top-color: transparent;"/>
                        </div>`;

    payBtn.innerHTML = htmlStr;

    payBtn.style.opacity = 0.3;
    payBtn.style['pointer-events'] = 'none';
    payBtn.style.height = '58px';
    payBtn.style.padding = 0;
};
