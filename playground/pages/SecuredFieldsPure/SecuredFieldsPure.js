import csf from '../../../src/components/internal/SecuredFields/lib/index';
import { onLoad, onConfigSuccess, onFieldValid, onAllValid, onBrand, onError, onFocus, onBinValue, onAutoComplete } from './handlers';
import { submitPaymentRequest, createRequestUI } from './utils';
import { originKeyMain, loadingContextMain, showCard, showKCPCard, showStoredCard, showACH, showGiftCard, showSepa } from './config';
import './style.scss';
import '../../../config/polyfills';
import '../../style.scss';
import '../../utils';

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
    loadingContext: loadingContextMain,
    originKey: originKeyMain,

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
        onLoad,
        onConfigSuccess,
        onFieldValid,
        onAllValid,
        onBrand,
        onError,
        onFocus,
        onBinValue,
        onAutoComplete
    }
};

if (showCard) {
    window.myCard1 = new csf(csfCardConfig);
    window.mycsf = window.myCard1;

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let myKCPCard;
if (showKCPCard) {
    myKCPCard = new csf({
        ...csfCardConfig,
        rootNode: '#adyenPaymentDivCardKCP',
        isKCP: true
    });
} else {
    document.querySelector('#adyenPaymentDivCardKCP').style.display = 'none';
    document.querySelector('#payBtn-kcp').style.display = 'none';
}

// Stored card
if (showStoredCard) {
    window.myStoredCard = new csf({
        ...csfCardConfig,
        rootNode: '#adyenPaymentDivCard2',
        type: 'vpay'
    });
} else {
    document.querySelector('#adyenPaymentDivCard2').style.display = 'none';
    document.querySelector('#payBtn-card2').style.display = 'none';
}

const achConfig = {
    rootNode: '#adyenPaymentDivACH',
    type: 'ach',
    originKey: originKeyMain,
    iframeUIConfig: {
        sfStyles: sfStyle
    },
    loadingContext: loadingContextMain,
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

if (showACH) {
    window.myAch = new csf(achConfig);
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
    originKey: originKeyMain,
    iframeUIConfig: {
        sfStyles: sfStyle,
        placeholders: giftCardPlaceholders
    },
    loadingContext: loadingContextMain,
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

if (showGiftCard) {
    window.myGiftCard = new csf(giftCardConfig);
} else {
    document.querySelector('#adyenPaymentDivGiftCard').style.display = 'none';
    document.querySelector('#payBtn-giftcard').style.display = 'none';
}

// setTimeout(() => {
//     myGiftCard.isValidated('encryptedCardNumber');
//     setCCErrors({ fieldType: 'encryptedCardNumber', error: 'hasError', rootNode: document.body.querySelector('#adyenPaymentDivGiftCard') });
// }, 3000);

// Sepa
const sepaConfig = {
    rootNode: '#adyenPaymentDivSepa',
    type: 'sepa',
    originKey: originKeyMain,
    iframeUIConfig: {
        sfStyles: sfStyle,
        placeholders: placeholders
    },
    loadingContext: loadingContextMain,
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

if (showSepa) {
    window.myIban = new csf(sepaConfig);
} else {
    document.querySelector('#adyenPaymentDivSepa').style.display = 'none';
    document.querySelector('#payBtn-sepa').style.display = 'none';
}

//-------- end SET UP checkoutSecuredFields -------------------

// ENSURES initiateCardPayment WORKS
window.type = csfCardConfig.type;
if (csfCardConfig.cardGroupTypes.length === 1) {
    window.type = csfCardConfig.cardGroupTypes[0];
}
//--

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
            encryptedCardNumber: window.rootNode.querySelector('#' + window.type + '-encrypted-encryptedCardNumber').value,
            encryptedExpiryMonth: window.rootNode.querySelector('#' + window.type + '-encrypted-encryptedExpiryMonth').value,
            encryptedExpiryYear: window.rootNode.querySelector('#' + window.type + '-encrypted-encryptedExpiryYear').value,
            encryptedSecurityCode: window.rootNode.querySelector('#' + window.type + '-encrypted-encryptedSecurityCode').value
        },
        returnUrl: 'http://localhost:3000/verify.php',
        merchantAccount: 'TestMerchant'
    };

    if (pCardType === 'KCP') {
        // TODO - switch to encryptedPassword once localhost:8080 can on it
        requestObj.paymentMethod.encryptedPin = window.rootNode.querySelector('#' + window.type + '-encrypted-encryptedPassword').value;
        requestObj.paymentMethod.taxNumber = window.rootNode.querySelector('.pm-input-dob-field').value;
    }

    if (window.console && window.console.log) {
        window.console.log('@@@ index::initiateCardPayment:: requestObj=', requestObj);
        console.log('### index::initiateCardPayment:: rootNode = ', window.rootNode.getAttribute('id'));
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
