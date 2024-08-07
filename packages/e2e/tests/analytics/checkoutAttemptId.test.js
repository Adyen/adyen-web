import { CARDS_URL } from '../pages';
import { REGULAR_TEST_CARD } from '../cards/utils/constants';
import CardComponentPage from '../_models/CardComponent.page';
import { mock, paymentLogger } from './checkoutAttemptId.mocks';
import { getCheckoutAttemptIdFromSessionStorage } from './checkoutAttemptId.clientScripts';

let cardPage;

fixture`Analytics - checkoutAttemptId on sessionStorage`
    .page(CARDS_URL)
    .requestHooks([mock, paymentLogger])
    .beforeEach(() => {
        cardPage = new CardComponentPage();
    });
// todo: move it to unit/ui test
test('#1 - should save the checkoutAttemptId session in the sessionStorage and keep it there if page refreshes', async t => {
    await t.setNativeDialogHandler(() => true);

    const { id, timestamp } = await getCheckoutAttemptIdFromSessionStorage();

    await t.expect(id).ok();
    await t.expect(timestamp).ok();

    /**
     * Refreshes the page - ex: shopper decided to add another product to the basket
     */
    await t.eval(() => location.reload(true));

    const { id: storedId, timestamp: storedTimestamp } = await getCheckoutAttemptIdFromSessionStorage();

    await t.expect(storedId).eql(id);
    await t.expect(storedTimestamp).eql(timestamp);

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    await t
        .click(cardPage.payButton)
        .expect(paymentLogger.count(() => true))
        .eql(1)
        .expect(
            paymentLogger.contains(record => {
                const body = JSON.parse(record.request.body);
                return body.paymentMethod.checkoutAttemptId === id;
            })
        )
        .ok('checkoutAttemptId is present in the /payments request inside paymentMethod data');
});
