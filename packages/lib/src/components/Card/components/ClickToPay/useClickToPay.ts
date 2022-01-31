import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import ClickToPayService, { Status } from '../../../internal/ClickToPay/ClickToPayService';

interface IUseClickToPay {
    schemas: Array<string>;
    shopperIdentity?: { value: string; type: string };
}

const useClickToPay = ({ schemas, shopperIdentity }: IUseClickToPay) => {
    const [status, setStatus] = useState<Status>(Status.Idle);
    const clickToPayService = useRef<ClickToPayService>(new ClickToPayService(schemas, shopperIdentity));

    const initClickToPay = useCallback(async () => {
        clickToPayService.current.subscribeOnStatusChange(setStatus);
        await clickToPayService.current.initialize();
    }, [schemas]);

    useEffect(() => {
        initClickToPay();
        return () => {
            // does not run
            clickToPayService.current.removeSdks();
        };
    }, [initClickToPay]);

    return {
        status
    };
};

export default useClickToPay;
