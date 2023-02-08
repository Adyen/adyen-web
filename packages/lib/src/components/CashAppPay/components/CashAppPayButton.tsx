import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { ICashAppService } from '../services/CashAppService';

interface CashAppComponentProps {
    cashAppService: ICashAppService;
}

const CashAppPayButton = ({ cashAppService }: CashAppComponentProps) => {
    const cashAppRef = useRef<HTMLDivElement>(null);
    // const [status, setStatus] = useState('loading');
    //
    // const handleCustomerRequestApproved = useCallback(({ customerProfile, grants, referenceId }) => {
    //     onSubmit(...)
    // });

    // subscribeForCustomerInteraction();
    // subscribeForCustomerDismissed();
    // subscribeForCustomerRequestApproved();
    // subscribeForCustomerRequestDeclined();
    // subscribeForCustomerRequestFailed();

    const initializeCashAppSdk = useCallback(async () => {
        await cashAppService.initialize(cashAppRef.current);
    }, []);

    useEffect(() => {
        initializeCashAppSdk();
        // cashAppPayService.subscribeForCustomerRequestApproved(handleCustomerRequestApproved);
        // ...

        // setStatus('ready');

        return () => {
            cashAppService.restart();
        };
    }, [cashAppService, initializeCashAppSdk]);

    return <div id="adyen-checkout__cashapp-button" ref={cashAppRef} />;
};

export { CashAppPayButton };
