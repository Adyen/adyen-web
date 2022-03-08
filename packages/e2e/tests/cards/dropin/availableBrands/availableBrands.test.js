import { Selector } from 'testcafe';
import { DROPIN_SESSIONS_URL } from '../../../pages';
import { mock, loggers, MOCK_SESSION_DATA } from './availableBrands.mocks';
import { getIframeSelector } from '../../../utils/commonUtils';
import cu from '../../utils/cardUtils';
import AddressComponent from '../../../_models/Address.component';
import DropinPage from '../../../_models/Dropin.page';
// import { TEST_CVC_VALUE } from '../../utils/constants';

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--card iframe');
const cardUtils = cu(iframeSelector);
const { setupLogger, paymentLogger } = loggers;

let dropinPage = null;

fixture.only`Cards - Available Brands on Drop-in`
    .page(DROPIN_SESSIONS_URL)
    .requestHooks([mock, setupLogger, paymentLogger])
    .beforeEach(() => {
        dropinPage = new DropinPage({});
    });

test('Card brands show on the header of the payment method item', async t => {
    const paymentItem = dropinPage.getPaymentMethodItemSelector('Credit Card');

    await t.expect(paymentItem.hasBrands).ok();
    await t.expect(paymentItem.extraBrandsText).eql('+7');
    await t.expect(paymentItem.numberOfBrandImages).eql(3);

    await paymentItem.click();

    await t.expect(paymentItem.hasBrands).notOk();

    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(10);
    // await t.debug();
});
