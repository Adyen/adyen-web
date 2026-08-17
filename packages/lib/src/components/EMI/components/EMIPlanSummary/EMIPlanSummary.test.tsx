import { createRef, h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { EMIPlanSummary } from './EMIPlanSummary';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { EMI_FIXTURE_CHECKOUT_AMOUNT, emiIssuersFixture } from '../../emi-plans.fixture';
import type { EmiPlanOption } from '../../types';
import type { PaymentAmount } from '../../../../types/global-types';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const [hdfc, , axis, kotak] = emiIssuersFixture;
const noCostPlanWithDiscount = hdfc.plans[0];
const standardPlanWithInterest = axis.plans[0];
const planWithoutAmounts = kotak.plans[0];

const formatAmount = (amount?: PaymentAmount) => (amount ? i18n.amount(amount.value, amount.currency) : '');

const renderPlanSummary = (plan: EmiPlanOption, { amount }: { amount?: PaymentAmount } = { amount: EMI_FIXTURE_CHECKOUT_AMOUNT }) =>
    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <AmountProvider amount={amount} providerRef={createRef()}>
                <EMIPlanSummary plan={plan} />
            </AmountProvider>
        </CoreProvider>
    );

describe('EMIPlanSummary', () => {
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
            `-${formatAmount(noCostPlanWithDiscount.selectedOffer?.amount)}`,
            formatAmount(EMI_FIXTURE_CHECKOUT_AMOUNT),
            formatAmount(noCostPlanWithDiscount.totalInterestAmount),
            formatAmount(noCostPlanWithDiscount.totalPayableAmount),
            formatAmount(noCostPlanWithDiscount.monthlyPayableAmount)
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
        expect(definitions[definitions.length - 1]).toBe(formatAmount(noCostPlanWithDiscount.monthlyPayableAmount));
    });

    test('should omit every row whose source amount is missing', () => {
        renderPlanSummary(planWithoutAmounts);

        expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual(['Item price', 'Amount reserved on card']);
        expect(screen.queryByText('Upcoming monthly payment')).toBeNull();
    });

    test('should render nothing when neither the checkout amount nor the plan amounts are known', () => {
        renderPlanSummary(planWithoutAmounts, {});

        expect(screen.queryAllByRole('term')).toHaveLength(0);
    });
});
