import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { CtpState } from './services/ClickToPayService';
import useClickToPayContext from './context/useClickToPayContext';
import CtPOneTimePassword from './components/CtPOneTimePassword';
import CtPCards from './components/CtPCards';
import CtPSection from './components/CtPSection';
import CtPLoader from './components/CtPLoader';
import CtPLogin from './components/CtPLogin';
import SrciError from './services/sdks/SrciError';

type ClickToPayComponentProps = {
    onDisplayCardComponent?(): void;
};

const ClickToPayComponent = ({ onDisplayCardComponent }: ClickToPayComponentProps): h.JSX.Element => {
    const { ctpState, startIdentityValidation, logoutShopper } = useClickToPayContext();

    useEffect(() => {
        async function sendOneTimePassword() {
            try {
                await startIdentityValidation();
            } catch (error) {
                if (error instanceof SrciError)
                    console.warn(`CtP - Identity Validation error: Reason: ${error?.reason} / Source: ${error?.source} / Scheme: ${error?.scheme}`);
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
            {ctpState === CtpState.OneTimePassword && <CtPOneTimePassword onDisplayCardComponent={onDisplayCardComponent} />}
            {ctpState === CtpState.Ready && <CtPCards onDisplayCardComponent={onDisplayCardComponent} />}
            {ctpState === CtpState.Login && <CtPLogin />}
        </CtPSection>
    );
};

export default ClickToPayComponent;
