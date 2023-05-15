import ClickToPayProvider, { ClickToPayProviderProps } from '../../internal/ClickToPay/context/ClickToPayProvider';
import ClickToPayHolder from './ClickToPayHolder';
import { h } from 'preact';

const ClickToPayWrapper = ({
    amount,
    configuration,
    clickToPayService,
    setClickToPayRef,
    onSetStatus,
    onSubmit,
    onError,
    isStandaloneComponent,
    ...props
}: ClickToPayProviderProps) => {
    return (
        <ClickToPayProvider
            isStandaloneComponent={isStandaloneComponent}
            configuration={configuration}
            amount={amount}
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
