import ClickToPayProvider, { ClickToPayProviderProps } from '../../internal/ClickToPay/context/ClickToPayProvider';
import ClickToPayHolder from './ClickToPayHolder';
import { h } from 'preact';

const ClickToPayWrapper = ({
    configuration,
    clickToPayService,
    setClickToPayRef,
    onSetStatus,
    onSubmit,
    onError,
    isStandaloneComponent,
    ...props
}: Readonly<ClickToPayProviderProps>) => {
    return (
        <ClickToPayProvider
            isStandaloneComponent={isStandaloneComponent}
            configuration={configuration}
            clickToPayService={clickToPayService}
            setClickToPayRef={setClickToPayRef}
            onSetStatus={onSetStatus}
            onSubmit={onSubmit}
            onError={onError}
        >
            <ClickToPayHolder>{props.children}</ClickToPayHolder>
        </ClickToPayProvider>
    );
};

export default ClickToPayWrapper;
