import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import isMobile from '../../../../utils/isMobile';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../../core/Errors/SRPanel';
import UPIComponent from './UPIComponent';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { TxVariants } from '../../../tx-variants';
import { App } from '../../types';

jest.mock('../../../../utils/isMobile');
const isMobileMock = isMobile as jest.Mock;

const customRender = (ui: h.JSX.Element) => {
    return render(
        // @ts-ignore fix
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={new SRPanel(global.core)}>{ui}</SRPanelProvider>
        </CoreProvider>
    );
};

describe('UPI component', () => {
    const onChangeMock = jest.fn();

    afterEach(() => {
        isMobileMock.mockReset();
    });

    describe('On mobile devices', () => {
        beforeEach(() => {
            isMobileMock.mockReturnValue(true);
        });

        test('should show upi_collect as the first tab, and upi_qr as the second, if no app list is provided.', async () => {
            customRender(<UPIComponent defaultMode={'qrCode'} onChange={onChangeMock} showPayButton={false}></UPIComponent>);
            const segments = await screen.findAllByRole('button');
            expect(segments[0]).toHaveTextContent('Enter UPI ID');
            expect(segments[1]).toHaveTextContent('QR code');
        });

        test('should show upi_intent as the first tab, and upi_qr as the second, if there is an app list.', async () => {
            customRender(
                <UPIComponent
                    apps={[{ id: 'gpay', name: 'Google Pay' }]}
                    defaultMode={'qrCode'}
                    onChange={onChangeMock}
                    showPayButton={false}
                ></UPIComponent>
            );
            const segments = await screen.findAllByRole('button');
            expect(segments[0]).toHaveTextContent('Pay by any UPI app');
            expect(segments[1]).toHaveTextContent('QR code');
        });

        test('should call onUpdateMode after selecting an upi mode', async () => {
            const onUpdatedModeMock = jest.fn();
            const user = userEvent.setup();
            customRender(
                <UPIComponent defaultMode={'intent'} onChange={onChangeMock} onUpdateMode={onUpdatedModeMock} showPayButton={false}></UPIComponent>
            );
            const qrMode = await screen.findByRole('button', { name: /QR code/i });
            await user.click(qrMode);
            expect(onUpdatedModeMock).toHaveBeenCalledWith('qrCode');
        });

        test('should call onChange after selecting an upi mode', async () => {
            const onUpdatedModeMock = jest.fn();
            const user = userEvent.setup();
            customRender(
                <UPIComponent defaultMode={'intent'} onChange={onChangeMock} onUpdateMode={onUpdatedModeMock} showPayButton={false}></UPIComponent>
            );
            const qrMode = await screen.findByRole('button', { name: /QR code/i });
            await user.click(qrMode);
            expect(onChangeMock).toHaveBeenCalledWith({ data: {}, valid: {}, errors: {}, isValid: true });
        });
    });

    describe('On large screen size devices', () => {
        beforeEach(() => {
            isMobileMock.mockReturnValue(false);
        });

        test('should show upi_qr as the first tab, and upi_collect as the second tab.', async () => {
            customRender(<UPIComponent defaultMode={'qrCode'} onChange={onChangeMock} showPayButton={false}></UPIComponent>);
            const segments = await screen.findAllByRole('button');
            expect(segments[0]).toHaveTextContent('QR code');
            expect(segments[1]).toHaveTextContent('Enter UPI ID');
        });
    });

    describe('Upi intent', () => {
        beforeEach(() => {
            isMobileMock.mockReturnValue(true);
        });

        test('should show a list of apps from the given app list', async () => {
            customRender(
                <UPIComponent
                    apps={[{ id: 'gpay', name: 'Google Pay' }]}
                    defaultMode={'intent'}
                    onChange={onChangeMock}
                    showPayButton={false}
                ></UPIComponent>
            );
            const appList = await screen.findByRole('radiogroup');
            const app = await screen.findByRole('radio', { name: /google pay/i });
            expect(appList).toBeInTheDocument();
            expect(app).toBeInTheDocument();
        });

        test('should show a pay button if showPayButton is true', async () => {
            customRender(
                <UPIComponent
                    apps={[{ id: 'gpay', name: 'Google Pay' }]}
                    defaultMode={'intent'}
                    onChange={onChangeMock}
                    showPayButton={true}
                    payButton={() => <button data-testid="dummy-pay-button">Test button</button>}
                ></UPIComponent>
            );
            expect(await screen.findByTestId('dummy-pay-button')).toBeInTheDocument();
        });

        test('should pass disabled to pay button if nothing is selected', async () => {
            const payButtonMock = jest.fn();
            customRender(
                <UPIComponent
                    apps={[{ id: 'gpay', name: 'Google Pay' }]}
                    defaultMode={'intent'}
                    onChange={onChangeMock}
                    showPayButton={true}
                    payButton={payButtonMock}
                ></UPIComponent>
            );
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();
            expect(payButtonMock).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
        });

        test('should call the onChange after selecting an app', async () => {
            const gpayApp = { id: 'gpay', name: 'Google Pay' };
            const payButtonMock = jest.fn();
            const user = userEvent.setup();
            customRender(
                <UPIComponent
                    apps={[gpayApp]}
                    defaultMode={'intent'}
                    showPayButton={true}
                    onChange={onChangeMock}
                    payButton={payButtonMock}
                ></UPIComponent>
            );
            const googlePay = await screen.findByRole('radio', { name: /Google Pay/i });
            await user.click(googlePay);
            expect(onChangeMock).toHaveBeenCalledWith({
                data: { app: { id: gpayApp.id, name: gpayApp.name } },
                isValid: true,
                errors: null,
                valid: null
            });
        });

        test('should call the onChange after selecting the upi collect and filling the data in the vpa input field', async () => {
            const collectApp: App = { id: 'vpa', name: 'Enter UPI ID', type: TxVariants.upi_collect };
            const payButtonMock = jest.fn();
            const user = userEvent.setup();
            customRender(
                <UPIComponent
                    apps={[collectApp]}
                    defaultMode={'intent'}
                    showPayButton={true}
                    onChange={onChangeMock}
                    payButton={payButtonMock}
                ></UPIComponent>
            );
            const upiCollect = await screen.findByRole('radio', { name: /Enter UPI ID/ });
            await user.click(upiCollect);
            const vpaInput = await screen.findByLabelText(/Enter UPI ID \/ VPA/);
            await user.type(vpaInput, 'test');
            await user.tab();

            expect(onChangeMock).toHaveBeenCalledWith({
                data: { app: collectApp, virtualPaymentAddress: 'test' },
                valid: { virtualPaymentAddress: true },
                errors: { virtualPaymentAddress: null },
                isValid: true
            });
        });
    });

    describe('Upi collect', () => {
        beforeEach(() => {
            isMobileMock.mockReturnValue(false);
        });

        test('should show a pay button if showPayButton is true', async () => {
            customRender(
                <UPIComponent
                    defaultMode={'vpa'}
                    onChange={onChangeMock}
                    showPayButton={true}
                    payButton={() => <button data-testid="dummy-pay-button">Test button</button>}
                ></UPIComponent>
            );
            expect(await screen.findByTestId('dummy-pay-button')).toBeInTheDocument();
        });

        test('should show the vpa input field', async () => {
            customRender(<UPIComponent defaultMode={'vpa'} onChange={onChangeMock} showPayButton={false}></UPIComponent>);
            const vpaInput = await screen.findByLabelText(/Enter UPI ID \/ VPA/);
            expect(vpaInput).toBeInTheDocument();
        });

        test('should call onChange with inValid to false if nothing is filled in the vpa input', async () => {
            const user = userEvent.setup();
            customRender(<UPIComponent defaultMode={'vpa'} onChange={onChangeMock} showPayButton={false}></UPIComponent>);
            const vpaInput = await screen.findByLabelText(/Enter UPI ID \/ VPA/);
            await user.click(vpaInput);
            // To blur the input
            await user.tab();
            expect(onChangeMock).toHaveBeenCalledWith({
                data: { virtualPaymentAddress: null },
                errors: { virtualPaymentAddress: null },
                valid: { virtualPaymentAddress: false },
                isValid: false
            });
        });

        test('should call the onChange with the filled in data and isValid to true, after filling the vpa input field', async () => {
            const user = userEvent.setup();
            customRender(<UPIComponent defaultMode={'vpa'} onChange={onChangeMock} showPayButton={false}></UPIComponent>);
            const vpaInput = await screen.findByLabelText(/Enter UPI ID \/ VPA/);
            await user.type(vpaInput, 'test');
            await user.tab();
            expect(onChangeMock).toHaveBeenCalledWith({
                data: { virtualPaymentAddress: 'test' },
                errors: { virtualPaymentAddress: null },
                valid: { virtualPaymentAddress: true },
                isValid: true
            });
        });
    });
});
