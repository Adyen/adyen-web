import { h } from 'preact';
import { CtpState } from '../../../services/ClickToPayService';
import { ClickToPayContext } from './ClickToPayContext';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { IClickToPayService, ShopperCard } from '../../../services/types';

type ClickToPayProviderProps = {
    clickToPayService: IClickToPayService | null;
    children: any;
};

const ClickToPayProvider = ({ clickToPayService, children }: ClickToPayProviderProps) => {
    const [ctpService] = useState<IClickToPayService | null>(clickToPayService);
    const [ctpState, setCtpState] = useState<CtpState>(clickToPayService?.state || CtpState.NotAvailable);

    useEffect(() => {
        ctpService?.subscribeOnStateChange(status => setCtpState(status));
    }, [ctpService]);

    const handleFinishIdentityValidation = useCallback(
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

    return (
        <ClickToPayContext.Provider
            value={{
                ctpState,
                cards: ctpService?.shopperCards,
                otpMaskedContact: ctpService?.shopperValidationContact,
                checkout: checkout,
                startIdentityValidation: startIdentityValidation,
                finishIdentityValidation: handleFinishIdentityValidation
            }}
        >
            {children}
        </ClickToPayContext.Provider>
    );
};

export default ClickToPayProvider;
