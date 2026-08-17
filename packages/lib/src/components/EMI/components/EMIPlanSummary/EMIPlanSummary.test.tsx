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

const [hdfc, , axis] = emiPlansResponseMock.issuers;
const noCostPlanWithDiscount = hdfc.plans[0];
const standardPlanWithInterest = axis.plans[0];
/** The larger of the two offers the no cost plan carries, which is the one the design shows */
const displayedOffer = noCostPlanWithDiscount.offers?.[1];

const formatAmount = (amount?: PaymentAmount) => (amount ? i18n.amount(amount.value, amount.currency) : '');

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

describe('EMIPlanSummary', () => {
    test('should keep every row in a single group', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        expect(within(screen.getByRole('group')).getAllByRole('term')).toHaveLength(6);
    });

    test('should render every row of a complete plan, in the order of the design', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual([
            'Item price',
            'Discount',
            'Amount reserved on card',
            'Interest charged by bank @15.5%',
            'Total amount to be paid over time',
            'Upcoming monthly payment'
        ]);
    });

    test('should render the amount of every row, with the discount as a negative value', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        // An exact match also proves that no struck-through original amount is rendered next to a value
        expect(screen.getAllByRole('definition').map(definition => definition.textContent)).toEqual([
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            `-${formatAmount(displayedOffer?.amount)}`,
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(noCostPlanWithDiscount.transactionAmounts.totalInterestAmount),
            formatAmount(noCostPlanWithDiscount.transactionAmounts.totalPayableAmount),
            formatAmount(noCostPlanWithDiscount.transactionAmounts.monthlyPayableAmount)
        ]);
    });

    test('should not render the discount row when the plan carries no offer', () => {
        renderPlanSummary(standardPlanWithInterest);

        expect(screen.queryByText('Discount')).toBeNull();
        expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual([
            'Item price',
            'Amount reserved on card',
            'Interest charged by bank @15.5%',
            'Total amount to be paid over time',
            'Upcoming monthly payment'
        ]);
    });

    test('should interpolate the plan interest rate into the interest label', () => {
        renderPlanSummary({ ...standardPlanWithInterest, interestRateBps: 1599 });

        expect(screen.getByText('Interest charged by bank @15.99%')).toBeInTheDocument();
    });

    test('should render the monthly payment with its own label, outside the row list', () => {
        renderPlanSummary(noCostPlanWithDiscount);

        const terms = screen.getAllByRole('term').map(term => term.textContent);
        const definitions = screen.getAllByRole('definition').map(definition => definition.textContent);

        expect(terms[terms.length - 1]).toBe('Upcoming monthly payment');
        expect(definitions[definitions.length - 1]).toBe(formatAmount(noCostPlanWithDiscount.transactionAmounts.monthlyPayableAmount));
    });

    test('should omit the checkout amount rows when no amount was configured, keeping the plan rows', () => {
        renderPlanSummary(standardPlanWithInterest, {});

        expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual([
            'Interest charged by bank @15.5%',
            'Total amount to be paid over time',
            'Upcoming monthly payment'
        ]);
    });

    test('should render the plan rows when the merchant configured no amount', () => {
        // Merchants configure the amount, so `null` reaches the context at runtime even though the type forbids it
        const unconfiguredAmount: unknown = null;

        renderPlanSummary(standardPlanWithInterest, { amount: unconfiguredAmount as PaymentAmount });

        expect(screen.queryByText('Item price')).toBeNull();
        expect(screen.getByText('Upcoming monthly payment')).toBeInTheDocument();
    });
});
