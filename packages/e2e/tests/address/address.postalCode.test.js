import { ADDRESS_URL } from '../pages';
import AddressComponent from '../_models/Address.component';
import { mock } from './address.mocks';
import { removeCharsFromInput, removeFocusFromElement } from '../utils/commonUtils';

let addressComponent = null;

fixture`Address (PostalCode)`
    .page(ADDRESS_URL)
    .requestHooks([mock])
    .beforeEach(() => {
        addressComponent = new AddressComponent();
    });

test('should show error when switching from country that has valid postal code to one that has invalid postal code', async t => {
    await addressComponent.selectCountry('United States');
    await addressComponent.fillPostalCode('12345');

    await addressComponent.selectCountry('Brazil');
    await t.expect(addressComponent.postalCodeInputError.innerText).contains('Invalid format. Expected format: 12345678 or 12345-678');

    await addressComponent.selectCountry('Netherlands');
    await t.expect(addressComponent.postalCodeInputError.innerText).contains('Invalid format. Expected format: 9999AA');
});

test('should format postal code when switching countries (if format fn is provided)', async t => {
    await addressComponent.selectCountry('Brazil');
    await addressComponent.fillPostalCode('99999000');

    await addressComponent.selectCountry('United States');
    await t.expect(addressComponent.postalCodeInput.value).eql('99999');
});

test('should show error when remove focus from postal code with invalid value', async t => {
    // Brazil
    await addressComponent.selectCountry('Brazil');
    await addressComponent.fillPostalCode('12345');
    await removeFocusFromElement(addressComponent.postalCodeInput);

    await t.expect(addressComponent.postalCodeInputError.innerText).contains('Invalid format. Expected format: 12345678 or 12345-678');

    await addressComponent.fillPostalCode('678');

    await t.expect(addressComponent.postalCodeInput.value).eql('12345678');

    // US
    await addressComponent.selectCountry('United States');
    await t.expect(addressComponent.postalCodeInput.value).eql('12345');

    await removeCharsFromInput(addressComponent.postalCodeInput, 1);
    await removeFocusFromElement(addressComponent.postalCodeInput);

    await t.expect(addressComponent.postalCodeInput.value).eql('1234');
    await t.expect(addressComponent.postalCodeInputError.innerText).contains('Invalid format. Expected format: 99999 or 99999-9999');

    // NL
    await addressComponent.selectCountry('Netherlands');

    await t.expect(addressComponent.postalCodeInputError.innerText).contains('Invalid format. Expected format: 9999AA');

    await addressComponent.fillPostalCode('AB');

    await t.expect(addressComponent.postalCodeInput.value).eql('1234AB');
});

test('should format input according to the country pattern', async t => {
    await addressComponent.selectCountry('United States');
    await addressComponent.fillPostalCode('12345678910');

    await t.expect(addressComponent.postalCodeInput.value).eql('12345');

    await addressComponent.fillPostalCode('-3145');
    await t.expect(addressComponent.postalCodeInput.value).eql('12345-3145');
});

test("should show proper 'Zip Code' label for US", async t => {
    await addressComponent.selectCountry('United States');
    await t.expect(addressComponent.postalCodeLabel.innerText).eql('Zip code');

    await addressComponent.selectCountry('Netherlands');
    await t.expect(addressComponent.postalCodeLabel.innerText).eql('Postal code');

    await addressComponent.selectCountry('Brazil');
    await t.expect(addressComponent.postalCodeLabel.innerText).eql('Postal code');
});
