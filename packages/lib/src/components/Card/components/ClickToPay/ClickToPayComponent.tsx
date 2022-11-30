import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { CtpState } from './services/ClickToPayService';
import useClickToPayContext from './context/useClickToPayContext';
import CtPOneTimePassword from './components/CtPOneTimePassword';
import CtPCards from './components/CtPCards';
import CtPSection from './components/CtPSection';
import CtPLoader from './components/CtPLoader';
import CtPLogin from './components/CtPLogin';

type ClickToPayComponentProps = {
    onShowCardButtonClick?(): void;
};

const ClickToPayComponent = ({ onShowCardButtonClick }: ClickToPayComponentProps): h.JSX.Element => {
    const { ctpState, startIdentityValidation, logoutShopper } = useClickToPayContext();

    useEffect(() => {
        async function sendOneTimePassword() {
            try {
                await startIdentityValidation();
            } catch (error) {
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
        <CtPSection>
            {[CtpState.Loading, CtpState.ShopperIdentified].includes(ctpState) && <CtPLoader />}
            {ctpState === CtpState.OneTimePassword && <CtPOneTimePassword onDisplayRegularCardComponent={onShowCardButtonClick} />}
            {ctpState === CtpState.Ready && <CtPCards onShowCardButtonClick={onShowCardButtonClick} />}
            {ctpState === CtpState.Login && <CtPLogin />}
        </CtPSection>
    );
};

export default ClickToPayComponent;
