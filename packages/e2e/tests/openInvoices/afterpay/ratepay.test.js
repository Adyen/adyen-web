import { ClientFunction, Selector } from 'testcafe';
import { OPENINVOICES_URL } from '../../pages';

fixture`Testing RatePay (OpenInvoices)`.page(`${OPENINVOICES_URL}?countryCode=NL`);

const getComponentData = ClientFunction(() => {
    return window.afterpay.data;
});

const mockAddressGermany = {
    city: 'City',
    country: 'DE',
    houseNumberOrName: '123',
    postalCode: '12345',
    stateOrProvince: 'N/A',
    street: 'Street'
};

test.skip('should make an RatePay Direct Debit payment', async t => {
    const checkboxLabelGender = Selector('.ratepay-direct-field .adyen-checkout__field--gender .adyen-checkout__radio_group__label');
    const payButton = Selector('.ratepay-direct-field adyen-checkout__button--pay');

    // Opens dropdown
    await t
        .typeText('.ratepay-direct-field .adyen-checkout__input--firstName', 'First')
        .typeText('.ratepay-direct-field .adyen-checkout__input--lastName', 'Last')
        // Click checkbox (in reality click its label - for some reason clicking the actual checkboxes takes ages)
        .click(checkboxLabelGender.nth(0))
        .typeText('.ratepay-direct-field .adyen-checkout__input--dateOfBirth', '01011990', { caretPos: 1 })
        .typeText('.ratepay-direct-field .adyen-checkout__input--shopperEmail', 'test@test.com')
        .typeText('.ratepay-direct-field .adyen-checkout__input--telephoneNumber', '612345678')
        .typeText('.ratepay-direct-field .adyen-checkout__iban-input__owner-name', 'A. Schneider')
        .typeText('.ratepay-direct-field .adyen-checkout__iban-input__iban-number', 'DE87123456781234567890')
        .typeText('.ratepay-direct-field .adyen-checkout__input--street', mockAddressGermany.street)
        .typeText('.ratepay-direct-field .adyen-checkout__input--houseNumberOrName', mockAddressGermany.houseNumberOrName)
        .typeText('.ratepay-direct-field .adyen-checkout__input--city', mockAddressGermany.city)
        .typeText('.ratepay-direct-field .adyen-checkout__input--postalCode', mockAddressGermany.postalCode)
        // Can't use the checkboxLabelGender trick to speed up the click 'cos this label contains a link - so use a Selector with a timeout
        .click(payButton)
        .wait(5000);
});
