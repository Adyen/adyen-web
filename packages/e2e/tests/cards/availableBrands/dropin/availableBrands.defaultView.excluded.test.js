import { Selector } from 'testcafe';
import { DROPIN_SESSIONS_URL } from '../../../pages';
import { getMock } from './availableBrands.mocks';
import DropinPage from '../../../_models/Dropin.page';

let dropinPage = null;

fixture`Cards - Available Brands ("with" excluded brands) (Default view)`
    .page(DROPIN_SESSIONS_URL)
    .requestHooks([getMock('setupResponseWithExcludedBrands')])
    .clientScripts('./availableBrands.clientScripts.js')
    .beforeEach(() => {
        dropinPage = new DropinPage({});
    });

test('All available brands show up on the Payment Method Item', async t => {
    await dropinPage.brandsHolder();
    const paymentItem = dropinPage.getPaymentMethodItemSelector('Credit Card');

    await t.expect(paymentItem.hasBrands).ok();
    await t.expect(paymentItem.extraBrandsText).eql('');
    await t.expect(paymentItem.numberOfBrandImages).eql(6);
});

test('Brands are kept in the  Payment Method Item after clicking on it', async t => {
    await dropinPage.brandsHolder();
    const paymentItem = dropinPage.getPaymentMethodItemSelector('Credit Card');
    await paymentItem.click();

    await t.expect(paymentItem.hasBrands).ok();
    await t.expect(paymentItem.numberOfBrandImages).eql(6);

    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(0);
});
