import { useCallback } from 'preact/hooks';

export const useCreateVaultSetupToken = (onSubmit: () => Promise<string>) => {
    const createVaultSetupToken = useCallback(async () => {
        const vaultSetupToken = await onSubmit();
        return { vaultSetupToken };
    }, [onSubmit]);

    return createVaultSetupToken;
};
