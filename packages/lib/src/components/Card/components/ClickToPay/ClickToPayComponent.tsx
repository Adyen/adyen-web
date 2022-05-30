import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';
import { CtpState } from '../../services/ClickToPayService';
import useClickToPayContext from './context/useClickToPayContext';
import CtPOneTimePassword from './components/CtPOneTimePassword';
import CtPCardsList from './components/CtPCardsList';
import CtPSection from './components/CtPSection';
import { CheckoutPayload } from '../../services/types';

type ClickToPayComponentProps = {
    onSubmit(payload: CheckoutPayload): void;
};

const ClickToPayComponent = ({ onSubmit }: ClickToPayComponentProps) => {
    const { ctpState, startIdentityValidation } = useClickToPayContext();

    useEffect(() => {
        if (ctpState === CtpState.ShopperIdentified) startIdentityValidation();
    }, [ctpState]);

    if (ctpState === CtpState.NotAvailable) {
        return null;
    }

    return (
        <Fragment>
            <CtPSection isLoading={[CtpState.Loading, CtpState.ShopperIdentified].includes(ctpState)}>
                {ctpState === CtpState.OneTimePassword && <CtPOneTimePassword />}
                {ctpState === CtpState.Ready && <CtPCardsList onSubmit={onSubmit} />}
            </CtPSection>
        </Fragment>
    );
};

export default ClickToPayComponent;
