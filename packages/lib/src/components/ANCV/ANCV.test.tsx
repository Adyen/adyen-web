import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import ANCV from './ANCV';
import { ANCVConfiguration } from './types';
import { ICore } from '../../core/types';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';

const BENEFICIARY_ID_LABEL = /Your ANCV identification/i;

/** Creates and renders an ANCV element with sensible defaults, returning the element instance */
function setupANCV(core: ICore, props: Partial<ANCVConfiguration> = {}): ANCV {
    const ancv = new ANCV(core, {
        amount: { value: 1000, currency: 'EUR' },
        data: { beneficiaryId: '' },
        i18n: global.i18n,
        loadingContext: 'mock',
        modules: { resources: global.resources },
        ...props
    });
    render(ancv.render());
    return ancv;
}

/** Types into the beneficiaryId field and blurs it to trigger validation */
async function typeBeneficiaryId(user: ReturnType<typeof userEvent.setup>, value: string): Promise<void> {
    await user.type(screen.getByLabelText(BENEFICIARY_ID_LABEL), value);
    await user.tab();
}

describe('ANCV', () => {
    describe('data propagation', () => {
        test('should propagate the beneficiaryId input to the component state and merchant onChange callback', async () => {
            const user = userEvent.setup();
            const onChangeMock = jest.fn();
            const ancv = setupANCV(setupCoreMock(), { onChange: onChangeMock });

            await typeBeneficiaryId(user, '12345678901');

            expect(ancv.state.data).toEqual({ beneficiaryId: '12345678901' });
            expect(ancv.isValid).toBe(true);
            expect(onChangeMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            type: 'ancv',
                            beneficiaryId: '12345678901'
                        })
                    }),
                    isValid: true
                }),
                ancv
            );
        });

        test('should not be valid when the beneficiaryId does not match the expected format', async () => {
            const user = userEvent.setup();
            const ancv = setupANCV(setupCoreMock());

            await typeBeneficiaryId(user, '12345');

            expect(await screen.findByText('Enter a valid email address or ANCV ID')).toBeVisible();
            expect(ancv.isValid).toBe(false);
        });

        test('should propagate the beneficiaryId input to the payment method object on submit', async () => {
            const user = userEvent.setup();
            const onSubmitMock = jest.fn();
            // ANCV follows the giftcard order flow: submit() calls createOrder() first, so either
            // an order must already exist, or onOrderRequest must be provided to resolve one.
            const onOrderRequest = jest.fn(resolve => resolve({ orderData: 'mock', pspReference: 'mock' }));
            const ancv = setupANCV(setupCoreMock(), { onSubmit: onSubmitMock, onOrderRequest });

            await typeBeneficiaryId(user, '12345678901');
            await user.click(screen.getByRole('button', { name: 'Confirm purchase' }));

            expect(ancv.state.data).toEqual({ beneficiaryId: '12345678901' });
            expect(ancv.isValid).toBe(true);
            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            type: 'ancv',
                            beneficiaryId: '12345678901'
                        })
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });
    });

    describe('createOrder', () => {
        test('should call the onOrderRequest callback prop when provided', async () => {
            const onOrderRequest = jest.fn((resolve, _reject, _data) => {
                resolve({ orderData: 'mockOrderData', pspReference: 'mockPspRef' });
            });

            const ancv = setupANCV(setupCoreMock(), {
                // @ts-ignore test only
                onOrderRequest
            });

            await ancv.createOrder();

            expect(onOrderRequest).toHaveBeenCalledTimes(1);
            expect(onOrderRequest).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), expect.any(Object));
        });

        test('should send an error event to the analytics if the createOrder call fails for the session flow', async () => {
            const code = 'mockErrorCode';
            const core = setupCoreMock();

            const ancv = setupANCV(core, {
                onError: () => {},
                // @ts-ignore test only
                session: {
                    createOrder: () => Promise.reject(new AdyenCheckoutError('NETWORK_ERROR', '', { code }))
                }
            });

            await ancv.createOrder();

            expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith({
                code,
                component: 'ancv',
                errorType: ErrorEventType.apiError,
                timestamp: expect.any(String),
                id: expect.any(String)
            });
        });
    });
});
