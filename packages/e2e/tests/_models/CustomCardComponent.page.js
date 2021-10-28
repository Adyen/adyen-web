import { ClientFunction, Selector } from 'testcafe';
import BasePage from './BasePage';
import { getIframeSelector } from '../utils/commonUtils';
import cu from '../cards/utils/cardUtils';
import ccu from '../customcard/utils/customCardUtils';

export default class CustomCardPage extends BasePage {
    constructor(baseEl = '.secured-fields') {
        super('customcards');

        const BASE_EL = baseEl;

        /**
         * CardNumber
         */
        // Top level <label>
        this.numHolder = Selector(`${BASE_EL} .pm-form-label-pan`);

        // The <span> that holds the label text (first child of the <label>)
        this.numLabelText = Selector(`${BASE_EL} .pm-form-label-pan .pm-form-label__text`);

        // The <span> that holds the iframe
        this.numSpan = Selector(`${BASE_EL} .pm-form-label-pan .pm-input-field`);

        // The <span> that holds the error text - display: none | block
        this.numErrorText = Selector(`${BASE_EL} .pm-form-label-pan .pm-form-label__error-text`);

        /**
         * ExpiryDate
         */
        // Top level <div>
        this.dateHolder = Selector(`${BASE_EL} .pm-form-label--exp-date`);

        // The <span> that holds the label text (first child of the <label>)
        this.dateLabelText = Selector(`${BASE_EL} .pm-form-label--exp-date .pm-form-label__text`);

        // The <span> that holds the iframe
        this.dateSpan = Selector(`${BASE_EL} .pm-form-label--exp-date .pm-input-field`);

        // The <span> that holds the error text
        this.dateErrorText = Selector(`${BASE_EL} .pm-form-label--exp-date .pm-form-label__error-text`);

        /**
         * ExpiryMonth
         */
        // Top level <div>
        this.monthHolder = Selector(`${BASE_EL} .pm-form-label--exp-month`);

        // The <span> that holds the label text (first child of the <label>)
        this.monthLabelText = Selector(`${BASE_EL} .pm-form-label--exp-month .pm-form-label__text`);

        // The <span> that holds the iframe
        this.monthSpan = Selector(`${BASE_EL} .pm-form-label--exp-month .pm-input-field`);

        // The <span> that holds the error text
        this.monthErrorText = Selector(`${BASE_EL} .pm-form-label--exp-month .pm-form-label__error-text`);

        /**
         * ExpiryYear
         */
        // Top level <div>
        this.yearHolder = Selector(`${BASE_EL} .pm-form-label--exp-year`);

        // The <span> that holds the label text (first child of the <label>)
        this.yearLabelText = Selector(`${BASE_EL} .pm-form-label--exp-year .pm-form-label__text`);

        // The <span> that holds the iframe
        this.yearSpan = Selector(`${BASE_EL} .pm-form-label--exp-year .pm-input-field`);

        // The <span> that holds the error text
        this.yearErrorText = Selector(`${BASE_EL} .pm-form-label--exp-year .pm-form-label__error-text`);

        /**
         * CVC
         */
        // Top level <div>
        this.cvcHolder = Selector(`${BASE_EL} .pm-form-label--cvc`);

        // The <span> that holds the label text (first child of the <label>)
        this.cvcLabelText = Selector(`${BASE_EL} .pm-form-label--cvc .pm-form-label__text`);

        // The <span> that holds the iframe
        this.cvcSpan = Selector(`${BASE_EL} .pm-form-label--cvc .pm-input-field`);

        // The <span> that holds the error text
        this.cvcErrorText = Selector(`${BASE_EL} .pm-form-label--cvc .pm-form-label__error-text`);

        /**
         * Branding
         */
        // The <img> el that holds the card brand logo
        this.brandingIcon = Selector(`${BASE_EL} .pm-image-1`);

        /**
         * Dual branding
         */
        // Has display:block when dual branding is happening
        // Changes opacity & pointer-events to indicate active/inactive (dual branded card complete/incomplete)
        this.dualBrandingIconHolder = Selector(`${BASE_EL} .pm-image-dual`); // Changes opacity & pointer-events to indicate active/inactive

        this.dualBrandImage1 = Selector(`${BASE_EL} .pm-image-dual-1`);
        this.dualBrandImage2 = Selector(`${BASE_EL} .pm-image-dual-2`);

        /**
         * iframe utils
         */
        this.iframeSelector = getIframeSelector(`${BASE_EL} iframe`);
        this.cardUtils = cu(this.iframeSelector);

        // Applies to custom card with separate date fields - where month, year & cvc have different indices
        this.customCardUtils = ccu(this.iframeSelector);

        /**
         * Pay button
         */
        this.payButton = Selector(`${BASE_EL} .adyen-checkout__button`);
    }

    getFromState = ClientFunction((base, path) => {
        const splitPath = path.split('.');
        const reducer = (xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined);

        return splitPath.reduce(reducer, window[base].state);
    });
}
