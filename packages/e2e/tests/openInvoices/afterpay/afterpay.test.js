import { ClientFunction, Selector } from 'testcafe';
import { OPENINVOICES_URL } from '../../pages';

fixture.only`Testing AfterPay (OpenInvoices)`.page(`${OPENINVOICES_URL}?countryCode=NL`);

const getComponentData = ClientFunction(() => {
    return window.afterpay.data;
});

const mockAddress = {
    city: 'City',
    country: 'NL',
    houseNumberOrName: '123',
    postalCode: '0000AB',
    stateOrProvince: 'N/A',
    street: 'Street'
};

const checkboxLabelGender = Selector('.afterpay-field .adyen-checkout__field--gender .adyen-checkout__radio_group__label');
const checkboxConsent = Selector('.afterpay-field input[name=consentCheckbox]', { timeout: 1000 });

test('should make an AfterPay payment', async t => {
    // Opens dropdown
    await t
        .typeText('.afterpay-field .adyen-checkout__input--firstName', 'First')
        .typeText('.afterpay-field .adyen-checkout__input--lastName', 'Last')
        // Click checkbox (in reality click its label - for some reason clicking the actual checkboxes takes ages)
        .click(checkboxLabelGender.nth(0))
        .typeText('.afterpay-field .adyen-checkout__input--dateOfBirth', '01/01/1970')
        .typeText('.afterpay-field .adyen-checkout__input--shopperEmail', 'test@test.com')
        .typeText('.afterpay-field .adyen-checkout__input--telephoneNumber', '612345678')
        .typeText('.afterpay-field .adyen-checkout__input--street', mockAddress.street)
        .typeText('.afterpay-field .adyen-checkout__input--houseNumberOrName', mockAddress.houseNumberOrName)
        .typeText('.afterpay-field .adyen-checkout__input--city', mockAddress.city)
        .typeText('.afterpay-field .adyen-checkout__input--postalCode', mockAddress.postalCode)
        // Can't use the checkboxLabelGender trick to speed up the click 'cos this label contains a link - so use a Selector with a timeout
        .click(checkboxConsent);

    const stateData = await getComponentData();

    await t
        .expect(stateData.paymentMethod.type)
        .eql('afterpay_default')
        .expect(stateData.billingAddress)
        .eql(mockAddress)
        .expect(stateData.deliveryAddress)
        .eql(mockAddress);
});
