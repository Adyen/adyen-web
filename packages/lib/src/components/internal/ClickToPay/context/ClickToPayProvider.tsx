import { h } from 'preact';
import { CtpState } from '../services/ClickToPayService';
import { ClickToPayContext } from './ClickToPayContext';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { ClickToPayCheckoutPayload, IClickToPayService, IdentityLookupParams } from '../services/types';
import ShopperCard from '../models/ShopperCard';
import { ClickToPayProps } from '../types';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import { PaymentAmount } from '../../../../types/global-types';
import { UIElementStatus } from '../../UIElement/types';

type ClickToPayProviderRef = {
    setStatus?(status: UIElementStatus): void;
};

export type ClickToPayProviderProps = {
    isStandaloneComponent: boolean;
    clickToPayService: IClickToPayService | null;
    configuration: ClickToPayProps;
    amount: PaymentAmount;
    children: any;
    setClickToPayRef(ref): void;
    onSubmit(payload: ClickToPayCheckoutPayload): void;
    onSetStatus(status: UIElementStatus): void;
    onError(error: AdyenCheckoutError): void;
};

const ClickToPayProvider = ({
    isStandaloneComponent = false,
    clickToPayService,
    amount,
    configuration,
    children,
    setClickToPayRef,
    onSubmit,
    onSetStatus,
    onError
}: ClickToPayProviderProps) => {
    const [ctpService] = useState<IClickToPayService | null>(clickToPayService);
    const [ctpState, setCtpState] = useState<CtpState>(clickToPayService?.state || CtpState.NotAvailable);
    const [isCtpPrimaryPaymentMethod, setIsCtpPrimaryPaymentMethod] = useState<boolean>(true);
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const clickToPayRef = useRef<ClickToPayProviderRef>({});
    const isOnReadyInvoked = useRef<boolean>(false);

    useEffect(() => {
        setClickToPayRef(clickToPayRef.current);
        clickToPayRef.current.setStatus = setStatus;
    }, []);

    useEffect(() => {
        ctpService?.subscribeOnStateChange(status => setCtpState(status));
    }, [ctpService]);

    const onReady = useCallback(() => {
        if (isOnReadyInvoked.current) {
            return;
        }
        configuration.onReady?.();
        isOnReadyInvoked.current = true;
    }, [configuration?.onReady]);

    const finishIdentityValidation = useCallback(
        async (otpValue: string) => {
            await ctpService?.finishIdentityValidation(otpValue);
        },
        [ctpService]
    );

    const startIdentityValidation = useCallback(async () => {
        const data = await ctpService?.startIdentityValidation();
        return data;
    }, [ctpService]);

    const checkout = useCallback(
        async (card: ShopperCard) => {
            return await ctpService?.checkout(card);
        },
        [ctpService]
    );

    const verifyIfShopperIsEnrolled = useCallback(
        async (shopperIdentity: IdentityLookupParams) => {
            return await ctpService?.verifyIfShopperIsEnrolled(shopperIdentity);
        },
        [ctpService]
    );

    const logoutShopper = useCallback(async () => {
        await ctpService?.logout();
    }, [ctpService]);

    const updateStoreCookiesConsent = useCallback(
        (shouldStore: boolean) => {
            ctpService.updateStoreCookiesConsent(shouldStore);
        },
        [ctpService]
    );

    return (
        <ClickToPayContext.Provider
            value={{
                status,
                onSubmit,
                onError,
                onSetStatus,
                amount,
                configuration,
                isStoringCookies: ctpService?.storeCookies,
                isStandaloneComponent,
                isCtpPrimaryPaymentMethod,
                setIsCtpPrimaryPaymentMethod,
                ctpState,
                verifyIfShopperIsEnrolled,
                cards: ctpService?.shopperCards,
                schemes: ctpService?.schemes,
                otpMaskedContact: ctpService?.identityValidationData?.maskedShopperContact,
                otpNetwork: ctpService?.identityValidationData?.selectedNetwork,
                checkout,
                logoutShopper,
                startIdentityValidation,
                finishIdentityValidation,
                updateStoreCookiesConsent,
                onReady
            }}
        >
            {children}
        </ClickToPayContext.Provider>
    );
};

export default ClickToPayProvider;
