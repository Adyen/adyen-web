import { createRef, h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import UPIComponent from './UPIComponent';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';
import { UPI_MODE } from '../../constants';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';

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
        const gpayApp = { id: 'gpay', name: 'Google Pay', icon: 'gpay.png' };

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
    });
});
