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

const formatAmount = (amount: PaymentAmount) => i18n.amount(amount.value, amount.currency);

const formatDiscounted = (amount: PaymentAmount, discount: PaymentAmount) => formatAmount({ ...amount, value: amount.value - discount.value });

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
const plansDiscountingInterest: [planType: string, plan: EmiPlan, offer: PaymentAmount][] = [
    ['no cost', noCostPlanWithDiscount, noCostOffer],
    ['low cost', lowCostPlanWithDiscount, lowCostOffer]
];

describe('EMIPlanSummary', () => {
    test('should keep every row in a single group', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        expect(within(screen.getByRole('group')).getAllByRole('term')).toHaveLength(5);
    });

    test('should render every row of a complete plan, in the order of the design', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        expect(labels()).toEqual([
            'Item price',
            'Amount reserved on card',
            'Interest charged by bank @15.5%',
            'Total amount to be paid over time',
            'Upcoming monthly payment'
        ]);
    });

    describe.each(plansDiscountingInterest)('%s plan', (_planType, plan, offer) => {
        const { totalInterestAmount, totalPayableAmount, monthlyPayableAmount } = plan.transactionAmounts;

        test('should discount the offer off the reserved amount and off the interest, keeping the interest original', () => {
            renderPlanSummary(plan);

            expect(values()).toEqual([
                formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
                formatDiscounted(EMI_FIXTURE_CHECKOUT_AMOUNT, offer),
                // The struck-through original and the discounted value of the interest row, side by side
                `${formatAmount(totalInterestAmount)}${formatDiscounted(totalInterestAmount, offer)}`,
                formatAmount(totalPayableAmount),
                formatAmount(monthlyPayableAmount)
            ]);
        });

        // The row announces the amount the shopper pays, and the strikethrough carries the discount visually
        test('should strike the original interest through, hidden from assistive technology', () => {
            renderPlanSummary(plan);

            const original = screen.getByText(formatAmount(totalInterestAmount));

            expect(original.tagName).toBe('S');
            expect(original).toHaveAttribute('aria-hidden', 'true');
        });

        test('should render no discount row, the offer being shown on the rows it discounts', () => {
            renderPlanSummary(plan);

            expect(screen.queryByText('Discount')).toBeNull();
        });

        test('should render the rows of the plan when no checkout amount is configured', () => {
            renderPlanSummary(plan, { amount: undefined });

            expect(labels()).toEqual([
                expect.stringMatching(/^Interest charged by bank @/),
                'Total amount to be paid over time',
                'Upcoming monthly payment'
            ]);
            expect(screen.getByText(formatDiscounted(totalInterestAmount, offer))).toBeInTheDocument();
        });
    });

    test('should discount the interest no further than zero when the offer exceeds it', () => {
        const { transactionAmounts } = noCostPlanWithDiscount;
        const interestBelowOffer = { value: noCostOffer.value - 100, currency: noCostOffer.currency };

        renderPlanSummary({ ...noCostPlanWithDiscount, transactionAmounts: { ...transactionAmounts, totalInterestAmount: interestBelowOffer } });

        expect(screen.getByText(i18n.amount(0, interestBelowOffer.currency))).toBeInTheDocument();
    });

    test('should render the offer of a standard plan as a discount row of its own, leaving the other rows alone', () => {
        const offer = { offerId: 'offer-axis', type: 'DISCOUNT', amount: { value: 100000, currency: 'INR' } };
        const { totalInterestAmount, totalPayableAmount, monthlyPayableAmount } = standardPlanWithInterest.transactionAmounts;

        renderPlanSummary({ ...standardPlanWithInterest, offers: [offer] });

        expect(labels()).toEqual([
            'Item price',
            'Discount',
            'Amount reserved on card',
            'Interest charged by bank @15.5%',
            'Total amount to be paid over time',
            'Upcoming monthly payment'
        ]);
        // An exact match also proves that no struck-through original amount is rendered next to a value
        expect(values()).toEqual([
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            // The locale places the minus sign, the same way it places the currency symbol
            i18n.amount(-offer.amount.value, offer.amount.currency),
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(totalInterestAmount),
            formatAmount(totalPayableAmount),
            formatAmount(monthlyPayableAmount)
        ]);
    });

    test('should not render the discount row when the plan carries no offer', () => {
        const { totalInterestAmount, totalPayableAmount, monthlyPayableAmount } = standardPlanWithInterest.transactionAmounts;

        renderPlanSummary(standardPlanWithInterest);

        expect(screen.queryByText('Discount')).toBeNull();
        expect(labels()).toEqual([
            'Item price',
            'Amount reserved on card',
            'Interest charged by bank @15.5%',
            'Total amount to be paid over time',
            'Upcoming monthly payment'
        ]);
        expect(values()).toEqual([
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(totalInterestAmount),
            formatAmount(totalPayableAmount),
            formatAmount(monthlyPayableAmount)
        ]);
    });

    test('should interpolate the plan interest rate into the interest label', () => {
        renderPlanSummary({ ...standardPlanWithInterest, interestRateBps: 1599 });

        expect(screen.getByText('Interest charged by bank @15.99%')).toBeInTheDocument();
    });

    test('should render the monthly payment with its own label, outside the row list', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        const terms = labels();
        const definitions = values();

        expect(terms[terms.length - 1]).toBe('Upcoming monthly payment');
        expect(definitions[definitions.length - 1]).toBe(formatAmount(noCostPlanWithDiscount.transactionAmounts.monthlyPayableAmount));
    });
});
