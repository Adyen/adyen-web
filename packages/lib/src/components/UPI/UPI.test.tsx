import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import UPI from './UPI';
import isMobile from '../../utils/isMobile';
import { TxVariants } from '../tx-variants';
import { Resources } from '../../core/Context/Resources';
import { getIntentOption, getQrOption, getVpaOption } from './constants';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

jest.mock('../../utils/isMobile');
const isMobileMock = isMobile as jest.Mock;
const onCompleteMock = jest.fn();
jest.mock('./constants', () => ({
    ...jest.requireActual('./constants'),
    getIntentOption: jest.fn(() => ({ label: 'UPI app', value: 'intent' })),
    getVpaOption: jest.fn(() => ({ label: 'UPI ID', value: 'vpa' })),
    getQrOption: jest.fn(() => ({ label: 'QR code', value: 'qrCode' }))
}));

describe('UPI', () => {
    const props = {
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: new Resources('test') },
        onComplete: onCompleteMock
    };

    afterEach(() => {
        isMobileMock.mockReset();
        (getIntentOption as jest.Mock).mockClear();
        (getVpaOption as jest.Mock).mockClear();
        (getQrOption as jest.Mock).mockClear();
    });

    describe('formatProps', () => {
        describe('on mobile devices', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(true);
            });

            test('should configure for intent and vpa modes if apps are provided', () => {
                const upi = new UPI(global.core, props);
                const gpayApp = { id: 'gpay', name: 'Google Pay' };
                const formattedProps = upi.formatProps({ ...props, apps: [gpayApp] });

                expect(formattedProps).toMatchObject({
                    apps: [gpayApp],
                    defaultMode: 'intent',
                    segmentedControlOptions: [
                        { label: 'UPI app', value: 'intent' },
                        { label: 'UPI ID', value: 'vpa' }
                    ]
                });
            });

            test('should configure for only vpa mode if no apps are provided', () => {
                const upi = new UPI(global.core, props);
                const formattedProps = upi.formatProps({ ...props, apps: [] });

                expect(formattedProps).toMatchObject({
                    apps: [],
                    defaultMode: 'vpa',
                    segmentedControlOptions: []
                });
            });

            test('should respect a valid defaultMode prop', () => {
                const upi = new UPI(global.core, props);
                const gpayApp = { id: 'gpay', name: 'Google Pay' };
                const formattedProps = upi.formatProps({ ...props, apps: [gpayApp], defaultMode: 'vpa' });

                expect(formattedProps.defaultMode).toBe('vpa');
            });
        });

        describe('on non-mobile (desktop) devices', () => {
            beforeEach(() => {
                isMobileMock.mockReturnValue(false);
            });

            test('should configure for qrCode and vpa modes, and ignore any apps', () => {
                const upi = new UPI(global.core, props);
                const gpayApp = { id: 'gpay', name: 'Google Pay' };
                const formattedProps = upi.formatProps({ ...props, apps: [gpayApp] });

                expect(formattedProps).toMatchObject({
                    apps: [],
                    defaultMode: 'qrCode',
                    segmentedControlOptions: [
                        { label: 'QR code', value: 'qrCode' },
                        { label: 'UPI ID', value: 'vpa' }
                    ]
                });
            });

            test('should respect a valid defaultMode prop', () => {
                const upi = new UPI(global.core, props);
                const formattedProps = upi.formatProps({ ...props, defaultMode: 'vpa' });
                expect(formattedProps.defaultMode).toBe('vpa');
            });
        });
    });

    describe('formatData', () => {
        test('should return type upi_qr when in QR code mode', () => {
            isMobileMock.mockReturnValue(false);
            const core = setupCoreMock();

            const upi = new UPI(core, { ...props, defaultMode: 'qrCode' });
            render(upi.render());
            // In QR mode, data is formatted correctly on init without user interaction
            expect(upi.formatData()).toEqual({ paymentMethod: { type: TxVariants.upi_qr } });
        });

        test('should return type upi_collect and VPA when in VPA mode', async () => {
            isMobileMock.mockReturnValue(false);
            const core = setupCoreMock();

            const upi = new UPI(core, { ...props, defaultMode: 'vpa' });
            render(upi.render());

            const user = userEvent.setup();
            await user.type(screen.getByTestId('input-virtual-payment-address'), 'test@vpa');
            await user.tab();

            await waitFor(() => {
                expect(upi.formatData()).toEqual({
                    paymentMethod: { type: TxVariants.upi_collect, virtualPaymentAddress: 'test@vpa' }
                });
            });
        });

        test('should return type upi_intent and appId when in intent mode', async () => {
            isMobileMock.mockReturnValue(true);
            const core = setupCoreMock();
            const gpayApp = { id: 'gpay', name: 'Google Pay' };
            const upi = new UPI(core, { ...props, apps: [gpayApp], defaultMode: 'intent' });
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

            const upi = new UPI(core, { ...props, defaultMode: 'qrCode' });
            render(upi.render());
            expect(upi.isValid).toBe(true);
        });

        describe('VPA mode', () => {
            test('should not be valid on init', async () => {
                isMobileMock.mockReturnValue(false);
                const core = setupCoreMock();

                const upi = new UPI(core, { ...props, defaultMode: 'vpa' });
                render(upi.render());
                await waitFor(() => {
                    expect(upi.isValid).toBe(false);
                });
            });

            test('should be valid after filling in a valid VPA', async () => {
                isMobileMock.mockReturnValue(false);
                const core = setupCoreMock();

                const upi = new UPI(core, { ...props, defaultMode: 'vpa' });
                render(upi.render());

                const user = userEvent.setup();
                await user.type(screen.getByTestId('input-virtual-payment-address'), 'test@test');
                await user.tab();

                await waitFor(() => {
                    expect(upi.isValid).toBe(true);
                });
            });
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

            test('should switch to VPA mode, be invalid, then become valid after typing', async () => {
                const core = setupCoreMock();

                const upi = new UPI(core, { ...props, apps: [{ id: 'gpay', name: 'Google Pay' }] });
                render(upi.render());
                const user = userEvent.setup();

                // Switch to VPA mode
                const vpaModeButton = await screen.findByRole('button', { name: /UPI ID/i });
                await user.click(vpaModeButton);

                // Should be invalid after switching
                await waitFor(() => {
                    expect(upi.isValid).toBe(false);
                });

                await user.type(screen.getByTestId('input-virtual-payment-address'), 'test@test');
                await user.tab();

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
        test('should render the UPI component by default', async () => {
            const core = setupCoreMock();

            const upi = new UPI(core, props);
            render(upi.render());
            // Check for segmented control group
            expect(await screen.findByRole('group')).toBeInTheDocument();
        });
        test('should have a segment controlled naviable by keyboard and selected with enter', async () => {
            const core = setupCoreMock();
            const user = userEvent.setup();

            const upi = new UPI(core, props);
            render(upi.render());

            const segmentedControl = await screen.findByRole('group');
            // Check for segmented control group
            expect(segmentedControl).toBeInTheDocument();

            (await screen.findByRole('button', { name: 'QR code' })).focus();
            expect(await screen.findByRole('button', { name: /Generate QR code/i })).toBeInTheDocument();

            // check if onComplete was not called
            await user.keyboard('{Enter}');
            expect(onCompleteMock).not.toHaveBeenCalled();

            await user.tab();
            await user.keyboard('{Enter}');

            // check if upi id is visible
            expect(await screen.findByText('Enter your UPI ID')).toBeInTheDocument();

            // check if generate qr code is not visible
            expect( screen.queryByRole('button', { name: /Generate QR code/i })).not.toBeInTheDocument();
        });

        test('should have a segment controlled naviable by keyboard and selected with space', async () => {
            const core = setupCoreMock();
            const user = userEvent.setup();

            const upi = new UPI(core, props);
            render(upi.render());

            const segmentedControl = await screen.findByRole('group');
            // Check for segmented control group
            expect(segmentedControl).toBeInTheDocument();

            (await screen.findByRole('button', { name: 'QR code' })).focus();
            expect(await screen.findByRole('button', { name: /Generate QR code/i })).toBeInTheDocument();

            // check if onComplete was not called
            await user.keyboard(' ');
            expect(onCompleteMock).not.toHaveBeenCalled();

            await user.tab();

            // check if upi id is visible
            await user.keyboard(' ');
            expect(await screen.findByText('Enter your UPI ID')).toBeInTheDocument();

            // check if generate qr code is not visible
            expect( screen.queryByRole('button', { name: /Generate QR code/i })).not.toBeInTheDocument();
        });
    });
});
