import { render, screen } from '@testing-library/preact';
import UPI from './UPI';
import isMobile from '../../utils/isMobile';
import { TX_VARIANT, UpiMode } from './types';
import { SRPanel } from '../../core/Errors/SRPanel';

jest.mock('../../utils/isMobile');
const isMobileMock = isMobile as jest.Mock;

describe('UPI', () => {
    // @ts-ignore ignore
    const props = { i18n: global.i18n, loadingContext: 'test', modules: { srPanel: new SRPanel({}), resources: global.resources } };
    afterEach(() => {
        isMobileMock.mockReset();
    });

    describe('formatProps', () => {
        describe('on mobile devices', () => {
            let upi: UPI;
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
                upi = new UPI(props);
            });

            test('should return an app list from the given props.apps and a collect app', () => {
                expect(upi.formatProps({ ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] })).toMatchObject({
                    apps: [
                        { id: 'gpay', name: 'Google Pay', type: TX_VARIANT.UpiIntent },
                        { id: UpiMode.Vpa, name: 'Enter UPI ID', type: TX_VARIANT.UpiCollect }
                    ],
                    defaultMode: UpiMode.Intent
                });
            });

            test('should return an empty app list if there is no app list from the props', () => {
                expect(upi.formatProps(props)).toMatchObject({ apps: [], defaultMode: UpiMode.Vpa });
            });
        });

        describe('on non mobile devices', () => {
            let upi: UPI;
            beforeEach(() => {
                isMobileMock.mockReturnValue(false);
                upi = new UPI(props);
            });

            test('should return an empty app list, and set the default mode to QR code', () => {
                expect(upi.formatProps({})).toEqual({ apps: [], defaultMode: UpiMode.QrCode });
            });
        });
    });

    describe('formatData', () => {
        describe('select the QR code mode', () => {
            test('should return the payment type upi_qr', () => {
                isMobileMock.mockReturnValue(false);
                const upi = new UPI({ ...props, defaultMode: UpiMode.QrCode });
                expect(upi.formatData()).toEqual({ paymentMethod: { type: TX_VARIANT.UpiQr } });
            });
        });

        describe('select the vpa mode', () => {
            test('should return the payment type upi_collect and virtualPaymentAddress', () => {
                isMobileMock.mockReturnValue(false);
                const upi = new UPI({ ...props, defaultMode: UpiMode.Vpa });
                upi.setState({ data: { virtualPaymentAddress: 'test' }, valid: {}, errors: {}, isValid: true });
                expect(upi.formatData()).toEqual({ paymentMethod: { type: TX_VARIANT.UpiCollect, virtualPaymentAddress: 'test' } });
            });
        });

        describe('select the intent mode', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
            });

            describe('pay with the UPI ID / VPA', () => {
                test('should return the payment type upi_collect and virtualPaymentAddress', () => {
                    const upi = new UPI({ ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                    upi.setState({
                        data: { virtualPaymentAddress: 'test', app: { id: 'vpa', type: TX_VARIANT.UpiCollect } },
                        valid: {},
                        errors: {},
                        isValid: true
                    });
                    expect(upi.formatData()).toEqual({ paymentMethod: { type: TX_VARIANT.UpiCollect, virtualPaymentAddress: 'test' } });
                });
            });

            describe('pay with other apps', () => {
                test('should return the payment type upi_intent and the chosen appId', () => {
                    const upi = new UPI({ ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                    upi.setState({
                        data: { app: { id: 'gpay', type: TX_VARIANT.UpiIntent } },
                        valid: {},
                        errors: {},
                        isValid: true
                    });
                    expect(upi.formatData()).toEqual({ paymentMethod: { type: TX_VARIANT.UpiIntent, appId: 'gpay' } });
                });
            });
        });
    });

    describe('render', () => {
        test('should render the UPI component by default', async () => {
            const upi = new UPI(props);
            render(upi.render());
            expect(await screen.findByRole('group')).toBeInTheDocument;
        });
    });
});
