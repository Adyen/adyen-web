import { Selector } from 'testcafe';
import { DROPIN_SESSIONS_URL } from '../../../pages';
import { getMock } from './availableBrands.mocks';
import DropinPage from '../../../_models/Dropin.page';

let dropinPage = null;

fixture`Cards - Available Brands (Compact view)`
    .page(DROPIN_SESSIONS_URL)
    .requestHooks([getMock()])
    .beforeEach(() => {
        dropinPage = new DropinPage({});
    });

test('Not all brands show on the header of the payment method item', async t => {
    const paymentItem = dropinPage.getPaymentMethodItemSelector('Credit Card');

    await t.expect(paymentItem.hasBrands).ok();
    await t.expect(paymentItem.extraBrandsText).eql('+7');
    await t.expect(paymentItem.numberOfBrandImages).eql(3);
});

test('Clicking on the Payment method, brands disappear from header and show beneath Card Number', async t => {
    const paymentItem = dropinPage.getPaymentMethodItemSelector('Credit Card');
    await paymentItem.click();

    await t.expect(paymentItem.hasBrands).notOk();
    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(10);
});
