import { ClientFunction } from 'testcafe';
import { OPENINVOICES_URL } from '../../pages';

fixture`Testing AfterPay (OpenInvoices)`.page(`${OPENINVOICES_URL}?countryCode=NL`);

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

test('should make an AfterPay payment', async t => {
    // Opens dropdown
    await t
        .typeText('.afterpay-field .adyen-checkout__input--firstName', 'First')
        .typeText('.afterpay-field .adyen-checkout__input--lastName', 'Last')
        .click('.afterpay-field .adyen-checkout__field--gender .adyen-checkout__radio_group__input:first-child')
        .typeText('.afterpay-field .adyen-checkout__input--dateOfBirth', '01/01/1970')
        .typeText('.afterpay-field .adyen-checkout__input--shopperEmail', 'test@test.com')
        .typeText('.afterpay-field .adyen-checkout__input--telephoneNumber', '612345678')
        .typeText('.afterpay-field .adyen-checkout__input--street', mockAddress.street)
        .typeText('.afterpay-field .adyen-checkout__input--houseNumberOrName', mockAddress.houseNumberOrName)
        .typeText('.afterpay-field .adyen-checkout__input--city', mockAddress.city)
        .typeText('.afterpay-field .adyen-checkout__input--postalCode', mockAddress.postalCode)
        .click('.afterpay-field input[name=consentCheckbox]');

    const stateData = await getComponentData();

    await t
        .expect(stateData.paymentMethod)
        .eql({
            type: 'afterpay_default'
        })
        .expect(stateData.billingAddress)
        .eql(mockAddress)
        .expect(stateData.deliveryAddress)
        .eql(mockAddress);
});
