import { ClientFunction, Selector } from 'testcafe';
import { VOUCHERS_URL } from '../../pages';
import { getIsValid } from '../../utils/commonUtils';

fixture`Testing Boleto (Vouchers)`.page(`${VOUCHERS_URL}?countryCode=BR`);

const getComponentData = ClientFunction(() => {
    return window.boletoInput.data;
});

const mockData = {
    shopperName: {
        firstName: 'Tom',
        lastName: 'Jobim'
    },
    socialSecurityNumber: '32553325916',
    billingAddress: {
        country: 'BR',
        street: 'Fake street',
        houseNumberOrName: '123',
        city: 'Sao Paulo',
        postalCode: '11111555',
        stateOrProvince: 'SP'
    },
    shopperEmail: 'shopper@adyen.nl'
};

async function fillBoleto(t) {
    await t
        .typeText('.boleto-input .adyen-checkout__field--firstName .adyen-checkout__input', mockData.shopperName.firstName)
        .typeText('.boleto-input .adyen-checkout__field--lastName .adyen-checkout__input', mockData.shopperName.lastName)
        .typeText('.boleto-input .adyen-checkout__field--socialSecurityNumber .adyen-checkout__input', mockData.socialSecurityNumber)
        .typeText('.boleto-input .adyen-checkout__input--street', mockData.billingAddress.street)
        .typeText('.boleto-input .adyen-checkout__input--houseNumberOrName', mockData.billingAddress.houseNumberOrName)
        .typeText('.boleto-input .adyen-checkout__input--city', mockData.billingAddress.city)
        .typeText('.boleto-input .adyen-checkout__input--postalCode', mockData.billingAddress.postalCode)
        .click(Selector('.boleto-input .adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__button'))
        .click(Selector('.boleto-input [data-value=SP]'));
}

test('should make an Boleto payment', async t => {
    await fillBoleto(t);
    const stateData = await getComponentData();

    await t
        .expect(stateData.paymentMethod.type)
        .eql('boletobancario')
        .expect(stateData.shopperName)
        .eql(mockData.shopperName)
        .expect(stateData.socialSecurityNumber)
        .eql(mockData.socialSecurityNumber)
        .expect(stateData.billingAddress)
        .eql(mockData.billingAddress)
        .expect(getIsValid('boletoInput'))
        .eql(true);
});

test('should show the "send copy to email" field', async t => {
    await fillBoleto(t);
    await t.expect(getIsValid('boletoInput')).eql(true);

    await t.click(Selector('.boleto-input .adyen-checkout__field--sendCopyToEmail .adyen-checkout__checkbox'));
    await t.expect(getIsValid('boletoInput')).eql(false);

    await t.typeText('.boleto-input .adyen-checkout__input--email', mockData.shopperEmail);
    await t.expect(getIsValid('boletoInput')).eql(true);

    const stateData = await getComponentData();

    await t
        .expect(stateData.paymentMethod.type)
        .eql('boletobancario')
        .expect(stateData.shopperEmail)
        .eql(mockData.shopperEmail)
        .expect(getIsValid('boletoInput'))
        .eql(true);
});
