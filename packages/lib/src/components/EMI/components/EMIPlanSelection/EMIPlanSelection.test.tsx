import { h } from 'preact';
import { useState } from 'preact/hooks';
import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { EMIPlanSelection } from './EMIPlanSelection';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { emiIssuersFixture } from '../../emi-plans.fixture';
import type { EmiIssuerOption, EmiSelection } from '../../types';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const [hdfc, icici, axis] = emiIssuersFixture;

/**
 * The component is controlled, so the test owns the selection the way EMIComponent does, and the spy
 * records what it is asked to change to.
 */
const renderPlanSelection = (issuers: EmiIssuerOption[]) => {
    const onSelectionChange = jest.fn();

    function ControlledPlanSelection(): h.JSX.Element {
        const [selection, setSelection] = useState<EmiSelection>({ issuer: issuers[0], plan: issuers[0].plans[0] });

        return (
            <EMIPlanSelection
                issuers={issuers}
                selection={selection}
                onSelectionChange={next => {
                    onSelectionChange(next);
                    setSelection(next);
                }}
            />
        );
    }

    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <ControlledPlanSelection />
        </CoreProvider>
    );

    return { onSelectionChange };
};

const getProviderSelect = () => screen.getByLabelText('Provider');
const getPlanSelect = () => screen.getByLabelText('Plan');

const getPlanOptions = () => {
    const [, planList] = screen.getAllByRole('listbox');
    return within(planList)
        .getAllByRole('option')
        .map(option => option.textContent);
};

describe('EMIPlanSelection', () => {
    const user = userEvent.setup();

    test('should expose both selects by their accessible name', () => {
        renderPlanSelection(emiIssuersFixture);

        expect(getProviderSelect()).toBeInTheDocument();
        expect(getPlanSelect()).toBeInTheDocument();
    });

    test('should show the given selection on both collapsed rows, without announcing a change', () => {
        const { onSelectionChange } = renderPlanSelection(emiIssuersFixture);

        expect(getProviderSelect()).toHaveTextContent(hdfc.name);
        expect(getPlanSelect()).toHaveTextContent('₹58,800.00 x 3 months');
        expect(onSelectionChange).not.toHaveBeenCalled();
    });

    test('should list only the plans of the selected issuer', () => {
        renderPlanSelection(emiIssuersFixture);

        expect(getPlanOptions()).toEqual(['₹58,800.00 x 3 months-₹4,000.00 discount availableNo cost', '₹29,400.00 x 6 months | @15.5% p.a']);
    });

    test('should reset the plan to the first plan of the newly selected issuer', async () => {
        const { onSelectionChange } = renderPlanSelection(emiIssuersFixture);

        await user.click(getProviderSelect());
        const [providerList] = screen.getAllByRole('listbox');
        await user.click(within(providerList).getByRole('option', { name: new RegExp(icici.name, 'i') }));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: icici, plan: icici.plans[0] });
        expect(getPlanOptions()).toEqual([
            '₹58,800.00 x 3 months | @7.5% p.a-₹6,000.00 discount availableLow cost',
            '₹19,600.00 x 9 months | @15.99% p.a'
        ]);
    });

    test('should keep the issuer and switch the plan when another plan is selected', async () => {
        const { onSelectionChange } = renderPlanSelection(emiIssuersFixture);

        await user.click(getPlanSelect());
        const [, planList] = screen.getAllByRole('listbox');
        await user.click(within(planList).getByRole('option', { name: /6 months/i }));

        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[1] });
    });

    test('should omit the interest rate from the label of a no cost plan only', () => {
        renderPlanSelection([hdfc]);

        const [noCostPlan, standardPlan] = getPlanOptions();

        expect(noCostPlan).not.toContain('p.a');
        expect(standardPlan).toContain('@15.5% p.a');
    });

    test('should show the discount of the selected plan on the collapsed provider row', () => {
        renderPlanSelection([hdfc]);

        expect(getProviderSelect()).toHaveTextContent('No cost');
    });

    test('should announce the discount of the selected plan', () => {
        renderPlanSelection([hdfc]);

        // Both Selects own a live region of their own, so the banner is resolved by its copy
        expect(screen.getByText('-₹4,000.00 discount offer applied for using HDFC Bank')).toHaveAttribute('role', 'status');
    });

    test('should not show a discount banner for a plan without an offer', () => {
        renderPlanSelection([axis]);

        expect(screen.queryByText(/discount offer applied/i)).toBeNull();
    });
});
