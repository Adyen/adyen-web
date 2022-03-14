import { t, Selector } from 'testcafe';

export default class PaymentMethodItem {
    // Card brands that appear on the header of the Payment Method Item
    brands = null;

    constructor(baseEl = '', paymentMethodName) {
        if (!paymentMethodName) {
            throw Error('PaymentMethodItem: missing PM name');
        }

        this.baseEl = Selector(`${baseEl} .adyen-checkout__payment-method`).withText(paymentMethodName);
        this.brands = this.baseEl.find('.adyen-checkout__payment-method__brands');
    }

    get numberOfBrandImages() {
        return this.brands.find('img').count;
    }

    get extraBrandsText() {
        return this.brands.textContent;
    }

    get hasBrands() {
        return this.brands.exists;
    }

    async click() {
        await t.click(this.baseEl);
    }
}
