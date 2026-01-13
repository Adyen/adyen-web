import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import UPI from './UPI';
import isMobile from '../../utils/isMobile';
import { TxVariants } from '../tx-variants';
import { Resources } from '../../core/Context/Resources';
import { UPI_MODE } from './constants';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

jest.mock('../../utils/isMobile');
const isMobileMock = isMobile as jest.Mock;
const onCompleteMock = jest.fn();
const onSubmitMock = jest.fn();

describe('UPI', () => {
    const props = {
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: new Resources('test') },
        onSubmit: onSubmitMock,
        onComplete: onCompleteMock
    };

    afterEach(() => {
        isMobileMock.mockReset();
    });

    describe('formatProps', () => {
        describe('on mobile devices', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
            });

            test('should configure for intent mode if apps are provided', () => {
                const upi = new UPI(global.core, props);
                const gpayApp = { id: 'gpay', name: 'Google Pay' };
                const formattedProps = upi.formatProps({ ...props, apps: [gpayApp] });

                expect(formattedProps).toMatchObject({
                    apps: [gpayApp],
                    defaultMode: UPI_MODE.INTENT
                });
            });

            test('should configure for qrCode mode if no apps are provided', () => {
                const upi = new UPI(global.core, props);
                const formattedProps = upi.formatProps({ ...props, apps: [] });

                expect(formattedProps).toMatchObject({
                    apps: []
                });
            });
        });

        describe('on non-mobile (desktop) devices', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(false);
            });

            test('should configure for qrCode mode, and ignore any apps', () => {
                const upi = new UPI(global.core, props);
                const gpayApp = { id: 'gpay', name: 'Google Pay' };
                const formattedProps = upi.formatProps({ ...props, apps: [gpayApp] });

                expect(formattedProps).toMatchObject({
                    apps: [],
                    defaultMode: UPI_MODE.QR_CODE
                });
            });
        });
    });

    describe('formatData', () => {
        test('should return type upi_qr when in QR code mode', async () => {
            isMobileMock.mockReturnValue(false);
            const core = setupCoreMock();

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
            const core = setupCoreMock();
            const gpayApp = { id: 'gpay', name: 'Google Pay' };
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
            const core = setupCoreMock();

            const upi = new UPI(core, { ...props });
            render(upi.render());
            expect(upi.isValid).toBe(true);
        });

        describe('Intent mode', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
            });

            test('should not be valid on init', async () => {
                const core = setupCoreMock();

                const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                render(upi.render());
                await waitFor(() => {
                    expect(upi.isValid).toBe(false);
                });
            });

            test('should be valid after selecting an app', async () => {
                const core = setupCoreMock();

                const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
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
            const core = setupCoreMock();

            const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
            render(upi.render());

            upi.showValidation();

            const alert = await screen.findByRole('alert');
            expect(alert).toHaveTextContent('Select your preferred UPI app to continue');

            await waitFor(() => {
                expect(upi.isValid).toBe(false);
            });
        });

        test('should not show an error and be valid if an app is selected', async () => {
            const core = setupCoreMock();

            const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
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

    describe('UI Rendering', () => {
        test('should render the UPI component qrCode by default', () => {
            const core = setupCoreMock();

            const upi = new UPI(core, props);
            render(upi.render());

            expect(upi.isValid).toBe(true);
        });
    });
});
