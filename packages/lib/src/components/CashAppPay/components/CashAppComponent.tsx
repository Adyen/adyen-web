import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { ICashAppService } from '../services/CashAppService';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { UIElementStatus } from '../../types';
import Spinner from '../../internal/Spinner';
import { CashAppPayEvents } from '../services/types';

interface CashAppComponentProps {
    cashAppService: ICashAppService;
    onSubmit(grantId: string): void;
    onError(error: AdyenCheckoutError): void;
}

const CashAppComponent = ({ cashAppService, onSubmit, onError }: CashAppComponentProps) => {
    const cashAppRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<UIElementStatus>('loading');

    const initializeCashAppSdk = useCallback(async () => {
        try {
            await cashAppService.initialize();

            cashAppService.subscribeToEvent(CashAppPayEvents.CustomerDismissed, () => {
                onError(new AdyenCheckoutError('CANCEL', 'Customer dismissed the modal'));
            });
            cashAppService.subscribeToEvent(CashAppPayEvents.CustomerRequestDeclined, async () => {
                onError(new AdyenCheckoutError('ERROR', 'Payment declined by CashAppPay'));
                await cashAppService.restart();
                await cashAppService.createCustomerRequest();
                await cashAppService.renderButton(cashAppRef.current);
            });

            cashAppService.subscribeToEvent(CashAppPayEvents.CustomerRequestApproved, ({ grants }) => {
                onSubmit(grants.payment.grantId);
            });

            cashAppService.subscribeToEvent(CashAppPayEvents.CustomerRequestFailed, () => {
                onError(new AdyenCheckoutError('ERROR', 'Customer request failed'));
            });

            await cashAppService.createCustomerRequest();
            await cashAppService.renderButton(cashAppRef.current);

            setStatus('ready');
        } catch (error) {
            onError(error);
        }
    }, []);

    useEffect(() => {
        initializeCashAppSdk();
        return () => {
            console.log('restart');
            cashAppService.restart();
        };
    }, [cashAppService, initializeCashAppSdk]);

    return (
        <div id="adyen-checkout__cashapp-button" ref={cashAppRef}>
            {status === 'loading' && <Spinner />}
        </div>
    );
};

export { CashAppComponent };
