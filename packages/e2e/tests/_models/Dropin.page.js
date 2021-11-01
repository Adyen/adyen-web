import { ClientFunction, Selector } from 'testcafe';
import BasePage from './BasePage';
import { getIframeSelector } from '../utils/commonUtils';
import cu from '../cards/utils/cardUtils';

/**
 * The Page Model Pattern is a test automation pattern that allows you to create an
 * abstraction of the tested page, and use it in test code to refer to page elements
 */
export default class DropinPage extends BasePage {
    constructor(pmSelector) {
        super('');

        const BASE_EL = '.adyen-checkout__dropin';

        /**
         * ###################
         * Credit card related
         * ###################
         */
        this.brandsHolder = Selector(`${BASE_EL} .adyen-checkout__payment-method__brands`);
        this.brandsImages = this.brandsHolder.find('img');

        /**
         * CardNumber
         */
        // Top level <div>
        this.numHolder = Selector(`${BASE_EL} .adyen-checkout__field--cardNumber`);
        // The <span> that holds the iframe
        this.numSpan = Selector(`${BASE_EL} .adyen-checkout__card__cardNumber__input`);

        // The <img> el that holds the card brand logo (actually a child of this.numSpan)
        this.brandingIcon = Selector(`${BASE_EL} .adyen-checkout__card__cardNumber__brandIcon`);

        /**
         * ExpiryDate
         */
        // Top level <div>
        this.dateHolder = Selector(`${BASE_EL} .adyen-checkout__field__exp-date`);
        // The <span> that holds the iframe
        this.dateSpan = Selector(`${BASE_EL} .adyen-checkout__card__exp-date__input`);

        /**
         * CVC
         */
        // Top level <div>
        this.cvcHolder = Selector(`${BASE_EL} .adyen-checkout__field__cvc`);
        // The <span> that holds the iframe
        this.cvcSpan = Selector(`${BASE_EL} .adyen-checkout__card__cvc__input`);

        /**
         * Dual branding
         */
        this.dualBrandingIconHolder = Selector(`${BASE_EL} .adyen-checkout__card__dual-branding__buttons`);
        this.dualBrandingIconHolderActive = Selector(`${BASE_EL} .adyen-checkout__card__dual-branding__buttons--active`);
        this.dualBrandingImages = this.dualBrandingIconHolderActive.find('img');

        /**
         * iframe utils
         */
        this.iframeSelector = getIframeSelector(`${BASE_EL} ${pmSelector} iframe`);
        this.cardUtils = cu(this.iframeSelector);
    }

    getFromState = ClientFunction(path => {
        const splitPath = path.split('.');
        const reducer = (xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined);

        return splitPath.reduce(reducer, window.dropin.dropinRef.state);
    });
}
