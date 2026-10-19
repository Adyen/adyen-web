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

const requireAmount = (amount: PaymentAmount | undefined, field: string, plan: EmiPlan): PaymentAmount => {
    if (!amount) throw new Error(`The ${plan.type} fixture carries no ${field}`);

    return amount;
};

const formatAmount = (amount: PaymentAmount) => i18n.amount(amount.value, amount.currency);

const formatDiscount = (amount: PaymentAmount) => i18n.amount(-amount.value, amount.currency);

const labels = () => screen.getAllByRole('term').map(term => term.textContent);
const values = () => screen.getAllByRole('definition').map(definition => definition.textContent);
const valuesByLabel = () => {
    const rowValues = values();
    return Object.fromEntries(labels().map((label, index) => [label, rowValues[index]]));
};

const renderPlanSummary = (plan: EmiPlan, { amount }: { amount?: PaymentAmount } = { amount: EMI_FIXTURE_CHECKOUT_AMOUNT }) =>
    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <AmountProvider amount={amount} providerRef={createRef()}>
                <EMIPlanSummary plan={plan} />
            </AmountProvider>
        </CoreProvider>
    );

const plansDiscountingInterest: [planType: string, plan: EmiPlan, tag: string, interestDiscount: string][] = [
    ['no cost', noCostPlanWithDiscount, 'No cost', '-₹4,082.65'],
    ['low cost', lowCostPlanWithDiscount, 'Low cost', '-₹1,500.00']
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
            'Interest discountNo cost',
            'Amount reserved on card',
            'Interest charged by bank @18% p.a',
            'Total amount to be paid over time'
        ]);
    });

    test('should render every amount of a complete plan as the response carries it, without arithmetic', () => {
        const { authorizationAmount, additionalDiscountAmount, interestDiscountAmount, totalInterestAmount, totalPayableAmount } =
            noCostPlanWithDiscount.transactionAmounts;

        renderPlanSummary(noCostPlanWithDiscount);

        expect(values()).toEqual([
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatDiscount(requireAmount(additionalDiscountAmount, 'additional discount', noCostPlanWithDiscount)),
            formatDiscount(requireAmount(interestDiscountAmount, 'interest discount', noCostPlanWithDiscount)),
            formatAmount(authorizationAmount),
            formatAmount(totalInterestAmount),
            formatAmount(totalPayableAmount)
        ]);
    });

    test('should show the additional discount as the instant discount, not the total instant discount', () => {
        const { totalInstantDiscountAmount } = noCostPlanWithDiscount.transactionAmounts;

        renderPlanSummary(noCostPlanWithDiscount);

        expect(valuesByLabel()).toEqual(expect.objectContaining({ 'Instant discount': '-₹15,499.90' }));
        expect(values()).not.toContain(formatDiscount(requireAmount(totalInstantDiscountAmount, 'total instant discount', noCostPlanWithDiscount)));
    });

    test('should not render the instant discount row for a plan without an additional discount', () => {
        renderPlanSummary(lowCostPlanWithDiscount);

        expect(lowCostPlanWithDiscount.transactionAmounts.totalInstantDiscountAmount).toBeDefined();
        expect(labels()).not.toContain('Instant discount');
    });

    test('should render the rows of the plan when no checkout amount is configured', () => {
        renderPlanSummary(noCostPlanWithDiscount, { amount: undefined });

        expect(labels()).toEqual([
            'Instant discount',
            'Interest discountNo cost',
            'Amount reserved on card',
            'Interest charged by bank @18% p.a',
            'Total amount to be paid over time'
        ]);
    });

    describe.each(plansDiscountingInterest)('%s plan', (_planType, plan, tag, interestDiscount) => {
        test('should show the interest discount as a negative amount against its own row', () => {
            renderPlanSummary(plan);

            expect(valuesByLabel()).toEqual(expect.objectContaining({ [`Interest discount${tag}`]: interestDiscount }));
        });

        test('should tag the interest discount with the plan type it comes with', () => {
            renderPlanSummary(plan);

            expect(screen.getByText('Interest discount', { exact: false })).toHaveTextContent(tag);
        });
    });

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

        expect(labels()).toContain('Interest discount');
        expect(values()).toContain(formatDiscount(interestDiscountAmount));
    });

    test('should render the instant discount of a plan that carries no interest discount', () => {
        renderPlanSummary({
            ...standardPlanWithInterest,
            transactionAmounts: { ...standardPlanWithInterest.transactionAmounts, additionalDiscountAmount: { value: 100000, currency: 'INR' } }
        });

        expect(labels()).not.toContain('Interest discount');
        expect(valuesByLabel()).toEqual(expect.objectContaining({ 'Instant discount': '-₹1,000.00' }));
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
