import GooglePayService from './GooglePayService';
import Script from '../../utils/Script';
import { mock } from 'jest-mock-extended';
import type { IAnalytics } from '../../core/Analytics/Analytics';

jest.mock('../../utils/Script');

const mockAnalytics = mock<IAnalytics>();

describe('GooglePayService', () => {
    const mockPaymentsClientConstructor = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // @ts-ignore Mock Script load method
        (Script as jest.Mock).mockImplementation(() => ({
            load: jest.fn().mockImplementation(() => {
                (window as any).google = {
                    payments: {
                        api: {
                            PaymentsClient: mockPaymentsClientConstructor
                        }
                    }
                };
                return Promise.resolve();
            })
        }));
        delete (window as any).google;
    });

    test('should pass nonce to Script attributes and PaymentOptions when nonce is provided', async () => {
        const service = new GooglePayService('test', mockAnalytics, {}, 'csp-nonce-123');
        await service.paymentsClient;

        expect(Script).toHaveBeenCalledWith(
            expect.objectContaining({
                component: 'googlepay',
                attributes: {
                    nonce: 'csp-nonce-123'
                }
            })
        );

        expect(mockPaymentsClientConstructor).toHaveBeenCalledWith(
            expect.objectContaining({
                environment: 'TEST',
                nonce: 'csp-nonce-123'
            })
        );
    });

    test('should not include nonce in Script attributes or PaymentOptions when nonce is omitted', async () => {
        const service = new GooglePayService('test', mockAnalytics, {});
        await service.paymentsClient;

        expect(Script).toHaveBeenCalledWith(
            expect.not.objectContaining({
                attributes: expect.anything()
            })
        );

        expect(mockPaymentsClientConstructor).toHaveBeenCalledWith(
            expect.not.objectContaining({
                nonce: expect.anything()
            })
        );
    });
});
