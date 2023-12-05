import { render, screen, waitForElementToBeRemoved } from '@testing-library/preact';
import { h } from 'preact';
import QRLoader from './QRLoader';
import checkPaymentStatus from '../../../core/Services/payment-status';
import Language from '../../../language/Language';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';

jest.mock('../../../core/Services/payment-status');

const i18n = { get: key => key } as Language;

describe('QRLoader', () => {
    const assignSpy = jest.fn();
    const srPanel = new SRPanel({});
    const customRender = (ui: h.JSX.Element) => {
        return render(
            // @ts-ignore ignore
            <SRPanelProvider srPanel={srPanel}>{ui}</SRPanelProvider>
        );
    };

    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn(() => ({ matches: true }))
        });
        Object.defineProperty(window, 'location', {
            value: { assign: assignSpy }
        });
    });

    describe('QR loader in different statuses', () => {
        // Pending status
        test('should show a spinner on init', () => {
            const props = { brandLogo: 'https://example.com', brandName: 'example' };
            // @ts-ignore ignore
            customRender(<QRLoader i18n={i18n} {...props} />);
            expect(screen.getByTestId('spinner')).toBeInTheDocument();
        });

        // Authorised status
        test('should show the success result', async () => {
            // Mock the checkPaymentStatusValue with an authorised response
            const checkPaymentStatusValue = { payload: 'Ab02b4c0!', resultCode: 'authorised', type: 'complete' };
            (checkPaymentStatus as jest.Mock).mockReturnValueOnce(Promise.resolve(checkPaymentStatusValue));
            const onCompleteMock = jest.fn();
            const expectedResult = {
                data: {
                    details: {
                        payload: 'Ab02b4c0!' // this should come from the status endpoint
                    },
                    paymentData: 'Ab02b4c0!2' // this should come from the initial props (from the initial /payments call)
                }
            };

            const props = { paymentData: 'Ab02b4c0!2', onComplete: onCompleteMock, delay: 0 };
            customRender(<QRLoader i18n={i18n} {...props} />);
            expect(await screen.findByText(/payment successful/i)).toBeInTheDocument();
            expect(onCompleteMock).toBeCalledWith(expectedResult, expect.any(Object));
        });

        // Error status
        test('should show the error result', async () => {
            // Mock the checkPaymentStatusValue with an error
            const mockErrorStatusNoPayload = { error: 'Unkown error', payload: 'Ab02b4c0!' };
            (checkPaymentStatus as jest.Mock).mockReturnValueOnce(Promise.resolve(mockErrorStatusNoPayload));
            const onCompleteMock = jest.fn();
            const onErrorMock = jest.fn();
            const expectedResult = {
                data: {
                    details: {
                        payload: 'Ab02b4c0!' // this should come from the status endpoint
                    },
                    paymentData: 'Ab02b4c0!2' // this should come from the initial props (from the initial /payments call)
                }
            };

            const props = { paymentData: 'Ab02b4c0!2', onComplete: onCompleteMock, onError: onErrorMock, delay: 0 };
            customRender(<QRLoader i18n={i18n} {...props} />);
            expect(await screen.findByText(/payment failed/i)).toBeInTheDocument();
            expect(onErrorMock).toBeCalledWith(new AdyenCheckoutError('ERROR', 'error result with no payload in response'));
            expect(onCompleteMock).toBeCalledWith(expectedResult, expect.any(Object));
        });
    });

    describe('QR code is not expired', () => {
        beforeEach(() => {
            const mockPaymentStatus = { payload: 'Ab02b4c0!', resultCode: 'pending', type: 'complete' };
            (checkPaymentStatus as jest.Mock).mockResolvedValue(mockPaymentStatus);
        });

        test('should see the brand logo img', async () => {
            const props = { brandLogo: 'https://example.com', brandName: 'example', delay: 0 };
            // @ts-ignore ignore
            customRender(<QRLoader i18n={i18n} {...props} />);
            await waitForElementToBeRemoved(() => screen.queryByTestId('spinner'));
            expect(await screen.findByAltText(props.brandName)).toBeInTheDocument();
        });

        test('should see the payment amount', async () => {
            const props = { amount: { value: 1000, currency: 'NL' }, delay: 0 };
            // @ts-ignore ignore
            customRender(<QRLoader i18n={i18n} {...props} />);
            expect(await screen.findByText(props.amount.value)).toBeInTheDocument();
        });

        test('should see the copy button', async () => {
            const props = { copyBtn: true, delay: 0 };
            // @ts-ignore ignore
            customRender(<QRLoader i18n={i18n} {...props} />);
            expect(await screen.findByRole('button', { name: /copy/i })).toBeInTheDocument();
        });

        describe('Redirect to mobile app section', () => {
            test('should see the redirect introduction', async () => {
                const props = { url: 'https://localhost:8080', delay: 0, redirectIntroduction: 'redirectIntroduction' };
                // @ts-ignore ignore
                customRender(<QRLoader i18n={i18n} {...props} />);
                expect(await screen.findByText(props.redirectIntroduction)).toBeInTheDocument();
            });

            test('should see the redirect button', async () => {
                const props = { url: 'https://localhost:8080', delay: 0, buttonLabel: 'Redirect' };
                // @ts-ignore ignore
                customRender(<QRLoader i18n={i18n} {...props} />);
                const btn = await screen.findByRole('button', { name: /redirect/i });
                expect(btn).toBeInTheDocument();
                btn.click();
                expect(assignSpy).toHaveBeenCalledWith(props.url);
            });
        });

        describe('QR code section', () => {
            test('should see the QR code instructions string', async () => {
                const props = { instructions: 'instructions', delay: 0 };
                // @ts-ignore ignore
                customRender(<QRLoader i18n={i18n} {...props} />);
                expect(await screen.findByText(props.instructions)).toBeInTheDocument();
            });

            test('should see the QR code instructions element', async () => {
                const props = { instructions: () => <div data-testid="test-instructions">instructions</div>, delay: 0 };
                // @ts-ignore ignore
                customRender(<QRLoader i18n={i18n} {...props} />);
                expect(await screen.findByTestId('test-instructions')).toBeInTheDocument();
            });
        });
    });
});
