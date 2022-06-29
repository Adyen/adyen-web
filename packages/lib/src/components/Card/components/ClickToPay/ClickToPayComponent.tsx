import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';
import useClickToPayContext from './context/useClickToPayContext';
import { CtpState } from './services/ClickToPayService';
import CtPOneTimePassword from './components/CtPOneTimePassword';
import CtPCardsList from './components/CtPCardsList/CtPCardsList';
import CtPSection from './components/CtPSection';
import CtPLoader from './components/CtPLoader';
import CtPLogin from './components/CtPLogin/CtPLogin';
import { CheckoutPayload } from './services/types';

type ClickToPayComponentProps = {
    onSubmit(payload: CheckoutPayload): void;
};

const ClickToPayComponent = ({ onSubmit }: ClickToPayComponentProps): h.JSX.Element => {
    const { ctpState, startIdentityValidation, logoutShopper } = useClickToPayContext();

    useEffect(() => {
        async function sendOneTimePassword() {
            try {
                await startIdentityValidation();
            } catch (error){
                console.warn(error);
                logoutShopper();
            }
        }
        if (ctpState === CtpState.ShopperIdentified) {
            sendOneTimePassword();
        }
    }, [ctpState]);

    if (ctpState === CtpState.NotAvailable) {
        return null;
    }

    return (
        <Fragment>
            <CtPSection>
                {[CtpState.Loading, CtpState.ShopperIdentified].includes(ctpState) && <CtPLoader />}
                {ctpState === CtpState.OneTimePassword && <CtPOneTimePassword />}
                {ctpState === CtpState.Ready && <CtPCardsList onSubmit={onSubmit} />}
                {ctpState === CtpState.Login && <CtPLogin />}
            </CtPSection>
        </Fragment>
    );
};

export default ClickToPayComponent;
