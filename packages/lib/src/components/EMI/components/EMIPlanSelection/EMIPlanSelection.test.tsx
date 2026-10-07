import { h } from 'preact';
import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { EMIPlanSelection } from './EMIPlanSelection';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { UiTarget } from '../../../../core/Analytics/events/AnalyticsInfoEvent';
import { emiPlansResponseMock } from '../../stories/mocks';
import type { EmiIssuer, EmiSelection } from '../../types';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const [hdfc, icici, , kotak] = emiPlansResponseMock.issuers;

const issuerWithSimilarPlans: EmiIssuer = {
    ...hdfc,
    plans: [hdfc.plans[0], { ...hdfc.plans[1], tenureMonths: 3 }, hdfc.plans[1]]
};

const issuerWithEveryPlanType: EmiIssuer = {
    ...hdfc,
    availablePlanTypes: ['standard', 'lowCost', 'noCost'],
    plans: [hdfc.plans[1], icici.plans[0], hdfc.plans[0]]
};

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

const getOptionValues = (list: HTMLElement) =>
    within(list)
        .getAllByRole('option')
        .map(option => option.getAttribute('data-value'));

const getProviderOptionValues = () => getOptionValues(screen.getAllByRole('listbox')[0]);
const getPlanOptionValues = () => getOptionValues(screen.getAllByRole('listbox')[1]);

const TAG_LABEL = /^(No cost|Low cost)$/;

const getTagsWithin = (element: HTMLElement) =>
    within(element)
        .getAllByText(TAG_LABEL)
        .map(tag => tag.textContent);

const getProviderOption = (issuerName: string) =>
    within(screen.getAllByRole('listbox')[0]).getByRole('option', { name: new RegExp(issuerName, 'i') });

describe('EMIPlanSelection', () => {
    const user = userEvent.setup();

    test('should expose both selects by their accessible name', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        expect(getProviderSelect()).toBeInTheDocument();
        expect(getPlanSelect()).toBeInTheDocument();
    });

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
            '₹52,366.50 x 3 months | @7.5% p.aAdditional ₹2,100.50 discount availableLow cost',
            '₹19,333.22 x 9 months | @15.99% p.a'
        ]);
    });

    test('should offer every issuer it is given', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        expect(getProviderOptions()).toHaveLength(emiPlansResponseMock.issuers.length);
    });

    test('should report the first plan of the issuer the shopper selects', async () => {
        const { onSelectionChange } = renderPlanSelection(emiPlansResponseMock.issuers);

        await user.click(getProviderSelect());
        await user.click(within(screen.getAllByRole('listbox')[0]).getByRole('option', { name: new RegExp(icici.issuerName, 'i') }));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: icici, plan: icici.plans[0] }, UiTarget.emiProvider);
    });

    test('should report the plan the shopper selects, keeping the issuer', async () => {
        const { onSelectionChange } = renderPlanSelection(emiPlansResponseMock.issuers);

        await user.click(getPlanSelect());
        await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /6 months/i }));

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[1] }, UiTarget.emiPlan);
    });

    test('should report the first plan again after the shopper picked another one', async () => {
        const { onSelectionChange } = renderPlanSelection(emiPlansResponseMock.issuers, { issuer: hdfc, plan: hdfc.plans[1] });

        await user.click(getPlanSelect());
        await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /3 months/i }));

        expect(onSelectionChange).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[0] }, UiTarget.emiPlan);
    });

    test('should identify a provider by the issuer and funding source the payment is made for', () => {
        renderPlanSelection(emiPlansResponseMock.issuers);

        expect(getProviderOptionValues()).toEqual(['issuer:HDFC:credit', 'issuer:ICICI:credit', 'issuer:AXIS:credit', 'issuer:KOTAK:credit']);
    });

    test('should identify a plan by the provider, type and tenure the payment is made for', () => {
        renderPlanSelection([hdfc]);

        expect(getPlanOptionValues()).toEqual(['plan:HDFC:credit:noCost:3', 'plan:HDFC:credit:standard:6']);
    });

    test('should keep those identities when the response order changes', () => {
        const reordered: EmiIssuer = { ...hdfc, plans: [hdfc.plans[1], hdfc.plans[0]] };

        renderPlanSelection([icici, reordered], { issuer: reordered, plan: reordered.plans[0] });

        expect(getProviderOptionValues()).toEqual(['issuer:ICICI:credit', 'issuer:HDFC:credit']);
        expect(getPlanOptionValues()).toEqual(['plan:HDFC:credit:standard:6', 'plan:HDFC:credit:noCost:3']);
    });

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

    test('should offer the discount of a plan as supporting text', () => {
        renderPlanSelection([hdfc]);

        expect(getPlanOptions()[0]).toContain('Additional ₹4,000.00 discount available');
    });

    describe('provider rows', () => {
        test('should keep the tag of the provider while a plan without one is selected', () => {
            renderPlanSelection([hdfc], { issuer: hdfc, plan: hdfc.plans[1] });

            expect(getTagsWithin(getProviderSelect())).toEqual(['No cost']);
        });

        test('should tag a provider with every plan type it offers, no cost first', () => {
            renderPlanSelection([issuerWithEveryPlanType]);

            expect(getTagsWithin(getProviderSelect())).toEqual(['No cost', 'Low cost']);
            expect(getTagsWithin(getProviderOption(issuerWithEveryPlanType.issuerName))).toEqual(['No cost', 'Low cost']);
        });

        test('should tag a provider with the plan types the response advertises, not those of its plans', () => {
            renderPlanSelection([{ ...hdfc, availablePlanTypes: ['lowCost'] }]);

            expect(getTagsWithin(getProviderSelect())).toEqual(['Low cost']);
        });

        test('should leave a provider offering only standard plans untagged', () => {
            renderPlanSelection([kotak]);

            expect(within(getProviderSelect()).queryByText(TAG_LABEL)).not.toBeInTheDocument();
            expect(within(getProviderOption(kotak.issuerName)).queryByText(TAG_LABEL)).not.toBeInTheDocument();
        });

        test('should offer the largest discount of the provider as supporting text, whichever plan is selected', () => {
            renderPlanSelection([hdfc], { issuer: hdfc, plan: hdfc.plans[1] });

            expect(getProviderOption(hdfc.issuerName)).toHaveTextContent('Additional ₹4,000.00 discount available');
        });

        test('should offer the best offer of the response as the provider discount, not one of its plans', () => {
            renderPlanSelection([{ ...hdfc, bestOffer: { value: 123400, currency: 'INR' } }]);

            expect(getProviderOption(hdfc.issuerName)).toHaveTextContent('Additional ₹1,234.00 discount available');
        });

        test('should offer no supporting text for a provider without a discount', () => {
            renderPlanSelection([kotak]);

            expect(getProviderOption(kotak.issuerName)).not.toHaveTextContent('discount available');
        });
    });
});
