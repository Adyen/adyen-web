import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import UPIComponent from './UPIComponent';
import { App } from '../../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { MAX_PRIMARY_APPS, UPI_MODE } from '../../constants';
import { InfoEventType, UiTarget } from '../../../../core/Analytics/events/AnalyticsInfoEvent';

const customRender = (ui: h.JSX.Element) => {
    const core = setupCoreMock();

    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <AmountProvider providerRef={createRef()}>
                <SRPanelProvider srPanel={new SRPanel(core)}>{ui}</SRPanelProvider>
            </AmountProvider>
        </CoreProvider>
    );
};

describe('UPIComponent', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Upi intent mode', () => {
        const gpayApp: App = { id: 'gpay', name: 'Google Pay' };

        const allApps: App[] = [
            gpayApp,
            { id: 'phonepe', name: 'PhonePe' },
            { id: 'bhim', name: 'BHIM' },
            { id: 'paytm', name: 'Paytm' },
            { id: 'amazon', name: 'Amazon Pay' },
            { id: 'whatsapp', name: 'WhatsApp' }
        ];

        const priorityApps = allApps.slice(0, MAX_PRIMARY_APPS);
        const appsExceedingMax = allApps.slice(0, MAX_PRIMARY_APPS + 2);
        const lowPriorityApp = appsExceedingMax[MAX_PRIMARY_APPS];

        test('should show a list of apps from the given app list', async () => {
            customRender(
                <UPIComponent
                    appsList={[gpayApp]}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    setComponentRef={jest.fn()}
                    showPayButton={false}
                    payButton={() => <button className="pay-button" />}
                    onSubmitAnalytics={jest.fn()}
                />
            );

            expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
            expect(await screen.findByRole('radio', { name: /google pay/i })).toBeInTheDocument();
        });

        test('should split apps into priority grid and low-priority dropdown when exceeding MAX_PRIMARY_APPS', async () => {
            customRender(
                <UPIComponent
                    appsList={appsExceedingMax}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    showPayButton={false}
                    setComponentRef={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                    onSubmitAnalytics={jest.fn()}
                />
            );

            await screen.findByRole('radiogroup');
            const radios = screen.getAllByRole('radio');
            expect(radios).toHaveLength(MAX_PRIMARY_APPS);
            expect(radios[0]).toHaveAccessibleName(/Google Pay/i);

            expect(screen.getByRole('combobox', { name: /UPI apps/i })).toBeInTheDocument();
        });

        test('should not show dropdown when apps count equals MAX_PRIMARY_APPS', async () => {
            customRender(
                <UPIComponent
                    appsList={priorityApps}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    showPayButton={false}
                    payButton={() => <button className="pay-button" />}
                    setComponentRef={jest.fn()}
                    onSubmitAnalytics={jest.fn()}
                />
            );

            const radios = await screen.findAllByRole('radio');
            expect(radios).toHaveLength(MAX_PRIMARY_APPS);
            expect(screen.queryByRole('combobox', { name: /UPI apps/i })).not.toBeInTheDocument();
        });

        test('should show a pay button if showPayButton is true', async () => {
            customRender(
                <UPIComponent
                    appsList={[gpayApp]}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    showPayButton={true}
                    payButton={() => <button>Pay</button>}
                    setComponentRef={jest.fn()}
                    onSubmitAnalytics={jest.fn()}
                />
            );
            expect(await screen.findByRole('button', { name: 'Pay' })).toBeInTheDocument();
        });

        test('should call payButton with the correct status', async () => {
            const payButtonMock = jest.fn().mockImplementation(() => <button>Pay</button>);
            const user = userEvent.setup();

            customRender(
                <UPIComponent
                    appsList={[gpayApp]}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    showPayButton={true}
                    payButton={payButtonMock}
                    setComponentRef={jest.fn()}
                    onSubmitAnalytics={jest.fn()}
                />
            );

            expect(payButtonMock).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'ready' }));

            const googlePayRadio = await screen.findByRole('radio', { name: /Google Pay/i });
            await user.click(googlePayRadio);
            expect(payButtonMock).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'ready' }));
        });

        test('should fire onChange with invalid state initially, then with valid state after selecting an app', async () => {
            const onChangeMock = jest.fn();
            const user = userEvent.setup();

            customRender(
                <UPIComponent
                    appsList={[gpayApp]}
                    mode={UPI_MODE.INTENT}
                    showPayButton={false}
                    onChange={onChangeMock}
                    payButton={() => <button className="pay-button" />}
                    setComponentRef={jest.fn()}
                    onSubmitAnalytics={jest.fn()}
                />
            );

            expect(onChangeMock).toHaveBeenCalledWith({
                data: {},
                isValid: false
            });

            const googlePayRadio = await screen.findByRole('radio', { name: /Google Pay/i });
            await user.click(googlePayRadio);

            await waitFor(() => {
                expect(onChangeMock).toHaveBeenCalledTimes(2);
            });
            expect(onChangeMock).toHaveBeenLastCalledWith({
                data: { app: { id: gpayApp.id, name: gpayApp.name } },
                isValid: true
            });
        });

        test('should fire onChange with valid state after selecting from dropdown', async () => {
            const onChangeMock = jest.fn();
            const user = userEvent.setup();

            customRender(
                <UPIComponent
                    appsList={appsExceedingMax}
                    mode={UPI_MODE.INTENT}
                    showPayButton={false}
                    onChange={onChangeMock}
                    payButton={() => <button className="pay-button" />}
                    setComponentRef={jest.fn()}
                    onSubmitAnalytics={jest.fn()}
                />
            );

            const dropdownCombobox = screen.getByRole('combobox', { name: /UPI apps/i });
            await user.click(dropdownCombobox);

            const option = await screen.findByRole('option', { name: new RegExp(lowPriorityApp.name, 'i') });
            await user.click(option);

            await waitFor(() => {
                expect(onChangeMock).toHaveBeenLastCalledWith({
                    data: { app: lowPriorityApp },
                    isValid: true
                });
            });
        });

        test('should fire analytics events: displayed on mount and selected on grid/dropdown selection', async () => {
            const onSubmitAnalyticsMock = jest.fn();
            const user = userEvent.setup();

            customRender(
                <UPIComponent
                    appsList={appsExceedingMax}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    showPayButton={false}
                    payButton={() => <button className="pay-button" />}
                    onSubmitAnalytics={onSubmitAnalyticsMock}
                    setComponentRef={jest.fn()}
                />
            );

            await waitFor(() => {
                expect(onSubmitAnalyticsMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: InfoEventType.displayed,
                        target: UiTarget.list
                    })
                );
            });

            const googlePayRadio = await screen.findByRole('radio', { name: /Google Pay/i });
            await user.click(googlePayRadio);

            expect(onSubmitAnalyticsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: InfoEventType.selected,
                    target: UiTarget.list,
                    issuer: 'Google Pay'
                })
            );

            const dropdownCombobox = screen.getByRole('combobox', { name: /UPI apps/i });
            await user.click(dropdownCombobox);
            const option = await screen.findByRole('option', { name: new RegExp(lowPriorityApp.name, 'i') });
            await user.click(option);

            expect(onSubmitAnalyticsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: InfoEventType.selected,
                    target: UiTarget.listDetected,
                    issuer: lowPriorityApp.name
                })
            );
        });
    });
});
