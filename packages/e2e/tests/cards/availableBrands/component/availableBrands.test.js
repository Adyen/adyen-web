import { CARDS_URL } from '../../../pages';
import CardComponent from '../../../_models/CardComponent.page';
import { Selector } from 'testcafe';

let cardComponent = null;

fixture`Cards - Available brands on Card Component`.page(CARDS_URL).beforeEach(async t => {
    cardComponent = new CardComponent('.card-field');
});

test('Available brands show underneath Card Number field if property `showBrandsUnderCardNumber` is set', async t => {
    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(10);
}).clientScripts('./availableBrands.clientScripts.js');

test('Available brands dont show underneath Card Number field by default', async t => {
    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    await t.expect(brandsInsidePaymentMethod.find('img').count).eql(0);
});
