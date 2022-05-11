import { h } from 'preact';
import ClickToPayService, { CtpState } from '../../../services/ClickToPayService';
import SrcSdkLoader from '../../../services/sdks/SrcSdkLoader';
import { ClickToPayContext } from './ClickToPayContext';
import { useCallback, useEffect, useState } from 'preact/hooks';

type ClickToPayProviderProps = {
    configuration: any;
    environment: string;
    children: any;
};

const ClickToPayProvider = (props: ClickToPayProviderProps) => {
    const [ctpState, setCtpState] = useState<CtpState>(CtpState.Idle);
    const [ctpService, setCtpService] = useState<ClickToPayService>(null);

    useEffect(() => {
        if (!props.configuration) {
            setCtpState(CtpState.NotAvailable);
            return;
        }

        const { schemas, shopperIdentity } = props.configuration;
        const schemaNames = Object.keys(schemas);
        const srcSdkLoader = new SrcSdkLoader(schemaNames, props.environment);
        const service = new ClickToPayService(schemas, srcSdkLoader, shopperIdentity);
        setCtpService(service);
    }, []);

    useEffect(() => {
        if (ctpService) {
            ctpService.subscribeOnStatusChange(status => setCtpState(status));
            ctpService.initialize();
        }
    }, [ctpService]);

    const handleFinishIdentityValidation = useCallback(
        async (otpValue: string) => {
            await ctpService.finishIdentityValidation(otpValue);
        },
        [ctpService]
    );

    const startIdentityValidation = useCallback(async () => {
        const data = await ctpService.startIdentityValidation();
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
            <ClickToPayContext.Consumer>{props.children}</ClickToPayContext.Consumer>
        </ClickToPayContext.Provider>
    );
};

export default ClickToPayProvider;
