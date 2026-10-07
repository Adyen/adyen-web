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

/** The fields are optional on the wire, so a fixture meant to carry one is asserted rather than defaulted */
const requireAmount = (amount: PaymentAmount | undefined, field: string, plan: EmiPlan): PaymentAmount => {
    if (!amount) throw new Error(`The ${plan.type} fixture carries no ${field}`);

    return amount;
};

const formatAmount = (amount: PaymentAmount) => i18n.amount(amount.value, amount.currency);

// The locale places the minus sign, the same way it places the currency symbol
const formatDiscount = (amount: PaymentAmount) => i18n.amount(-amount.value, amount.currency);

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
const plansDiscountingInterest: [planType: string, plan: EmiPlan, tag: string][] = [
    ['no cost', noCostPlanWithDiscount, 'No cost'],
    ['low cost', lowCostPlanWithDiscount, 'Low cost']
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

    describe.each(plansDiscountingInterest)('%s plan', (_planType, plan, tag) => {
        const { authorizationAmount, totalInstantDiscountAmount, interestDiscountAmount, totalInterestAmount, totalPayableAmount } =
            plan.transactionAmounts;

        test('should render every amount as the response carries it, without arithmetic', () => {
            renderPlanSummary(plan);

            expect(values()).toEqual([
                formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
                formatDiscount(requireAmount(totalInstantDiscountAmount, 'instant discount', plan)),
                formatDiscount(requireAmount(interestDiscountAmount, 'interest discount', plan)),
                formatAmount(authorizationAmount),
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
                'Amount reserved on card',
                expect.stringMatching(/^Interest charged by bank @/),
                'Total amount to be paid over time'
            ]);
        });
    });

    /** The reserved amount is the backend's figure, so it no longer depends on the merchant's checkout amount */
    test('should reserve the authorisation amount of the response, whatever the checkout amount', () => {
        const amount = { value: 100, currency: 'INR' };

        renderPlanSummary(noCostPlanWithDiscount, { amount });

        expect(values()[3]).toBe(formatAmount(noCostPlanWithDiscount.transactionAmounts.authorizationAmount));
    });

    test('should render the interest discount of a standard plan when the response carries one', () => {
        const interestDiscountAmount = { value: 100000, currency: 'INR' };

        renderPlanSummary({
            ...standardPlanWithInterest,
            transactionAmounts: { ...standardPlanWithInterest.transactionAmounts, interestDiscountAmount }
        });

        // A standard plan has no tag, so the label carries none
        expect(labels()).toContain('Interest discount');
        expect(values()).toContain(formatDiscount(interestDiscountAmount));
    });

    test('should not render the discount rows when the plan carries neither discount', () => {
        const { authorizationAmount, totalInterestAmount, totalPayableAmount } = standardPlanWithInterest.transactionAmounts;

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
            formatAmount(authorizationAmount),
            formatAmount(totalInterestAmount),
            formatAmount(totalPayableAmount)
        ]);
    });

    test('should interpolate the plan interest rate into the interest label', () => {
        renderPlanSummary({ ...standardPlanWithInterest, interestRateBps: 1599 });

        expect(screen.getByText('Interest charged by bank @15.99% p.a')).toBeInTheDocument();
    });
});
