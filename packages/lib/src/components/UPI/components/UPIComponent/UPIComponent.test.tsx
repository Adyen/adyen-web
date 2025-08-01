import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import UPIComponent from './UPIComponent';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { App, UpiMode } from '../../types';
import { SegmentedControlOption } from '../../../internal/SegmentedControl/SegmentedControl';
import { A11Y } from '../../constants';

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

    describe('Segmented Control', () => {
        const mockOptions: SegmentedControlOption<UpiMode>[] = [
            { label: 'UPI App', value: 'intent', id: A11Y.ButtonId.INTENT, controls: A11Y.AreaId.INTENT },
            { label: 'QR Code', value: 'qrCode', id: A11Y.ButtonId.QR, controls: A11Y.AreaId.QR }
        ];

        test('should render the options provided in props', async () => {
            customRender(<UPIComponent defaultMode={'intent'} onChange={jest.fn()} showPayButton={false} segmentedControlOptions={mockOptions} />);

            expect(await screen.findByRole('button', { name: /UPI App/i })).toBeInTheDocument();
            expect(await screen.findByRole('button', { name: /QR Code/i })).toBeInTheDocument();
        });

        test('should call onUpdateMode when a new mode is selected', async () => {
            const onUpdateModeMock = jest.fn();
            const user = userEvent.setup();

            customRender(
                <UPIComponent
                    defaultMode={'intent'}
                    onChange={jest.fn()}
                    onUpdateMode={onUpdateModeMock}
                    showPayButton={false}
                    segmentedControlOptions={mockOptions}
                />
            );

            const qrModeButton = await screen.findByRole('button', { name: /QR Code/i });
            await user.click(qrModeButton);

            expect(onUpdateModeMock).toHaveBeenCalledWith('qrCode');
        });

        test('should call onChange when a new mode is selected', async () => {
            const onChangeMock = jest.fn();
            const user = userEvent.setup();

            customRender(<UPIComponent defaultMode={'intent'} onChange={onChangeMock} showPayButton={false} segmentedControlOptions={mockOptions} />);

            expect(onChangeMock).toHaveBeenCalledTimes(1);

            const qrModeButton = await screen.findByRole('button', { name: /QR Code/i });
            await user.click(qrModeButton);

            expect(onChangeMock).toHaveBeenCalledTimes(2);
            expect(onChangeMock).toHaveBeenLastCalledWith({ data: {}, valid: {}, errors: {}, isValid: true });
        });
    });

    describe('Upi intent mode', () => {
        const gpayApp: App = { id: 'gpay', name: 'Google Pay' };

        test('should show a list of apps from the given app list', async () => {
            customRender(<UPIComponent apps={[gpayApp]} defaultMode={'intent'} onChange={jest.fn()} showPayButton={false} />);

            expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
            expect(await screen.findByRole('radio', { name: /google pay/i })).toBeInTheDocument();
        });

        test('should show a pay button if showPayButton is true', async () => {
            customRender(
                <UPIComponent
                    apps={[gpayApp]}
                    defaultMode={'intent'}
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
                <UPIComponent apps={[gpayApp]} defaultMode={'intent'} onChange={jest.fn()} showPayButton={true} payButton={payButtonMock} />
            );

            expect(payButtonMock).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'ready' }));

            const googlePayRadio = await screen.findByRole('radio', { name: /Google Pay/i });
            await user.click(googlePayRadio);
            expect(payButtonMock).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'success' }));
        });

        test('should fire onChange with invalid state initially, then with valid state after selecting an app', async () => {
            const onChangeMock = jest.fn();
            const user = userEvent.setup();

            customRender(<UPIComponent apps={[gpayApp]} defaultMode={'intent'} showPayButton={false} onChange={onChangeMock} />);

            expect(onChangeMock).toHaveBeenCalledWith({
                data: {},
                isValid: false
            });

            const googlePayRadio = await screen.findByRole('radio', { name: /Google Pay/i });
            await user.click(googlePayRadio);

            expect(onChangeMock).toHaveBeenCalledTimes(2);
            expect(onChangeMock).toHaveBeenLastCalledWith({
                data: { app: gpayApp },
                isValid: true
            });
        });
    });

    describe('Upi collect (VPA) mode', () => {
        test('should show a pay button if showPayButton is true', async () => {
            customRender(<UPIComponent defaultMode={'vpa'} onChange={jest.fn()} showPayButton={true} payButton={() => <button>Pay</button>} />);
            expect(await screen.findByRole('button', { name: 'Pay' })).toBeInTheDocument();
        });

        test('should call onChange with isValid: false if VPA input is invalid', async () => {
            const onChangeMock = jest.fn();
            const user = userEvent.setup();

            customRender(<UPIComponent defaultMode={'vpa'} onChange={onChangeMock} showPayButton={false} />);

            const vpaInput = screen.getByTestId('input-virtual-payment-address');
            await user.click(vpaInput);
            await user.tab(); // Blur the input to trigger validation

            expect(onChangeMock).toHaveBeenCalledWith({
                data: { virtualPaymentAddress: null },
                errors: { virtualPaymentAddress: null },
                valid: { virtualPaymentAddress: false },
                isValid: false
            });
        });

        test('should call onChange with isValid: true after filling the VPA input field correctly', async () => {
            const onChangeMock = jest.fn();
            const user = userEvent.setup();

            customRender(<UPIComponent defaultMode={'vpa'} onChange={onChangeMock} showPayButton={false} />);

            const vpaInput = screen.getByTestId('input-virtual-payment-address');
            await user.type(vpaInput, 'test@test');
            await user.tab(); // Blur the input

            expect(onChangeMock).toHaveBeenCalledWith({
                data: { virtualPaymentAddress: 'test@test' },
                errors: { virtualPaymentAddress: null },
                valid: { virtualPaymentAddress: true },
                isValid: true
            });
        });
    });
});
