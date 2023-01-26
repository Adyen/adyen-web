import { Selector } from 'testcafe';
import { DROPIN_SESSIONS_URL } from '../../../pages';
import { getMock } from './availableBrands.mocks';
import DropinPage from '../../../_models/Dropin.page';

let dropinPage = null;

fixture`Cards - Available Brands ("with" excluded brands) (Compact view)`
    .page(DROPIN_SESSIONS_URL)
    .requestHooks([getMock('setupResponseWithExcludedBrands')])
    .beforeEach(() => {
        dropinPage = new DropinPage({});
    });

test('#1 Not all brands show on the header of the payment method item, and excluded items are also removed', async t => {
    await dropinPage.brandsHolder();
    const paymentItem = dropinPage.getPaymentMethodItemSelector('Credit Card');

    await t.expect(paymentItem.hasBrands).ok();
    await t.expect(paymentItem.extraBrandsText).eql('+3');
    await t.expect(paymentItem.numberOfBrandImages).eql(3);
});

test('#2 Clicking on the Payment method, brands disappear from header and show beneath Card Number (with excluded brands absent)', async t => {
    await dropinPage.brandsHolder();
    const paymentItem = dropinPage.getPaymentMethodItemSelector('Credit Card');
    await paymentItem.click();

    await t.expect(paymentItem.hasBrands).notOk();
    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(6);
});
