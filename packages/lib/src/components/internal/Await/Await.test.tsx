import { createRef, h } from 'preact';
import checkPaymentStatus from '../../../core/Services/payment-status';
import { Await } from './Await';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AwaitComponentProps } from './types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';
import { AmountProvider, AmountProviderProps } from '../../../core/Context/AmountProvider';

jest.mock('../../../core/Services/payment-status');

const renderAwait = ({
    awaitProps,
    amountProviderProps
}: {
    awaitProps: AwaitComponentProps;
    amountProviderProps?: Partial<AmountProviderProps>;
}) => {
    const srPanel = new SRPanel(global.core);

    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={srPanel}>
                <AmountProvider {...amountProviderProps} providerRef={createRef()}>
                    <Await {...awaitProps} />
                </AmountProvider>
            </SRPanelProvider>
        </CoreProvider>
    );
};

describe('Await', () => {
    const assignSpy = jest.fn();

    const defaultProps: AwaitComponentProps = {
        countdownTime: 0,
        onActionHandled: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn(),
        showCountdownTimer: true,
        throttleInterval: 0,
        throttleTime: 0,
        brandLogo: 'https://example.com',
        clientKey: 'test_client_key',
        messageText: 'test',
        paymentData: 'dummy',
        type: 'mbway',
        awaitText: 'test'
    };

    const amountProviderProps = { amount: { currency: 'USD', value: 1000 } };

    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            value: { assign: assignSpy }
        });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('In progress', () => {
        let checkPaymentStatusValue;
        beforeEach(() => {
            checkPaymentStatusValue = { payload: 'Ab02b4c0!', resultCode: 'pending', type: 'complete' };
            (checkPaymentStatus as jest.Mock).mockResolvedValue(checkPaymentStatusValue);
        });

        test('should show the spinner', async () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });
            expect(await screen.findByTestId('spinner')).toBeTruthy();
        });

        test('should show brand logo', async () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });
            const image = await screen.findByAltText(defaultProps.type);
            // @ts-ignore src is part of img
            expect(image.src).toContain(defaultProps.brandLogo);
        });

        test('should show a countdown timer', async () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });
            expect(await screen.findByRole('timer')).toBeTruthy();
        });

        test('should show redirect button', async () => {
            renderAwait({ awaitProps: { ...defaultProps, url: 'redirect-url' }, amountProviderProps });
            expect(await screen.findByRole('button')).toBeTruthy();
        });

        test('click the redirect button should call location.assign', async () => {
            renderAwait({ awaitProps: { ...defaultProps, url: 'redirect-url' }, amountProviderProps });
            fireEvent.click(await screen.findByRole('button'));
            expect(assignSpy).toHaveBeenCalled();
        });

        test('should call location.assign if there is an url and shouldRedirectAutomatically is true', async () => {
            assignSpy.mockReset();

            renderAwait({ awaitProps: { ...defaultProps, url: 'redirect-url', shouldRedirectAutomatically: true }, amountProviderProps });

            await waitFor(() => expect(assignSpy).toHaveBeenCalled());
            const button = screen.queryByRole('button');
            expect(button).not.toBeInTheDocument();
        });
    });

    describe('Expired', () => {
        let checkPaymentStatusValue;
        beforeEach(() => {
            checkPaymentStatusValue = { error: 'Unkown error', payload: 'Ab02b4c0!' };
            (checkPaymentStatus as jest.Mock).mockResolvedValue(checkPaymentStatusValue);
        });

        test('should show an error image', async () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });

            const image = await screen.findByAltText(/payment.*? failed/i);
            expect(image).toBeTruthy();
        });

        test('should call onComplete if there is a payload', async () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });

            await waitFor(() =>
                expect(defaultProps.onComplete).toHaveBeenCalledWith({
                    data: {
                        details: { payload: checkPaymentStatusValue.payload },
                        paymentData: defaultProps.paymentData
                    }
                })
            );
        });

        test('should call onError if there is not a payload', async () => {
            (checkPaymentStatus as jest.Mock).mockReset();
            checkPaymentStatusValue = { error: 'Un-known error' };
            (checkPaymentStatus as jest.Mock).mockResolvedValue(checkPaymentStatusValue);
            renderAwait({ awaitProps: defaultProps, amountProviderProps });

            await waitFor(() =>
                expect(defaultProps.onError).toHaveBeenCalledWith(new AdyenCheckoutError('ERROR', 'error result with no payload in response'))
            );
        });
    });

    describe('Completed', () => {
        let checkPaymentStatusValue;
        beforeEach(() => {
            checkPaymentStatusValue = { payload: 'Ab02b4c0!', resultCode: 'authorised', type: 'complete' };
            (checkPaymentStatus as jest.Mock).mockResolvedValue(checkPaymentStatusValue);
        });

        test('should show a success image', async () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });
            const image = await screen.findByAltText(/payment.*? successful/i);
            expect(image).toBeTruthy();
        });

        test('should call onComplete if there is a payload', () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });

            expect(defaultProps.onComplete).toHaveBeenCalledWith({
                data: {
                    details: { payload: checkPaymentStatusValue.payload },
                    paymentData: defaultProps.paymentData
                }
            });
        });
    });

    describe('Loading', () => {
        beforeEach(() => {
            const checkPaymentStatusValue = { payload: 'Ab02b4c0!', resultCode: 'pending', type: 'complete' };
            (checkPaymentStatus as jest.Mock).mockResolvedValue(checkPaymentStatusValue);
        });

        test('should show the spinner on init', async () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });

            expect(await screen.findByTestId('spinner')).toBeTruthy();
        });

        test('should show brand logo', async () => {
            renderAwait({ awaitProps: defaultProps, amountProviderProps });

            const image = await screen.findByAltText(defaultProps.type);
            // @ts-ignore src is part of img
            expect(image.src).toContain(defaultProps.brandLogo);
        });
    });
});
