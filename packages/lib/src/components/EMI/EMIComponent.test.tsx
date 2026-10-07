import { createRef, h } from 'preact';
import { render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { EMIComponent } from './EMIComponent';
import CardElement from '../Card';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { AmountProvider } from '../../core/Context/AmountProvider';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { EMI_FIXTURE_CHECKOUT_AMOUNT, emiPlansResponseMock } from './stories/mocks';
import type { EmiIssuer, EmiPlansOutcome } from './types';

const core = setupCoreMock();
const i18n = core.modules.i18n;

const [hdfc, icici] = emiPlansResponseMock.issuers;

const createCard = () =>
    new CardElement(core, {
        i18n,
        loadingContext: 'test',
        modules: { resources: core.modules.resources },
        _disableClickToPay: true,
        showPayButton: false
    });

interface RenderOptions {
    loadPlans?: () => Promise<EmiPlansOutcome>;
    initialOutcome?: EmiPlansOutcome;
}

const ready = (issuers: EmiIssuer[]): EmiPlansOutcome => ({ status: 'ready', issuers });

/** Most tests start from a settled lookup, the state a re-render of the element starts from. */
const renderEmiComponent = ({ loadPlans = jest.fn(), initialOutcome }: RenderOptions = { initialOutcome: ready(emiPlansResponseMock.issuers) }) => {
    const onPlanSelect = jest.fn();
    const setMessages = jest.spyOn(core.modules.srPanel, 'setMessages');

    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <SRPanelProvider srPanel={core.modules.srPanel}>
                <AmountProvider amount={EMI_FIXTURE_CHECKOUT_AMOUNT} providerRef={createRef()}>
                    <EMIComponent
                        activeSupportedPaymentMethodElement={createCard()}
                        loadPlans={loadPlans}
                        initialOutcome={initialOutcome}
                        onPlanSelect={onPlanSelect}
                        showPayButton={true}
                        payButton={() => <button type={'button'}>Pay</button>}
                        setComponentRef={() => {}}
                    />
                </AmountProvider>
            </SRPanelProvider>
        </CoreProvider>
    );

    return { onPlanSelect, setMessages, loadPlans };
};

const selectOption = async (label: string, option: RegExp) => {
    await userEvent.click(screen.getByLabelText(label));
    const list = screen.getAllByRole('listbox')[label === 'Provider' ? 0 : 1];
    await userEvent.click(within(list).getByRole('option', { name: option }));
};

