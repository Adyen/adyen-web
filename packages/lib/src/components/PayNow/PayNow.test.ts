import PayNow from './PayNow';
import { render, screen, within } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { Resources } from '../../core/Context/Resources';
import checkPaymentStatus from '../../core/Services/payment-status';
import { SRPanel } from '../../core/Errors/SRPanel';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

jest.mock('../../core/Services/payment-status');

describe('PayNow', () => {
    describe('isValid', () => {
        test('should be always true', () => {
            const core = setupCoreMock();
            const paynow = new PayNow(core);
            expect(paynow.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const core = setupCoreMock();
            const paynow = new PayNow(core);
            expect(paynow.data.paymentMethod.type).toBe('paynow');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const core = setupCoreMock();
            const paynow = new PayNow(core, { modules: { srPanel: core.modules.srPanel } });
            expect(paynow.render()).not.toBe(null);
        });
    });

    test('should render mobile instructions', async () => {
        // Mocks matchMedia to return 'matches: true' when checking (max-width: 1024px)
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(() => ({
                matches: true
            }))
        });

        jest.useFakeTimers();

        const srPanel = mock<SRPanel>();
        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        // @ts-ignore mockResolvedValue not inferred
        checkPaymentStatus.mockResolvedValue({
            payload: 'Ab02b4c0!BQABAgBLLk9evMb+rScNdE...',
            resultCode: 'pending',
            type: 'complete'
        });

        const core = setupCoreMock();

        const paynow = new PayNow(core, {
            loadingContext: 'checkoutshopper.com/',
            modules: { resources, analytics: global.analytics, srPanel },
            i18n: global.i18n,
            paymentData: 'Ab02b4c0!BQABAgBH1f8hqfFxOvbfK..',
            qrCodeImage: '',
            paymentMethodType: 'paynow',
            qrCodeData: '00020126580009SG...'
        });

        render(paynow.mount('body'));

        // Triggers the execution of the setTimeout that makes the /status API request
        jest.runAllTimers();

        await screen.findAllByText(/Scan the QR code using the PayNow app to complete the payment/);

        const div = within(screen.queryByTestId('paynow-introduction'));
        div.getByText(/Take a screenshot of the QR code./);
        div.getByText(/Open the PayNow bank or payment app./);
        div.getByText(/Select the option to scan a QR code./);
        div.getByText(/Choose the option to upload a QR and select the screenshot./);
        div.getByText(/Complete the transaction./);

        jest.resetAllMocks();
    });
});
