import { createRef, h } from 'preact';
import { render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { EMIComponent } from './EMIComponent';
import CardElement from '../Card';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { AmountProvider } from '../../core/Context/AmountProvider';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { EMI_FIXTURE_CHECKOUT_AMOUNT, emiPlansResponseMock } from './stories/mocks';
import type { EmiIssuer } from './types';

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

const emiComponent = (issuers: EmiIssuer[], onPlanSelect: (selection: unknown) => void): h.JSX.Element => (
    <CoreProvider i18n={i18n} loadingContext={'test'} resources={core.modules.resources}>
        <SRPanelProvider srPanel={core.modules.srPanel}>
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
        </SRPanelProvider>
    </CoreProvider>
);

const renderEmiComponent = (issuers: EmiIssuer[]) => {
    const onPlanSelect = jest.fn();
    const setMessages = jest.spyOn(core.modules.srPanel, 'setMessages');
    render(emiComponent(issuers, onPlanSelect));

    return { onPlanSelect, setMessages };
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
            renderEmiComponent(emiPlansResponseMock.issuers);

            expect(screen.getAllByRole('heading').map(heading => heading.textContent)).toEqual(['EMI plan', 'Plan summary', 'Card details']);
        });

        test('should name both plan sections after their heading, and describe the selects', () => {
            renderEmiComponent(emiPlansResponseMock.issuers);

            expect(screen.getByRole('group', { name: 'EMI plan' })).toHaveAccessibleDescription(/choose your preferred combination/i);
            expect(screen.getByRole('group', { name: 'Plan summary' })).toBeInTheDocument();
        });

        test('should render the plan instructions above the selects', () => {
            renderEmiComponent(emiPlansResponseMock.issuers);

            expect(screen.getByText(/choose your preferred combination/i)).toBeInTheDocument();
        });

        test('should name the preselected provider in the card details instructions', () => {
            renderEmiComponent(emiPlansResponseMock.issuers);

            expect(screen.getByText(`Enter card details that are associated with a ${hdfc.issuerName} card`)).toBeInTheDocument();
        });

        test('should preselect the first issuer and its first plan', () => {
            renderEmiComponent(emiPlansResponseMock.issuers);

            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
            expect(screen.getByLabelText('Plan')).toHaveTextContent('₹58,800.00 x 3 months');
        });

        test('should announce the default selection once, without waiting for an interaction', () => {
            const { onPlanSelect } = renderEmiComponent(emiPlansResponseMock.issuers);

            expect(onPlanSelect).toHaveBeenCalledTimes(1);
            expect(onPlanSelect).toHaveBeenCalledWith({ issuer: hdfc, plan: hdfc.plans[0] });
        });

        test('should report a plan the shopper picks, and re-render the summary for it', async () => {
            const { onPlanSelect } = renderEmiComponent(emiPlansResponseMock.issuers);

            await selectOption('Plan', /6 months/i);

            expect(onPlanSelect).toHaveBeenLastCalledWith({ issuer: hdfc, plan: hdfc.plans[1] });
            // The new plan carries no offer and a different monthly amount
            expect(screen.getByText('₹29,400.00')).toBeInTheDocument();
            expect(screen.queryByText('Discount')).toBeNull();
        });

        test('should reset the plan and the summary to the first plan of a newly selected provider', async () => {
            const { onPlanSelect } = renderEmiComponent(emiPlansResponseMock.issuers);

            await selectOption('Plan', /6 months/i);
            await selectOption('Provider', new RegExp(icici.issuerName, 'i'));

            expect(onPlanSelect).toHaveBeenLastCalledWith({ issuer: icici, plan: icici.plans[0] });
            expect(screen.getByLabelText('Plan')).toHaveTextContent('₹58,800.00 x 3 months');
            expect(screen.getByText('Interest charged by bank @7.5%')).toBeInTheDocument();
            expect(screen.getByText(`Enter card details that are associated with a ${icici.issuerName} card`)).toBeInTheDocument();
        });

        test('should show a discount banner for the selected plan', () => {
            renderEmiComponent(emiPlansResponseMock.issuers);

            expect(screen.getByText('-₹4,000.00 discount offer applied for using HDFC Bank')).toBeInTheDocument();
        });

        test('should drop the discount banner when the shopper picks a plan without an offer', async () => {
            renderEmiComponent(emiPlansResponseMock.issuers);

            await selectOption('Plan', /6 months/i);

            expect(screen.queryByText(/discount offer applied/i)).toBeNull();
        });

        test('should announce the discount of a plan the shopper picks', async () => {
            const { setMessages } = renderEmiComponent(emiPlansResponseMock.issuers);

            await selectOption('Provider', new RegExp(icici.issuerName, 'i'));

            await waitFor(() => expect(setMessages).toHaveBeenCalledWith('-₹6,000.00 discount offer applied for using ICICI Bank'));
        });

        test('should summarise the preselected plan', () => {
            renderEmiComponent(emiPlansResponseMock.issuers);

            expect(screen.getByText('Interest charged by bank @15.5%')).toBeInTheDocument();
            expect(screen.getByText('Upcoming monthly payment')).toBeInTheDocument();
        });

        test('should render the funding source form and the pay button', () => {
            renderEmiComponent(emiPlansResponseMock.issuers);

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

        test('should not report a selection', () => {
            const { onPlanSelect } = renderEmiComponent([]);

            expect(onPlanSelect).not.toHaveBeenCalled();
        });
    });
});
