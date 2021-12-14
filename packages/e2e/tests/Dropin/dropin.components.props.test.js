import DropinPage from '../_models/Dropin.page';

const dropinPage = new DropinPage({});

fixture`Testing props propagation for Dropin created components`
    .beforeEach(async t => {
        await t.navigateTo(`${dropinPage.pageUrl}`);
    })
    .clientScripts('./dropin.comps.props.clientScripts.js');

test('#1 StoredCard in Dropin receives correct props', async t => {
    // Wait for field to appear in DOM
    await t.wait(1000);

    const elIndex = 0;

    // expect props from core.getPropsForComps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.paymentMethods.length')).eql(3);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.i18n')).notEql(null);

    // expect props from core.processGlobalOptions
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.clientKey')).eql('test_F7_FEKJHF');
    //    await t.expect(dropinPage.getFromActivePMProps('clientKey')).eql('test_F7_FEKJHF');// alt
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.amount.value')).eql(19000);

    // expect props from Dropin.getCommonProps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.showPayButton')).eql(true);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.isDropin')).eql(true);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.oneClick')).eql(true);

    // expect props from storedCard object in paymentMethodsResponse.storedPaymentMethods
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.brand')).eql('visa');
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.storedPaymentMethodId')).eql('8415');
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.expiryYear')).eql('2030');

    // expect props from relevant paymentMethodsConfiguration object
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.hideCVC')).eql(true);
});

test('#2 Card in Dropin receives correct props', async t => {
    // Wait for field to appear in DOM
    await t.wait(1000);

    const elIndex = 1;

    // expect props from core.getPropsForComps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.paymentMethods.length')).eql(3);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.i18n')).notEql(null);

    // expect props from core.processGlobalOptions
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.clientKey')).eql('test_F7_FEKJHF');
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.amount.value')).eql(19000);

    // expect props from Dropin.getCommonProps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.showPayButton')).eql(true);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.isDropin')).eql(true);

    // expect props from card object in paymentMethodsResponse.paymentMethods
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.brands.length')).eql(6);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.name')).eql('Credit Card');

    // expect props from relevant paymentMethodsConfiguration object
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.hasHolderName')).eql(true);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.holderNameRequired')).eql(true);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.positionHolderNameOnTop')).eql(true);

    // expect prop from Card.formatProps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.type')).eql('card');
});

test('#3 Google Pay in Dropin receives correct props', async t => {
    // Wait for field to appear in DOM
    await t.wait(1000);

    const elIndex = 2;

    // expect props from core.getPropsForComps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.paymentMethods.length')).eql(3);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.i18n')).notEql(null);

    // expect props from core.processGlobalOptions
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.clientKey')).eql('test_F7_FEKJHF');
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.amount.value')).eql(19000);

    // expect props from Dropin.getCommonProps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.showPayButton')).eql(true);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.isDropin')).eql(true);

    // expect props from object in paymentMethodsResponse.paymentMethods
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.configuration.merchantId')).eql('1000');
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.configuration.gatewayMerchantId')).eql('TestMerchantCheckout');

    // expect props from relevant paymentMethodsConfiguration object
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.foo')).eql('bar');

    // expect props from GooglePay.formatProps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.type')).eql('paywithgoogle');
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.buttonSizeMode')).eql('fill');
});

test('#4 Redirect PM in Dropin receives correct props', async t => {
    // Wait for field to appear in DOM
    await t.wait(1000);

    const elIndex = 3;

    // expect props from core.getPropsForComps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.paymentMethods.length')).eql(3);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.i18n')).notEql(null);

    // expect props from core.processGlobalOptions
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.clientKey')).eql('test_F7_FEKJHF');
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.amount.value')).eql(19000);

    // expect props from Dropin.getCommonProps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.showPayButton')).eql(true);
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.isDropin')).eql(true);

    // expect props from object in paymentMethodsResponse.paymentMethods
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.name')).eql('UnionPay');

    // expect props from relevant paymentMethodsConfiguration object
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.foo')).eql('bar');

    // expect props from Redirect.formatProps()
    await t.expect(dropinPage.getFromDropinRefStateElements(elIndex, 'props.type')).eql('unionpay');
});
