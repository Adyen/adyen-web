import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import { ComponentMethodsRef } from '../../types';
import { PayPalService } from '../services/PayPalService';
import { PayPalV6OnApproveData } from '../paypal-js-types';
import { PayPalUIElementStatus } from '../components/types';

export const usePayPalStatus = ({
    paypalService,
    onApprove,
    setComponentRef,
    waitForEligibility = true
}: {
    paypalService: PayPalService;
    onApprove: (data: PayPalV6OnApproveData) => Promise<void>;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    /**
     * When 'false', the status becomes 'ready' as soon as the SDK instance is created, without waiting for the
     * eligible payment methods check
     */
    waitForEligibility?: boolean;
}) => {
    const [status, setStatus] = useState<PayPalUIElementStatus>('pending');

    const componentRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus
    });

    useEffect(() => {
        setComponentRef(componentRef.current);
    }, [setComponentRef]);

    useEffect(() => {
        let isCurrent = true;
        const readyPromise = waitForEligibility ? paypalService.isFundingSourceEligibilityReady() : paypalService.isSdkLoaded();

        readyPromise
            .then(() => {
                if (isCurrent) {
                    setStatus('ready');
                }
            })
            .catch(() => {
                // SDK failed to load, but we don't need to handle it here
            });

        return () => {
            isCurrent = false;
        };
    }, [paypalService, waitForEligibility]);

    const handleOnApprove = useCallback(
        (data: PayPalV6OnApproveData) => {
            setStatus('processing');
            void onApprove(data);
            return Promise.resolve();
        },
        [onApprove]
    );

    return {
        status,
        handleOnApprove
    };
};
