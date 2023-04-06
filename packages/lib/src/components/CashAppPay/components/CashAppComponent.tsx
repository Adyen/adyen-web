import { h, RefObject } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { UIElementStatus } from '../../types';
import Spinner from '../../internal/Spinner';
import { CashAppPayEvents, ICashAppService } from '../services/types';
import { CashAppPayEventData } from '../types';
import StoreDetails from '../../internal/StoreDetails';
import './CashAppComponent.scss';

interface CashAppComponentProps {
    enableStoreDetails?: boolean;
    cashAppService: ICashAppService;
    showPayButton: boolean;
    onClick(): void;
    onChange(data: any): void;
    onAuthorize(payEventData: CashAppPayEventData): void;
    onError(error: AdyenCheckoutError): void;
    ref(ref: RefObject<typeof CashAppComponent>): void;
}

const CashAppComponent = ({ enableStoreDetails, cashAppService, showPayButton, onClick, onChange, onAuthorize, onError }: CashAppComponentProps) => {
    const cashAppRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<UIElementStatus>('loading');
    const subscriptions = useRef<Function[]>([]);
    const [storePaymentMethod, setStorePaymentMethod] = useState<boolean>(false);

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

                cashAppService.subscribeToEvent(CashAppPayEvents.CustomerRequestApproved, ({ customerProfile, grants }) => {
                    const cashAppPaymentData: CashAppPayEventData = {
                        ...(customerProfile?.id && { customerId: customerProfile.id }),
                        ...(customerProfile?.cashtag && { cashTag: customerProfile.cashtag }),
                        ...(grants?.payment?.grantId && { grantId: grants.payment.grantId }),
                        ...(grants?.onFile?.grantId && { onFileGrantId: grants.onFile.grantId })
                    };

                    console.log(cashAppPaymentData);

                    onAuthorize(cashAppPaymentData);
                }),
                cashAppService.subscribeToEvent(CashAppPayEvents.CustomerRequestFailed, () => {
                    onError(new AdyenCheckoutError('ERROR', 'Customer request failed'));
                })
            ];

            // await cashAppService.createCustomerRequest();
            await cashAppService.renderButton(cashAppRef.current);

            setStatus('ready');
        } catch (error) {
            onError(error);
        }
    }, [cashAppService, onError, onAuthorize]);

    useEffect(() => {
        if (enableStoreDetails) {
            cashAppService.setStorePaymentMethod(storePaymentMethod);
            onChange({ shopperWantsToStore: storePaymentMethod });
        }
    }, [enableStoreDetails, storePaymentMethod]);

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
        <div className="adyen-checkout__cashapp">
            {status === 'loading' && showPayButton && <Spinner />}
            {status !== 'loading' && enableStoreDetails && <StoreDetails storeDetails={storePaymentMethod} onChange={setStorePaymentMethod} />}
            <div onClick={onClick} id="adyen-checkout__cashapp-placeholder" ref={cashAppRef} />
        </div>
    );
};

export { CashAppComponent };
