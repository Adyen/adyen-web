import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import UPI from './UPI';
import isMobile from '../../utils/isMobile';
import { SRPanel } from '../../core/Errors/SRPanel';
import { TxVariants } from '../tx-variants';
import { Resources } from '../../core/Context/Resources';

jest.mock('../../utils/isMobile');
const isMobileMock = isMobile as jest.Mock;

describe('UPI', () => {
    // @ts-ignore ignore
    const props = { i18n: global.i18n, loadingContext: 'test', modules: { srPanel: new SRPanel(global.core), resources: new Resources('test') } };
    afterEach(() => {
        isMobileMock.mockReset();
    });

    describe('formatProps', () => {
        describe('on mobile devices', () => {
            let upi: UPI;
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
                upi = new UPI(global.core, props);
            });

            test('should return an app list from the given props.apps and a collect app', () => {
                expect(upi.formatProps({ ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] })).toMatchObject({
                    apps: [
                        { id: 'gpay', name: 'Google Pay', type: TxVariants.upi_intent },
                        { id: 'vpa', name: 'Enter UPI ID', type: TxVariants.upi_collect }
                    ],
                    defaultMode: 'intent'
                });
            });

            test('should return an empty app list if there is no app list from the props', () => {
                expect(upi.formatProps(props)).toMatchObject({ apps: [], defaultMode: 'vpa' });
            });
        });

        describe('on non mobile devices', () => {
            let upi: UPI;
            beforeEach(() => {
                isMobileMock.mockReturnValue(false);
                upi = new UPI(global.core, props);
            });

            test('should return an empty app list, and set the default mode to QR code', () => {
                expect(upi.formatProps({})).toEqual({ apps: [], defaultMode: 'qrCode' });
            });
        });
    });

    describe('formatData', () => {
        describe('select the QR code mode', () => {
            test('should return the payment type upi_qr', () => {
                isMobileMock.mockReturnValue(false);
                const upi = new UPI(global.core, { ...props, defaultMode: 'qrCode' });
                expect(upi.formatData()).toEqual({ paymentMethod: { type: TxVariants.upi_qr } });
            });
        });

        describe('select the vpa mode', () => {
            test('should return the payment type upi_collect and virtualPaymentAddress', () => {
                isMobileMock.mockReturnValue(false);
                const upi = new UPI(global.core, { ...props, defaultMode: 'vpa' });
                upi.setState({ data: { virtualPaymentAddress: 'test' }, valid: {}, errors: {}, isValid: true });
                expect(upi.formatData()).toEqual({ paymentMethod: { type: TxVariants.upi_collect, virtualPaymentAddress: 'test' } });
            });
        });

        describe('select the intent mode', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
            });

            describe('pay with the UPI ID / VPA', () => {
                test('should return the payment type upi_collect and virtualPaymentAddress', () => {
                    const upi = new UPI(global.core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                    upi.setState({
                        data: { virtualPaymentAddress: 'test', app: { id: 'vpa', type: TxVariants.upi_collect } },
                        valid: {},
                        errors: {},
                        isValid: true
                    });
                    expect(upi.formatData()).toEqual({ paymentMethod: { type: TxVariants.upi_collect, virtualPaymentAddress: 'test' } });
                });
            });

            describe('pay with other apps', () => {
                test('should return the payment type upi_intent and the chosen appId', () => {
                    const upi = new UPI(global.core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                    upi.setState({
                        data: { app: { id: 'gpay', type: TxVariants.upi_intent } },
                        valid: {},
                        errors: {},
                        isValid: true
                    });
                    expect(upi.formatData()).toEqual({ paymentMethod: { type: TxVariants.upi_intent, appId: 'gpay' } });
                });
            });
        });
    });

    describe('isValid', () => {
        describe('select the QR code mode', () => {
            test('should be valid', async () => {
                isMobileMock.mockReturnValue(false);
                const upi = new UPI(global.core, { ...props, defaultMode: 'qrCode' });
                render(upi.render());
                await waitFor(() => {
                    expect(upi.isValid).toBe(true);
                });
            });
        });

        describe('select the vpa mode', () => {
            test('should not be valid on init', async () => {
                isMobileMock.mockReturnValue(false);
                const upi = new UPI(global.core, { ...props, defaultMode: 'vpa' });
                render(upi.render());
                await waitFor(() => {
                    expect(upi.isValid).toBe(false);
                });
            });

            test('should be valid when filling in the vpa', async () => {
                isMobileMock.mockReturnValue(false);
                const upi = new UPI(global.core, { ...props, defaultMode: 'vpa' });
                render(upi.render());
                const user = userEvent.setup();
                const vpaInput = await screen.findByLabelText(/Enter UPI ID \/ VPA/i);
                await user.type(vpaInput, 'test@test');
                expect(upi.isValid).toBe(true);
            });
        });

        describe('select the intent mode', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
            });

            test('should not be valid on init', async () => {
                const upi = new UPI(global.core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                render(upi.render());
                await waitFor(() => {
                    expect(upi.isValid).toBe(false);
                });
            });

            test('should be valid when selecting other apps', async () => {
                const upi = new UPI(global.core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                render(upi.render());
                const user = userEvent.setup();
                const radioButton = await screen.findByRole('radio', { name: /google pay/i });
                await user.click(radioButton);
                expect(upi.isValid).toBe(true);
            });

            test('should not be valid when selecting upi collect', async () => {
                const upi = new UPI(global.core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                render(upi.render());
                const user = userEvent.setup();
                const radioButton = await screen.findByRole('radio', { name: /Enter UPI ID/i });
                await user.click(radioButton);
                expect(upi.isValid).toBe(false);
            });

            test('should be valid when filling the vpa', async () => {
                const upi = new UPI(global.core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                render(upi.render());
                const user = userEvent.setup();
                const radioButton = await screen.findByRole('radio', { name: /Enter UPI ID/i });
                await user.click(radioButton);
                expect(upi.isValid).toBe(false);

                const vpaInput = await screen.findByLabelText(/Enter UPI ID \/ VPA/i);
                await user.type(vpaInput, 'test@test');
                expect(upi.isValid).toBe(true);
            });
        });
    });

    describe('render', () => {
        test('should render the UPI component by default', async () => {
            const upi = new UPI(global.core, props);
            render(upi.render());
            expect(await screen.findByRole('group')).toBeInTheDocument();
        });
    });
});
