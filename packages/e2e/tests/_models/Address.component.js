import { t, ClientFunction, Selector } from 'testcafe';

export default class AddressComponent {
    countrySelector = null;
    streetInput = null;

    constructor(baseEl = '.adyen-checkout__fieldset') {
        this.countrySelector = Selector(`${baseEl} .adyen-checkout__dropdown__button`);
        this.streetInput = Selector(`${baseEl} .adyen-checkout__input--street`);
    }

    async fillStreetInput(value = '') {
        await t.typeText(this.streetInput, value);
    }

    getFromState = ClientFunction(path => {
        const splitPath = path.split('.');
        const reducer = (xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined);

        return splitPath.reduce(reducer, window.card.state);
    });
}
