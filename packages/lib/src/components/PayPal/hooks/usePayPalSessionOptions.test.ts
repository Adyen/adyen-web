import { renderHook } from '@testing-library/preact-hooks';
import { mock } from 'jest-mock-extended';
import { usePayPalSessionOptions } from './usePayPalSessionOptions';
import type { PayPalService } from '../services/PayPalService';

describe('usePayPalSessionOptions', () => {
    const createParams = () => ({
        paypalService: mock<PayPalService>(),
        onApprove: jest.fn(),
        onShippingAddressChange: jest.fn(),
        onShippingOptionsChange: jest.fn(),
        onCancel: jest.fn(),
        onError: jest.fn(),
        commit: true,
        vault: true
    });

    test('should build the one-time session options from the provided callbacks', () => {
        const params = createParams();

        const { result } = renderHook(() => usePayPalSessionOptions(params));

        expect(result.current?.oneTimeSessionOptions).toEqual({
            onApprove: params.onApprove,
            onShippingAddressChange: params.onShippingAddressChange,
            onShippingOptionsChange: params.onShippingOptionsChange,
            onCancel: params.onCancel,
            onError: params.onError,
            commit: true,
            savePayment: true
        });
    });

    test('should build the save session options with only approve, cancel and error callbacks', () => {
        const params = createParams();

        const { result } = renderHook(() => usePayPalSessionOptions(params));

        expect(result.current?.saveSessionOptions).toEqual({
            onApprove: params.onApprove,
            onCancel: params.onCancel,
            onError: params.onError
        });
    });

    test('should map vault to savePayment in one-time session options', () => {
        const params = { ...createParams(), vault: false };

        const { result } = renderHook(() => usePayPalSessionOptions(params));

        expect(result.current?.oneTimeSessionOptions.savePayment).toBe(false);
    });
});
