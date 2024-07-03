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
    const { ctpState, onReady, startIdentityValidation, logoutShopper } = useClickToPayContext();

    useEffect(() => {
        if ([CtpState.OneTimePassword, CtpState.Login, CtpState.Ready].includes(ctpState)) {
            onReady();
        }
    }, [ctpState, onReady]);

    useEffect(() => {
        async function sendOneTimePassword() {
            try {
                await startIdentityValidation();
            } catch (error) {
                if (error instanceof SrciError) console.warn(`CtP - Identity Validation error: ${error.toString()}`);
                await logoutShopper();
            }
        }
        if (ctpState === CtpState.ShopperIdentified) {
            void sendOneTimePassword();
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
