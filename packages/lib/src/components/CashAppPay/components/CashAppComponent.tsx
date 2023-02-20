import { h, RefObject } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { UIElementStatus } from '../../types';
import Spinner from '../../internal/Spinner';
import { CashAppPayEvents, ICashAppService } from '../services/types';

interface CashAppComponentProps {
    cashAppService: ICashAppService;
    onSubmit(grantId: string): void;
    onError(error: AdyenCheckoutError): void;
    ref(ref: RefObject<typeof CashAppComponent>): void;
}

const CashAppComponent = ({ cashAppService, onSubmit, onError }: CashAppComponentProps) => {
    const cashAppRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<UIElementStatus>('loading');
    const subscriptions = useRef<Function[]>([]);

    const initializeCashAppSdk = useCallback(async () => {
        try {
            await cashAppService.initialize();

            subscriptions.current = [
                cashAppService.subscribeToEvent(CashAppPayEvents.CustomerDismissed, () => {
                    onError(new AdyenCheckoutError('CANCEL', 'Customer dismissed the modal'));
                }),
                cashAppService.subscribeToEvent(CashAppPayEvents.CustomerRequestDeclined, async () => {
                    onError(new AdyenCheckoutError('ERROR', 'Payment declined by CashAppPay'));
                    await cashAppService.restart();
                    await cashAppService.createCustomerRequest();
                    await cashAppService.renderButton(cashAppRef.current);
                }),

                cashAppService.subscribeToEvent(CashAppPayEvents.CustomerRequestApproved, ({ grants }) => {
                    onSubmit(grants.payment.grantId);
                }),
                cashAppService.subscribeToEvent(CashAppPayEvents.CustomerRequestFailed, () => {
                    onError(new AdyenCheckoutError('ERROR', 'Customer request failed'));
                })
            ];

            await cashAppService.createCustomerRequest();
            await cashAppService.renderButton(cashAppRef.current);

            setStatus('ready');
        } catch (error) {
            onError(error);
        }
    }, [cashAppService, onError, onSubmit]);

    useEffect(() => {
        console.log('CashApp started');
        initializeCashAppSdk();
        return () => {
            cashAppService.restart();
            subscriptions.current.map(unsubscribeFn => unsubscribeFn());

            console.log('subscriptions count:', subscriptions.current.length);
            console.log('CashApp Effect cleanup');
        };
    }, [cashAppService, initializeCashAppSdk]);

    return (
        <div id="adyen-checkout__cashapp-button" ref={cashAppRef}>
            {status === 'loading' && <Spinner />}
        </div>
    );
};

export { CashAppComponent };
