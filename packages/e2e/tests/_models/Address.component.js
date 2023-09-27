import { t, ClientFunction, Selector } from 'testcafe';

export default class AddressComponent {
    constructor(baseEl = '.adyen-checkout__fieldset') {
        this.baseEl = Selector(baseEl);

        this.countrySelector = this.baseEl.find('.adyen-checkout__field--country .adyen-checkout__dropdown');

        this.streetInput = this.baseEl.find('.adyen-checkout__input--street');

        this.postalCodeLabel = this.baseEl.find('.adyen-checkout__field--postalCode .adyen-checkout__label__text');
        this.postalCodeInput = this.baseEl.find('.adyen-checkout__input--postalCode');
        this.postalCodeInputError = this.baseEl.find('.adyen-checkout__field--postalCode .adyen-checkout-contextual-text--error');
    }

    async fillPostalCode(value = '') {
        await t.typeText(this.postalCodeInput, value);
    }

    async selectCountry(value = '') {
        await t.click(this.countrySelector);
        const countryDropdownItem = this.countrySelector.find('.adyen-checkout__dropdown__element').withText(value);
        await t.click(countryDropdownItem);
    }
}
