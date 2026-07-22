import { renderHook } from '@testing-library/preact-hooks';
import { useCreateVaultSetupToken } from './useCreateVaultSetupToken';

describe('useCreateVaultSetupToken', () => {
    test('should return a function that calls onSubmit and wraps the result in a vaultSetupToken object', async () => {
        const onSubmit = jest.fn().mockResolvedValue('vault-token-123');

        const { result } = renderHook(() => useCreateVaultSetupToken(onSubmit));

        await expect(result.current()).resolves.toEqual({ vaultSetupToken: 'vault-token-123' });
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    test('should reject when onSubmit rejects', async () => {
        const error = new Error('submit failed');
        const onSubmit = jest.fn().mockRejectedValue(error);

        const { result } = renderHook(() => useCreateVaultSetupToken(onSubmit));

        await expect(result.current()).rejects.toThrow('submit failed');
    });
});
