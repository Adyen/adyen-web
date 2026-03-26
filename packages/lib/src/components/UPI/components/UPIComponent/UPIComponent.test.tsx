import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import UPIComponent from './UPIComponent';
import { App } from '../../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';
import { UPI_MODE } from '../../constants';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
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
        const gpayApp: App = { id: 'gpay', name: 'Google Pay', icon: 'gpay.png' };
        const phonepeApp: App = { id: 'phonepe', name: 'IphonePE' };
        const bhimApp: App = { id: 'bhim', name: 'BHIM' };
        const paytmApp: App = { id: 'paytm', name: 'Paytm' };
        const amazonApp: App = { id: 'amazon', name: 'Amazon Pay' };
        const whatsappApp: App = { id: 'whatsapp', name: 'WhatsApp' };

        test('should show a list of apps from the given app list', async () => {
            customRender(
                <UPIComponent
                    appsList={[gpayApp]}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    setComponentRef={jest.fn()}
                    showPayButton={false}
                    payButton={() => <button className="pay-button" />}
                />
            );

            expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
            expect(await screen.findByRole('radio', { name: /google pay/i })).toBeInTheDocument();
        });

        test('should split apps into primary grid (max 4) and secondary dropdown when more than 4 apps', async () => {
            customRender(
                <UPIComponent
                    appsList={[gpayApp, phonepeApp, bhimApp, paytmApp, amazonApp, whatsappApp]}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    showPayButton={false}
                    setComponentRef={jest.fn()}
                    payButton={() => <button className="pay-button" />}
                />
            );

            await screen.findByRole('radiogroup');
            const radios = screen.getAllByRole('radio');
            expect(radios).toHaveLength(4);
            expect(radios[0]).toHaveAccessibleName(/Google Pay/i);
            expect(radios[3]).toHaveAccessibleName(/Paytm/i);

            expect(screen.getByRole('button', { name: /Choose preferred app/i })).toBeInTheDocument();
        });

        test('should not show dropdown when 4 or fewer apps', async () => {
            customRender(
                <UPIComponent
                    appsList={[gpayApp, phonepeApp, bhimApp, paytmApp]}
                    mode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    showPayButton={false}
                    payButton={() => <button className="pay-button" />}
                    setComponentRef={jest.fn()}
                />
            );

            const radios = await screen.findAllByRole('radio');
            expect(radios).toHaveLength(4);
            expect(screen.queryByRole('button', { name: /Choose preferred app/i })).not.toBeInTheDocument();
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
                    appsList={[gpayApp, phonepeApp, bhimApp, paytmApp, amazonApp, whatsappApp]}
                    mode={UPI_MODE.INTENT}
                    showPayButton={false}
                    onChange={onChangeMock}
                    payButton={() => <button className="pay-button" />}
                    setComponentRef={jest.fn()}
                />
            );

            const dropdownButton = screen.getByRole('button', { name: /Choose preferred app/i });
            await user.click(dropdownButton);

            const amazonOption = await screen.findByRole('option', { name: /Amazon Pay/i });
            await user.click(amazonOption);

            await waitFor(() => {
                expect(onChangeMock).toHaveBeenLastCalledWith({
                    data: { app: amazonApp },
                    isValid: true
                });
            });
        });

        test('should fire analytics events: displayed on mount and selected on grid/dropdown selection', async () => {
            const onSubmitAnalyticsMock = jest.fn();
            const user = userEvent.setup();

            customRender(
                <UPIComponent
                    appsList={[gpayApp, phonepeApp, bhimApp, paytmApp, amazonApp, whatsappApp]}
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

            const dropdownButton = screen.getByRole('button', { name: /Choose preferred app/i });
            await user.click(dropdownButton);
            const amazonOption = await screen.findByRole('option', { name: /Amazon Pay/i });
            await user.click(amazonOption);

            expect(onSubmitAnalyticsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: InfoEventType.selected,
                    target: UiTarget.listSearch,
                    issuer: 'Amazon Pay'
                })
            );
        });
    });
});
