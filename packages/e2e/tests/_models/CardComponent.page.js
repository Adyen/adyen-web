import { ClientFunction, Selector } from 'testcafe';
import BasePage from './BasePage';
import { getIframeSelector } from '../utils/commonUtils';
import cu from '../cards/utils/cardUtils';
import kcp from '../cards/utils/kcpUtils';

/**
 * The Page Model Pattern is a test automation pattern that allows you to create an
 * abstraction of the tested page, and use it in test code to refer to page elements
 */
export default class CardPage extends BasePage {
    constructor() {
        super('cards');

        const BASE_EL = '.card-field';

        /**
         * CardNumber
         */
        // Top level <div>
        this.numHolder = Selector(`${BASE_EL} .adyen-checkout__field--cardNumber`);
        //        this.numHolderInError = Selector(`${BASE_EL} .adyen-checkout__field--cardNumber.adyen-checkout__field--error`);

        // The <span> that holds the label text (first child of the <label>)
        this.numLabelText = Selector(`${BASE_EL} .adyen-checkout__field--cardNumber .adyen-checkout__label__text`);
        this.numLabelTextError = Selector(`${BASE_EL} .adyen-checkout__field--cardNumber .adyen-checkout__label__text--error`);

        // The <span> that holds the iframe
        this.numSpan = Selector(`${BASE_EL} .adyen-checkout__card__cardNumber__input`);

        // The <span> that holds the error text
        this.numErrorText = Selector(`${BASE_EL} .adyen-checkout__field--cardNumber .adyen-checkout__error-text`);

        // The <img> el that holds the card brand logo (actually a child of this.numSpan)
        this.brandingIcon = Selector(`${BASE_EL} .adyen-checkout__card__cardNumber__brandIcon`);

        /**
         * ExpiryDate
         */
        // Top level <div>
        this.dateHolder = Selector(`${BASE_EL} .adyen-checkout__field__exp-date`);
        //        this.dateHolderInError = Selector(`${BASE_EL} .adyen-checkout__field__exp-date.adyen-checkout__field--error`);
        this.dateHolderAsOptional = Selector(`${BASE_EL} .adyen-checkout__field__exp-date--optional`);

        // The <span> that holds the label text (first child of the <label>)
        this.dateLabelText = Selector(`${BASE_EL} .adyen-checkout__field__exp-date .adyen-checkout__label__text`);
        this.dateLabelTextError = Selector(`${BASE_EL} .adyen-checkout__field__exp-date .adyen-checkout__label__text--error`);

        // The <span> that holds the iframe
        this.dateSpan = Selector(`${BASE_EL} .adyen-checkout__card__exp-date__input`);

        // The <span> that holds the error text
        this.dateErrorText = Selector(`${BASE_EL} .adyen-checkout__field__exp-date .adyen-checkout__error-text`);

        /**
         * CVC
         */
        // Top level <div>
        this.cvcHolder = Selector(`${BASE_EL} .adyen-checkout__field__cvc`);
        //        this.cvcHolderInError = Selector(`${BASE_EL} .adyen-checkout__field__cvc.adyen-checkout__field--error`);
        this.cvcHolderAsOptional = Selector(`${BASE_EL} .adyen-checkout__field__cvc--optional`);

        // The <span> that holds the label text (first child of the <label>)
        this.cvcLabelText = Selector(`${BASE_EL} .adyen-checkout__field__cvc .adyen-checkout__label__text`);
        this.cvcLabelTextError = Selector(`${BASE_EL} .adyen-checkout__field__cvc .adyen-checkout__label__text--error`);

        // The <span> that holds the iframe
        this.cvcSpan = Selector(`${BASE_EL} .adyen-checkout__card__cvc__input`);

        // The <span> that holds the error text
        this.cvcErrorText = Selector(`${BASE_EL} .adyen-checkout__field__cvc .adyen-checkout__error-text`);

        /**
         * Dual branding
         */
        this.dualBrandingIconHolder = Selector(`${BASE_EL} .adyen-checkout__card__dual-branding__buttons`);
        this.dualBrandingIconHolderActive = Selector(`${BASE_EL} .adyen-checkout__card__dual-branding__buttons--active`);
        this.dualBrandingImages = this.dualBrandingIconHolderActive.find('img');

        /**
         * KCP
         */
        this.pwdSpan = Selector(`${BASE_EL} [data-cse="encryptedPassword"]`);
        this.pwdErrorText = Selector(`${BASE_EL} .adyen-checkout__field--koreanAuthentication-encryptedPassword .adyen-checkout__error-text`);

        /**
         * iframe utils
         */
        this.iframeSelector = getIframeSelector(`${BASE_EL} iframe`);
        this.cardUtils = cu(this.iframeSelector);
        this.kcpUtils = kcp(this.iframeSelector);

        /**
         * Pay button
         */
        this.payButton = Selector(`${BASE_EL} .adyen-checkout__button--pay`);
    }

    getFromState = ClientFunction(path => {
        const splitPath = path.split('.');
        const reducer = (xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined);

        return splitPath.reduce(reducer, window.card.state);
    });
}
