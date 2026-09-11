import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import { ComponentMethodsRef } from '../../types';
import { PayPalService } from '../services/PayPalService';
import { PayPalV6OnApproveData } from '../paypal-js-types';

export const usePayPalStatus = ({
    paypalService,
    onApprove,
    setComponentRef
}: {
    paypalService: PayPalService;
    onApprove: (data: PayPalV6OnApproveData) => Promise<void>;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}) => {
    const [status, setStatus] = useState('pending');

    const componentRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus
    });

    useEffect(() => {
        setComponentRef(componentRef.current);
    }, [setComponentRef]);

    useEffect(() => {
        paypalService
            .isSdkLoaded()
            .then(() => {
                setStatus('ready');
            })
            .catch(() => {
                // SDK failed to load, but we don't need to handle it here
            });
    }, [paypalService]);

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
