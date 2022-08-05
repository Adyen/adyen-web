import { CARDS_URL } from '../../pages';
import CardComponentPage from '../../_models/CardComponent.page';
import { REGULAR_TEST_CARD } from '../utils/constants';
import { mock, paymentLogger } from './cards.installments.mocks';
import InstallmentsComponent from '../../_models/Installments.component';

let cardComponent = null;

fixture`Cards (Installments)`
    .page(CARDS_URL)
    .clientScripts('./cards.installments.clientScripts.js')
    .requestHooks([mock, paymentLogger])
    .beforeEach(async t => {
        // handler for alert that's triggered on successful payment
        await t.setNativeDialogHandler(() => true);
        cardComponent = new CardComponentPage('.card-field', { installments: new InstallmentsComponent() });
    });

test('#1 should not add installments property to payload if one-time payment is selected', async t => {
    await cardComponent.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardComponent.cardUtils.fillDateAndCVC(t);

    await t
        .click(cardComponent.payButton)
        .expect(paymentLogger.count(() => true))
        .eql(1)
        .expect(
            paymentLogger.contains(record => {
                const { installments } = JSON.parse(record.request.body);
                return installments === undefined;
            })
        )
        .ok('payment payload has the expected payload');
});

test('#2 should not add installments property to payload if 1x installment is selected', async t => {
    await cardComponent.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardComponent.cardUtils.fillDateAndCVC(t);
    await cardComponent.installments.selectInstallment(1);

    await t
        .click(cardComponent.payButton)
        .expect(paymentLogger.count(() => true))
        .eql(1)
        .expect(
            paymentLogger.contains(record => {
                const { installments } = JSON.parse(record.request.body);
                return installments === undefined;
            })
        )
        .ok('payment payload has the expected payload');
});

test('#3 should add revolving plan to payload if selected', async t => {
    await cardComponent.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardComponent.cardUtils.fillDateAndCVC(t);
    await cardComponent.installments.selectRevolving();

    await t
        .click(cardComponent.payButton)
        .expect(paymentLogger.count(() => true))
        .eql(1)
        .expect(
            paymentLogger.contains(record => {
                const { installments } = JSON.parse(record.request.body);
                return installments.value === 1 && installments.plan === 'revolving';
            })
        )
        .ok('payment payload has the expected payload');
});

test('#4 should add installments value property if regular installment > 1 is selected', async t => {
    await cardComponent.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardComponent.cardUtils.fillDateAndCVC(t);
    await cardComponent.installments.selectInstallment(2);

    await t
        .click(cardComponent.payButton)
        .expect(paymentLogger.count(() => true))
        .eql(1)
        .expect(
            paymentLogger.contains(record => {
                const { installments } = JSON.parse(record.request.body);
                return installments.value === 2;
            })
        )
        .ok('payment payload has the expected payload');
});
