import { useCallback, useEffect, useState } from 'preact/hooks';
import ClickToPayService, { CtpState, IClickToPayService } from './ClickToPayService';
import { InitiateIdentityValidationResponse } from './types';
import SrcSdkLoader from './sdks/SrcSdkLoader';
import { configMock, SecureRemoteCommerceInitResult } from './configMock';

interface IUseClickToPay {
    schemas: Array<string>;
    environment: string;
    ctpService: IClickToPayService;
    schemasConfig?: Record<string, SecureRemoteCommerceInitResult>; // TODO: optional?
    shopperIdentity?: { value: string; type: string };
}

const useClickToPay = ({ ctpService, schemas, shopperIdentity, environment /*schemasConfig = configMock  */ }: IUseClickToPay) => {
    const [state, setState] = useState<CtpState>(ctpService.state);
    const [ctp, setCtpService] = useState<IClickToPayService>(ctpService);

    useEffect(() => {
        // const srcSdkLoader = new SrcSdkLoader(schemas, environment);
        // // TOOD: pass configuration from config object
        // const ctp = new ClickToPayService(schemasConfig, srcSdkLoader, shopperIdentity);
        ctp.subscribeOnStatusChange(setState);

        if (ctp.state === CtpState.Idle) {
            ctp.initialize().then();
        }
        // setCtpService(ctp);
    }, [ctp, schemas, environment, shopperIdentity]);

    const onStartIdentityValidation = useCallback(async (): Promise<InitiateIdentityValidationResponse> => {
        return await ctp.startIdentityValidation();
    }, [ctp]);

    const onCancelIdentityValidation = useCallback(() => {
        ctp.abortIdentityValidation();
    }, [ctp]);

    const onFinishIdentityValidation = useCallback(
        async (value: string) => {
            try {
                await ctp.finishIdentityValidation(value);
            } catch (error) {
                console.log(error);
            }
        },
        [ctp]
    );

    const onCheckout = useCallback(
        async (srcDigitalCardId: string) => {
            try {
                const payload = await ctp.checkout(srcDigitalCardId);
                console.log(payload);
            } catch (error) {
                console.log(error);
            }
        },
        [ctp]
    );

    return {
        status: state,
        cards: ctp?.maskedCards,
        doCheckout: onCheckout,
        startIdentityValidation: onStartIdentityValidation,
        cancelIdentityValidation: onCancelIdentityValidation,
        finishIdentityValidation: onFinishIdentityValidation
    };
};

export default useClickToPay;
