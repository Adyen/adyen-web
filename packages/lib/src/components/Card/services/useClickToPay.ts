import { useCallback, useEffect, useState } from 'preact/hooks';
import ClickToPayService, { CtpState } from './ClickToPayService';
import { InitiateIdentityValidationResponse } from './types';
import SrcSdkLoader from './sdks/SrcSdkLoader';
import { configMock, SecureRemoteCommerceInitResult } from './configMock';

interface IUseClickToPay {
    schemas: Array<string>;
    environment: string;
    schemasConfig?: Record<string, SecureRemoteCommerceInitResult>; // TODO: optional?
    shopperIdentity?: { value: string; type: string };
}

const useClickToPay = ({ schemas, shopperIdentity, environment, schemasConfig = configMock }: IUseClickToPay) => {
    const [status, setStatus] = useState<CtpState>(CtpState.Idle);
    const [ctpService, setCtpService] = useState<ClickToPayService>(null);

    useEffect(() => {
        const srcSdkLoader = new SrcSdkLoader(schemas, environment);
        // TOOD: pass configuration from config object
        const ctp = new ClickToPayService(schemasConfig, srcSdkLoader, shopperIdentity);

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
