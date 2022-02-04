import { ClientFunction, Selector } from 'testcafe';
import BasePage from './BasePage';
import { getIframeSelector } from '../utils/commonUtils';
import cu from '../cards/utils/cardUtils';

/**
 * The Page Model Pattern is a test automation pattern that allows you to create an
 * abstraction of the tested page, and use it in test code to refer to page elements
 */
export default class GiftCardPage extends BasePage {
    constructor(baseEl = '.adyen-checkout__giftcard') {
        super('cards');

        const BASE_EL = baseEl;

        /**
         * CardNumber
         */
        // Top level el
        this.pmHolder = Selector(`${BASE_EL}`);

        // El that holds the title (in the dropin)
        this.nameSpan = Selector(`${BASE_EL} .adyen-checkout__payment-method__name`);

        // The <img> el that holds the card brand logo (actually a child of this.numSpan)
        this.brandingIcon = Selector(`${BASE_EL} .adyen-checkout__payment-method__image`);

        /**
         * iframe utils
         */
        this.iframeSelector = getIframeSelector(`${BASE_EL} iframe`);
        this.cardUtils = cu(this.iframeSelector);

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
