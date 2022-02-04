import { useCallback, useEffect, useState } from 'preact/hooks';
import ClickToPayService, { CtpState } from './ClickToPayService';
import { InitiateIdentityValidationResponse } from './types';

interface IUseClickToPay {
    schemas: Array<string>;
    environment: string;
    shopperIdentity?: { value: string; type: string };
}

const useClickToPay = ({ schemas, shopperIdentity, environment }: IUseClickToPay) => {
    const [status, setStatus] = useState<CtpState>(CtpState.Idle);
    const [ctpService, setCtpService] = useState<ClickToPayService>(null);

    useEffect(() => {
        const ctp = new ClickToPayService(schemas, environment, shopperIdentity);
        ctp.subscribeOnStatusChange(setStatus);
        ctp.initialize().then();

        setCtpService(ctp);
    }, [schemas, environment, shopperIdentity]);

    const onStartIdentityValidation = useCallback(async (): Promise<InitiateIdentityValidationResponse> => {
        return await ctpService.startIdentityValidation();
    }, [ctpService]);

    const onCancelIdentityValidation = useCallback(() => {
        ctpService.abortIdentityValidation();
    }, [ctpService]);

    const onFinishIdentityValidation = useCallback(
        async (value: string) => {
            try {
                await ctpService.finishIdentityValidation(value);
            } catch (error) {
                console.log(error);
            }
        },
        [ctpService]
    );

    const onCheckout = useCallback(
        async (srcDigitalCardId: string) => {
            try {
                const payload = await ctpService.checkout(srcDigitalCardId);
                console.log(payload);
            } catch (error) {
                console.log(error);
            }
        },
        [ctpService]
    );

    return {
        status,
        cards: ctpService?.maskedCards,
        doCheckout: onCheckout,
        startIdentityValidation: onStartIdentityValidation,
        cancelIdentityValidation: onCancelIdentityValidation,
        finishIdentityValidation: onFinishIdentityValidation
    };
};

export default useClickToPay;
