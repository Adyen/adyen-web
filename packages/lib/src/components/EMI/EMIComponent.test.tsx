import { createRef, h } from 'preact';
import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { EMIComponent } from './EMIComponent';
import CardElement from '../Card';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { AmountProvider } from '../../core/Context/AmountProvider';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { EMI_FIXTURE_CHECKOUT_AMOUNT, emiIssuersFixture } from './emi-plans.fixture';
import type { EmiIssuerOption } from './types';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const [hdfc] = emiIssuersFixture;

const createCard = () =>
    new CardElement(core, {
        i18n,
        loadingContext: 'test',
        modules: { resources: core.modules.resources },
        _disableClickToPay: true,
        showPayButton: false
    });

const renderEmiComponent = (issuers: EmiIssuerOption[]) => {
    const onPlanSelect = jest.fn();

    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <AmountProvider amount={EMI_FIXTURE_CHECKOUT_AMOUNT} providerRef={createRef()}>
                <EMIComponent
                    activeFundingSourceElement={createCard()}
                    issuers={issuers}
                    onPlanSelect={onPlanSelect}
                    showPayButton={true}
                    payButton={() => <button type={'button'}>Pay</button>}
                    setComponentRef={() => {}}
                />
            </AmountProvider>
        </CoreProvider>
    );

    return { onPlanSelect };
};

describe('EMIComponent', () => {
    describe('with plans', () => {
        test('should render the plan sections as headings, in reading order', () => {
            renderEmiComponent(emiIssuersFixture);

            expect(screen.getAllByRole('heading').map(heading => heading.textContent)).toEqual(['EMI plan', 'Plan summary', 'Card details']);
        });

        test('should render the plan instructions above the selects', () => {
            renderEmiComponent(emiIssuersFixture);

            expect(screen.getByText(/choose your preferred combination/i)).toBeInTheDocument();
        });

        test('should name the preselected provider in the card details instructions', () => {
            renderEmiComponent(emiIssuersFixture);

            expect(screen.getByText(`Enter card details that are associated with a ${hdfc.name} card`)).toBeInTheDocument();
        });

        test('should announce the default selection once, without waiting for an interaction', () => {
            const { onPlanSelect } = renderEmiComponent(emiIssuersFixture);

            expect(onPlanSelect).toHaveBeenCalledTimes(1);
            expect(onPlanSelect).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[0] });
        });

        test('should announce a plan the shopper picks, and re-render the summary for it', async () => {
            const { onPlanSelect } = renderEmiComponent(emiIssuersFixture);

            await userEvent.click(screen.getByLabelText('Plan'));
            const [, planList] = screen.getAllByRole('listbox');
            await userEvent.click(within(planList).getByRole('option', { name: /6 months/i }));

            expect(onPlanSelect).toHaveBeenLastCalledWith({ issuer: hdfc, plan: hdfc.plans[1] });
            // The new plan carries no offer and a different monthly amount
            expect(screen.getByText('₹29,400.00')).toBeInTheDocument();
            expect(screen.queryByText('Discount')).toBeNull();
        });

        test('should summarise the preselected plan', () => {
            renderEmiComponent(emiIssuersFixture);

            expect(screen.getByText('Interest charged by bank @15.5%')).toBeInTheDocument();
            expect(screen.getByText('Upcoming monthly payment')).toBeInTheDocument();
        });

        test('should render the funding source form and the pay button', () => {
            renderEmiComponent(emiIssuersFixture);

            expect(screen.getByRole('form')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
        });
    });

    describe('without plans', () => {
        test('should render no plan selection UI at all', () => {
            renderEmiComponent([]);

            expect(screen.queryAllByRole('heading')).toHaveLength(0);
            expect(screen.queryByLabelText('Provider')).toBeNull();
            expect(screen.queryByLabelText('Plan')).toBeNull();
            expect(screen.queryByText('Plan summary')).toBeNull();
            expect(screen.queryByText(/choose your preferred combination/i)).toBeNull();
        });

        test('should still render the funding source form and the pay button', () => {
            renderEmiComponent([]);

            expect(screen.getByRole('form')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
        });
    });
});
