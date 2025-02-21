import { useState, useEffect } from 'preact/hooks';
import { PasskeyService } from '../services/PasskeyService';

interface UsePasskeyServiceParams {
    environment: string;
    clientKey: string;
}

export function usePasskeyService({ environment, clientKey }: UsePasskeyServiceParams) {
    const [passkeyService, setPasskeyService] = useState<PasskeyService | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializePasskeyService = async () => {
            try {
                const service = new PasskeyService({ environment, clientKey });
                await service.initialize();
                setPasskeyService(service);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        void initializePasskeyService();
    }, [environment, clientKey]);

    return { passkeyService, loading, error };
}
