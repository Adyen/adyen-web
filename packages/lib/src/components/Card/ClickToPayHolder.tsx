import ClickToPayProvider from './components/ClickToPay/context/ClickToPayProvider';
import ClickToPayWrapper from './ClickToPayWrapper';
import { h } from 'preact';

const ClickToPayHolder = ({ amount, clickToPayService, setClickToPayRef, onSetStatus, onSubmit, onError, ...props }) => {
    return (
        <ClickToPayProvider
            amount={amount}
            clickToPayService={clickToPayService}
            setClickToPayRef={setClickToPayRef}
            onSetStatus={onSetStatus}
            onSubmit={onSubmit}
            onError={onError}
        >
            <ClickToPayWrapper>{props.children}</ClickToPayWrapper>
        </ClickToPayProvider>
    );
};

export default ClickToPayHolder;
