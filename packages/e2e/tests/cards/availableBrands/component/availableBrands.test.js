import { CARDS_URL } from '../../../pages';
import CardComponent from '../../../_models/CardComponent.page';
import { Selector } from 'testcafe';

let cardComponent = null;

fixture`Cards - Available brands on Card Component`.page(CARDS_URL).beforeEach(async t => {
    cardComponent = new CardComponent('.card-field');
});

test('#1 Available brands dont show underneath Card Number field if property `showBrandsUnderCardNumber` is set to false', async t => {
    // Wait for field to appear in DOM
    await cardComponent.numHolder();
    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(0);
}).clientScripts('./availableBrands.disabled.clientScripts.js');

/**
 * NOTE: this test ALWAYS fails if other test files are run i.e. only if this fixture is run in isolation does this test pass
 * So it is a false negative from TestCafe.
 */
test('#2 Available brands show underneath Card Number field by default', async t => {
    await cardComponent.numHolder();
    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(10);
}).clientScripts('./availableBrands.clientScripts.js');

test('#3 Available brands show underneath Card Number field but with excluded brands missing', async t => {
    await cardComponent.numHolder();
    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(7);
}).clientScripts('./availableBrands.excluded.clientScripts.js');
