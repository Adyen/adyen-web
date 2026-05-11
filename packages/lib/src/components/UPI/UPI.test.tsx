import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import UPI from './UPI';
import isMobile from '../../utils/isMobile';
import { TxVariants } from '../tx-variants';
import { Resources } from '../../core/Context/Resources';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

jest.mock('../../utils/isMobile');
const isMobileMock = isMobile as jest.Mock;
const onCompleteMock = jest.fn();
const onSubmitMock = jest.fn();
const core = setupCoreMock();

describe('UPI', () => {
    const props = {
        i18n: core.modules.i18n,
        loadingContext: 'test',
        modules: { resources: new Resources('test') },
        onSubmit: onSubmitMock,
        onComplete: onCompleteMock
    };

    afterEach(() => {
        isMobileMock.mockReset();
    });

    describe('formatData', () => {
        test('should return type upi_qr when in QR code mode', async () => {
            isMobileMock.mockReturnValue(false);

            const upi = new UPI(core, { ...props });
            render(upi.render());
            // In QR mode, data is formatted correctly on init without user interaction
            expect(upi.formatData()).toEqual({ paymentMethod: { type: TxVariants.upi_qr } });
            const user = userEvent.setup();
            const generateQrCodeButton = await screen.findByRole('button', { name: /Generate QR code/i });
            await user.click(generateQrCodeButton);
            expect(onSubmitMock).toHaveBeenCalledTimes(1);
        });

        test('should return type upi_intent and appId when in intent mode', async () => {
            isMobileMock.mockReturnValue(true);
            const gpayApp = { id: 'gpay', name: 'Google Pay', icon: '' };
            const upi = new UPI(core, { ...props, apps: [gpayApp] });
            render(upi.render());

            const user = userEvent.setup();
            const radioButton = await screen.findByRole('radio', { name: /google pay/i });
            await user.click(radioButton);

            await waitFor(() => {
                expect(upi.formatData()).toEqual({
                    paymentMethod: { type: TxVariants.upi_intent, appId: 'gpay' }
                });
            });
        });
    });

    describe('isValid', () => {
        test('should be valid for QR code mode', () => {
            isMobileMock.mockReturnValue(false);

            const upi = new UPI(core, { ...props });
            render(upi.render());
            expect(upi.isValid).toBe(true);
        });

        describe('Intent mode', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
            });

            test('should not be valid on init', async () => {
                const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay', icon: '' }] });
                render(upi.render());
                await waitFor(() => {
                    expect(upi.isValid).toBe(false);
                });
            });

            test('should be valid after selecting an app', async () => {
                const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay', icon: '' }] });
                render(upi.render());
                const user = userEvent.setup();
                const radioButton = await screen.findByRole('radio', { name: /google pay/i });
                await user.click(radioButton);
                await waitFor(() => {
                    expect(upi.isValid).toBe(true);
                });
            });
        });
    });

    describe('showValidation', () => {
        beforeEach(() => {
            isMobileMock.mockReturnValue(true);
        });

        test('should show an error alert in intent mode if no app is selected', async () => {
            const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay', icon: '' }] });
            render(upi.render());

            upi.showValidation();

            const alert = await screen.findByRole('alert');
            expect(alert).toHaveTextContent('Select your preferred UPI app to continue');

            await waitFor(() => {
                expect(upi.isValid).toBe(false);
            });
        });

        test('should not show an error and be valid if an app is selected', async () => {
            const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay', icon: '' }] });
            render(upi.render());
            const user = userEvent.setup();
            const radioButton = await screen.findByRole('radio', { name: /google pay/i });
            await user.click(radioButton);

            upi.showValidation();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            await waitFor(() => {
                expect(upi.isValid).toBe(true);
            });
        });
    });

    describe('paymentType', () => {
        test('should return upi_qr when on desktop', () => {
            isMobileMock.mockReturnValue(false);
            const upi = new UPI(core, { ...props });
            expect(upi.paymentType).toBe(TxVariants.upi_qr);
        });

        test('should return upi_intent when on mobile with apps', () => {
            isMobileMock.mockReturnValue(true);
            const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay', icon: '' }] });
            expect(upi.paymentType).toBe(TxVariants.upi_intent);
        });

        test('should return upi_qr when on mobile without apps', () => {
            isMobileMock.mockReturnValue(true);
            const upi = new UPI(core, { ...props, apps: [] });
            expect(upi.paymentType).toBe(TxVariants.upi_qr);
        });
    });

    describe('brands', () => {
        test('should return brand icons and names from apps list', () => {
            isMobileMock.mockReturnValue(true);
            const apps = [
                { id: 'gpay', name: 'Google Pay', icon: '' },
                { id: 'phonepe', name: 'PhonePe', icon: '' }
            ];
            const upi = new UPI(core, { ...props, apps });

            const brands = upi.brands;
            expect(brands).toHaveLength(2);
            expect(brands[0]).toEqual(expect.objectContaining({ name: 'Google Pay' }));
            expect(brands[1]).toEqual(expect.objectContaining({ name: 'PhonePe' }));
        });

        test('should return empty array when showPaymentMethodItemImages is false', () => {
            isMobileMock.mockReturnValue(true);
            const apps = [{ id: 'gpay', name: 'Google Pay', icon: '' }];
            const upi = new UPI(core, { ...props, apps, showPaymentMethodItemImages: false });

            expect(upi.brands).toEqual([]);
        });

        test('should return empty array when no apps are provided', () => {
            isMobileMock.mockReturnValue(false);
            const upi = new UPI(core, { ...props });

            expect(upi.brands).toEqual([]);
        });
    });

    describe('UI Rendering', () => {
        test('should render the UPI component qrCode by default', () => {
            const upi = new UPI(core, props);
            render(upi.render());

            expect(upi.isValid).toBe(true);
        });
    });
});
