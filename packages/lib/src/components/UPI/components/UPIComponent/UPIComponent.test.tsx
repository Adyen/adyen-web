import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import UPIComponent from './UPIComponent';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { App } from '../../types';
import { UPI_MODE } from '../../constants';

const customRender = (ui: h.JSX.Element) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={new SRPanel(global.core)}>{ui}</SRPanelProvider>
        </CoreProvider>
    );
};

describe('UPIComponent', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Upi intent mode', () => {
        const gpayApp: App = { id: 'gpay', name: 'Google Pay' };

        test('should show a list of apps from the given app list', async () => {
            customRender(<UPIComponent apps={[gpayApp]} defaultMode={UPI_MODE.INTENT} onChange={jest.fn()} showPayButton={false} />);

            expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
            expect(await screen.findByRole('radio', { name: /google pay/i })).toBeInTheDocument();
        });

        test('should show a pay button if showPayButton is true', async () => {
            customRender(
                <UPIComponent
                    apps={[gpayApp]}
                    defaultMode={UPI_MODE.INTENT}
                    onChange={jest.fn()}
                    showPayButton={true}
                    payButton={() => <button>Pay</button>}
                />
            );
            expect(await screen.findByRole('button', { name: 'Pay' })).toBeInTheDocument();
        });

        test('should call payButton with the correct status', async () => {
            const payButtonMock = jest.fn().mockImplementation(() => <button>Pay</button>);
            const user = userEvent.setup();

            customRender(
                <UPIComponent apps={[gpayApp]} defaultMode={UPI_MODE.INTENT} onChange={jest.fn()} showPayButton={true} payButton={payButtonMock} />
            );

            expect(payButtonMock).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'ready' }));

            const googlePayRadio = await screen.findByRole('radio', { name: /Google Pay/i });
            await user.click(googlePayRadio);
            expect(payButtonMock).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'ready' }));
        });

        test('should fire onChange with invalid state initially, then with valid state after selecting an app', async () => {
            const onChangeMock = jest.fn();
            const user = userEvent.setup();

            customRender(<UPIComponent apps={[gpayApp]} defaultMode={UPI_MODE.INTENT} showPayButton={false} onChange={onChangeMock} />);

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
                data: { app: gpayApp },
                isValid: true
            });
        });
    });
});
