import { h } from 'preact';
import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { EMIPlanSelection } from './EMIPlanSelection';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { emiPlansResponseMock } from '../../stories/mocks';
import type { EmiIssuer, EmiSelection } from '../../types';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const [hdfc, icici] = emiPlansResponseMock.issuers;

/**
 * One issuer offering a plan type at a tenure another of its plans also carries: the pair
 * (`type`, `tenureMonths`) tells them apart, neither field on its own does.
 */
const issuerWithSimilarPlans: EmiIssuer = {
    ...hdfc,
    plans: [
        // noCost, 3 months
        hdfc.plans[0],
        // The tenure of the first plan, at the type of the last
        { ...hdfc.plans[1], tenureMonths: 3 },
        // standard, 6 months
        hdfc.plans[1]
    ]
};

/**
 * The component is controlled: it renders the selection it is given and reports the one it is asked to
 * change to. EMIComponent owns the state, the discount banner and its announcement, so all of that is
 * covered in `EMIComponent.test.tsx`.
 */
const renderPlanSelection = (issuers: EmiIssuer[], selection?: EmiSelection) => {
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

/** What the select reports back on a choice, before the component trades it for a response object. */
const getOptionValues = (list: HTMLElement) =>
    within(list)
        .getAllByRole('option')
        .map(option => option.getAttribute('data-value'));

const getProviderOptionValues = () => getOptionValues(screen.getAllByRole('listbox')[0]);
const getPlanOptionValues = () => getOptionValues(screen.getAllByRole('listbox')[1]);

describe('EMIPlanSelection', () => {
    const user = userEvent.setup();

    test('should expose both selects by their accessible name', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        expect(getProviderSelect()).toBeInTheDocument();
        expect(getPlanSelect()).toBeInTheDocument();
    });

    // EMIComponent owns the heading and the copy the group is named and described by, and asserts those
    test('should keep both selects in a single group', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        const group = screen.getByRole('group');

        expect(within(group).getByLabelText('Provider')).toBeInTheDocument();
        expect(within(group).getByLabelText('Plan')).toBeInTheDocument();
    });

    test('should show the given selection on both collapsed rows', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        expect(getProviderSelect()).toHaveTextContent(hdfc.issuerName);
        expect(getPlanSelect()).toHaveTextContent('₹51,666.33 x 3 months');
    });

    test('should list only the plans of the selected issuer', () => {
        renderPlanSelection(emiPlansResponseMock.issuers, { issuer: icici, plan: icici.plans[0] });

        expect(getPlanOptions()).toEqual([
            '₹52,366.50 x 3 months | @7.5% p.a-₹2,100.50 discount availableLow cost',
            '₹19,333.22 x 9 months | @15.99% p.a'
        ]);
    });

    // The response is the only source, and every issuer it carries is selectable
    test('should offer every issuer it is given', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        expect(getProviderOptions()).toHaveLength(emiPlansResponseMock.issuers.length);
    });

    test('should report the first plan of the issuer the shopper selects', async () => {
        const { onSelectionChange } = renderPlanSelection(emiPlansResponseMock.issuers);

        await user.click(getProviderSelect());
        await user.click(within(screen.getAllByRole('listbox')[0]).getByRole('option', { name: new RegExp(icici.issuerName, 'i') }));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: icici, plan: icici.plans[0] });
    });

    test('should report the plan the shopper selects, keeping the issuer', async () => {
        const { onSelectionChange } = renderPlanSelection(emiPlansResponseMock.issuers);

        await user.click(getPlanSelect());
        await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /6 months/i }));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[1] });
    });

    // Going back to the plan that was preselected is a normal move, and its row is no different
    test('should report the first plan again after the shopper picked another one', async () => {
        const { onSelectionChange } = renderPlanSelection(emiPlansResponseMock.issuers, { issuer: hdfc, plan: hdfc.plans[1] });

        await user.click(getPlanSelect());
        await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /3 months/i }));

        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[0] });
    });

    test('should identify a provider by the issuer and funding source the payment is made for', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        expect(getProviderOptionValues()).toEqual(['issuer:HDFC:credit', 'issuer:ICICI:credit', 'issuer:AXIS:debit', 'issuer:KOTAK:credit']);
    });

    test('should identify a plan by the provider, type and tenure the payment is made for', () => {
        renderPlanSelection([hdfc]);

        expect(getPlanOptionValues()).toEqual(['plan:HDFC:credit:noCost:3', 'plan:HDFC:credit:standard:6']);
    });

    // A row answers to what it is, so reordering the response moves the rows and nothing else
    test('should keep those identities when the response order changes', () => {
        const reordered: EmiIssuer = { ...hdfc, plans: [hdfc.plans[1], hdfc.plans[0]] };

        renderPlanSelection([icici, reordered], { issuer: reordered, plan: reordered.plans[0] });

        expect(getProviderOptionValues()).toEqual(['issuer:ICICI:credit', 'issuer:HDFC:credit']);
        expect(getPlanOptionValues()).toEqual(['plan:HDFC:credit:standard:6', 'plan:HDFC:credit:noCost:3']);
    });

    // Both lists live in one document, where positions made every first row answer to `listItem-0`
    test('should give no two rows of the two lists the same id', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        const optionIds = screen.getAllByRole('option').map(option => option.id);

        expect(new Set(optionIds).size).toBe(optionIds.length);
    });

    test('should tell plans apart by their whole identity when they share a tenure or a type', async () => {
        const { onSelectionChange } = renderPlanSelection([issuerWithSimilarPlans]);

        expect(getPlanOptionValues()).toEqual(['plan:HDFC:credit:noCost:3', 'plan:HDFC:credit:standard:3', 'plan:HDFC:credit:standard:6']);

        await user.click(getPlanSelect());
        await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /₹28,166.50 x 3 months/ }));

        // The objects of the response itself, so nothing derived here travels with the selection
        const [{ issuer, plan }] = onSelectionChange.mock.calls[0] as [EmiSelection];

        expect(issuer).toBe(issuerWithSimilarPlans);
        expect(plan).toBe(issuerWithSimilarPlans.plans[1]);
    });

    test('should not report anything while nothing is selected', () => {
        const { onSelectionChange } = renderPlanSelection(emiPlansResponseMock.issuers);

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
