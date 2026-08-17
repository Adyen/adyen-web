import { h } from 'preact';
import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { EMIPlanSelection } from './EMIPlanSelection';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { emiIssuersFixture } from '../../emi-plans.fixture';
import type { EmiIssuerOption, EmiSelection } from '../../types';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const [hdfc, icici] = emiIssuersFixture;
const issuerWithoutPlans: EmiIssuerOption = { id: 'sbi', name: 'State Bank of India', fundingSource: 'credit', plans: [] };

/**
 * The component is controlled: it renders the selection it is given and reports the one it is asked to
 * change to. EMIComponent owns the state, the discount banner and its announcement, so all of that is
 * covered in `EMIComponent.test.tsx`.
 */
const renderPlanSelection = (issuers: EmiIssuerOption[], selection?: EmiSelection) => {
    const onSelectionChange = jest.fn();

    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <EMIPlanSelection
                issuers={issuers}
                selection={selection ?? { issuer: issuers[0], plan: issuers[0].plans[0] }}
                onSelectionChange={onSelectionChange}
            />
        </CoreProvider>
    );

    return { onSelectionChange };
};

const getProviderSelect = () => screen.getByLabelText('Provider');
const getPlanSelect = () => screen.getByLabelText('Plan');

const getOptions = (list: HTMLElement) =>
    within(list)
        .getAllByRole('option')
        .map(option => option.textContent);

const getProviderOptions = () => getOptions(screen.getAllByRole('listbox')[0]);
const getPlanOptions = () => getOptions(screen.getAllByRole('listbox')[1]);

describe('EMIPlanSelection', () => {
    const user = userEvent.setup();

    test('should expose both selects by their accessible name', () => {
        renderPlanSelection(emiIssuersFixture);

        expect(getProviderSelect()).toBeInTheDocument();
        expect(getPlanSelect()).toBeInTheDocument();
    });

    // EMIComponent owns the heading and the copy the group is named and described by, and asserts those
    test('should keep both selects in a single group', () => {
        renderPlanSelection(emiIssuersFixture);

        const group = screen.getByRole('group');

        expect(within(group).getByLabelText('Provider')).toBeInTheDocument();
        expect(within(group).getByLabelText('Plan')).toBeInTheDocument();
    });

    test('should show the given selection on both collapsed rows', () => {
        renderPlanSelection(emiIssuersFixture);

        expect(getProviderSelect()).toHaveTextContent(hdfc.name);
        expect(getPlanSelect()).toHaveTextContent('₹58,800.00 x 3 months');
    });

    test('should list only the plans of the selected issuer', () => {
        renderPlanSelection(emiIssuersFixture, { issuer: icici, plan: icici.plans[0] });

        expect(getPlanOptions()).toEqual([
            '₹58,800.00 x 3 months | @7.5% p.a-₹6,000.00 discount availableLow cost',
            '₹19,600.00 x 9 months | @15.99% p.a'
        ]);
    });

    test('should not offer an issuer that has no plans', () => {
        renderPlanSelection([hdfc, issuerWithoutPlans]);

        expect(getProviderOptions()).toHaveLength(1);
        expect(screen.queryByText(issuerWithoutPlans.name)).toBeNull();
    });

    test('should report the first plan of the issuer the shopper selects', async () => {
        const { onSelectionChange } = renderPlanSelection(emiIssuersFixture);

        await user.click(getProviderSelect());
        await user.click(within(screen.getAllByRole('listbox')[0]).getByRole('option', { name: new RegExp(icici.name, 'i') }));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: icici, plan: icici.plans[0] });
    });

    test('should report the plan the shopper selects, keeping the issuer', async () => {
        const { onSelectionChange } = renderPlanSelection(emiIssuersFixture);

        await user.click(getPlanSelect());
        await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /6 months/i }));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[1] });
    });

    test('should not report anything while nothing is selected', () => {
        const { onSelectionChange } = renderPlanSelection(emiIssuersFixture);

        expect(onSelectionChange).not.toHaveBeenCalled();
    });

    test('should omit the interest rate from the label of a no cost plan only', () => {
        renderPlanSelection([hdfc]);

        const [noCostPlan, standardPlan] = getPlanOptions();

        expect(noCostPlan).not.toContain('p.a');
        expect(standardPlan).toContain('@15.5% p.a');
    });

    test('should show the tag of the selected plan on the collapsed provider row', () => {
        renderPlanSelection([hdfc]);

        expect(getProviderSelect()).toHaveTextContent('No cost');
    });

    test('should offer the discount of a plan as supporting text', () => {
        renderPlanSelection([hdfc]);

        expect(getPlanOptions()[0]).toContain('-₹4,000.00 discount available');
    });
});