describe('EMIComponent', () => {
    // The SR panel is shared, so its spy is removed between tests rather than accumulating calls
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('with plans', () => {
        test('should render the plan sections as headings, in reading order', () => {
            renderEmiComponent();

            expect(screen.getAllByRole('heading').map(heading => heading.textContent)).toEqual([
                'EMI plan',
                'Plan summary',
                'HDFC Bank Card details'
            ]);
        });

        test('should name both plan sections after their heading, and describe the selects', () => {
            renderEmiComponent();

            expect(screen.getByRole('group', { name: 'EMI plan' })).toHaveAccessibleDescription(/choose your preferred combination/i);
            expect(screen.getByRole('group', { name: 'Plan summary' })).toBeInTheDocument();
        });

        test('should render the plan instructions above the selects', () => {
            renderEmiComponent();

            expect(screen.getByText(/choose your preferred combination/i)).toBeInTheDocument();
        });

        test('should name the preselected provider in the card details instructions', () => {
            renderEmiComponent();

            expect(screen.getByText(`Enter card details that are associated with a ${hdfc.issuerName} card`)).toBeInTheDocument();
        });

        test('should preselect the first issuer and its first plan', () => {
            renderEmiComponent();

            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
            expect(screen.getByLabelText('Plan')).toHaveTextContent('₹51,666.33 x 3 months');
        });

        /** No target: the container tells a preselection apart from a shopper action by its absence. */
        test('should announce the default selection once, without waiting for an interaction', () => {
            const { onPlanSelect } = renderEmiComponent();

            expect(onPlanSelect).toHaveBeenCalledTimes(1);
            expect(onPlanSelect).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[0] }, undefined);
        });

        test('should report a plan the shopper picks, and re-render the summary for it', async () => {
            const { onPlanSelect } = renderEmiComponent();

            await selectOption('Plan', /6 months/i);

            expect(onPlanSelect).toHaveBeenLastCalledWith({ issuer: hdfc, plan: hdfc.plans[1] }, UiTarget.emiPlan);
            // The new plan totals a different amount over time, and carries no discount of either kind
            expect(screen.getByText('₹168,999.00')).toBeInTheDocument();
            expect(screen.queryByText('Instant discount')).toBeNull();
            expect(screen.queryByText('Interest discount')).toBeNull();
        });

        test('should reset the plan and the summary to the first plan of a newly selected provider', async () => {
            const { onPlanSelect } = renderEmiComponent();

            await selectOption('Plan', /6 months/i);
            await selectOption('Provider', new RegExp(icici.issuerName, 'i'));

            expect(onPlanSelect).toHaveBeenLastCalledWith({ issuer: icici, plan: icici.plans[0] }, UiTarget.emiProvider);
            expect(screen.getByLabelText('Plan')).toHaveTextContent('₹52,366.50 x 3 months');
            expect(screen.getByText('Interest charged by bank @7.5% p.a')).toBeInTheDocument();
            expect(screen.getByText(`Enter card details that are associated with a ${icici.issuerName} card`)).toBeInTheDocument();
        });

        /** Switching provider moves both selects, and is still the one action the shopper took. */
        test('should report a provider the shopper picks once, not as a provider and a plan change', async () => {
            const { onPlanSelect } = renderEmiComponent();

            await selectOption('Provider', new RegExp(icici.issuerName, 'i'));

            expect(onPlanSelect).toHaveBeenCalledTimes(2);
            expect(onPlanSelect.mock.calls.map(([, target]) => target)).toEqual([undefined, UiTarget.emiProvider]);
        });

        test('should show a discount banner for the selected plan', () => {
            renderEmiComponent();

            expect(screen.getByText('-₹4,000.00 discount offer applied for using HDFC Bank')).toBeInTheDocument();
        });

        test('should drop the discount banner when the shopper picks a plan without an offer', async () => {
            renderEmiComponent();

            await selectOption('Plan', /6 months/i);

            expect(screen.queryByText(/discount offer applied/i)).toBeNull();
        });

        test('should announce the discount of a plan the shopper picks', async () => {
            const { setMessages } = renderEmiComponent();

            await selectOption('Provider', new RegExp(icici.issuerName, 'i'));

            await waitFor(() => expect(setMessages).toHaveBeenCalledWith('-₹2,100.50 discount offer applied for using ICICI Bank'));
        });

        test('should summarise the preselected plan', () => {
            renderEmiComponent();

            expect(screen.getByText('Interest charged by bank @15.5% p.a')).toBeInTheDocument();
            expect(screen.getByText('Total amount to be paid over time')).toBeInTheDocument();
        });

        test('should render the supported payment method form and the pay button', () => {
            renderEmiComponent();

            expect(screen.getByRole('form')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
        });
    });

    describe('loading the plans', () => {
        const deferred = () => {
            let resolve: (outcome: EmiPlansOutcome) => void = () => {};
            const promise = new Promise<EmiPlansOutcome>(settle => {
                resolve = settle;
            });

            return { promise, resolve };
        };

        test('should load the plans once when it mounts', () => {
            const { loadPlans } = renderEmiComponent({ loadPlans: jest.fn(() => deferred().promise) });

            expect(loadPlans).toHaveBeenCalledTimes(1);
        });

        // The card form is not rendered while loading, so the only spinner on screen is the one of EMI
        test('should show only a spinner while the plans load, announcing it to screen readers', () => {
            const { setMessages } = renderEmiComponent({ loadPlans: () => deferred().promise });

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByLabelText('Provider')).toBeNull();
            expect(screen.queryByRole('form')).toBeNull();
            expect(screen.queryByRole('button', { name: 'Pay' })).toBeNull();
            expect(setMessages).toHaveBeenCalledWith('Loading…');
        });

        test('should render the plans, the form and the pay button once the plans arrive', async () => {
            const { promise, resolve } = deferred();
            const { onPlanSelect, setMessages } = renderEmiComponent({ loadPlans: () => promise });

            resolve(ready(emiPlansResponseMock.issuers));

            expect(await screen.findByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
            expect(screen.getByRole('form')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
            await waitFor(() => expect(onPlanSelect).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[0] }, undefined));
            await waitFor(() => expect(setMessages).toHaveBeenCalledWith('Loaded'));
        });

        /** No error screen yet: the shopper can pick another payment method in Drop-in. */
        test('should keep the spinner, and render no form, when the plans are unavailable', async () => {
            const { promise, resolve } = deferred();
            const { onPlanSelect } = renderEmiComponent({ loadPlans: () => promise });

            resolve({ status: 'unavailable' });
            await promise;

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByRole('form')).toBeNull();
            expect(screen.queryByRole('button', { name: 'Pay' })).toBeNull();
            expect(onPlanSelect).not.toHaveBeenCalled();
        });

        test('should start from the outcome it is given, without loading again', () => {
            const { loadPlans } = renderEmiComponent({ initialOutcome: ready(emiPlansResponseMock.issuers) });

            expect(loadPlans).not.toHaveBeenCalled();
            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
        });

        test('should keep the spinner when it is given an unavailable outcome, without loading again', () => {
            const { loadPlans } = renderEmiComponent({ initialOutcome: { status: 'unavailable' } });

            expect(loadPlans).not.toHaveBeenCalled();
            expect(screen.getByTestId('spinner')).toBeInTheDocument();
        });
    });
});
