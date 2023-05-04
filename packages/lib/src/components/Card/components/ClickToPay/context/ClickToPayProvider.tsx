import { h } from 'preact';
import { CtpState } from '../services/ClickToPayService';
import { ClickToPayContext } from './ClickToPayContext';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { ClickToPayCheckoutPayload, IClickToPayService, IdentityLookupParams } from '../services/types';
import { PaymentAmount } from '../../../../../types';
import ShopperCard from '../models/ShopperCard';
import { UIElementStatus } from '../../../../types';
import AdyenCheckoutError from '../../../../../core/Errors/AdyenCheckoutError';
import { ClickToPayConfiguration } from '../../../types';

type ClickToPayProviderRef = {
    setStatus?(status: UIElementStatus): void;
};

export type ClickToPayProviderProps = {
    isStandaloneComponent: boolean;
    clickToPayService: IClickToPayService | null;
    configuration: ClickToPayConfiguration;
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

    useEffect(() => {
        setClickToPayRef(clickToPayRef.current);
        clickToPayRef.current.setStatus = setStatus;
    }, []);

    useEffect(() => {
        ctpService?.subscribeOnStateChange(status => setCtpState(status));
    }, [ctpService]);

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

    return (
        <ClickToPayContext.Provider
            value={{
                status,
                onSubmit,
                onError,
                onSetStatus,
                amount,
                configuration,
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
                finishIdentityValidation
            }}
        >
            {children}
        </ClickToPayContext.Provider>
    );
};

export default ClickToPayProvider;
