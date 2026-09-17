import { createRef, h } from 'preact';
import { render, screen, within } from '@testing-library/preact';
import { EMIPlanSummary } from './EMIPlanSummary';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { EMI_FIXTURE_CHECKOUT_AMOUNT, emiPlansResponseMock } from '../../stories/mocks';
import type { EmiPlan } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const [hdfc, icici, axis] = emiPlansResponseMock.issuers;
const noCostPlanWithDiscount = hdfc.plans[0];
const lowCostPlanWithDiscount = icici.plans[0];
const standardPlanWithInterest = axis.plans[0];

const offerOf = (plan: EmiPlan, index: number): PaymentAmount => (plan.offers ?? [])[index].amount;
/** The larger of the two offers the no cost plan carries, which is the one the design shows */
const noCostOffer = offerOf(noCostPlanWithDiscount, 1);
const lowCostOffer = offerOf(lowCostPlanWithDiscount, 0);

/** The field is optional on the wire, so a fixture meant to carry one is asserted rather than defaulted */
const instantDiscountOf = (plan: EmiPlan): PaymentAmount => {
    const { instantDiscountAmount } = plan.transactionAmounts;
    if (!instantDiscountAmount) throw new Error(`The ${plan.type} fixture carries no instant discount`);

    return instantDiscountAmount;
};

const formatAmount = (amount: PaymentAmount) => i18n.amount(amount.value, amount.currency);

// The locale places the minus sign, the same way it places the currency symbol
const formatDiscount = (amount: PaymentAmount) => i18n.amount(-amount.value, amount.currency);

const formatReserved = (amount: PaymentAmount, ...discounts: PaymentAmount[]) =>
    formatAmount({ ...amount, value: discounts.reduce((left, discount) => left - discount.value, amount.value) });

const labels = () => screen.getAllByRole('term').map(term => term.textContent);
const values = () => screen.getAllByRole('definition').map(definition => definition.textContent);

/**
 * The checkout amount comes from context, the plan from props. EMIComponent owns the heading the group
 * is named after, so that naming is asserted in `EMIComponent.test.tsx`.
 */
const renderPlanSummary = (plan: EmiPlan, { amount }: { amount?: PaymentAmount } = { amount: EMI_FIXTURE_CHECKOUT_AMOUNT }) =>
    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <AmountProvider amount={amount} providerRef={createRef()}>
                <EMIPlanSummary plan={plan} />
            </AmountProvider>
        </CoreProvider>
    );

/** Both plan types spend their offer on the interest the bank charges, so both summarise it the same way */
const plansDiscountingInterest: [planType: string, plan: EmiPlan, offer: PaymentAmount, instantDiscount: PaymentAmount, tag: string][] = [
    ['no cost', noCostPlanWithDiscount, noCostOffer, instantDiscountOf(noCostPlanWithDiscount), 'No cost'],
    ['low cost', lowCostPlanWithDiscount, lowCostOffer, instantDiscountOf(lowCostPlanWithDiscount), 'Low cost']
];

describe('EMIPlanSummary', () => {
    test('should keep every row in a single group', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        expect(within(screen.getByRole('group')).getAllByRole('term')).toHaveLength(6);
    });

    test('should render every row of a complete plan, in the order of the design', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        expect(labels()).toEqual([
            'Item price',
            'Instant discount',
            // The plan type is tagged inside the label of the row its offer discounts
            'Interest discountNo cost',
            'Amount reserved on card',
            'Interest charged by bank @15.5% p.a',
            'Total amount to be paid over time'
        ]);
    });

    describe.each(plansDiscountingInterest)('%s plan', (_planType, plan, offer, instantDiscount, tag) => {
        const { totalInterestAmount, totalPayableAmount } = plan.transactionAmounts;

        test('should take both the interest discount and the instant discount off the reserved amount, leaving the interest whole', () => {
            renderPlanSummary(plan);

            expect(values()).toEqual([
                formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
                formatDiscount(instantDiscount),
                formatDiscount(offer),
                formatReserved(EMI_FIXTURE_CHECKOUT_AMOUNT, instantDiscount, offer),
                formatAmount(totalInterestAmount),
                formatAmount(totalPayableAmount)
            ]);
        });

        test('should tag the interest discount with the plan type it comes with', () => {
            renderPlanSummary(plan);

            expect(screen.getByText('Interest discount', { exact: false })).toHaveTextContent(tag);
        });

        test('should render the rows of the plan when no checkout amount is configured', () => {
            renderPlanSummary(plan, { amount: undefined });

            expect(labels()).toEqual([
                'Instant discount',
                `Interest discount${tag}`,
                expect.stringMatching(/^Interest charged by bank @/),
                'Total amount to be paid over time'
            ]);
        });
    });

    test('should reserve nothing on the card when the discounts exceed the checkout amount', () => {
        const amount = { value: instantDiscountOf(noCostPlanWithDiscount).value - 100, currency: 'INR' };

        renderPlanSummary(noCostPlanWithDiscount, { amount });

        expect(screen.getByText(i18n.amount(0, amount.currency))).toBeInTheDocument();
    });

    // Only a tagged plan type buys its interest down, so the offer of a standard plan discounts nothing
    test('should render no discount row for a standard plan carrying an offer', () => {
        const offer = { offerId: 'offer-axis', type: 'DISCOUNT', amount: { value: 100000, currency: 'INR' } };
        const { totalInterestAmount, totalPayableAmount } = standardPlanWithInterest.transactionAmounts;

        renderPlanSummary({ ...standardPlanWithInterest, offers: [offer] });

        expect(labels()).toEqual([
            'Item price',
            'Amount reserved on card',
            'Interest charged by bank @15.5% p.a',
            'Total amount to be paid over time'
        ]);
        expect(values()).toEqual([
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(totalInterestAmount),
            formatAmount(totalPayableAmount)
        ]);
    });

    test('should not render the discount rows when the plan carries neither an offer nor an instant discount', () => {
        const { totalInterestAmount, totalPayableAmount } = standardPlanWithInterest.transactionAmounts;

        renderPlanSummary(standardPlanWithInterest);

        expect(screen.queryByText('Instant discount')).toBeNull();
        expect(screen.queryByText('Interest discount')).toBeNull();
        expect(labels()).toEqual([
            'Item price',
            'Amount reserved on card',
            'Interest charged by bank @15.5% p.a',
            'Total amount to be paid over time'
        ]);
        expect(values()).toEqual([
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(totalInterestAmount),
            formatAmount(totalPayableAmount)
        ]);
    });

    test('should interpolate the plan interest rate into the interest label', () => {
        renderPlanSummary({ ...standardPlanWithInterest, interestRateBps: 1599 });

        expect(screen.getByText('Interest charged by bank @15.99% p.a')).toBeInTheDocument();
    });
});
