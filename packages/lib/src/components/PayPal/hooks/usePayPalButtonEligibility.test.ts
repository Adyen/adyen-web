import { renderHook } from '@testing-library/preact-hooks';
import { waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { usePayPalButtonEligibility } from './usePayPalButtonEligibility';
import type { PayPalService } from '../services/PayPalService';
import type { PayPalEligiblePaymentMethods } from '../paypal-js-types';

describe('usePayPalButtonEligibility', () => {
    const createService = (isEligible: boolean) => {
        const isEligibleMock = jest.fn().mockReturnValue(isEligible);
        const service = mock<PayPalService>();
        service.getEligiblePaymentMethods.mockReturnValue({ isEligible: isEligibleMock } as unknown as PayPalEligiblePaymentMethods);
        return { service, isEligibleMock };
    };

    test('should return isEligible true when the funding source is eligible', async () => {
        const { service, isEligibleMock } = createService(true);

        const { result } = renderHook(() => usePayPalButtonEligibility(service, 'paypal'));

        await waitFor(() => expect(result.current?.isEligible).toBe(true));
        expect(isEligibleMock).toHaveBeenCalledWith('paypal');
    });

    test('should keep isEligible false when the funding source is not eligible', async () => {
        const { service, isEligibleMock } = createService(false);

        const { result } = renderHook(() => usePayPalButtonEligibility(service, 'venmo'));

        await waitFor(() => expect(isEligibleMock).toHaveBeenCalledWith('venmo'));
        expect(result.current?.isEligible).toBe(false);
    });
});
