import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import Spinner from '../../../internal/Spinner';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useAmount } from '../../../../core/Context/AmountProvider';
import { loadKlarnaSdk } from '../../utils/load-klarna-sdk';
import './KlarnaNetworkContainer.scss';

import type {
    KlarnaInitiateParams,
    KlarnaInitiateResult,
    KlarnaPayment,
    KlarnaPaymentError,
    KlarnaPaymentOption,
    KlarnaShippingAddressChangeHandler,
    KlarnaShippingOptionSelectHandler,
    KlarnaUIElement
} from '../../klarna-web-sdk-types';

export interface KlarnaNetworkAuthorizeResult {
    paymentRequestId?: string;
}

export interface KlarnaNetworkContainerProps {
    onAuthorize(params: KlarnaInitiateParams): Promise<KlarnaNetworkAuthorizeResult>;
    onError(error: AdyenCheckoutError): void;
    onKlarnaError(error: KlarnaPaymentError | Error, paymentRequest?: unknown): void;
    onShippingAddressChange?: KlarnaShippingAddressChangeHandler;
    onShippingOptionSelect?: KlarnaShippingOptionSelectHandler;

    clientId: string;
    partnerAccountId?: string;
    paymentAccountId?: string;
}

export function KlarnaNetworkContainer({
    onAuthorize,
    onError,
    onKlarnaError,
    onShippingAddressChange,
    onShippingOptionSelect,
    clientId,
    partnerAccountId,
    paymentAccountId
}: Readonly<KlarnaNetworkContainerProps>) {
    const { i18n } = useCoreContext();
    const { amount } = useAmount();
    const currency = amount?.currency;
    const value = amount?.value;

    const [isLoading, setIsLoading] = useState(true);
    const [paymentOption, setPaymentOption] = useState<KlarnaPaymentOption | null>(null);

    const messageContainerRef = useRef<HTMLDivElement>(null);
    const buttonContainerRef = useRef<HTMLDivElement>(null);

    const initiate = useCallback(
        async (params: KlarnaInitiateParams): Promise<KlarnaInitiateResult> => {
            const { paymentRequestId } = await onAuthorize(params);

            if (!paymentRequestId) throw new Error('/payments did not return action.sdkData.paymentRequestId');

            return { paymentRequestId };
        },
        [onAuthorize]
    );

    useEffect(() => {
        let isActive = true;
        let payment: KlarnaPayment | undefined;

        const setUpKlarna = async () => {
            if (!currency) throw new Error('a valid amount with a currency is required');

            const klarna = await loadKlarnaSdk({
                clientId,
                products: ['PAYMENT'],
                partnerAccountId,
                ...(paymentAccountId && { acquiringConfig: { paymentAccountId } }),
                locale: i18n.locale
            });

            if (!isActive) return;

            payment = klarna.Payment;
            console.log('Klarna SDK initialised available klarna props', klarna);
            console.info('Klarna SDK initialised available props in payment', {
                payment
            });
            payment.on('error', onKlarnaError);
            if (onShippingAddressChange) payment.on('shippingaddresschange', onShippingAddressChange);
            if (onShippingOptionSelect) payment.on('shippingoptionselect', onShippingOptionSelect);

            const presentation = await payment.presentation({
                amount: value,
                currency,
                locale: i18n.locale,
                intent: 'PAY'
            });

            if (!isActive) return;

            setPaymentOption(presentation?.paymentOption ?? null);
            setIsLoading(false);
        };

        void setUpKlarna().catch((error: unknown) => {
            if (!isActive) return;
            setIsLoading(false);
            onError(new AdyenCheckoutError('ERROR', 'failed to initialise Klarna', { cause: error }));
        });

        return () => {
            isActive = false;
            payment?.off('error', onKlarnaError);
            if (onShippingAddressChange) payment?.off('shippingaddresschange', onShippingAddressChange);
            if (onShippingOptionSelect) payment?.off('shippingoptionselect', onShippingOptionSelect);
        };
    }, [clientId, partnerAccountId, paymentAccountId, value, currency]);

    useEffect(() => {
        if (!paymentOption) return;

        const mountedElements: KlarnaUIElement[] = [];

        if (paymentOption.message && messageContainerRef.current) {
            mountedElements.push(paymentOption.message.component().mount(messageContainerRef.current));
        }

        if (buttonContainerRef.current) {
            const button = paymentOption.paymentButton.component({ intent: 'PAY', initiate });
            mountedElements.push(button.mount(buttonContainerRef.current));
        }

        return () => mountedElements.forEach(element => element.unmount());
    }, [paymentOption, initiate]);

    if (isLoading) {
        return (
            <div className="adyen-checkout__klarna-network" aria-live="polite" aria-busy="true">
                <Spinner />
            </div>
        );
    }

    if (!paymentOption) return null;

    return (
        <div className="adyen-checkout__klarna-network">
            <div className="adyen-checkout__klarna-network__message" ref={messageContainerRef} />
            <div className="adyen-checkout__klarna-network__button" ref={buttonContainerRef} />
        </div>
    );
}

export default KlarnaNetworkContainer;
