import { h } from 'preact';
import { CtpState, IClickToPayService } from '../../../services/ClickToPayService';
import { ClickToPayContext } from './ClickToPayContext';
import { useCallback, useEffect, useState } from 'preact/hooks';

type ClickToPayProviderProps = {
    clickToPayService: IClickToPayService | null;
    children: any;
};

const ClickToPayProvider = ({ clickToPayService, children }: ClickToPayProviderProps) => {
    const [ctpService] = useState<IClickToPayService | null>(clickToPayService);
    const [ctpState, setCtpState] = useState<CtpState>(clickToPayService?.state || CtpState.NotAvailable);

    useEffect(() => {
        ctpService?.subscribeOnStatusChange(status => setCtpState(status));
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

    return (
        <ClickToPayContext.Provider
            value={{
                ctpState: ctpState,
                cards: ctpService?.maskedCards,
                otpMaskedContact: ctpService?.maskedShopperContact,
                startIdentityValidation: startIdentityValidation,
                finishIdentityValidation: handleFinishIdentityValidation
            }}
        >
            <ClickToPayContext.Consumer>{children}</ClickToPayContext.Consumer>
        </ClickToPayContext.Provider>
    );
};

export default ClickToPayProvider;
