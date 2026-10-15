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
import type { EmiIssuer, EmiPlansState } from './types';

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
    loadPlans?: () => Promise<EmiPlansState>;
    initialPlans?: EmiPlansState;
}

const ready = (issuers: EmiIssuer[]): EmiPlansState => ({ status: 'ready', issuers });

const renderEmiComponent = ({ loadPlans = jest.fn(), initialPlans }: RenderOptions = { initialPlans: ready(emiPlansResponseMock.issuers) }) => {
    const onPlansDisplayed = jest.fn();
    const onPlanSelect = jest.fn();
    const setMessages = jest.spyOn(core.modules.srPanel, 'setMessages');

    render(
        <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
            <SRPanelProvider srPanel={core.modules.srPanel}>
                <AmountProvider amount={EMI_FIXTURE_CHECKOUT_AMOUNT} providerRef={createRef()}>
                    <EMIComponent
                        activeSupportedPaymentMethodElement={createCard()}
                        loadPlans={loadPlans}
                        initialPlans={initialPlans}
                        onPlansDisplayed={onPlansDisplayed}
                        onPlanSelect={onPlanSelect}
                        showPayButton={true}
                        payButton={() => <button type={'button'}>Pay</button>}
                        setComponentRef={() => {}}
                    />
                </AmountProvider>
            </SRPanelProvider>
        </CoreProvider>
    );

    return { onPlansDisplayed, onPlanSelect, setMessages, loadPlans };
};

const selectOption = async (label: string, option: RegExp) => {
    await userEvent.click(screen.getByLabelText(label));
    const list = screen.getAllByRole('listbox')[label === 'Provider' ? 0 : 1];
    await userEvent.click(within(list).getByRole('option', { name: option }));
};

describe('EMIComponent', () => {
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

        test('should report the default selection as displayed once, without waiting for an interaction', () => {
            const { onPlansDisplayed, onPlanSelect } = renderEmiComponent();

            expect(onPlansDisplayed).toHaveBeenCalledTimes(1);
            expect(onPlansDisplayed).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[0] });
            expect(onPlanSelect).not.toHaveBeenCalled();
        });

        test('should report a plan the shopper picks, and re-render the summary for it', async () => {
            const { onPlanSelect } = renderEmiComponent();

            await selectOption('Plan', /6 months/i);

            expect(onPlanSelect).toHaveBeenLastCalledWith({ issuer: hdfc, plan: hdfc.plans[1] }, UiTarget.emiPlan);
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

        test('should report a provider the shopper picks once, not as a provider and a plan change', async () => {
            const { onPlanSelect } = renderEmiComponent();

            await selectOption('Provider', new RegExp(icici.issuerName, 'i'));

            expect(onPlanSelect).toHaveBeenCalledTimes(1);
            expect(onPlanSelect).toHaveBeenCalledWith({ issuer: icici, plan: icici.plans[0] }, UiTarget.emiProvider);
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
            let resolve: (plans: EmiPlansState) => void = () => {};
            const promise = new Promise<EmiPlansState>(resolvePromise => {
                resolve = resolvePromise;
            });

            return { promise, resolve };
        };

        test('should load the plans once when it mounts', () => {
            const { loadPlans } = renderEmiComponent({ loadPlans: jest.fn(() => deferred().promise) });

            expect(loadPlans).toHaveBeenCalledTimes(1);
        });

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
            const { onPlansDisplayed, setMessages } = renderEmiComponent({ loadPlans: () => promise });

            resolve(ready(emiPlansResponseMock.issuers));

            expect(await screen.findByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
            expect(screen.getByRole('form')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
            await waitFor(() => expect(onPlansDisplayed).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[0] }));
            await waitFor(() => expect(setMessages).toHaveBeenCalledWith('Loaded'));
        });

        test('should keep the spinner, and render no form, when the plans are unavailable', async () => {
            const { promise, resolve } = deferred();
            const { onPlansDisplayed } = renderEmiComponent({ loadPlans: () => promise });

            resolve({ status: 'unavailable' });
            await promise;

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByRole('form')).toBeNull();
            expect(screen.queryByRole('button', { name: 'Pay' })).toBeNull();
            expect(onPlansDisplayed).not.toHaveBeenCalled();
        });

        test('should start from the plans it is given, without loading again', () => {
            const { loadPlans } = renderEmiComponent({ initialPlans: ready(emiPlansResponseMock.issuers) });

            expect(loadPlans).not.toHaveBeenCalled();
            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
        });

        test('should keep the spinner when it is given unavailable plans, without loading again', () => {
            const { loadPlans } = renderEmiComponent({ initialPlans: { status: 'unavailable' } });

            expect(loadPlans).not.toHaveBeenCalled();
            expect(screen.getByTestId('spinner')).toBeInTheDocument();
        });
    });
});
