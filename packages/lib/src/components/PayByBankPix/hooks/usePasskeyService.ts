import { useState, useEffect } from 'preact/hooks';
import { PasskeyService } from '../services/PasskeyService';

interface UsePasskeyServiceParams {
    environment: string;
    deviceId?: string;
}

export function usePasskeyService({ environment, deviceId }: UsePasskeyServiceParams) {
    const [passkeyService, setPasskeyService] = useState<PasskeyService | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializePasskeyService = async () => {
            try {
                const service = await new PasskeyService({ environment, deviceId }).initialize();
                setPasskeyService(service);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        void initializePasskeyService();
    }, [environment, deviceId]);

    return { passkeyService, loading, error };
}
