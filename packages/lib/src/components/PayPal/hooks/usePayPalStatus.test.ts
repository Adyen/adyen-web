import { renderHook } from '@testing-library/preact-hooks';
import { act, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import { usePayPalStatus } from './usePayPalStatus';
import type { PayPalService } from '../services/PayPalService';
import type { PayPalV6OnApproveData } from '../paypal-js-types';

const createParams = ({
    isFundingSourceEligibilityReady = Promise.resolve(undefined),
    isSdkLoaded = Promise.resolve(undefined),
    onApprove = jest.fn().mockResolvedValue(undefined),
    waitForEligibility
}: { isFundingSourceEligibilityReady?: Promise<void>; isSdkLoaded?: Promise<void>; onApprove?: jest.Mock; waitForEligibility?: boolean } = {}) => {
    const paypalService = mock<PayPalService>();
    paypalService.isFundingSourceEligibilityReady.mockReturnValue(isFundingSourceEligibilityReady);
    paypalService.isSdkLoaded.mockReturnValue(isSdkLoaded);

    return {
        paypalService,
        onApprove,
        setComponentRef: jest.fn(),
        waitForEligibility
    };
};

describe('usePayPalStatus', () => {
    test('should start in the pending status while the eligible payment methods are being checked', () => {
        // Never resolves, so the hook stays in the pending state
        const params = createParams({ isFundingSourceEligibilityReady: new Promise<void>(() => {}) });

        const { result } = renderHook(() => usePayPalStatus(params));

        expect(result.current?.status).toBe('pending');
    });

    test('should move to the ready status once the eligible payment methods are checked', async () => {
        const params = createParams();

        const { result } = renderHook(() => usePayPalStatus(params));

        await waitFor(() => expect(result.current?.status).toBe('ready'));
        expect(params.paypalService.isSdkLoaded).not.toHaveBeenCalled();
    });

    test('should stay in the pending status when the eligibility check fails', async () => {
        const params = createParams({ isFundingSourceEligibilityReady: Promise.reject(new Error('PayPal eligible payment methods not checked')) });

        const { result } = renderHook(() => usePayPalStatus(params));

        await waitFor(() => expect(params.paypalService.isFundingSourceEligibilityReady).toHaveBeenCalled());
        expect(result.current?.status).toBe('pending');
    });

    test('should move to the ready status once the SDK is loaded when not waiting for the eligibility check', async () => {
        const params = createParams({ isFundingSourceEligibilityReady: new Promise<void>(() => {}), waitForEligibility: false });

        const { result } = renderHook(() => usePayPalStatus(params));

        await waitFor(() => expect(result.current?.status).toBe('ready'));
        expect(params.paypalService.isFundingSourceEligibilityReady).not.toHaveBeenCalled();
    });

    test('should stay in the pending status when the SDK fails to load and not waiting for the eligibility check', async () => {
        const params = createParams({ isSdkLoaded: Promise.reject(new Error('PayPal SDK not loaded')), waitForEligibility: false });

        const { result } = renderHook(() => usePayPalStatus(params));

        await waitFor(() => expect(params.paypalService.isSdkLoaded).toHaveBeenCalled());
        expect(result.current?.status).toBe('pending');
    });

    test('should ignore the ready promise of a previous paypalService', async () => {
        let resolvePrevious: () => void = () => {};
        const previousParams = createParams({
            isFundingSourceEligibilityReady: new Promise<void>(resolve => {
                resolvePrevious = resolve;
            })
        });
        const nextParams = createParams({ isFundingSourceEligibilityReady: new Promise<void>(() => {}) });

        let params = previousParams;
        const { result, rerender } = renderHook(() => usePayPalStatus(params));
        params = nextParams;
        rerender();

        await act(async () => {
            resolvePrevious();
            await Promise.resolve();
        });

        expect(result.current?.status).toBe('pending');
    });

    test('should expose a component ref holding the status setter', () => {
        const params = createParams();

        renderHook(() => usePayPalStatus(params));

        expect(params.setComponentRef).toHaveBeenCalledTimes(1);
        expect(params.setComponentRef).toHaveBeenCalledWith(expect.objectContaining({ setStatus: expect.any(Function) }));
    });

    test('should let the component ref drive the status', async () => {
        const params = createParams();

        const { result } = renderHook(() => usePayPalStatus(params));

        await waitFor(() => expect(result.current?.status).toBe('ready'));

        const componentRef = params.setComponentRef.mock.calls[0][0];
        void act(() => {
            componentRef.setStatus('processing');
        });

        expect(result.current?.status).toBe('processing');
    });

    test('should switch to the processing status and forward the data when the payment is approved', async () => {
        const onApprove = jest.fn().mockResolvedValue(undefined);
        const params = createParams({ onApprove });
        const approveData = { orderId: 'order-1' } as PayPalV6OnApproveData;

        const { result } = renderHook(() => usePayPalStatus(params));

        await waitFor(() => expect(result.current?.status).toBe('ready'));

        await act(async () => {
            await result.current?.handleOnApprove(approveData);
        });

        expect(onApprove).toHaveBeenCalledWith(approveData);
        expect(result.current?.status).toBe('processing');
    });

    test('should resolve handleOnApprove without waiting for the onApprove callback', async () => {
        // The session start() call must not be blocked by the merchant flow, so handleOnApprove resolves immediately
        const onApprove = jest.fn().mockReturnValue(new Promise(() => {}));
        const params = createParams({ onApprove });

        const { result } = renderHook(() => usePayPalStatus(params));

        await waitFor(() => expect(result.current?.status).toBe('ready'));

        await expect(result.current?.handleOnApprove({ orderId: 'order-1', fundingSource: 'paypal' })).resolves.toBeUndefined();
    });
});
